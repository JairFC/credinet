import asyncpg
from app.loans import utils
import logging

logger = logging.getLogger(__name__)

async def get_enriched_loan(conn: asyncpg.Connection, loan_id: int):
    try:
        fetch_query = """
        SELECT
            l.*,
            u.first_name as user_first_name,
            u.last_name as user_last_name,
            COALESCE(p.payments_made, 0) as payments_made,
            COALESCE(p.total_paid, 0.0) as total_paid
        FROM
            loans l
        JOIN users u ON l.user_id = u.id
        LEFT JOIN (
            SELECT loan_id, COUNT(id)::int as payments_made, SUM(amount_paid) as total_paid
            FROM payments GROUP BY loan_id
        ) p ON l.id = p.loan_id
        WHERE l.id = $1
        """
        record = await conn.fetchrow(fetch_query, loan_id)

        if not record:
            return None

        loan_dict = dict(record)
        
        amount = float(loan_dict['amount'])
        interest_rate = float(loan_dict['interest_rate'])
        term_months = float(loan_dict['term_months'])
        payment_frequency = loan_dict['payment_frequency']
        total_paid = float(loan_dict['total_paid'])

        schedule = utils.calculate_amortization_schedule(amount, interest_rate, term_months, record['created_at'].date(), payment_frequency)
        
        if not schedule:
            outstanding_balance = amount - total_paid
        else:
            total_to_be_paid = schedule[0]['payment_amount'] * len(schedule)
            outstanding_balance = round(total_to_be_paid - total_paid, 2)

        loan_dict['outstanding_balance'] = outstanding_balance
        
        return loan_dict
    except Exception as e:
        logger.error(f"CRITICAL ERROR in get_enriched_loan for loan_id={loan_id}: {e}", exc_info=True)
        return None