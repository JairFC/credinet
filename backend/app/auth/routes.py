from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import asyncpg
import bcrypt
from typing import List, Optional
from pydantic import BaseModel

from .schemas import UserCreate, UserResponse, Token, UserUpdate, PaginatedUserResponse
from .jwt import create_access_token, authenticate_user, get_current_user, require_role, require_roles
from .roles import UserRole
from app.core.config import settings
from app.common import database
from app.loans.schemas import ClientDashboardResponse, ClientDashboardSummary, ClientDashboardLoan, ClientDashboardPayment
from app.logic import get_enriched_loan

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    current_user: UserResponse = Depends(require_roles([UserRole.ADMINISTRADOR, UserRole.DESARROLLADOR])),
    conn: asyncpg.Connection = Depends(database.get_db)
):
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    try:
        new_user_record = await conn.fetchrow(
            """
            INSERT INTO users (username, password_hash, role, first_name, last_name, email, phone_number, associate_id, birth_date, curp)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
            """,
            user_data.username, hashed_password.decode('utf-8'), user_data.role.value,
            user_data.first_name, user_data.last_name, user_data.email, user_data.phone_number,
            user_data.associate_id, user_data.birth_date, user_data.curp
        )
        return dict(new_user_record)
    except asyncpg.exceptions.UniqueViolationError:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El nombre de usuario o email ya existe.")

@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    conn: asyncpg.Connection = Depends(database.get_db)
):
    user = await authenticate_user(conn, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Nombre de usuario o contraseña incorrectos", headers={"WWW-Authenticate": "Bearer"})
    
    token_data = {"sub": user.username, "role": user.role.value}
    if user.role == UserRole.ASOCIADO and user.associate_id:
        token_data["associate_id"] = user.associate_id
        
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user

@router.get("/me/dashboard", response_model=ClientDashboardResponse)
async def get_client_dashboard(
    current_user: UserResponse = Depends(require_role(UserRole.CLIENTE)),
    conn: asyncpg.Connection = Depends(database.get_db)
):
    user_id = current_user.id
    loan_ids_records = await conn.fetch("SELECT id FROM loans WHERE user_id = $1", user_id)
    all_user_loans = [await get_enriched_loan(conn, r['id']) for r in loan_ids_records if await get_enriched_loan(conn, r['id'])]
    active_loans = [loan for loan in all_user_loans if loan['status'] == 'active']
    summary = ClientDashboardSummary(
        active_loans_count=len(active_loans),
        total_outstanding_balance=sum(loan['outstanding_balance'] for loan in active_loans)
    )
    recent_payments_records = await conn.fetch(
        "SELECT p.id, p.loan_id, p.amount_paid, p.payment_date FROM payments p JOIN loans l ON p.loan_id = l.id WHERE l.user_id = $1 ORDER BY p.payment_date DESC LIMIT 5",
        user_id
    )
    return ClientDashboardResponse(
        summary=summary,
        loans=[ClientDashboardLoan.model_validate(loan) for loan in all_user_loans],
        recent_payments=[ClientDashboardPayment.model_validate(dict(p)) for p in recent_payments_records]
    )

@router.get("/users", response_model=PaginatedUserResponse)
async def read_users(
    current_user: UserResponse = Depends(get_current_user),
    page: int = 1,
    limit: int = 20,
    role: Optional[str] = None,  # Parámetro opcional para filtrar por rol
    conn: asyncpg.Connection = Depends(database.get_db)
):
    offset = (page - 1) * limit
    
    # Construcción dinámica de la consulta
    params = []
    conditions = []

    if role:
        params.append(role)
        conditions.append(f"role = ${len(params)}")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    
    # Contar el total de registros con el filtro aplicado
    total_query = f"SELECT COUNT(id) FROM users {where_clause}"
    total_records = await conn.fetchval(total_query, *params)
    
    # Obtener los registros paginados con el filtro
    query_params = params + [limit, offset]
    query = f"SELECT * FROM users {where_clause} ORDER BY id LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}"
    user_records = await conn.fetch(query, *query_params)
    
    return {
        "items": [dict(user) for user in user_records],
        "total": total_records,
        "page": page,
        "limit": limit,
        "pages": (total_records + limit - 1) // limit if limit > 0 else 0
    }

@router.get("/users/{user_id}", response_model=UserResponse)
async def read_user(user_id: int, current_user: UserResponse = Depends(get_current_user), conn: asyncpg.Connection = Depends(database.get_db)):
    user = await conn.fetchrow("SELECT * FROM users WHERE id = $1", user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Usuario con id {user_id} no encontrado.")
    return dict(user)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, current_user: UserResponse = Depends(get_current_user), conn: asyncpg.Connection = Depends(database.get_db)):
    if current_user.id == user_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No puedes eliminarte a ti mismo.")
    result = await conn.execute("DELETE FROM users WHERE id = $1", user_id)
    if result == "DELETE 0":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Usuario con id {user_id} no encontrado.")

@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(user_id: int, user_data: UserUpdate, current_user: UserResponse = Depends(get_current_user), conn: asyncpg.Connection = Depends(database.get_db)):
    # Lógica de actualización completa
    pass