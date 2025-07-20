from typing import List
from pydantic import BaseModel
import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.jwt import require_roles, get_current_user
from app.auth.schemas import UserInDB, UserResponse
from app.auth.roles import UserRole
from app.common import database
from . import schemas
from app.loans.schemas import LoanResponse
from app.logic import get_enriched_loan

class PaginatedAssociateResponse(BaseModel):
    items: List[schemas.AssociateResponse]
    total: int
    page: int
    limit: int
    pages: int

router = APIRouter()

@router.get("/", response_model=PaginatedAssociateResponse)
async def get_associates(
    page: int = 1,
    limit: int = 20,
    conn: asyncpg.Connection = Depends(database.get_db)
):
    offset = (page - 1) * limit
    total_records = await conn.fetchval("SELECT COUNT(id) FROM associates")
    query = "SELECT * FROM associates ORDER BY id LIMIT $1 OFFSET $2"
    records = await conn.fetch(query, limit, offset)
    return {
        "items": [dict(rec) for rec in records],
        "total": total_records,
        "page": page,
        "limit": limit,
        "pages": (total_records + limit - 1) // limit if limit > 0 else 0
    }

class AssociateDashboardData(BaseModel):
    summary: schemas.AssociateSummaryResponse
    loans: List[LoanResponse]
    users: List[UserResponse]

@router.get("/dashboard", response_model=AssociateDashboardData)
async def get_associate_dashboard_data(
    current_user: UserInDB = Depends(get_current_user)
):
    if current_user.role != UserRole.ASOCIADO:
        raise HTTPException(status_code=403, detail="Acceso denegado.")
    
    associate_id = current_user.associate_id
    if not associate_id:
        raise HTTPException(status_code=404, detail="Usuario no está vinculado a ningún asociado.")

    async with database.db_pool.acquire() as conn:
        loan_ids_records = await conn.fetch("SELECT id FROM loans WHERE associate_id = $1", associate_id)
        
        enriched_loans_dicts = [await get_enriched_loan(conn, r['id']) for r in loan_ids_records if await get_enriched_loan(conn, r['id'])]
        
        summary_data = {
            "total_loans": len(enriched_loans_dicts), "active_loans": 0,
            "total_loaned_amount": 0.0, "total_outstanding_balance": 0.0, "total_commission": 0.0
        }
        for loan in enriched_loans_dicts:
            summary_data["total_loaned_amount"] += float(loan['amount'])
            summary_data["total_outstanding_balance"] += float(loan['outstanding_balance'])
            if loan['status'] == 'active': summary_data["active_loans"] += 1
            commission = float(loan['amount']) * (float(loan['commission_rate'] or 0) / 100.0)
            summary_data["total_commission"] += commission
        
        user_ids = {loan['user_id'] for loan in enriched_loans_dicts}
        users_records = []
        if user_ids:
            users_query = "SELECT id, username, role, first_name, last_name, email, phone_number, associate_id, updated_at FROM users WHERE id = ANY($1::int[])"
            users_records = await conn.fetch(users_query, list(user_ids))

    final_summary = schemas.AssociateSummaryResponse.model_validate(summary_data)
    final_loans = [LoanResponse.model_validate(loan) for loan in enriched_loans_dicts]
    final_users = [UserResponse.model_validate(dict(user)) for user in users_records] # Convertir a dict

    return AssociateDashboardData(
        summary=final_summary,
        loans=final_loans,
        users=final_users
    )

# ... (resto de las rutas)
