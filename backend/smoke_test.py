import requests
import os
import sys
import time
import logging
from datetime import datetime

# --- Configuración de Logging ---
LOG_FILE = '/code/system_health_check.log'
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s,%(levelname)s,%(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

# --- Configuración de la API y Usuarios de Prueba ---
API_URL = "http://backend:8000/api"
ADMIN_USERNAME = "admin"
ASSOC_USERNAME = "asociado_test"
CLIENT_USERNAME = "sofia.vargas"
PASSWORD = "Sparrow20"

# --- Variables Globales ---
test_counter = 0
total_tests = 12 # Actualizar este número al añadir más pruebas
failed_tests = 0
admin_token = None
assoc_token = None
client_token = None

# --- Funciones de Ayuda ---
def print_header():
    logging.info("=" * 60)
    logging.info("  INICIANDO SYSTEM HEALTH CHECK (SH) - CREDINET")
    logging.info("=" * 60)
    time.sleep(2) # Pausa dramática

def print_footer():
    logging.info("-" * 60)
    if failed_tests == 0:
        logging.info(f"[SUCCESS] Todos los {total_tests} chequeos del sistema pasaron.")
    else:
        logging.error(f"[FAILURE] {failed_tests} de {total_tests} chequeos fallaron.")
    logging.info("=" * 60)

def run_test(description, test_func, *args):
    global test_counter, failed_tests
    test_counter += 1
    padding = 50 - len(description)
    print(f"[{test_counter}/{total_tests}] {description}{'.' * padding}", end="", flush=True)
    
    try:
        result = test_func(*args)
        if result is not False:
            print("[  OK  ]")
            logging.info(f"[PASS] {description}")
            return result
        else:
            raise Exception("Resultado de prueba fue False")
    except Exception as e:
        print("[ FAIL ]")
        logging.error(f"[FAIL] {description}. Razón: {e}", exc_info=False)
        failed_tests += 1
        return None

# --- Definiciones de Pruebas ---

def check_ping():
    response = requests.get(f"{API_URL}/ping", timeout=10)
    response.raise_for_status()
    return True

def login_user(username, password):
    response = requests.post(f"{API_URL}/auth/login", data={'username': username, 'password': password}, timeout=10)
    response.raise_for_status()
    token = response.json().get("access_token")
    if not token:
        raise ValueError("No se recibió access_token en el login.")
    return token

def check_endpoint_access(token, endpoint, expected_key):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}{endpoint}", headers=headers, timeout=10)
    response.raise_for_status()
    if expected_key not in response.json():
        raise ValueError(f"La respuesta de {endpoint} no contiene la clave '{expected_key}'.")
    return True

def check_endpoint_denied(token, endpoint, expected_status=403):
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(f"{API_URL}{endpoint}", headers=headers, timeout=10)
    if response.status_code != expected_status:
        raise ValueError(f"Acceso a {endpoint} debería ser {expected_status} pero fue {response.status_code}.")
    return True

# --- Secuencia de Arranque ---
def main():
    global admin_token, assoc_token, client_token
    print_header()

    # --- SECCIÓN 1: CONECTIVIDAD ---
    run_test("PING: Verificando conectividad del servidor", check_ping)

    # --- SECCIÓN 2: AUTENTICACIÓN (LOGIN) ---
    admin_token = run_test("AUTH: Login de Administrador", login_user, ADMIN_USERNAME, PASSWORD)
    assoc_token = run_test("AUTH: Login de Asociado", login_user, ASSOC_USERNAME, PASSWORD)
    client_token = run_test("AUTH: Login de Cliente", login_user, CLIENT_USERNAME, PASSWORD)

    # --- SECCIÓN 3: PERMISOS DE ADMINISTRADOR ---
    if admin_token:
        run_test("RBAC: Admin puede ver lista de Usuarios", check_endpoint_access, admin_token, "/auth/users", "items")
        run_test("RBAC: Admin puede ver lista de Asociados", check_endpoint_access, admin_token, "/associates/", "items")
        run_test("RBAC: Admin puede ver Dashboard Global", check_endpoint_access, admin_token, "/loans/summary", "total_loans")

    # --- SECCIÓN 4: PERMISOS DE ASOCIADO ---
    if assoc_token:
        run_test("RBAC: Asociado NO PUEDE ver Usuarios", check_endpoint_denied, assoc_token, "/auth/users")
        run_test("RBAC: Asociado puede ver su Dashboard", check_endpoint_access, assoc_token, "/associates/dashboard", "summary")

    # --- SECCIÓN 5: PERMISOS DE CLIENTE ---
    if client_token:
        run_test("RBAC: Cliente NO PUEDE ver Usuarios", check_endpoint_denied, client_token, "/auth/users")
        run_test("RBAC: Cliente NO PUEDE ver Asociados", check_endpoint_denied, client_token, "/associates/")
        run_test("RBAC: Cliente puede ver su Dashboard", check_endpoint_access, client_token, "/auth/me/dashboard", "summary")

    print_footer()

    if failed_tests > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    # Esperar a que el backend esté completamente listo
    time.sleep(5) 
    main()