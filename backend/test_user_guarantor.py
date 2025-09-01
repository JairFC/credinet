import requests
import os

def get_admin_token(api_url, username="admin", password="Sparrow20"):
    resp = requests.post(f"{api_url}/auth/login", data={"username": username, "password": password}, timeout=10)
    resp.raise_for_status()
    token = resp.json().get("access_token")
    assert token, "No se recibió access_token."
    return token

def test_user_guarantor():
    """
    Verifica que el endpoint de detalle de usuario incluya el campo 'guarantor' y que los datos sean correctos.
    """
    # Detectar puerto correcto: 8001 (host) o 8000 (dentro de docker)
    api_url = os.environ.get("API_URL")
    if not api_url:
        # Probar ambos puertos
        for url in ["http://localhost:8001/api", "http://localhost:8000/api", "http://backend:8000/api"]:
            try:
                r = requests.get(f"{url}/ping", timeout=3)
                if r.status_code == 200:
                    api_url = url
                    break
            except Exception:
                continue
    assert api_url, "No se pudo determinar el API_URL correcto."

    admin_token = get_admin_token(api_url)
    user_id = os.environ.get("GUARANTOR_USER_ID", "40")
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = requests.get(f"{api_url}/auth/users/{user_id}", headers=headers, timeout=10)
    r.raise_for_status()
    data = r.json()
    assert "guarantor" in data, "La respuesta no contiene el campo 'guarantor'"
    g = data["guarantor"]
    assert g is not None, "El campo 'guarantor' es None, pero debería existir para este usuario"
    assert g["full_name"] == "Maria Cruz", f"Nombre incorrecto: {g['full_name']}"
    assert g["relationship"] == "Madre", f"Parentesco incorrecto: {g['relationship']}"
    assert g["phone_number"] == "6143618296", f"Teléfono incorrecto: {g['phone_number']}"
    assert g["curp"] == "FACJ950525HCHRRR04", f"CURP incorrecta: {g['curp']}"
    print("[OK] El endpoint de usuario retorna correctamente el aval (guarantor)")

if __name__ == "__main__":
    test_user_guarantor()
