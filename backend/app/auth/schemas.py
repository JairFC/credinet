from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime, date

class UserBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    phone_number: str
    birth_date: Optional[date] = None
    curp: Optional[str] = None
    profile_picture_url: Optional[str] = None
    address_street: Optional[str] = None
    address_ext_num: Optional[str] = None
    address_int_num: Optional[str] = None
    address_colonia: Optional[str] = None
    address_zip_code: Optional[str] = None
    address_state: Optional[str] = None

class UserCreate(UserBase):
    password: str
    roles: List[str]
    associate_id: Optional[int] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    birth_date: Optional[date] = None
    curp: Optional[str] = None
    profile_picture_url: Optional[str] = None
    address_street: Optional[str] = None
    address_ext_num: Optional[str] = None
    address_int_num: Optional[str] = None
    address_colonia: Optional[str] = None
    address_zip_code: Optional[str] = None
    address_state: Optional[str] = None
    password: Optional[str] = None
    roles: Optional[List[str]] = None
    associate_id: Optional[int] = None

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