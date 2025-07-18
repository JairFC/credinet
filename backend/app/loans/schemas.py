from pydantic import BaseModel, Field
from typing import Literal, Optional, List
from datetime import date

class LoanBase(BaseModel):
    amount: float = Field(..., gt=0)
    interest_rate: float = Field(..., ge=0)
    commission_rate: float = Field(0.0, ge=0)
    term_months: int = Field(..., gt=0)
    payment_frequency: Literal['quincenal', 'mensual'] = 'quincenal'

class LoanCreate(LoanBase):
    client_id: int
    associate_id: Optional[int] = None

class LoanUpdate(LoanBase):
    associate_id: Optional[int] = None

class LoanResponse(LoanBase):
    id: int
    client_id: int
    associate_id: Optional[int] = None
    commission_rate: float
    client_first_name: str
    client_last_name: str
    status: Literal['pending', 'active', 'paid', 'defaulted']
    payments_made: int
    total_paid: float
    outstanding_balance: float

    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    amount_paid: Optional[float] = Field(None, gt=0)
    payment_date: date = Field(default_factory=date.today)

class PaymentResponse(BaseModel):
    id: int
    loan_id: int
    amount_paid: float
    payment_date: date

class LoanStatusUpdate(BaseModel):
    status: Literal['pending', 'active', 'paid', 'defaulted']

class AmortizationPayment(BaseModel):
    payment_number: int
    payment_amount: float
    principal: float
    interest: float
    balance: float

class AmortizationScheduleResponse(BaseModel):
    schedule: List[AmortizationPayment]

class UserLoanSummaryResponse(BaseModel):
    total_loans: int
    active_loans: int
    total_loaned_amount: float
    total_outstanding_balance: float

class ClientLoanSummaryResponse(BaseModel):
    total_loans: int
    active_loans: int
    total_loaned_amount: float
    total_outstanding_balance: float

class GlobalLoanSummaryResponse(BaseModel):
    total_loans: int
    active_loans: int
    total_loaned_amount: float
    total_outstanding_balance: float
    total_commission: float

class PaymentUpdate(BaseModel):
    amount_paid: float = Field(..., gt=0)
    payment_date: date

class LoanWithPaymentsResponse(LoanResponse):
    payments: List[PaymentResponse]

# Schemas for Client Dashboard
class ClientDashboardLoan(BaseModel):
    id: int
    amount: float
    status: str
    outstanding_balance: float

class ClientDashboardPayment(BaseModel):
    id: int
    loan_id: int
    amount_paid: float
    payment_date: date

class ClientDashboardSummary(BaseModel):
    active_loans_count: int
    total_outstanding_balance: float

class ClientDashboardResponse(BaseModel):
    summary: ClientDashboardSummary
    loans: List[ClientDashboardLoan]
    recent_payments: List[ClientDashboardPayment]
