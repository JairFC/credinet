from fastapi import APIRouter, HTTPException, Depends
import httpx
import asyncpg
from app.common.database import get_db

router = APIRouter()

ZIP_CODE_API_URL = "https://api.tau.com.mx/dipomex/v1/codigo_postal"

@router.get("/check-curp/{curp}", summary="Verificar si una CURP ya existe")
async def check_curp_exists(curp: str, conn: asyncpg.Connection = Depends(get_db)):
    """
    Verifica si una CURP ya está registrada en la base de datos.
    """
    if not curp or len(curp) != 18:
        raise HTTPException(status_code=400, detail="La CURP debe tener 18 caracteres.")
    
    record = await conn.fetchrow("SELECT id FROM users WHERE curp = $1", curp.upper())
    
    return {"exists": record is not None}

@router.get("/check-username/{username}", summary="Verificar si un nombre de usuario ya existe")
async def check_username_exists(username: str, conn: asyncpg.Connection = Depends(get_db)):
    """
    Verifica si un nombre de usuario ya está registrado en la base de datos.
    """
    if not username:
        raise HTTPException(status_code=400, detail="El nombre de usuario no puede estar vacío.")
    
    record = await conn.fetchrow("SELECT id FROM users WHERE username = $1", username)
    
    return {"exists": record is not None}


@router.get("/check-phone/{phone_number}", summary="Verificar si un número de teléfono ya existe")
async def check_phone_exists(phone_number: str, conn: asyncpg.Connection = Depends(get_db)):
    """
    Verifica si un número de teléfono ya está registrado en la base de datos.
    """
    if not phone_number or not phone_number.isdigit() or len(phone_number) != 10:
        raise HTTPException(status_code=400, detail="El número de teléfono debe tener 10 dígitos.")
    
    record = await conn.fetchrow("SELECT id FROM users WHERE phone_number = $1", phone_number)
    
    return {"exists": record is not None}

@router.get("/check-email/{email}", summary="Verificar si un email ya existe")
async def check_email_exists(email: str, conn: asyncpg.Connection = Depends(get_db)):
    """
    Verifica si un email ya está registrado en la base de datos.
    """
    if not email:
        raise HTTPException(status_code=400, detail="El email no puede estar vacío.")
    
    record = await conn.fetchrow("SELECT id FROM users WHERE email = $1", email.lower())
    
    return {"exists": record is not None}

# Endpoints de validación con formato esperado por el frontend
@router.get("/validate-username", summary="Validar disponibilidad de nombre de usuario")
async def validate_username(username: str, conn: asyncpg.Connection = Depends(get_db)):
    """
    Valida si un nombre de usuario está disponible.
    """
    if not username:
        raise HTTPException(status_code=400, detail="El nombre de usuario no puede estar vacío.")
    
    record = await conn.fetchrow("SELECT id FROM users WHERE username = $1", username)
    
    return {"available": record is None}

@router.get("/validate-curp", summary="Validar disponibilidad de CURP")
async def validate_curp(curp: str, conn: asyncpg.Connection = Depends(get_db)):
    """
    Valida si una CURP está disponible.
    """
    if not curp or len(curp) != 18:
        raise HTTPException(status_code=400, detail="La CURP debe tener 18 caracteres.")
    
    record = await conn.fetchrow("SELECT id FROM users WHERE curp = $1", curp.upper())
    
    return {"available": record is None}


@router.get("/zip-code/{zip_code}", summary="Consultar información de un código postal")
async def get_zip_code_info(zip_code: str):
    """
    Consulta la información de un código postal utilizando una API externa.
    """
    if not zip_code.isdigit() or len(zip_code) != 5:
        raise HTTPException(status_code=400, detail="El código postal debe ser un número de 5 dígitos.")

    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            # Preparamos los headers que la API externa espera
            headers = {
                'Content-Type': 'application/json',
                'APIKEY': '77b8b04b005aaff3abe8300c9d43f503f73ffe26'
            }
            
            # Hacemos la petición GET con los parámetros y headers correctos
            response = await client.get(f"{ZIP_CODE_API_URL}", params={"cp": zip_code}, headers=headers)
            
            if response.status_code == 404:
                # Código postal no encontrado, devolvemos datos por defecto
                return {
                    "estado": "DESCONOCIDO",
                    "municipio": "DESCONOCIDO",
                    "colonias": [],
                    "warning": "Código postal no encontrado en la API externa"
                }
            
            response.raise_for_status()  # Lanza una excepción para respuestas 4xx/5xx
            data = response.json()
            
            # La API devuelve los datos anidados bajo la clave 'codigo_postal'
            cp_data = data.get("codigo_postal", {})

            if not cp_data:
                # Fallback con datos por defecto
                return {
                    "estado": "DESCONOCIDO",
                    "municipio": "DESCONOCIDO", 
                    "colonias": [],
                    "warning": "No se encontró información específica para el código postal"
                }

            return {
                "estado": cp_data.get("estado", "DESCONOCIDO"),
                "municipio": cp_data.get("municipio", "DESCONOCIDO"),
                "colonias": cp_data.get("colonias", []),
            }

        except httpx.TimeoutException:
            # API externa no responde, devolvemos datos por defecto
            return {
                "estado": "DESCONOCIDO",
                "municipio": "DESCONOCIDO",
                "colonias": [],
                "warning": "Servicio de códigos postales temporalmente no disponible"
            }
        except httpx.HTTPStatusError as exc:
            # Error de la API externa, devolvemos datos por defecto
            return {
                "estado": "DESCONOCIDO", 
                "municipio": "DESCONOCIDO",
                "colonias": [],
                "warning": f"Error al consultar código postal (HTTP {exc.response.status_code})"
            }
        except Exception as e:
            # Cualquier otro error, devolvemos datos por defecto
            return {
                "estado": "DESCONOCIDO",
                "municipio": "DESCONOCIDO", 
                "colonias": [],
                "warning": f"Error interno: {str(e)}"
            }
