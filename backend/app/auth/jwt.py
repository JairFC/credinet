import asyncio
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
import asyncpg

from app.auth.schemas import TokenData, UserResponse, UserInDB
from app.core.config import settings
from app.common import database

# Configuración de seguridad
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def authenticate_user(conn: asyncpg.Connection, username: str, password: str) -> UserInDB | None:
    """
    Busca un usuario, verifica su contraseña y devuelve sus datos, incluido el rol.
    """
    user_record = await conn.fetchrow("SELECT * FROM users WHERE username = $1", username)
    if not user_record:
        return None

    is_password_correct = await asyncio.to_thread(pwd_context.verify, password, user_record['password_hash'])
    if not is_password_correct:
        return None

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
    return UserResponse(id=user.id, username=user.username, role=user.role)


def require_role(required_role: str):
    """
    Factoría de dependencias para requerir un rol específico.
    """
    async def role_checker(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
        if current_user.role != required_role and current_user.role != 'desarrollador':
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere el rol '{required_role}'.",
            )
        return current_user
    return role_checker

def require_roles(required_roles: list[str]):
    """
    Factoría de dependencias para requerir uno de varios roles.
    """
    async def role_checker(current_user: UserInDB = Depends(get_current_user)) -> UserInDB:
        # El desarrollador siempre tiene acceso
        if 'desarrollador' in current_user.role:
            return current_user
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Acceso denegado. Se requiere uno de los siguientes roles: {', '.join(required_roles)}.",
            )
        return current_user
    return role_checker
