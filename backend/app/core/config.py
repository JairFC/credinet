# backend/app/core/config.py

import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Credinet API"
    API_VERSION: str = "1.0.0"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "una_clave_secreta_por_defecto_muy_insegura")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

    class Config:
        case_sensitive = True

settings = Settings()
