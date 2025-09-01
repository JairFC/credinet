from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

class AssociateBase(BaseModel):
    name: str
    level_id: int
    contact_person: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    default_commission_rate: Optional[float] = 5.0

class AssociateCreate(AssociateBase):
    pass

class AssociateUpdate(AssociateBase):
    pass

class AssociateResponse(AssociateBase):
    id: int
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class AssociateSummaryResponse(BaseModel):
    total_loans: int
    active_loans: int
    total_loaned_amount: float
    total_outstanding_balance: float
    total_commission: float

class AssociateLevelBase(BaseModel):
    name: str
    max_loan_amount: Optional[float] = None

class AssociateLevelCreate(AssociateLevelBase):
    pass

class AssociateLevelUpdate(AssociateLevelBase):
    pass

class AssociateLevelResponse(AssociateLevelBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
