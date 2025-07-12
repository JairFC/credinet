# backend/app/common/database.py
import asyncpg
import os

DB_CONFIG = {
    "user": os.getenv("POSTGRES_USER"),
    "password": os.getenv("POSTGRES_PASSWORD"),
    "database": os.getenv("POSTGRES_DB"),
    "host": os.getenv("POSTGRES_HOST"),
}

db_pool = None

async def get_db_connection():
    return await db_pool.acquire()

async def close_db_connection(conn):
    await db_pool.release(conn)

async def create_db_pool():
    global db_pool
    db_pool = await asyncpg.create_pool(**DB_CONFIG)
    print("✅ Pool de conexiones a la base de datos creado.")

async def close_db_pool():
    global db_pool
    if db_pool:
        await db_pool.close()
        print("✅ Pool de conexiones a la base de datos cerrado.")