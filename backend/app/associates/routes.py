from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.auth.jwt import require_role, require_roles, get_current_user
from app.auth.schemas import UserInDB
from app.common import database
from . import schemas
from app.loans import utils as loan_utils
from app.logic import get_enriched_loan
import asyncpg
from pydantic import BaseModel
from app.loans.schemas import LoanResponse
from app.clients.schemas import ClientResponse

router = APIRouter()

# ... (las rutas create, get, update, delete de asociados se mantienen igual) ...

@router.post("/", response_model=schemas.AssociateResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["administrador", "auxiliar_administrativo"]))])
async def create_associate(
    associate: schemas.AssociateCreate,
):
    async with database.db_pool.acquire() as conn:
        try:
            query = """
            INSERT INTO associates (name, contact_person, contact_email)
            VALUES ($1, $2, $3)
            RETURNING id, name, contact_person, contact_email
            """
            new_record = await conn.fetchrow(
                query, associate.name, associate.contact_person, associate.contact_email
            )
            return dict(new_record)
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un asociado con ese nombre o email."
            )

@router.get("/", response_model=List[schemas.AssociateResponse], dependencies=[Depends(require_roles(["administrador", "auxiliar_administrativo", "asociado"]))])
async def get_associates():
    async with database.db_pool.acquire() as conn:
        associate_records = await conn.fetch("SELECT * FROM associates ORDER BY name")
        return [dict(record) for record in associate_records]

@router.get("/{associate_id}", response_model=schemas.AssociateResponse, dependencies=[Depends(require_roles(["administrador", "auxiliar_administrativo", "asociado"]))])
async def get_associate(
    associate_id: int,
):
    async with database.db_pool.acquire() as conn:
        associate_record = await conn.fetchrow("SELECT * FROM associates WHERE id = $1", associate_id)
        if not associate_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asociado con id {associate_id} no encontrado.")
        return dict(associate_record)

@router.get("/{associate_id}/summary", response_model=schemas.AssociateSummaryResponse, dependencies=[Depends(require_roles(["administrador", "auxiliar_administrativo", "asociado"]))])
async def get_associate_summary(
    associate_id: int,
):
    async with database.db_pool.acquire() as conn:
        associate = await conn.fetchrow("SELECT id FROM associates WHERE id = $1", associate_id)
        if not associate:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asociado con id {associate_id} no encontrado.")

        query = """
        SELECT
            l.id, l.amount, l.interest_rate, l.term_months, l.payment_frequency,
            l.status, l.commission_rate, COALESCE(p.total_paid, 0.0) as total_paid
        FROM loans l
        LEFT JOIN (
            SELECT loan_id, SUM(amount_paid) as total_paid
            FROM payments GROUP BY loan_id
        ) p ON l.id = p.loan_id
        WHERE l.associate_id = $1
        """
        
        loan_records = await conn.fetch(query, associate_id)

        if not loan_records:
            return schemas.AssociateSummaryResponse(
                total_loans=0, active_loans=0, total_loaned_amount=0.0,
                total_outstanding_balance=0.0, total_commission=0.0
            )

        summary = {
            "total_loans": len(loan_records), "active_loans": 0,
            "total_loaned_amount": 0.0, "total_outstanding_balance": 0.0, "total_commission": 0.0
        }

        for record in loan_records:
            loan_dict = dict(record)
            schedule = loan_utils.calculate_amortization_schedule(
                loan_dict['amount'], loan_dict['interest_rate'], loan_dict['term_months'], loan_dict['payment_frequency']
            )
            total_to_be_paid = schedule[0]['payment_amount'] * len(schedule) if schedule else loan_dict['amount']
            outstanding_balance = round(total_to_be_paid - loan_dict['total_paid'], 2)

            summary["total_loaned_amount"] += float(loan_dict['amount'])
            summary["total_outstanding_balance"] += float(outstanding_balance)
            if loan_dict['status'] == 'active':
                summary["active_loans"] += 1
            
            commission = float(loan_dict['amount']) * (float(loan_dict['commission_rate'] or 0) / 100.0)
            summary["total_commission"] += commission

        return schemas.AssociateSummaryResponse(**summary)

@router.put("/{associate_id}", response_model=schemas.AssociateResponse, dependencies=[Depends(require_roles(["administrador", "auxiliar_administrativo"]))])
async def update_associate(
    associate_id: int,
    associate_data: schemas.AssociateUpdate,
):
    async with database.db_pool.acquire() as conn:
        try:
            query = """
            UPDATE associates SET name = $1, contact_person = $2, contact_email = $3
            WHERE id = $4
            RETURNING id, name, contact_person, contact_email
            """
            updated_record = await conn.fetchrow(
                query, associate_data.name, associate_data.contact_person, associate_data.contact_email, associate_id
            )
            if not updated_record:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asociado con id {associate_id} no encontrado.")
            return dict(updated_record)
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"El nombre o email ya está en uso.")

@router.delete("/{associate_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_role("administrador"))])
async def delete_associate(
    associate_id: int,
):
    async with database.db_pool.acquire() as conn:
        result = await conn.execute("DELETE FROM associates WHERE id = $1", associate_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Asociado con id {associate_id} no encontrado.")
        return

class AssociateDashboardData(BaseModel):
    summary: schemas.AssociateSummaryResponse
    loans: List[LoanResponse]
    clients: List[ClientResponse]

@router.get("/dashboard", response_model=AssociateDashboardData, dependencies=[Depends(require_role("asociado"))])
async def get_associate_dashboard_data(
    current_user: UserInDB = Depends(get_current_user)
):
    associate_id = current_user.associate_id
    if not associate_id:
        raise HTTPException(status_code=404, detail="Usuario no está vinculado a ningún asociado.")

    async with database.db_pool.acquire() as conn:
        # 1. Obtener IDs de préstamos
        loan_ids_records = await conn.fetch("SELECT id FROM loans WHERE associate_id = $1", associate_id)
        
        # 2. Enriquecer cada préstamo
        enriched_loans_dicts = []
        for record in loan_ids_records:
            enriched_loan = await _get_enriched_loan(conn, record['id'])
            if enriched_loan:
                enriched_loans_dicts.append(enriched_loan)
        
        # 3. Calcular el resumen
        summary_data = {
            "total_loans": len(enriched_loans_dicts), "active_loans": 0,
            "total_loaned_amount": 0.0, "total_outstanding_balance": 0.0, "total_commission": 0.0
        }
        for loan in enriched_loans_dicts:
            summary_data["total_loaned_amount"] += float(loan['amount'])
            summary_data["total_outstanding_balance"] += float(loan['outstanding_balance'])
            if loan['status'] == 'active':
                summary_data["active_loans"] += 1
            commission = float(loan['amount']) * (float(loan['commission_rate'] or 0) / 100.0)
            summary_data["total_commission"] += commission
        
        # 4. Obtener clientes
        client_ids = {loan['client_id'] for loan in enriched_loans_dicts}
        clients_records = []
        if client_ids:
            clients_query = "SELECT * FROM clients WHERE id = ANY($1::int[])"
            clients_records = await conn.fetch(clients_query, list(client_ids))

    # 5. Validar y construir la respuesta final explícitamente
    final_summary = schemas.AssociateSummaryResponse.model_validate(summary_data)
    final_loans = [LoanResponse.model_validate(loan) for loan in enriched_loans_dicts]
    final_clients = [ClientResponse.model_validate(client) for client in clients_records]

    return AssociateDashboardData(
        summary=final_summary,
        loans=final_loans,
        clients=final_clients
    )


