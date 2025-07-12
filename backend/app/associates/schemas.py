from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class AssociateBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None

class AssociateCreate(AssociateBase):
    pass

class AssociateUpdate(AssociateBase):
    pass

class AssociateResponse(AssociateBase):
    id: int
    model_config = ConfigDict(from_attributes=True)

class AssociateSummaryResponse(BaseModel):
    total_loans: int
    active_loans: int
    total_loaned_amount: float
    total_outstanding_balance: float
    total_commission: float