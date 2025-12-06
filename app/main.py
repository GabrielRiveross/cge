from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine

# ✅ IMPORTA SÍ O SÍ LOS MODELOS
from app import models

from app.routers import clientes, medidores, lecturas, boletas

# ✅ CREA LAS TABLAS AQUÍ
Base.metadata.create_all(bind=engine)

app = FastAPI(title="CGE Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

app.include_router(clientes.router)
app.include_router(medidores.router)
app.include_router(lecturas.router)
app.include_router(boletas.router)
