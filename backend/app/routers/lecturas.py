from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/lecturas", tags=["Lecturas"])

@router.post("", response_model=schemas.LecturaOut)
def crear_lectura(payload: schemas.LecturaCreate, db: Session = Depends(get_db)):
    medidor = db.get(models.Medidor, payload.id_medidor)
    if not medidor:
        raise HTTPException(status_code=404, detail="Medidor no existe")

    dup = (
        db.query(models.LecturaConsumo)
        .filter_by(id_medidor=payload.id_medidor, anio=payload.anio, mes=payload.mes)
        .first()
    )
    if dup:
        raise HTTPException(status_code=409, detail="Ya existe una lectura para ese mes")

    obj = models.LecturaConsumo(
        id_medidor=payload.id_medidor,
        anio=payload.anio,
        mes=payload.mes,
        lectura_kwh=payload.lectura_kwh,
        observacion=payload.observacion  # ⬅️ NUEVO
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.get("/por-medidor/{id_medidor}", response_model=list[schemas.LecturaOut])
def listar_por_medidor(id_medidor: int, db: Session = Depends(get_db)):
    if not db.get(models.Medidor, id_medidor):
        raise HTTPException(status_code=404, detail="Medidor no existe")
    return (
        db.query(models.LecturaConsumo)
        .filter(models.LecturaConsumo.id_medidor == id_medidor)
        .order_by(models.LecturaConsumo.anio.desc(), models.LecturaConsumo.mes.desc())
        .all()
    )
