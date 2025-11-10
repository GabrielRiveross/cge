from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc
from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/api/lecturas", tags=["Lecturas"])

@router.post("", response_model=schemas.LecturaOut)
def registrar_lectura(payload: schemas.LecturaCreate, db: Session = Depends(get_db)):
    # Validaciones defensivas (ya están en Pydantic, pero mantenemos UX)
    if payload.mes < 1 or payload.mes > 12:
        raise HTTPException(status_code=422, detail="El mes debe estar entre 1 y 12")
    if payload.lectura_kwh < 0:
        raise HTTPException(status_code=422, detail="La lectura kWh no puede ser negativa")

    # Medidor debe existir
    medidor = db.get(models.Medidor, payload.id_medidor)
    if not medidor:
        raise HTTPException(status_code=404, detail="Medidor no existe")

    # Duplicado (id_medidor, anio, mes)
    dup = (
        db.query(models.LecturaConsumo)
        .filter_by(id_medidor=payload.id_medidor, anio=payload.anio, mes=payload.mes)
        .first()
    )
    if dup:
        raise HTTPException(status_code=409, detail="Ya existe lectura para ese mes")

    # Crear lectura (mapea 1:1 con el modelo)
    obj = models.LecturaConsumo(
        id_medidor=payload.id_medidor,
        anio=payload.anio,
        mes=payload.mes,
        lectura_kwh=payload.lectura_kwh,
    )
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


@router.get("/por-medidor/{id_medidor}", response_model=list[schemas.LecturaOut])
def listar_por_medidor(id_medidor: int, db: Session = Depends(get_db)):
    # (Opcional) validar existencia del medidor para mejor UX
    medidor = db.get(models.Medidor, id_medidor)
    if not medidor:
        raise HTTPException(status_code=404, detail="Medidor no existe")

    rows = (
        db.query(models.LecturaConsumo)
        .filter_by(id_medidor=id_medidor)
        .order_by(asc(models.LecturaConsumo.anio), asc(models.LecturaConsumo.mes))
        .all()
    )
    return rows
