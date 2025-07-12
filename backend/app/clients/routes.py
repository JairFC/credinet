from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.auth.jwt import get_current_user
from app.auth.schemas import UserResponse
from app.common import database
from . import schemas
import asyncpg

router = APIRouter()

@router.post("/", response_model=schemas.ClientResponse, status_code=201)
async def create_client(
    client: schemas.ClientCreate,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        try:
            user_id_to_assign = client.user_id if client.user_id is not None else current_user.id
            query = """
            INSERT INTO clients (first_name, last_name, email, user_id)
            VALUES ($1, $2, $3, $4)
            RETURNING id, first_name, last_name, email, user_id
            """
            new_client_record = await conn.fetchrow(
                query, client.first_name, client.last_name, client.email, user_id_to_assign
            )
            return dict(new_client_record)
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un cliente con el email '{client.email}'."
            )

@router.get("/", response_model=List[schemas.ClientResponse])
async def get_clients(
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        query = """
        SELECT
            c.id,
            c.first_name,
            c.last_name,
            c.email,
            c.user_id,
            (
                SELECT a.name
                FROM associates a
                JOIN loans l ON a.id = l.associate_id
                WHERE l.client_id = c.id
                ORDER BY l.created_at DESC
                LIMIT 1
            ) AS associate_name
        FROM clients c
        ORDER BY c.last_name;
        """
        clients_records = await conn.fetch(query)
        return [dict(record) for record in clients_records]

@router.get("/{client_id}", response_model=schemas.ClientResponse)
async def get_client(
    client_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        client_record = await conn.fetchrow("SELECT id, first_name, last_name, email, user_id FROM clients WHERE id = $1", client_id)
        if not client_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cliente con id {client_id} no encontrado.")
        return dict(client_record)

@router.put("/{client_id}", response_model=schemas.ClientResponse)
async def update_client(
    client_id: int,
    client_data: schemas.ClientUpdate,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        try:
            # Primero, verificamos que el cliente exista
            existing_client = await conn.fetchrow("SELECT id FROM clients WHERE id = $1", client_id)
            if not existing_client:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cliente con id {client_id} no encontrado.")

            query = """
            UPDATE clients SET first_name = $1, last_name = $2, email = $3
            WHERE id = $4
            RETURNING id, first_name, last_name, email, user_id
            """
            updated_record = await conn.fetchrow(query, client_data.first_name, client_data.last_name, client_data.email, client_id)
            return dict(updated_record)
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"El email '{client_data.email}' ya está en uso.")

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    current_user: UserResponse = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        # aexecute devuelve 'DELETE N' donde N es el número de filas borradas.
        result = await conn.execute("DELETE FROM clients WHERE id = $1", client_id)

        if result == "DELETE 0":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cliente con id {client_id} no encontrado.")