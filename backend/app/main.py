from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import clientes, medidores, lecturas, boletas

app = FastAPI(title="CGE Backend")

# CORS para tu front en localhost (ajusta si usas otro origen)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],           # pon tu origen exacto si quieres restringir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"ok": True}

# Montar routers con prefijo /api/... (ya definido dentro de cada router)
app.include_router(clientes.router)
app.include_router(medidores.router)
app.include_router(lecturas.router)
app.include_router(boletas.router)
