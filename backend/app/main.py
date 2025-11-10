from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routers import clientes, medidores, lecturas, boletas

Base.metadata.create_all(bind=engine)  # En prod usar Alembic

app = FastAPI(title="CGE Backend")

origins = [
    "http://localhost:4201",
    "http://127.0.0.1:4201",
    "http://localhost:4200",
    "http://127.0.0.1:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,      # déjalo True si vas a usar cookies/autenticación
    allow_methods=["*"],         # OPTIONS incluido para preflight
    allow_headers=["*"],         # Content-Type, Authorization, etc.
)

# --- DB (solo para desarrollo; en prod usa Alembic) ---
Base.metadata.create_all(bind=engine)

app.include_router(clientes.router)
app.include_router(medidores.router)
app.include_router(lecturas.router)
app.include_router(boletas.router)

@app.get("/api/health")
def health():
    return {"status": "ok"}
