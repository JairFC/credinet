def calculate_amortization_schedule(amount: float, interest_rate: float, term_months: int, payment_frequency: str = 'quincenal'):
    if payment_frequency == 'quincenal':
        periods_per_year = 24
        total_periods = term_months * 2
    else:  # mensual
        periods_per_year = 12
        total_periods = term_months

    if interest_rate <= 0:
        periodic_payment = amount / total_periods
        periodic_interest_rate = 0
    else:
        periodic_interest_rate = (interest_rate / 100) / periods_per_year
        periodic_payment = (amount * periodic_interest_rate) / (1 - (1 + periodic_interest_rate) ** -total_periods) if periodic_interest_rate > 0 else amount / total_periods

    schedule = []
    remaining_balance = amount

    for i in range(1, total_periods + 1):
        interest_payment = remaining_balance * periodic_interest_rate
        principal_payment = periodic_payment - interest_payment
        remaining_balance -= principal_payment

        schedule.append({
            "payment_number": i,
            "payment_amount": round(periodic_payment, 2),
            "principal": round(principal_payment, 2),
            "interest": round(interest_payment, 2),
            "balance": round(remaining_balance, 2) if remaining_balance > 0 else 0,
        })
    return schedule

async def get_enriched_loan(conn, loan_id: int):
    """
    Función auxiliar para obtener los detalles completos y calculados de un préstamo.
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
    
    # Convert decimal fields to float for consistent calculations and response
    loan_dict['amount'] = float(loan_dict['amount'])
    loan_dict['interest_rate'] = float(loan_dict['interest_rate'])
    loan_dict['total_paid'] = float(loan_dict['total_paid'])

    schedule = calculate_amortization_schedule(
        loan_dict['amount'], loan_dict['interest_rate'], loan_dict['term_months'], loan_dict['payment_frequency']
    )
    total_periods = len(schedule) if schedule else loan_dict['term_months']
    total_to_be_paid = schedule[0]['payment_amount'] * total_periods if schedule else loan_dict['amount']
    loan_dict['outstanding_balance'] = round(total_to_be_paid - loan_dict['total_paid'], 2)
    
    return loan_dict