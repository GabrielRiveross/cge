from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io

from ..database import get_db
from .. import models, schemas
from ..services.billing import kwh_mes_cliente, calcular_totales
from ..services import pdf as pdf_service

router = APIRouter(prefix="/api/boletas", tags=["Boletas"])


@router.post("", response_model=schemas.BoletaOut)
def generar_boleta(payload: schemas.BoletaCreate, db: Session = Depends(get_db)):
    cliente = db.get(models.Cliente, payload.id_cliente)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no existe")

    dup = (
        db.query(models.Boleta)
        .filter_by(id_cliente=payload.id_cliente, anio=payload.anio, mes=payload.mes)
        .first()
    )
    if dup:
        raise HTTPException(status_code=409, detail="Boleta ya existe para ese mes")

    kwh_total = kwh_mes_cliente(db, payload.id_cliente, payload.anio, payload.mes)
    tarifa_base, cargos, iva, total = calcular_totales(kwh_total)

    bo = models.Boleta(
        id_cliente=payload.id_cliente,
        anio=payload.anio,
        mes=payload.mes,
        kwh_total=kwh_total,
        tarifa_base=tarifa_base,
        cargos=cargos,
        iva=iva,
        total_pagar=total,
        estado="emitida",
    )
    db.add(bo)
    db.commit()
    db.refresh(bo)
    return bo


@router.get("", response_model=list[schemas.BoletaOut])
def listar_boletas(id_cliente: int | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Boleta)
    if id_cliente:
        q = q.filter(models.Boleta.id_cliente == id_cliente)
    return q.order_by(models.Boleta.created_at.desc()).all()


@router.get("/{id_boleta}/pdf", summary="Descargar boleta en PDF")
def descargar_boleta_pdf(id_boleta: int, db: Session = Depends(get_db)):
    bo = db.get(models.Boleta, id_boleta)
    if not bo:
        raise HTTPException(status_code=404, detail="Boleta no encontrada")

    cliente = db.get(models.Cliente, bo.id_cliente)
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    pdf_bytes = pdf_service.build_boleta_pdf(boleta=bo, cliente=cliente)
    filename = f"boleta_{bo.anio}_{bo.mes:02d}_cliente_{bo.id_cliente}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
