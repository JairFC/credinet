from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg

from app.auth.jwt import require_roles, get_current_user
from app.auth.schemas import UserInDB
from app.common.database import get_db
from . import schemas

router = APIRouter()

@router.post("/users/{user_id}/guarantor", response_model=schemas.GuarantorResponse, status_code=status.HTTP_201_CREATED)
async def create_guarantor(
    user_id: int,
    guarantor_data: schemas.GuarantorCreate,
    current_user: UserInDB = Depends(require_roles(["administrador", "auxiliar_administrativo"])),
    conn: asyncpg.Connection = Depends(get_db)
):
    # Lógica para crear un aval
    pass

@router.get("/users/{user_id}/guarantor", response_model=schemas.GuarantorResponse)
async def get_guarantor(
    user_id: int,
    current_user: UserInDB = Depends(require_roles(["administrador", "auxiliar_administrativo", "cliente"])),
    conn: asyncpg.Connection = Depends(get_db)
):
    # Lógica para obtener el aval
    pass

# (Opcional: endpoints PUT y DELETE si se requiere)
