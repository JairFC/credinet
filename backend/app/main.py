from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core import config
from app.auth import routes as auth_routes
from app.loans import routes as loans_routes
from app.associates import routes as associates_routes
from app.beneficiaries import routes as beneficiaries_routes
from app.utils import routes as utils_routes
from app.common.database import create_db_pool, close_db_pool

app = FastAPI(
    title="Credinet API",
    description="API para el sistema de préstamos Credinet.",
    version=config.settings.API_VERSION
)

@app.on_event("startup")
async def startup_event():
    await create_db_pool()

@app.on_event("shutdown")
async def shutdown_event():
    await close_db_pool()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[config.settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Endpoints base
app.include_router(auth_routes.router, prefix="/api/auth", tags=["Auth & Users"])
app.include_router(loans_routes.router, prefix="/api/loans", tags=["Loans"])
app.include_router(associates_routes.router, prefix="/api/associates", tags=["Associates"])
app.include_router(beneficiaries_routes.router, prefix="/api", tags=["Beneficiaries"])
app.include_router(utils_routes.router, prefix="/api/utils", tags=["Utilities"])

@app.get("/api/ping")
def ping():
    return {"message": "pong"}
