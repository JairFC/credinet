from pydantic import BaseModel
from datetime import datetime

class BeneficiaryBase(BaseModel):
    full_name: str
    relationship: str
    phone_number: str

class BeneficiaryCreate(BeneficiaryBase):
    pass

class BeneficiaryUpdate(BeneficiaryBase):
    pass

class BeneficiaryResponse(BeneficiaryBase):
    id: int
    user_id: int
    updated_at: datetime
