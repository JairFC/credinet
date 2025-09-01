from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class GuarantorBase(BaseModel):
    # Mantener full_name por compatibilidad, pero aceptar también partes
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    paternal_last_name: Optional[str] = None
    maternal_last_name: Optional[str] = None
    relationship: Optional[str] = None
    phone_number: Optional[str] = None
    curp: Optional[str] = None

class GuarantorCreate(GuarantorBase):
    pass

class GuarantorUpdate(GuarantorBase):
    pass

class GuarantorResponse(GuarantorBase):
    id: int
    user_id: int
    updated_at: datetime
