import requests
import os
import sys
import time

API_URL = "http://backend:8000"
ADMIN_USERNAME = "admin"
ASSOC_USERNAME = "asociado_test"
PASSWORD = "Sparrow20"

def run_health_check():
    print("--- Iniciando System Health Check ---")
    time.sleep(5)

    # 1. Ping
    try:
        response = requests.get(f"{API_URL}/api/ping", timeout=5)
        response.raise_for_status()
        print("✅ [1/7] Servidor está respondiendo.")
    except Exception as e:
        print(f"❌ [1/7] FALLO CRÍTICO: El servidor no responde. Error: {e}")
        sys.exit(1)

    # 2. Login Admin
    admin_token = None
    try:
        response = requests.post(f"{API_URL}/api/auth/login", data={'username': ADMIN_USERNAME, 'password': PASSWORD}, timeout=5)
        response.raise_for_status()
        admin_token = response.json().get("access_token")
        if not admin_token:
            raise ValueError("No se recibió access_token en el login.")
        print("✅ [2/7] Login de Admin funciona.")
    except Exception as e:
        print(f"❌ [2/7] FALLO CRÍTICO: Login de Admin falló. Error: {e}")
        sys.exit(1)

    # 3. Admin Endpoints
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    admin_endpoints = {
        "/api/auth/users": "items",
        "/api/associates/": "items",
        "/api/loans/": "items",
        "/api/loans/summary": "total_loans",
        "/api/loans/1": "id"
    }
    print("✅ [3/7] Probando endpoints de Admin...")
    for endpoint, key in admin_endpoints.items():
        try:
            res = requests.get(f"{API_URL}{endpoint}", headers=admin_headers, timeout=5)
            res.raise_for_status()
            if key in res.json():
                print(f"  - {endpoint}: OK")
            else:
                print(f"  - ❌ FALLO: {endpoint} no contiene la clave '{key}'.")
                sys.exit(1)
        except Exception as e:
            print(f"  - ❌ FALLO: {endpoint} falló. Error: {e}")
            sys.exit(1)

    # 4. Login Asociado
    assoc_token = None
    try:
        response = requests.post(f"{API_URL}/api/auth/login", data={'username': ASSOC_USERNAME, 'password': PASSWORD}, timeout=5)
        response.raise_for_status()
        assoc_token = response.json().get("access_token")
        if not assoc_token:
            raise ValueError("No se recibió access_token en el login de asociado.")
        print("✅ [4/7] Login de Asociado funciona.")
    except Exception as e:
        print(f"❌ [4/7] FALLO CRÍTICO: Login de Asociado falló. Error: {e}")
        sys.exit(1)

    # 5. Dashboard Asociado
    print("✅ [5/7] Probando dashboard de Asociado...")
    try:
        assoc_headers = {"Authorization": f"Bearer {assoc_token}"}
        res = requests.get(f"{API_URL}/api/associates/dashboard", headers=assoc_headers, timeout=5)
        res.raise_for_status()
        print(f"  - /api/associates/dashboard: OK")
    except Exception as e:
        print(f"  - ❌ FALLO: /api/associates/dashboard falló. Error: {e}")
        sys.exit(1)
    
    # 6. Lista de Préstamos de Asociado
    print("✅ [6/7] Probando lista de préstamos de Asociado...")
    try:
        assoc_headers = {"Authorization": f"Bearer {assoc_token}"}
        res = requests.get(f"{API_URL}/api/loans/", headers=assoc_headers, timeout=5)
        res.raise_for_status()
        data = res.json()
        if "items" in data and data['total'] > 0:
             print(f"  - /api/loans/ (asociado): OK (Total: {data['total']})")
        else:
            print(f"  - ❌ FALLO: /api/loans/ (asociado) no devolvió datos.")
            sys.exit(1)
    except Exception as e:
        print(f"  - ❌ FALLO: /api/loans/ (asociado) falló. Error: {e}")
        sys.exit(1)

    # 7. Prueba Multi-Rol
    print("✅ [7/7] Probando acceso dual para usuario multi-rol...")
    try:
        res = requests.get(f"{API_URL}/api/auth/me/dashboard", headers=admin_headers, timeout=5)
        res.raise_for_status()
        print("  - /api/auth/me/dashboard: OK (Admin también es cliente y tiene acceso)")
    except Exception as e:
        print(f"  - ❌ FALLO: /api/auth/me/dashboard con token de admin falló inesperadamente. Error: {e}")
        sys.exit(1)


    print("\n--- System Health Check Exitoso ---")
    sys.exit(0)

if __name__ == "__main__":
    run_health_check()
