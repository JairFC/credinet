from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
import asyncpg
import bcrypt
from typing import List

from .schemas import UserCreate, UserResponse, Token, UserUpdate
from .jwt import create_access_token, authenticate_user, get_current_user, require_role
from .roles import UserRole
from app.core.config import settings
from app.common import database
from app.loans.schemas import ClientDashboardResponse, ClientDashboardSummary, ClientDashboardLoan, ClientDashboardPayment
from app.logic import get_enriched_loan

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
            # Convertir el rol a string para la BD
            role_value = user_data.role.value if isinstance(user_data.role, UserRole) else user_data.role
            
            new_user_record = await conn.fetchrow(
                """
                INSERT INTO users (username, password_hash, role, associate_id) VALUES ($1, $2, $3, $4)
                RETURNING id, username, role, associate_id
                """,
                user_data.username,
                hashed_password.decode('utf-8'),
                role_value,
                user_data.associate_id
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
    # 1. Encontrar el client_id a partir del user_id
    client_record = await conn.fetchrow("SELECT id FROM clients WHERE user_id = $1", current_user.id)
    if not client_record:
        raise HTTPException(status_code=404, detail="No se encontró un cliente asociado a este usuario.")
    client_id = client_record['id']

    # 2. Obtener todos los préstamos del cliente
    loan_ids_records = await conn.fetch("SELECT id FROM loans WHERE client_id = $1", client_id)
    
    all_client_loans = []
    for record in loan_ids_records:
        enriched_loan = await get_enriched_loan(conn, record['id'])
        if enriched_loan:
            all_client_loans.append(enriched_loan)

    # 3. Calcular el resumen
    active_loans = [loan for loan in all_client_loans if loan['status'] == 'active']
    summary = ClientDashboardSummary(
        active_loans_count=len(active_loans),
        total_outstanding_balance=sum(loan['outstanding_balance'] for loan in active_loans)
    )

    # 4. Obtener los pagos recientes
    recent_payments_records = await conn.fetch(
        """
        SELECT p.id, p.loan_id, p.amount_paid, p.payment_date
        FROM payments p
        JOIN loans l ON p.loan_id = l.id
        WHERE l.client_id = $1
        ORDER BY p.payment_date DESC
        LIMIT 5
        """,
        client_id
    )

    return ClientDashboardResponse(
        summary=summary,
        loans=[ClientDashboardLoan.model_validate(loan) for loan in all_client_loans],
        recent_payments=[ClientDashboardPayment.model_validate(dict(p)) for p in recent_payments_records]
    )


@router.get("/users", response_model=List[UserResponse])
async def read_users(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Obtiene una lista de todos los usuarios.
    """
    async with database.db_pool.acquire() as conn:
        users = await conn.fetch("SELECT id, username, role, associate_id FROM users")
        return [dict(user) for user in users]

# ... (resto de las rutas de /users sin cambios)
