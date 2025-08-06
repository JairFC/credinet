import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient
import asyncpg
import os

# Establecer una variable de entorno para indicar que estamos en modo de prueba
os.environ['TESTING'] = 'True'

from app.main import app
from app.core.config import settings
from app.common import database

# Sobrescribir la URL de la base de datos ANTES de que la app la use
DB_CONFIG_TEST = {
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD"),
    "host": os.getenv("POSTGRES_HOST"),
}
TEST_DB_NAME = "credinet_test_db"
settings.TEST_DATABASE_URL = f"postgresql://{DB_CONFIG_TEST['user']}:{DB_CONFIG_TEST['password']}@{DB_CONFIG_TEST['host']}/{TEST_DB_NAME}"


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_database():
    """Crea y destruye la base de datos de prueba para toda la sesión."""
    conn = await asyncpg.connect(**DB_CONFIG_TEST, database='postgres')
    await conn.execute(f'DROP DATABASE IF EXISTS "{TEST_DB_NAME}"')
    await conn.execute(f'CREATE DATABASE "{TEST_DB_NAME}"')
    await conn.close()

    # Aplicar el schema a la base de datos de prueba
    test_conn = await asyncpg.connect(settings.TEST_DATABASE_URL)
    with open("../db/init.sql", "r") as f: # Ruta corregida
        await test_conn.execute(f.read())
    await test_conn.close()

    # La app ahora usará el pool de la BD de prueba gracias a la variable de entorno
    await database.create_db_pool()

    yield

    await database.close_db_pool()
    conn = await asyncpg.connect(**DB_CONFIG_TEST, database='postgres')
    await conn.execute(f'DROP DATABASE "{TEST_DB_NAME}"')
    await conn.close()


@pytest_asyncio.fixture(scope="function")
async def client() -> AsyncClient:
    """Proporciona un cliente HTTP para interactuar con la app en las pruebas."""
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac