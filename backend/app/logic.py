import asyncpg
from app.loans import utils

async def get_enriched_loan(conn: asyncpg.Connection, loan_id: int):
    """
    Función auxiliar para obtener los detalles completos y calculados de un préstamo,
    asegurando que los tipos de datos sean correctos para Pydantic.
    """
    fetch_query = """
    SELECT
        l.id,
        l.client_id,
        l.associate_id,
        l.amount,
        l.interest_rate,
        l.commission_rate,
        l.term_months,
        l.payment_frequency,
        l.status,
        c.first_name as client_first_name,
        c.last_name as client_last_name,
        COALESCE(p.payments_made, 0) as payments_made,
        COALESCE(p.total_paid, 0.0) as total_paid
    FROM
        loans l
    JOIN clients c ON l.client_id = c.id
    LEFT JOIN (
        SELECT loan_id, COUNT(id)::int as payments_made, SUM(amount_paid) as total_paid
        FROM payments GROUP BY loan_id
    ) p ON l.id = p.loan_id
    WHERE l.id = $1
    """
    record = await conn.fetchrow(fetch_query, loan_id)

    if not record:
        return None

    # Convertir el registro a un diccionario mutable
    loan_dict = dict(record)

    # Calcular el saldo pendiente
    amount = float(loan_dict['amount'])
    interest_rate = float(loan_dict['interest_rate'])
    term_months = loan_dict['term_months']
    payment_frequency = loan_dict['payment_frequency']
    total_paid = float(loan_dict['total_paid'])

    schedule = utils.calculate_amortization_schedule(amount, interest_rate, term_months, payment_frequency)
    
    total_to_be_paid = schedule[0]['payment_amount'] * len(schedule) if schedule else amount
    outstanding_balance = round(total_to_be_paid - total_paid, 2)

    # Construir el diccionario final explícitamente para asegurar todos los campos
    # que el modelo LoanResponse espera.
    return {
        "id": loan_dict['id'],
        "client_id": loan_dict['client_id'],
        "associate_id": loan_dict['associate_id'],
        "amount": amount,
        "interest_rate": interest_rate,
        "commission_rate": float(loan_dict['commission_rate']),
        "term_months": term_months,
        "payment_frequency": payment_frequency,
        "status": loan_dict['status'],
        "client_first_name": loan_dict['client_first_name'],
        "client_last_name": loan_dict['client_last_name'],
        "payments_made": loan_dict['payments_made'],
        "total_paid": total_paid,
        "outstanding_balance": outstanding_balance,
    }
