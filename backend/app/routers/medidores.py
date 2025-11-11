from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/medidores", tags=["Medidores"])


@router.post("", response_model=schemas.MedidorOut)
def create_medidor(payload: schemas.MedidorCreate, db: Session = Depends(get_db)):
    # Código único
    if db.query(models.Medidor).filter_by(codigo_medidor=payload.codigo_medidor).first():
        raise HTTPException(status_code=409, detail="Código de medidor ya existe")
    # Cliente debe existir
    if not db.get(models.Cliente, payload.id_cliente):
        raise HTTPException(status_code=404, detail="Cliente no existe")
    obj = models.Medidor(**payload.model_dump())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("", response_model=list[schemas.MedidorOut])
def list_medidores(db: Session = Depends(get_db)):
    rows = (
        db.query(
            models.Medidor.id_medidor,
            models.Medidor.codigo_medidor,
            models.Medidor.id_cliente,
            models.Medidor.direccion_suministro,
            models.Medidor.estado,
            models.Cliente.nombre_razon.label("cliente_nombre"),
        )
        .join(models.Cliente, models.Medidor.id_cliente == models.Cliente.id_cliente)
        .order_by(models.Medidor.id_medidor.asc())
        .all()
    )

    # SQLAlchemy Row → dict → Pydantic
    return [schemas.MedidorOut(**dict(r._mapping)) for r in rows]


@router.get("/{id}", response_model=schemas.MedidorOut)
def get_medidor(id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Medidor, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Medidor no existe")
    if obj.cliente:
        setattr(obj, "cliente_nombre", obj.cliente.nombre_razon)
    else:
        setattr(obj, "cliente_nombre", None)
    return obj


@router.put("/{id}", response_model=schemas.MedidorOut)
def update_medidor(id: int, payload: schemas.MedidorCreate, db: Session = Depends(get_db)):
    obj = db.get(models.Medidor, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Medidor no existe")

    # Si cambia el código, verificar unicidad
    if payload.codigo_medidor != obj.codigo_medidor:
        if db.query(models.Medidor).filter_by(codigo_medidor=payload.codigo_medidor).first():
            raise HTTPException(status_code=409, detail="Código de medidor ya existe")

    # Validar cliente
    if not db.get(models.Cliente, payload.id_cliente):
        raise HTTPException(status_code=404, detail="Cliente no existe")

    obj.codigo_medidor = payload.codigo_medidor
    obj.id_cliente = payload.id_cliente
    obj.direccion_suministro = payload.direccion_suministro
    obj.estado = payload.estado

    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.delete("/{id}", response_model=dict)
def delete_medidor(id: int, db: Session = Depends(get_db)):
    obj = db.get(models.Medidor, id)
    if not obj:
        raise HTTPException(status_code=404, detail="Medidor no existe")
    db.delete(obj)
    db.commit()
    return {"ok": True}
