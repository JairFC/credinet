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


@router.get("/zip-code/{zip_code}", summary="Consultar información de un código postal")
async def get_zip_code_info(zip_code: str):
    """
    Consulta la información de un código postal utilizando una API externa.
    """
    if not zip_code.isdigit() or len(zip_code) != 5:
        raise HTTPException(status_code=400, detail="El código postal debe ser un número de 5 dígitos.")

    async with httpx.AsyncClient() as client:
        try:
            # Preparamos los headers que la API externa espera
            headers = {
                'Content-Type': 'application/json',
                'APIKEY': '77b8b04b005aaff3abe8300c9d43f503f73ffe26'
            }
            
            # Hacemos la petición GET con los parámetros y headers correctos
            response = await client.get(f"{ZIP_CODE_API_URL}", params={"cp": zip_code}, headers=headers)
            
            response.raise_for_status()  # Lanza una excepción para respuestas 4xx/5xx
            data = response.json()
            
            # La API devuelve los datos anidados bajo la clave 'codigo_postal'
            cp_data = data.get("codigo_postal", {})

            if not cp_data:
                raise HTTPException(status_code=404, detail="No se encontró información para el código postal.")

            return {
                "estado": cp_data.get("estado"),
                "municipio": cp_data.get("municipio"),
                "colonias": cp_data.get("colonias", []),
            }

        except httpx.HTTPStatusError as exc:
            # Capturamos el detalle del error de la API externa para más claridad
            error_detail = exc.response.text
            raise HTTPException(status_code=exc.response.status_code, detail=f"Error al consultar el código postal: {error_detail}")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")
