from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.auth.jwt import get_current_user
from app.auth.schemas import UserInDB  # Importar el modelo completo
from app.common import database
from . import schemas
import asyncpg

router = APIRouter()

@router.post("/", response_model=schemas.ClientResponse, status_code=201)
async def create_client(
    client: schemas.ClientCreate,
    current_user: UserInDB = Depends(get_current_user)
):
    # Solo los roles administrativos pueden crear clientes
    if current_user.role not in ["desarrollador", "administrador", "auxiliar_administrativo"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para crear clientes.")

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
            # Para la respuesta, necesitamos el associate_name, que será nulo para un cliente nuevo sin préstamos.
            response_dict = dict(new_client_record)
            response_dict['associate_name'] = None
            return response_dict
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un cliente con el email '{client.email}'."
            )

@router.get("/", response_model=List[schemas.ClientResponse])
async def get_clients(
    current_user: UserInDB = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        params = []
        # Subconsulta para obtener el nombre del asociado del préstamo más reciente
        associate_name_subquery = """
        (
            SELECT a.name
            FROM associates a
            JOIN loans l ON a.id = l.associate_id
            WHERE l.client_id = c.id
            ORDER BY l.created_at DESC
            LIMIT 1
        ) AS associate_name
        """

        if current_user.role == 'asociado':
            if not current_user.associate_id:
                raise HTTPException(status_code=403, detail="El usuario asociado no tiene un ID de asociado asignado.")
            
            # La consulta ahora selecciona explícitamente el nombre del asociado actual.
            query = """
            SELECT c.id, c.first_name, c.last_name, c.email, c.user_id,
                   (SELECT name FROM associates WHERE id = $1) AS associate_name
            FROM clients c
            WHERE EXISTS (
                SELECT 1 FROM loans l WHERE l.client_id = c.id AND l.associate_id = $1
            )
            ORDER BY c.last_name;
            """
            params.append(current_user.associate_id)
        else:
            # La consulta original para roles administrativos
            query = f"""
            SELECT c.id, c.first_name, c.last_name, c.email, c.user_id, {associate_name_subquery}
            FROM clients c
            ORDER BY c.last_name;
            """

        clients_records = await conn.fetch(query, *params)
        return [dict(record) for record in clients_records]

@router.get("/{client_id}", response_model=schemas.ClientResponse)
async def get_client(
    client_id: int,
    current_user: UserInDB = Depends(get_current_user)
):
    async with database.db_pool.acquire() as conn:
        client_record = await conn.fetchrow("SELECT id, first_name, last_name, email, user_id FROM clients WHERE id = $1", client_id)
        if not client_record:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cliente con id {client_id} no encontrado.")
        
        response_dict = dict(client_record)
        
        # Añadimos el nombre del asociado para consistencia
        associate_name = await conn.fetchval("""
            SELECT a.name FROM associates a JOIN loans l ON a.id = l.associate_id
            WHERE l.client_id = $1 ORDER BY l.created_at DESC LIMIT 1
        """, client_id)
        response_dict['associate_name'] = associate_name
        
        return response_dict

@router.put("/{client_id}", response_model=schemas.ClientResponse)
async def update_client(
    client_id: int,
    client_data: schemas.ClientUpdate,
    current_user: UserInDB = Depends(get_current_user)
):
    if current_user.role not in ["desarrollador", "administrador", "auxiliar_administrativo"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para actualizar clientes.")

    async with database.db_pool.acquire() as conn:
        try:
            existing_client = await conn.fetchrow("SELECT id FROM clients WHERE id = $1", client_id)
            if not existing_client:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cliente con id {client_id} no encontrado.")

            query = """
            UPDATE clients SET first_name = $1, last_name = $2, email = $3
            WHERE id = $4
            RETURNING id, first_name, last_name, email, user_id
            """
            updated_record = await conn.fetchrow(query, client_data.first_name, client_data.last_name, client_data.email, client_id)
            
            response_dict = dict(updated_record)
            associate_name = await conn.fetchval("""
                SELECT a.name FROM associates a JOIN loans l ON a.id = l.associate_id
                WHERE l.client_id = $1 ORDER BY l.created_at DESC LIMIT 1
            """, client_id)
            response_dict['associate_name'] = associate_name
            
            return response_dict
        except asyncpg.exceptions.UniqueViolationError:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"El email '{client_data.email}' ya está en uso.")

@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: int,
    current_user: UserInDB = Depends(get_current_user)
):
    if current_user.role not in ["desarrollador", "administrador"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permiso para eliminar clientes.")

    async with database.db_pool.acquire() as conn:
        result = await conn.execute("DELETE FROM clients WHERE id = $1", client_id)

        if result == "DELETE 0":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cliente con id {client_id} no encontrado.")
