# backend/app/common/database.py
import asyncpg
import os
from contextlib import asynccontextmanager
from app.core.config import settings
from typing import List

# Esta configuración se usará por defecto
DATABASE_URL = f"postgresql://{os.getenv('POSTGRES_USER')}:{os.getenv('POSTGRES_PASSWORD')}@{os.getenv('POSTGRES_HOST')}/{os.getenv('POSTGRES_DB')}"

db_pool = None

async def create_db_pool():
    global db_pool
    if db_pool is None:
        # Si la variable de entorno TESTING está puesta, usa la URL de prueba.
        url = settings.TEST_DATABASE_URL if os.getenv('TESTING') else DATABASE_URL
        db_pool = await asyncpg.create_pool(url)
        print(f"✅ Pool de conexiones a la base de datos creado para: {url.split('@')[-1]}")

async def close_db_pool():
    global db_pool
    if db_pool:
        await db_pool.close()
        print("✅ Pool de conexiones a la base de datos cerrado.")

@asynccontextmanager
async def get_db_context():
    if db_pool is None:
        await create_db_pool()
    
    conn = None
    try:
        conn = await db_pool.acquire()
        yield conn
    finally:
        if conn:
            await db_pool.release(conn)

async def get_db():
    async with get_db_context() as conn:
        yield conn

async def get_user_roles(conn: asyncpg.Connection, user_id: int) -> List[str]:
    query = """
        SELECT r.name FROM roles r
        JOIN user_roles ur ON r.id = ur.role_id
        WHERE ur.user_id = $1
    """
    records = await conn.fetch(query, user_id)
    return [record['name'] for record in records]
