from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg

from app.auth.jwt import get_current_user, require_roles
from app.common.database import get_db
from app.loans import schemas
from app.loans.utils import calculate_amortization_schedule
from app.logic import get_enriched_loan
from app.auth.schemas import UserInDB

class PaginatedLoanResponse(BaseModel):
    items: List[schemas.LoanResponse]
    total: int
    page: int
    limit: int
    pages: int

router = APIRouter()

@router.get("/summary", response_model=schemas.GlobalLoanSummaryResponse)
async def get_global_loan_summary(
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(require_roles(["administrador", "auxiliar_administrativo", "asociado"]))
):
    query = "SELECT id FROM loans"
    loan_ids_records = await conn.fetch(query)
    summary = {"total_loans": len(loan_ids_records), "active_loans": 0, "total_loaned_amount": 0.0, "total_outstanding_balance": 0.0, "total_commission": 0.0}
    for record in loan_ids_records:
        enriched_loan = await get_enriched_loan(conn, record['id'])
        if not enriched_loan: continue
        summary["total_loaned_amount"] += float(enriched_loan['amount'])
        summary["total_outstanding_balance"] += float(enriched_loan['outstanding_balance'])
        if enriched_loan['status'] == 'active': summary["active_loans"] += 1
        commission = float(enriched_loan['amount']) * (float(enriched_loan.get('commission_rate', 0) or 0) / 100.0)
        summary["total_commission"] += commission
    return schemas.GlobalLoanSummaryResponse(**summary)

@router.get("/", response_model=PaginatedLoanResponse)
async def get_loans(
    user_id: Optional[int] = None,
    associate_id: Optional[int] = None,
    status: Optional[str] = None,
    search: str = None,
    page: int = 1,
    limit: int = 20,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    offset = (page - 1) * limit
    params, conditions = [], []

    # Filtros existentes
    if "asociado" in current_user.roles:
        conditions.append(f"l.associate_id = ${len(params) + 1}")
        params.append(current_user.associate_id)
    if user_id:
        conditions.append(f"l.user_id = ${len(params) + 1}")
        params.append(user_id)
    if status:
        conditions.append(f"l.status = ${len(params) + 1}")
        params.append(status)
    
    # Nuevo filtro de búsqueda universal
    if search:
        params.append(f"%{search}%")
        search_conditions = "u.first_name ILIKE ${len(params)} OR u.last_name ILIKE ${len(params)}"
        conditions.append(f"({search_conditions})")

    # Construcción de la consulta
    join_clause = "JOIN users u ON l.user_id = u.id" if search else ""
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    
    total_query = f"SELECT COUNT(l.id) FROM loans l {join_clause} {where_clause}"
    total_records = await conn.fetchval(total_query, *params)
    
    ids_query = f"SELECT l.id FROM loans l {join_clause} {where_clause} ORDER BY l.id DESC LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}"
    loan_ids_records = await conn.fetch(ids_query, *params, limit, offset)
    
    enriched_loans = [await get_enriched_loan(conn, r['id']) for r in loan_ids_records if await get_enriched_loan(conn, r['id'])]
    
    return {
        "items": enriched_loans, "total": total_records, "page": page, "limit": limit,
        "pages": (total_records + limit - 1) // limit if limit > 0 else 0
    }

@router.get("/{loan_id}", response_model=schemas.LoanWithPaymentsResponse)
async def get_loan_details(
    loan_id: int,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    enriched_loan = await get_enriched_loan(conn, loan_id)
    if not enriched_loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")

    # Los administradores y desarrolladores pueden ver todo
    is_admin_or_dev = any(role in current_user.roles for role in ["administrador", "desarrollador"])

    if not is_admin_or_dev:
        if "cliente" in current_user.roles and enriched_loan.get('user_id') != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver este préstamo.")
        if "asociado" in current_user.roles and enriched_loan.get('associate_id') != current_user.associate_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver este préstamo.")

    payments_records = await conn.fetch("SELECT * FROM payments WHERE loan_id = $1 ORDER BY payment_date DESC", loan_id)
    response_data = enriched_loan
    response_data['payments'] = [dict(p) for p in payments_records]
    return schemas.LoanWithPaymentsResponse.model_validate(response_data)

@router.get("/{loan_id}/schedule", response_model=schemas.AmortizationScheduleResponse)
async def get_loan_amortization_schedule(
    loan_id: int,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    loan_record = await conn.fetchrow("SELECT * FROM loans WHERE id = $1", loan_id)
    if not loan_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")

    is_admin_or_dev = any(role in current_user.roles for role in ["administrador", "desarrollador"])

    if not is_admin_or_dev:
        if "cliente" in current_user.roles and loan_record['user_id'] != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver este cronograma.")
        if "asociado" in current_user.roles and loan_record['associate_id'] != current_user.associate_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver este cronograma.")
            
    schedule = calculate_amortization_schedule(
        amount=float(loan_record['amount']), interest_rate=float(loan_record['interest_rate']),
        term_months=float(loan_record['term_months']), start_date=loan_record['created_at'].date(),
        payment_frequency=loan_record['payment_frequency']
    )
    return schemas.AmortizationScheduleResponse(schedule=schedule)
