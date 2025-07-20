import asyncio
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
import asyncpg

from app.auth.schemas import TokenData, UserResponse, UserInDB
from app.auth.roles import UserRole
from app.core.config import settings
from app.common import database

# Configuración de seguridad
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

import logging

logger = logging.getLogger(__name__)

async def authenticate_user(conn: asyncpg.Connection, username: str, password: str) -> UserInDB | None:
    """
    Busca un usuario, verifica su contraseña y devuelve sus datos, incluido el rol.
    """
    logger.info(f"Attempting to authenticate user: {username}")
    user_record = await conn.fetchrow("SELECT * FROM users WHERE username = $1", username)
    if not user_record:
        logger.warning(f"Authentication failed: User '{username}' not found.")
        return None
    
    logger.info(f"User '{username}' found. Verifying password.")
    password_hash_from_db = user_record['password_hash']
    
    try:
        is_password_correct = await asyncio.to_thread(pwd_context.verify, password, password_hash_from_db)
        if not is_password_correct:
            logger.warning(f"Authentication failed: Incorrect password for user '{username}'.")
            return None
    except Exception as e:
        logger.error(f"Error during password verification for user '{username}': {e}", exc_info=True)
        return None

    logger.info(f"Authentication successful for user: {username}")
    return UserInDB(**dict(user_record))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # El rol ya debe estar en 'data'
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserInDB:
    """Decodifica el token, valida el usuario y devuelve el modelo completo de BD."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    async with database.db_pool.acquire() as conn:
        user_record = await conn.fetchrow("SELECT * FROM users WHERE username = $1", username)
        if user_record is None:
            raise credentials_exception
        return UserInDB(**dict(user_record))

async def get_current_user_response(user: UserInDB = Depends(get_current_user)) -> UserResponse:
    """Devuelve un modelo UserResponse a partir del usuario actual."""
    return UserResponse.model_validate(user)


def require_role(required_role: UserRole):
    """
    Factoría de dependencias para requerir un rol específico.
    """
    async def role_checker(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
        if current_user.role == UserRole.DESARROLLADOR:
            return current_user
        if current_user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere el rol '{required_role.value}'.",
            )
        return current_user
    return role_checker

def require_roles(required_roles: list[UserRole]):
    """
    Factoría de dependencias para requerir uno de varios roles.
    """
    async def role_checker(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
        # El desarrollador siempre tiene acceso
        if current_user.role == UserRole.DESARROLLADOR:
            return current_user
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los siguientes roles: {', '.join(role.value for role in required_roles)}.",
            )
        return current_user
    return role_checker
