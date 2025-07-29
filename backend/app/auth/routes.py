from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import OAuth2PasswordRequestForm
import asyncpg
from typing import List

from app.auth.schemas import UserCreate, UserResponse, Token, UserUpdate, PaginatedUserResponse, UserInDB
from app.auth.jwt import create_access_token, authenticate_user, get_current_user, require_roles, pwd_context
from app.common.database import get_db, get_user_roles
from app.loans.schemas import ClientDashboardResponse, ClientDashboardSummary, ClientDashboardLoan, ClientDashboardPayment
from app.logic import get_enriched_loan

router = APIRouter()

@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    user_data: UserCreate,
    current_user: UserInDB = Depends(require_roles(["administrador", "desarrollador"])),
    conn: asyncpg.Connection = Depends(get_db)
):
    hashed_password = pwd_context.hash(user_data.password)
    
    async with conn.transaction():
        try:
            new_user_record = await conn.fetchrow(
                """
                INSERT INTO users (username, password_hash, first_name, last_name, email, phone_number, associate_id, birth_date, curp)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING id, username, first_name, last_name, email, phone_number, associate_id, updated_at, birth_date, curp, profile_picture_url, address_street, address_ext_num, address_int_num, address_colonia, address_zip_code, address_state
                """,
                user_data.username, hashed_password,
                user_data.first_name, user_data.last_name, user_data.email, user_data.phone_number,
                user_data.associate_id, user_data.birth_date, user_data.curp
            )

            user_dict = dict(new_user_record) # Initialize user_dict here

            role_ids_records = await conn.fetch("SELECT id FROM roles WHERE name = ANY($1::text[])", user_data.roles)
            if len(role_ids_records) != len(user_data.roles):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uno o más roles no son válidos.")

            role_ids = [record['id'] for record in role_ids_records]
            for role_id in role_ids:
                await conn.execute("INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)", new_user_record['id'], role_id)

            # Si se proporcionan datos del beneficiario, crearlo.
            if user_data.beneficiary:
                await conn.execute(
                    """
                    INSERT INTO beneficiaries (user_id, full_name, relationship, phone_number)
                    VALUES ($1, $2, $3, $4)
                    """,
                    new_user_record['id'],
                    user_data.beneficiary.full_name,
                    user_data.beneficiary.relationship,
                    user_data.beneficiary.phone_number
                )

            # Si se proporcionan datos del asociado, crearlo y vincularlo al usuario
            if user_data.associate_data:
                # Generar el nombre del asociado a partir del nombre y apellido del usuario
                associate_name = f"{user_data.first_name} {user_data.last_name}"
                new_associate_record = await conn.fetchrow(
                    """
                    INSERT INTO associates (name, level_id, contact_person, contact_email, default_commission_rate)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING id
                    """,
                    associate_name,
                    user_data.associate_data.level_id,
                    user_data.associate_data.contact_person or f"{user_data.first_name} {user_data.last_name}",
                    user_data.associate_data.contact_email or user_data.email,
                    user_data.associate_data.default_commission_rate
                )
                # Actualizar el usuario recién creado con el associate_id
                await conn.execute(
                    "UPDATE users SET associate_id = $1 WHERE id = $2",
                    new_associate_record['id'],
                    new_user_record['id']
                )
                # Actualizar el user_dict para que la respuesta incluya el associate_id
                user_dict['associate_id'] = new_associate_record['id']

        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El nombre de usuario o email ya existe.")

    user_dict['roles'] = user_data.roles
    return UserResponse.model_validate(user_dict)


@router.post("/login", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    conn: asyncpg.Connection = Depends(get_db)
):
    user = await authenticate_user(conn, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Nombre de usuario o contraseña incorrectos", headers={"WWW-Authenticate": "Bearer"})
    
    token_data = {"sub": user.username, "roles": user.roles}
    if "asociado" in user.roles and user.associate_id:
        token_data["associate_id"] = user.associate_id
        
    access_token = create_access_token(data=token_data)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: UserInDB = Depends(get_current_user)):
    user_dict = current_user.model_dump()
    return UserResponse.model_validate(user_dict)

@router.get("/me/dashboard", response_model=ClientDashboardResponse)
async def get_client_dashboard(
    current_user: UserInDB = Depends(require_roles(["cliente"])),
    conn: asyncpg.Connection = Depends(get_db)
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
    page: int = 1,
    limit: int = 20,
    role: str = None,
    search: str = None,
    conn: asyncpg.Connection = Depends(get_db),
    current_user: UserInDB = Depends(require_roles(["administrador", "desarrollador"]))
):
    offset = (page - 1) * limit
    
    params = []
    where_clauses = []

    if role:
        params.append(role)
        where_clauses.append(f"id IN (SELECT user_id FROM user_roles ur JOIN roles r ON ur.role_id = r.id WHERE r.name = ${len(params)})")

    if search:
        params.append(f"%{search}%")
        search_fields = ["username", "first_name", "last_name", "email", "phone_number"]
        search_conditions = " OR ".join([f"{field} ILIKE ${len(params)}" for field in search_fields])
        where_clauses.append(f"({search_conditions})")

    where_sql = ""
    if where_clauses:
        where_sql = " WHERE " + " AND ".join(where_clauses)

    base_query = f"FROM users{where_sql}"
    count_query = "SELECT COUNT(id) " + base_query
    data_query = "SELECT * " + base_query

    total_records = await conn.fetchval(count_query, *params)
    
    data_query += f" ORDER BY id LIMIT ${len(params) + 1} OFFSET ${len(params) + 2}"
    params.extend([limit, offset])
    
    user_records = await conn.fetch(data_query, *params)
    
    items = []
    for user_record in user_records:
        user_dict = dict(user_record)
        user_dict['roles'] = await get_user_roles(conn, user_dict['id'])
        items.append(UserResponse.model_validate(user_dict))

    return {
        "items": items,
        "total": total_records,
        "page": page,
        "limit": limit,
        "pages": (total_records + limit - 1) // limit if limit > 0 else 0
    }
