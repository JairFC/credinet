import asyncpg
from app.loans import utils

async def get_enriched_loan(conn: asyncpg.Connection, loan_id: int):
    """
    Función auxiliar para obtener los detalles completos y calculados de un préstamo,
    asegurando que los tipos de datos sean correctos para Pydantic.
    """
    fetch_query = """
    SELECT
        l.*,
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
    full_loan_record = await conn.fetchrow(fetch_query, loan_id)

    if not full_loan_record:
        return None

    loan_dict = dict(full_loan_record)
    
    # Forzar la conversión de Decimal a float y asegurar todos los campos
    loan_dict['amount'] = float(loan_dict['amount'])
    loan_dict['interest_rate'] = float(loan_dict['interest_rate'])
    loan_dict['commission_rate'] = float(loan_dict['commission_rate'])
    loan_dict['total_paid'] = float(loan_dict['total_paid'])

    schedule = utils.calculate_amortization_schedule(
        loan_dict['amount'], loan_dict['interest_rate'], loan_dict['term_months'], loan_dict['payment_frequency']
    )
    
    total_to_be_paid = schedule[0]['payment_amount'] * len(schedule) if schedule else loan_dict['amount']
    outstanding_balance = round(total_to_be_paid - loan_dict['total_paid'], 2)
    
    loan_dict['outstanding_balance'] = outstanding_balance
    
    # Asegurarse de que el campo associate_id esté presente
    if 'associate_id' not in loan_dict:
        loan_dict['associate_id'] = None

    return loan_dict
