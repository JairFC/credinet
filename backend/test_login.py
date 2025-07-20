import requests
import asyncpg
import asyncio
import bcrypt
import os

# --- Configuración ---
API_URL = "http://localhost:8001"
DB_URL = f"postgresql://{os.getenv('POSTG-RES_USER', 'credinet_user')}:{os.getenv('POSTGRES_PASSWORD', 'credinet_pass')}@{os.getenv('POSTGRES_HOST', 'localhost')}/{os.getenv('POSTGRES_DB', 'credinet_db')}"
USERNAME = "admin"
PASSWORD = "Sparrow20"

async def test_login():
    print("--- Iniciando Script de Diagnóstico de Login ---")
    
    # --- Paso 1: Verificación Directa de Contraseña ---
    print("\n[Paso 1/2] Verificando la contraseña directamente contra la BD...")
    try:
        conn = await asyncpg.connect(DB_URL)
        user_record = await conn.fetchrow("SELECT password_hash FROM users WHERE username = $1", USERNAME)
        await conn.close()
        
        if not user_record:
            print(f"❌ ERROR: Usuario '{USERNAME}' no encontrado en la base de datos.")
            return

        password_hash_from_db = user_record['password_hash']
        print(f"  - Hash de la BD: {password_hash_from_db}")
        
        if bcrypt.checkpw(PASSWORD.encode('utf-8'), password_hash_from_db.encode('utf-8')):
            print("  ✅ ÉXITO: La contraseña es correcta para el hash almacenado.")
        else:
            print("  ❌ ERROR: La contraseña NO COINCIDE con el hash almacenado.")
            return
            
    except Exception as e:
        print(f"  ❌ ERROR al conectar o verificar con la BD: {e}")
        return

    # --- Paso 2: Prueba de la API ---
    print("\n[Paso 2/2] Realizando petición POST a la API /api/auth/login...")
    try:
        login_data = {'username': USERNAME, 'password': PASSWORD}
        response = requests.post(f"{API_URL}/api/auth/login", data=login_data)
        
        print(f"  - Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("  ✅ ÉXITO: La API devolvió un 200 OK.")
            print(f"  - Respuesta (Token): {response.json()}")
        else:
            print("  ❌ ERROR: La API devolvió un error.")
            try:
                print(f"  - Detalle del Error: {response.json()}")
            except:
                print(f"  - Respuesta (no JSON): {response.text}")

    except requests.exceptions.RequestException as e:
        print(f"  ❌ ERROR de conexión a la API: {e}")

if __name__ == "__main__":
    asyncio.run(test_login())
