from pydantic import BaseModel
from typing import Optional

class AddressBase(BaseModel):
    street: Optional[str] = None
    external_number: Optional[str] = None
    internal_number: Optional[str] = None
    colony: Optional[str] = None
    municipality: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None

class AddressCreate(AddressBase):
    pass

class AddressResponse(AddressBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
