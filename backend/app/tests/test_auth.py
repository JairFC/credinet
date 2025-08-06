import pytest
from httpx import AsyncClient
from fastapi import status

# Marcar todas las pruebas de este módulo para que usen pytest-asyncio
pytestmark = pytest.mark.asyncio

async def test_register_user(client: AsyncClient):
    """
    Prueba el registro de un nuevo usuario.
    """
    test_username = "testuser"
    test_password = "testpassword"
    
    response = await client.post(
        "/api/auth/register",
        json={
            "username": test_username,
            "password": test_password,
            "role": "cliente" # Usamos el nuevo rol
        }
    )
    
    assert response.status_code == status.HTTP_201_CREATED
    
    data = response.json()
    assert data["username"] == test_username
    assert data["role"] == "cliente"
    assert "id" in data

async def test_register_existing_user_fails(client: AsyncClient):
    """
    Prueba que el registro falla si el usuario ya existe.
    """
    test_username = "admin" # Este usuario ya existe por el init.sql
    test_password = "testpassword"
    
    response = await client.post(
        "/api/auth/register",
        json={
            "username": test_username,
            "password": test_password,
            "role": "cliente"
        }
    )
    
    assert response.status_code == status.HTTP_409_CONFLICT
