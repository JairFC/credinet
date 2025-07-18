from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.jwt import get_current_user, require_roles, require_role
from app.auth.roles import UserRole
from app.common.database import get_db
from app.loans import schemas
from app.loans.utils import calculate_amortization_schedule
from app.logic import get_enriched_loan
from app.auth.schemas import UserInDB
import asyncpg


router = APIRouter()

# --- Rutas de Creación y Modificación (NUEVO) ---

@router.post("/", response_model=schemas.LoanResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    loan_data: schemas.LoanCreate,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(require_roles([UserRole.ADMINISTRADOR, UserRole.AUXILIAR_ADMINISTRATIVO]))
):
    # Validar que el cliente y el asociado (si se proporciona) existen
    client = await conn.fetchrow("SELECT id FROM clients WHERE id = $1", loan_data.client_id)
    if not client:
        raise HTTPException(status_code=404, detail=f"Cliente con id {loan_data.client_id} no encontrado.")
    
    if loan_data.associate_id:
        associate = await conn.fetchrow("SELECT id FROM associates WHERE id = $1", loan_data.associate_id)
        if not associate:
            raise HTTPException(status_code=404, detail=f"Asociado con id {loan_data.associate_id} no encontrado.")

    query = """
    INSERT INTO loans (client_id, associate_id, amount, interest_rate, commission_rate, term_months, payment_frequency, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id
    """
    try:
        new_loan_id = await conn.fetchval(
            query,
            loan_data.client_id,
            loan_data.associate_id,
            loan_data.amount,
            loan_data.interest_rate,
            loan_data.commission_rate,
            loan_data.term_months,
            loan_data.payment_frequency,
            'pending'  # Los préstamos se crean como pendientes por defecto
        )
        
        enriched_loan = await get_enriched_loan(conn, new_loan_id)
        if not enriched_loan:
             raise HTTPException(status_code=500, detail="No se pudo obtener el préstamo recién creado.")

        return schemas.LoanResponse.model_validate(enriched_loan)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error inesperado al crear el préstamo: {e}")


@router.put("/{loan_id}", response_model=schemas.LoanResponse)
async def update_loan(
    loan_id: int,
    loan_data: schemas.LoanUpdate,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(require_roles([UserRole.ADMINISTRADOR, UserRole.AUXILIAR_ADMINISTRATIVO]))
):
    existing_loan = await conn.fetchrow("SELECT id FROM loans WHERE id = $1", loan_id)
    if not existing_loan:
        raise HTTPException(status_code=404, detail=f"Préstamo con id {loan_id} no encontrado.")

    if loan_data.associate_id:
        associate = await conn.fetchrow("SELECT id FROM associates WHERE id = $1", loan_data.associate_id)
        if not associate:
            raise HTTPException(status_code=404, detail=f"Asociado con id {loan_data.associate_id} no encontrado.")

    query = """
    UPDATE loans
    SET amount = $1, interest_rate = $2, commission_rate = $3, term_months = $4, payment_frequency = $5, associate_id = $6
    WHERE id = $7
    """
    await conn.execute(
        query,
        loan_data.amount,
        loan_data.interest_rate,
        loan_data.commission_rate,
        loan_data.term_months,
        loan_data.payment_frequency,
        loan_data.associate_id,
        loan_id
    )
    
    enriched_loan = await get_enriched_loan(conn, loan_id)
    if not enriched_loan:
        raise HTTPException(status_code=500, detail="No se pudo obtener el préstamo actualizado.")
        
    return schemas.LoanResponse.model_validate(enriched_loan)


@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan(
    loan_id: int,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(require_role(UserRole.ADMINISTRADOR))
):
    # Verificar si hay pagos asociados
    payment_exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM payments WHERE loan_id = $1)", loan_id)
    if payment_exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar un préstamo que ya tiene pagos registrados."
        )

    result = await conn.execute("DELETE FROM loans WHERE id = $1", loan_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")
    return


# --- Rutas de Lectura (Existentes) ---

@router.get("/summary", response_model=schemas.GlobalLoanSummaryResponse)
async def get_global_loan_summary(
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(require_roles([UserRole.ADMINISTRADOR, UserRole.AUXILIAR_ADMINISTRATIVO, UserRole.ASOCIADO]))
):
    # La lógica de esta ruta ya es correcta y usa get_enriched_loan
    query = "SELECT id FROM loans"
    loan_ids_records = await conn.fetch(query)

    if not loan_ids_records:
        return schemas.GlobalLoanSummaryResponse(
            total_loans=0, active_loans=0, total_loaned_amount=0.0,
            total_outstanding_balance=0.0, total_commission=0.0
        )

    summary = {
        "total_loans": len(loan_ids_records), "active_loans": 0,
        "total_loaned_amount": 0.0, "total_outstanding_balance": 0.0, "total_commission": 0.0
    }

    for record in loan_ids_records:
        enriched_loan = await get_enriched_loan(conn, record['id'])
        if not enriched_loan:
            continue

        summary["total_loaned_amount"] += float(enriched_loan['amount'])
        summary["total_outstanding_balance"] += float(enriched_loan['outstanding_balance'])
        if enriched_loan['status'] == 'active':
            summary["active_loans"] += 1
        
        commission = float(enriched_loan['amount']) * (float(enriched_loan.get('commission_rate', 0) or 0) / 100.0)
        summary["total_commission"] += commission

    return schemas.GlobalLoanSummaryResponse(**summary)


@router.get("/", response_model=List[schemas.LoanResponse])
async def get_loans(
    client_id: Optional[int] = None,
    associate_id: Optional[int] = None,
    status: Optional[str] = None,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    # Base query
    base_query = "SELECT id FROM loans"
    
    conditions = []
    params = []
    
    # Si el usuario es un asociado, SIEMPRE se filtra por su ID.
    if current_user.role == UserRole.ASOCIADO:
        if not current_user.associate_id:
             raise HTTPException(status_code=403, detail="Usuario asociado no tiene un ID de asociado válido.")
        conditions.append(f"associate_id = ${len(params) + 1}")
        params.append(current_user.associate_id)

    # Filtros adicionales
    if client_id:
        conditions.append(f"client_id = ${len(params) + 1}")
        params.append(client_id)
    if associate_id and current_user.role != UserRole.ASOCIADO: # Evitar que un asociado filtre por otro
        conditions.append(f"associate_id = ${len(params) + 1}")
        params.append(associate_id)
    if status:
        conditions.append(f"status = ${len(params) + 1}")
        params.append(status)

    if conditions:
        final_query = base_query + " WHERE " + " AND ".join(conditions)
    else:
        final_query = base_query

    loan_ids_records = await conn.fetch(final_query, *params)
    
    enriched_loans = []
    for record in loan_ids_records:
        enriched_loan = await get_enriched_loan(conn, record['id'])
        if enriched_loan:
            enriched_loans.append(enriched_loan)
    
    return [schemas.LoanResponse.model_validate(loan) for loan in enriched_loans]


@router.get("/{loan_id}", response_model=schemas.LoanWithPaymentsResponse)
async def get_loan_details(
    loan_id: int,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(get_current_user)
):
    enriched_loan = await get_enriched_loan(conn, loan_id)
    if not enriched_loan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")

    # Seguridad: Un asociado solo puede ver sus propios préstamos
    if current_user.role == UserRole.ASOCIADO and enriched_loan.get('associate_id') != current_user.associate_id:
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
    # Primero, obtener el préstamo para verificar la propiedad
    loan_record = await conn.fetchrow("SELECT * FROM loans WHERE id = $1", loan_id)
    if not loan_record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")

    # Lógica de permisos
    if current_user.role == UserRole.CLIENTE:
        client_record = await conn.fetchrow("SELECT id FROM clients WHERE user_id = $1", current_user.id)
        if not client_record or client_record['id'] != loan_record['client_id']:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver este cronograma.")
    
    elif current_user.role == UserRole.ASOCIADO:
        if loan_record['associate_id'] != current_user.associate_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para ver este cronograma.")

    # Si pasa los permisos, calcular y devolver el cronograma
    schedule = calculate_amortization_schedule(
        amount=float(loan_record['amount']),
        interest_rate=float(loan_record['interest_rate']),
        term_months=loan_record['term_months'],
        payment_frequency=loan_record['payment_frequency']
    )
    
    return schemas.AmortizationScheduleResponse(schedule=schedule)


@router.put("/{loan_id}/status", response_model=schemas.LoanResponse)
async def update_loan_status(
    loan_id: int,
    status_update: schemas.LoanStatusUpdate,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(require_roles([UserRole.ADMINISTRADOR, UserRole.AUXILIAR_ADMINISTRATIVO]))
):
    query = "UPDATE loans SET status = $1 WHERE id = $2"
    result = await conn.execute(query, status_update.status, loan_id)
    if result == "UPDATE 0":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")
    
    enriched_loan = await get_enriched_loan(conn, loan_id)
    if not enriched_loan:
        raise HTTPException(status_code=500, detail="No se pudo obtener el préstamo actualizado.")
        
    return schemas.LoanResponse.model_validate(enriched_loan)

