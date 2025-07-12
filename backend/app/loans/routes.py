from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import date
from app.auth.jwt import get_current_user
from app.auth.schemas import UserResponse
from app.common import database
from . import schemas, utils
import asyncpg
from app.logic import get_enriched_loan

router = APIRouter()

@router.post("/", response_model=schemas.LoanResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    loan: schemas.LoanCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        async with conn.transaction():
            insert_query = """
            INSERT INTO loans (client_id, associate_id, amount, interest_rate, commission_rate, term_months, payment_frequency)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
            """
            new_loan_id = await conn.fetchval(
                insert_query, loan.client_id, loan.associate_id, loan.amount, loan.interest_rate, loan.commission_rate, loan.term_months, loan.payment_frequency
            )
            loan_dict = await get_enriched_loan(conn, new_loan_id)
            if not loan_dict:
                raise HTTPException(status_code=500, detail="Error al recuperar el préstamo recién creado.")
            return schemas.LoanResponse.model_validate(loan_dict)

@router.get("/", response_model=List[schemas.LoanResponse])
async def get_loans(
    client_id: Optional[int] = None,
    associate_id: Optional[int] = None,
    user_id: Optional[int] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        base_query = "SELECT id FROM loans"
        params = []
        where_clauses = []

        if client_id:
            params.append(client_id)
            where_clauses.append(f"client_id = ${len(params)}")
        elif associate_id:
            params.append(associate_id)
            where_clauses.append(f"associate_id = ${len(params)}")
        elif user_id:
            params.append(user_id)
            where_clauses.append(f"client_id IN (SELECT id FROM clients WHERE user_id = ${len(params)})")

        if where_clauses:
            final_query = f"{base_query} WHERE {' AND '.join(where_clauses)} ORDER BY created_at DESC"
        else:
            final_query = f"{base_query} ORDER BY created_at DESC"

        loan_id_records = await conn.fetch(final_query, *params)
        
        enriched_loans = []
        for record in loan_id_records:
            enriched_loan = await get_enriched_loan(conn, record['id'])
            if enriched_loan:
                enriched_loans.append(schemas.LoanResponse.model_validate(enriched_loan))
        return enriched_loans

@router.patch("/{loan_id}/status", response_model=schemas.LoanResponse)
async def update_loan_status(
    loan_id: int,
    status_update: schemas.LoanStatusUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        async with conn.transaction():
            update_query = "UPDATE loans SET status = $1 WHERE id = $2 AND status != $1 RETURNING id"
            updated_id = await conn.fetchval(update_query, status_update.status, loan_id)
            if not updated_id:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado o ya tiene ese estado.")
            loan_dict = await get_enriched_loan(conn, updated_id)
            if not loan_dict:
                raise HTTPException(status_code=404, detail=f"Préstamo con id {loan_id} no encontrado después de actualizar.")
            return schemas.LoanResponse.model_validate(loan_dict)

@router.put("/{loan_id}", response_model=schemas.LoanResponse)
async def update_loan(
    loan_id: int,
    loan_data: schemas.LoanUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        async with conn.transaction():
            loan = await conn.fetchrow("SELECT status FROM loans WHERE id = $1", loan_id)
            if not loan:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")
            if loan['status'] != 'pending':
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo se pueden editar préstamos en estado 'pendiente'.")

            update_query = """
            UPDATE loans SET amount = $1, interest_rate = $2, commission_rate = $3, term_months = $4, associate_id = $5, payment_frequency = $6
            WHERE id = $7 RETURNING id
            """
            updated_id = await conn.fetchval(
                update_query, loan_data.amount, loan_data.interest_rate, loan_data.commission_rate, loan_data.term_months,
                loan_data.associate_id, loan_data.payment_frequency, loan_id
            )
            loan_dict = await get_enriched_loan(conn, updated_id)
            return schemas.LoanResponse.model_validate(loan_dict)

@router.delete("/{loan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_loan(
    loan_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        loan = await conn.fetchrow("SELECT l.status, p.payment_count FROM loans l LEFT JOIN (SELECT loan_id, COUNT(*) as payment_count FROM payments GROUP BY loan_id) p ON l.id = p.loan_id WHERE l.id = $1", loan_id)
        if not loan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")
        if loan['status'] != 'pending':
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo se pueden eliminar préstamos en estado 'pendiente'.")
        if loan['payment_count'] and loan['payment_count'] > 0:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No se puede eliminar un préstamo que ya tiene pagos registrados.")

        await conn.execute("DELETE FROM loans WHERE id = $1", loan_id)

@router.get("/{loan_id}/amortization", response_model=schemas.AmortizationScheduleResponse)
async def get_amortization_schedule(
    loan_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        loan_record = await conn.fetchrow(
            "SELECT amount, interest_rate, term_months, payment_frequency FROM loans WHERE id = $1", loan_id
        )

        if not loan_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")
        
        schedule = utils.calculate_amortization_schedule(
            amount=float(loan_record['amount']),
            interest_rate=float(loan_record['interest_rate']),
            term_months=loan_record['term_months'],
            payment_frequency=loan_record['payment_frequency']
        )
        return {"schedule": schedule}

@router.post("/{loan_id}/payments", response_model=schemas.PaymentResponse, status_code=status.HTTP_201_CREATED)
async def record_loan_payment(
    loan_id: int,
    payment_data: schemas.PaymentCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        loan = await conn.fetchrow("SELECT * FROM loans WHERE id = $1 AND status = 'active'", loan_id)
        if not loan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo activo con id {loan_id} no encontrado.")

        amount_to_pay = payment_data.amount_paid
        if amount_to_pay is None:
            schedule = utils.calculate_amortization_schedule(
                amount=float(loan['amount']),
                interest_rate=float(loan['interest_rate']),
                term_months=loan['term_months'],
                payment_frequency=loan['payment_frequency']
            )
            if not schedule:
                    raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="No se pudo calcular el monto del pago.")
            amount_to_pay = schedule[0]['payment_amount']

        query = """
        INSERT INTO payments (loan_id, amount_paid, payment_date) VALUES ($1, $2, $3)
        RETURNING id, loan_id, amount_paid, payment_date
        """
        new_payment_record = await conn.fetchrow(query, loan_id, amount_to_pay, payment_data.payment_date)
        return dict(new_payment_record)


@router.get("/{loan_id}/payments", response_model=List[schemas.PaymentResponse])
async def get_loan_payments(
    loan_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        loan_exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM loans WHERE id = $1)", loan_id)
        if not loan_exists:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")

        payments_records = await conn.fetch(
            "SELECT * FROM payments WHERE loan_id = $1 ORDER BY payment_date DESC", loan_id
        )
        return [dict(p) for p in payments_records]


@router.get("/summary", response_model=schemas.GlobalLoanSummaryResponse)
async def get_global_loan_summary(
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        query = """
        SELECT
            COUNT(*) AS total_loans,
            COUNT(*) FILTER (WHERE status = 'active') AS active_loans,
            COALESCE(SUM(amount), 0) AS total_loaned_amount,
            COALESCE(SUM(
                CASE
                    WHEN status IN ('active', 'defaulted') THEN
                        (SELECT amount + (amount * interest_rate * term_months / 12) - COALESCE(SUM(p.amount_paid), 0)
                         FROM payments p WHERE p.loan_id = loans.id)
                    ELSE 0
                END
            ), 0) AS total_outstanding_balance,
            COALESCE(SUM(amount * commission_rate), 0) AS total_commission
        FROM loans;
        """
        summary_data = await conn.fetchrow(query)
        if not summary_data:
            return {
                "total_loans": 0,
                "active_loans": 0,
                "total_loaned_amount": 0,
                "total_outstanding_balance": 0,
                "total_commission": 0,
            }
        return schemas.GlobalLoanSummaryResponse.model_validate(dict(summary_data))


@router.get("/clients/{client_id}/summary", response_model=schemas.ClientLoanSummaryResponse)
async def get_client_loan_summary(
    client_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        query = """
        SELECT
            COUNT(*) AS total_loans,
            COUNT(*) FILTER (WHERE status = 'active') AS active_loans,
            COALESCE(SUM(amount), 0) AS total_loaned_amount,
            COALESCE(SUM(
                CASE
                    WHEN status IN ('active', 'defaulted') THEN
                        (SELECT amount + (amount * interest_rate * term_months / 12) - COALESCE(SUM(p.amount_paid), 0)
                         FROM payments p WHERE p.loan_id = loans.id)
                    ELSE 0
                END
            ), 0) AS total_outstanding_balance
        FROM loans
        WHERE client_id = $1;
        """
        summary_data = await conn.fetchrow(query, client_id)
        if not summary_data or summary_data['total_loans'] == 0:
            return {
                "total_loans": 0,
                "active_loans": 0,
                "total_loaned_amount": 0,
                "total_outstanding_balance": 0,
            }
        return schemas.ClientLoanSummaryResponse.model_validate(dict(summary_data))


@router.get("/with_payments", response_model=List[schemas.LoanWithPaymentsResponse])
async def get_loans_with_payments(
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        loan_id_records = await conn.fetch("SELECT id FROM loans ORDER BY created_at DESC")
        
        response_loans = []
        for record in loan_id_records:
            loan_dict = await get_enriched_loan(conn, record['id'])
            if loan_dict:
                payments_records = await conn.fetch("SELECT * FROM payments WHERE loan_id = $1 ORDER BY payment_date DESC", record['id'])
                loan_dict['payments'] = [dict(p) for p in payments_records]
                response_loans.append(schemas.LoanWithPaymentsResponse.model_validate(loan_dict))
        return response_loans

@router.get("/details/{loan_id}", response_model=schemas.LoanWithPaymentsResponse)
async def get_loan_details(
    loan_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        loan_dict = await get_enriched_loan(conn, loan_id)
        if not loan_dict:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Préstamo con id {loan_id} no encontrado.")
        
        payments_records = await conn.fetch("SELECT * FROM payments WHERE loan_id = $1 ORDER BY payment_date DESC", loan_id)
        loan_dict['payments'] = [dict(p) for p in payments_records]
        
        return schemas.LoanWithPaymentsResponse.model_validate(loan_dict)

@router.get("/payments", response_model=List[schemas.PaymentResponse])
async def get_all_payments(
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        query = "SELECT * FROM payments ORDER BY payment_date DESC"
        payments_records = await conn.fetch(query)
        return [dict(p) for p in payments_records]
