from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg

from app.auth.jwt import require_roles, get_current_user
from app.auth.schemas import UserInDB
from app.common.database import get_db
from . import schemas

router = APIRouter()

@router.post("/users/{user_id}/beneficiaries", response_model=schemas.BeneficiaryResponse, status_code=status.HTTP_201_CREATED)
async def create_beneficiary(
    user_id: int,
    beneficiary_data: schemas.BeneficiaryCreate,
    current_user: UserInDB = Depends(require_roles(["administrador", "auxiliar_administrativo"])),
    conn: asyncpg.Connection = Depends(get_db)
):
    # Lógica para crear un beneficiario
    pass

@router.get("/users/{user_id}/beneficiaries", response_model=List[schemas.BeneficiaryResponse])
async def get_beneficiaries(
    user_id: int,
    current_user: UserInDB = Depends(require_roles(["administrador", "auxiliar_administrativo", "cliente"])),
    conn: asyncpg.Connection = Depends(get_db)
):
    # Lógica para obtener beneficiarios
    pass

# ... (PUT y DELETE)
