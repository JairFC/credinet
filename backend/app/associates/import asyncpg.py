import asyncpg
from .database import connect_to_db

async def get_db_connection():
    """
    FastAPI dependency to get a database connection.

    This function establishes a connection to the database, yields it to the
    route function, and ensures that the connection is closed properly
    after the request is finished, even if an error occurs.
    """
    conn = None
    try:
        conn = await connect_to_db()
        yield conn
    finally:
        if conn:
            await conn.close()