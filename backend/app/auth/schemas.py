from pydantic import BaseModel, ConfigDict, EmailStr, validator
import re
from typing import Optional, List
from datetime import datetime, date
from app.beneficiaries.schemas import BeneficiaryCreate, BeneficiaryResponse
from app.associates.schemas import AssociateCreate
from app.addresses.schemas import AddressCreate, AddressResponse

class UserBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    phone_number: str
    birth_date: Optional[date] = None
    curp: Optional[str] = None
    profile_picture_url: Optional[str] = None

    @validator('phone_number')
    def validate_phone_number(cls, v):
        digits_only = re.sub(r'\D', '', v)
        if len(digits_only) != 10:
            raise ValueError('El número de teléfono debe contener 10 dígitos.')
        return digits_only

class UserCreate(UserBase):
    password: str
    roles: List[str]
    associate_id: Optional[int] = None
    beneficiary: Optional[BeneficiaryCreate] = None
    associate_data: Optional[AssociateCreate] = None
    address: Optional[AddressCreate] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    birth_date: Optional[date] = None
    curp: Optional[str] = None
    profile_picture_url: Optional[str] = None
    password: Optional[str] = None
    roles: Optional[List[str]] = None
    associate_id: Optional[int] = None
    address: Optional[AddressCreate] = None

class UserInDB(UserBase):
    id: int
    roles: List[str]
    password_hash: str
    associate_id: Optional[int] = None
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserBase):
    id: int
    roles: List[str]
    associate_id: Optional[int] = None
    updated_at: datetime
    address: Optional[AddressResponse] = None
    beneficiaries: Optional[List[BeneficiaryResponse]] = None
    model_config = ConfigDict(from_attributes=True)

class PaginatedUserResponse(BaseModel):
    items: List[UserResponse]
    total: int
    page: int
    limit: int
    pages: int

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    roles: Optional[List[str]] = None
    associate_id: Optional[int] = None