from pydantic import BaseModel, ConfigDict
from typing import Optional

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: str = 'asociado'
    associate_id: Optional[int] = None

class UserUpdate(BaseModel):
    password: str

class UserInDB(UserBase):
    id: int
    role: str
    password_hash: str
    associate_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

class UserResponse(UserBase):
    id: int
    role: str
    associate_id: Optional[int] = None
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None
    associate_id: Optional[int] = None
