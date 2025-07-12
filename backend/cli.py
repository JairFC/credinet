import asyncio
import typer
import bcrypt
import asyncpg
import sys
from app.common.database import DB_CONFIG

app = typer.Typer()

async def _create_user(username, password):
    """Función asíncrona para crear el usuario."""
    conn = None
    try:
        conn = await asyncpg.connect(**DB_CONFIG)
        
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        # Usamos INSERT ... ON CONFLICT para manejar la creación y actualización
        await conn.execute(
            """
            INSERT INTO users (username, password_hash) VALUES ($1, $2)
            ON CONFLICT (username) DO NOTHING;
            """,
            username,
            hashed_password.decode('utf-8')
        )
        
        # Verificamos si la fila fue insertada
        result = await conn.fetchval("SELECT username FROM users WHERE username = $1", username)
        if result:
            print(f"✅ Usuario '{username}' creado/actualizado exitosamente.")
        else:
            # Esto podría ocurrir si el ON CONFLICT se activa
            print(f"✅ Usuario '{username}' ya existía, no se realizaron cambios.")

    except asyncpg.exceptions.UniqueViolationError:
        print(f"❌ Error: El nombre de usuario '{username}' ya existe.", file=sys.stderr)
        # Devolvemos un código de error específico para el conflicto
        sys.exit(10)
    except Exception as e:
        print(f"❌ Error al crear el usuario: {e}", file=sys.stderr)
        sys.exit(1)
    finally:
        if conn:
            await conn.close()

@app.command()
def create(username: str = typer.Option(..., "--username", help="Nombre de usuario."),
           password: str = typer.Option(..., "--password", help="Contraseña para el usuario.")):
    """
    Crea un nuevo usuario en la base de datos con una contraseña hasheada.
    Diseñado para ser llamado desde un script.
    """
    asyncio.run(_create_user(username, password))

if __name__ == "__main__":
    app()
