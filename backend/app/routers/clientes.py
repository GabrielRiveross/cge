from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/clientes", tags=["Clientes"])

@router.post("", response_model=schemas.ClienteOut)
def create_cliente(payload: schemas.ClienteCreate, db: Session = Depends(get_db)):
    exists = db.query(models.Cliente).filter(models.Cliente.rut == payload.rut).first()
    if exists:
        raise HTTPException(status_code=409, detail="RUT ya existe")
    obj = models.Cliente(**payload.model_dump())
    db.add(obj); db.commit(); db.refresh(obj)
    return obj

@router.get("", response_model=list[schemas.ClienteOut])
def list_clientes(
    q: str | None = Query(default=None, description="Buscar por RUT o nombre"),
    skip: int = 0, limit: int = 20, db: Session = Depends(get_db)
):
    query = db.query(models.Cliente)
    if q:
        like = f"%{q}%"
        query = query.filter((models.Cliente.rut.like(like)) | (models.Cliente.nombre_razon.like(like)))
    return query.offset(skip).limit(limit).all()

@router.get("/{id_cliente}", response_model=schemas.ClienteOut)
def get_cliente(id_cliente: int, db: Session = Depends(get_db)):
    obj = db.get(models.Cliente, id_cliente)
    if not obj: raise HTTPException(404, "Cliente no encontrado")
    return obj

@router.put("/{id_cliente}", response_model=schemas.ClienteOut)
def update_cliente(id_cliente: int, payload: schemas.ClienteUpdate, db: Session = Depends(get_db)):
    obj = db.get(models.Cliente, id_cliente)
    if not obj: raise HTTPException(404, "Cliente no encontrado")
    for k, v in payload.model_dump().items(): setattr(obj, k, v)
    db.commit(); db.refresh(obj); return obj

@router.delete("/{id_cliente}")
def delete_cliente(id_cliente: int, db: Session = Depends(get_db)):
    obj = db.get(models.Cliente, id_cliente)
    if not obj: raise HTTPException(404, "Cliente no encontrado")
    db.delete(obj); db.commit(); return {"ok": True}
