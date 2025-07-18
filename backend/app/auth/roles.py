from enum import Enum

class UserRole(str, Enum):
    DESARROLLADOR = "desarrollador"
    ADMINISTRADOR = "administrador"
    AUXILIAR_ADMINISTRATIVO = "auxiliar_administrativo"
    ASOCIADO = "asociado"
    CLIENTE = "cliente"
