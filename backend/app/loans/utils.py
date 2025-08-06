import logging
from datetime import date
from dateutil.relativedelta import relativedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def calculate_amortization_schedule(amount: float, interest_rate: float, term_months: float, start_date: date, payment_frequency: str = 'quincenal'):
    logger.info(f"Calculating schedule: amount={amount}, interest_rate={interest_rate}, term_months={term_months}, start_date={start_date}, freq={payment_frequency}")
    
    if payment_frequency == 'quincenal':
        periods_per_year = 24
        total_periods = term_months * 2
    else:
        periods_per_year = 12
        total_periods = term_months

    if interest_rate <= 0 or total_periods <= 0:
        return []

    num_payments = int(round(total_periods))
    periodic_interest_rate = (interest_rate / 100) / periods_per_year
    
    try:
        denominator = (1 - (1 + periodic_interest_rate) ** -total_periods)
        periodic_payment = (amount * periodic_interest_rate) / denominator if denominator != 0 else amount / total_periods
    except (ValueError, OverflowError):
        return []

    schedule = []
    remaining_balance = amount
    current_date = start_date

    for i in range(1, num_payments + 1):
        if payment_frequency == 'quincenal':
            # Asumimos quincenas los días 15 y fin de mes (o último día)
            if current_date.day < 15:
                current_date = current_date.replace(day=15)
            else:
                # Siguiente mes, día 1
                current_date = (current_date.replace(day=1) + relativedelta(months=1))
        else: # Mensual
            current_date += relativedelta(months=1)

        interest_payment = remaining_balance * periodic_interest_rate
        principal_payment = periodic_payment - interest_payment
        remaining_balance -= principal_payment
        
        schedule.append({
            "payment_number": i,
            "payment_date": current_date,
            "payment_amount": round(periodic_payment, 2),
            "principal": round(principal_payment, 2),
            "interest": round(interest_payment, 2),
            "balance": round(remaining_balance, 2) if remaining_balance > 0 else 0,
        })
    return schedule
