from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import asyncpg
import bcrypt

from .schemas import UserCreate, UserResponse, Token, UserUpdate
from .jwt import create_access_token, authenticate_user, get_current_user
from app.core.config import settings
from app.common import database

router = APIRouter()

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate
):
    """
    Registra un nuevo usuario directamente en la base de datos.
    """
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    
    async with database.db_pool.acquire() as conn:
        try:
            new_user_record = await conn.fetchrow(
                """
                INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)
                RETURNING id, username, role
                """,
                user_data.username,
                hashed_password.decode('utf-8'),
                user_data.role
            )
            return dict(new_user_record)
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El nombre de usuario '{user_data.username}' ya existe."
            )

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
):
    async with database.db_pool.acquire() as conn:
        user = await authenticate_user(conn, form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=401,
                detail="Nombre de usuario o contraseña incorrectos",
                headers={"WWW-Authenticate": "Bearer"},
            )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.get("/users", response_model=list[UserResponse])
async def read_users(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Obtiene una lista de todos los usuarios.
    """
    async with database.db_pool.acquire() as conn:
        users = await conn.fetch("SELECT id, username, role FROM users")
        return [dict(user) for user in users]

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Elimina un usuario.
    """
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes eliminarte a ti mismo."
        )

    async with database.db_pool.acquire() as conn:
        result = await conn.execute("DELETE FROM users WHERE id = $1", user_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Usuario con id {user_id} no encontrado.")
    return

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Actualiza la contraseña de un usuario.
    """
    if current_user.id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No puedes actualizar la contraseña de otro usuario."
        )

    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    
    async with database.db_pool.acquire() as conn:
        updated_user_record = await conn.fetchrow(
            """
            UPDATE users SET password_hash = $1 WHERE id = $2
            RETURNING id, username
            """,
            hashed_password.decode('utf-8'),
            user_id
        )
        if not updated_user_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Usuario con id {user_id} no encontrado.")
    
    return dict(updated_user_record)

@router.get("/users/{user_id}", response_model=UserResponse)
async def read_user(
    user_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Obtiene un usuario por su ID.
    """
    async with database.db_pool.acquire() as conn:
        user = await conn.fetchrow("SELECT id, username FROM users WHERE id = $1", user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Usuario con id {user_id} no encontrado.")
        return dict(user)
