import asyncio
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
import asyncpg
from typing import List

from app.auth.schemas import TokenData, UserResponse, UserInDB
from app.core.config import settings
from app.common.database import get_db
from app.common.database import get_user_roles

# Configuración de seguridad
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

import logging

logger = logging.getLogger(__name__)

async def authenticate_user(conn: asyncpg.Connection, identifier: str, password: str) -> UserInDB | None:
    """
    Busca un usuario por username, email o phone_number, verifica su contraseña y devuelve sus datos.
    """
    logger.info(f"Attempting to authenticate user with identifier: {identifier}")
    query = "SELECT * FROM users WHERE username = $1 OR email = $1 OR phone_number = $1"
    user_record = await conn.fetchrow(query, identifier)
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
    user_dict = dict(user_record)
    user_dict['roles'] = await get_user_roles(conn, user_dict['id'])
    return UserInDB(**user_dict)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), conn: asyncpg.Connection = Depends(get_db)) -> UserInDB:
    """Decodifica el token, valida el usuario y devuelve el modelo completo de BD con sus roles."""
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
    
    user_record = await conn.fetchrow("SELECT * FROM users WHERE username = $1", username)
    if user_record is None:
        raise credentials_exception
    
    user_dict = dict(user_record)
    user_dict['roles'] = await get_user_roles(conn, user_dict['id'])
    return UserInDB(**user_dict)

async def get_current_user_response(user: UserInDB = Depends(get_current_user)) -> UserResponse:
    """Devuelve un modelo UserResponse a partir del usuario actual."""
    return UserResponse.model_validate(user)

def require_roles(required_roles: list[str]):
    """
    Factoría de dependencias para requerir uno de varios roles.
    """
    async def role_checker(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
        if "desarrollador" in current_user.roles:
            return current_user
        
        if not any(role in current_user.roles for role in required_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los siguientes roles: {', '.join(required_roles)}.",
            )
        return current_user
    return role_checker

