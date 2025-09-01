from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
import asyncpg

from app.common import database
from app.common.database import get_db
from app.auth.jwt import require_roles, get_current_user
from app.auth.schemas import UserInDB
from . import schemas

router = APIRouter()

@router.post("/", response_model=schemas.AssociateResponse, status_code=status.HTTP_201_CREATED)
async def create_associate(
    associate_data: schemas.AssociateCreate,
    current_user: UserInDB = Depends(require_roles(["desarrollador", "administrador"])),
    conn: asyncpg.Connection = Depends(get_db)
):
    """Crea un nuevo asociado"""
    try:
        result = await conn.fetchrow(
            """
            INSERT INTO associates (name, level_id, contact_person, contact_email, default_commission_rate)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, name, level_id, contact_person, contact_email, default_commission_rate, updated_at
            """,
            associate_data.name,
            associate_data.level_id,
            associate_data.contact_person,
            associate_data.contact_email,
            associate_data.default_commission_rate
        )
        return dict(result)
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Ya existe un asociado con ese nombre o email")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear el asociado: {str(e)}")

@router.get("/{associate_id}", response_model=schemas.AssociateResponse)
async def get_associate_by_id(
    associate_id: int,
    conn: asyncpg.Connection = Depends(database.get_db),
    current_user: UserInDB = Depends(require_roles(["desarrollador", "administrador", "auxiliar_administrativo", "asociado"]))
):
    """Obtiene detalles de un asociado por su ID"""
    record = await conn.fetchrow("SELECT * FROM associates WHERE id = $1", associate_id)
    if not record:
        raise HTTPException(status_code=404, detail="Asociado no encontrado")
    
    # Si el usuario es un asociado, solo puede ver sus propios datos
    if "asociado" in current_user.roles and current_user.associate_id != associate_id:
        raise HTTPException(status_code=403, detail="No tienes permiso para ver este asociado")
        
    return dict(record)

@router.put("/{associate_id}", response_model=schemas.AssociateResponse)
async def update_associate(
    associate_id: int,
    associate_data: schemas.AssociateUpdate,
    current_user: UserInDB = Depends(require_roles(["desarrollador", "administrador"])),
    conn: asyncpg.Connection = Depends(get_db)
):
    """Actualiza un asociado existente"""
    # Primero verificamos que el asociado exista
    exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM associates WHERE id = $1)", associate_id)
    if not exists:
        raise HTTPException(status_code=404, detail="Asociado no encontrado")
    
    try:
        result = await conn.fetchrow(
            """
            UPDATE associates 
            SET name = $1, level_id = $2, contact_person = $3, 
                contact_email = $4, default_commission_rate = $5
            WHERE id = $6
            RETURNING id, name, level_id, contact_person, contact_email, default_commission_rate, updated_at
            """,
            associate_data.name,
            associate_data.level_id,
            associate_data.contact_person,
            associate_data.contact_email,
            associate_data.default_commission_rate,
            associate_id
        )
        return dict(result)
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(status_code=400, detail="Ya existe un asociado con ese nombre o email")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar el asociado: {str(e)}")

@router.delete("/{associate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_associate(
    associate_id: int,
    current_user: UserInDB = Depends(require_roles(["desarrollador", "administrador"])),
    conn: asyncpg.Connection = Depends(get_db)
):
    """Elimina un asociado"""
    # Primero verificamos que el asociado exista
    exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM associates WHERE id = $1)", associate_id)
    if not exists:
        raise HTTPException(status_code=404, detail="Asociado no encontrado")
    
    # Verificamos si hay préstamos asociados
    loans_count = await conn.fetchval("SELECT COUNT(*) FROM loans WHERE associate_id = $1", associate_id)
    if loans_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"No se puede eliminar el asociado porque tiene {loans_count} préstamos asociados"
        )
    
    # Verificamos si hay usuarios asociados
    users_count = await conn.fetchval("SELECT COUNT(*) FROM users WHERE associate_id = $1", associate_id)
    if users_count > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"No se puede eliminar el asociado porque tiene {users_count} usuarios vinculados"
        )
    
    # Si no hay dependencias, eliminamos el asociado
    await conn.execute("DELETE FROM associates WHERE id = $1", associate_id)
    return None

@router.get("/levels", response_model=List[schemas.AssociateLevelResponse])
async def get_associate_levels(
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(require_roles(["desarrollador", "administrador", "auxiliar_administrativo"]))
):
    """Obtiene la lista de niveles de asociado disponibles"""
    records = await conn.fetch("SELECT * FROM associate_levels ORDER BY max_loan_amount")
    return [dict(record) for record in records]
