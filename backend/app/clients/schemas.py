from pydantic import BaseModel, EmailStr
from typing import Optional

class ClientBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None

class ClientCreate(ClientBase):
    user_id: Optional[int] = None

class ClientUpdate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    user_id: Optional[int] = None
    