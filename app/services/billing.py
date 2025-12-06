from sqlalchemy.orm import Session
from sqlalchemy import select, func
from ..models import Medidor, LecturaConsumo

TARIFA_UNITARIA = 50.0    # CLP por kWh (documentar en README)
PORC_CARGOS = 0.05        # 5%
IVA = 0.19

def kwh_mes_cliente(db: Session, id_cliente: int, anio: int, mes: int) -> int:
    stmt = (
        select(func.sum(LecturaConsumo.lectura_kwh))
        .join(Medidor, Medidor.id_medidor == LecturaConsumo.id_medidor)
        .where(Medidor.id_cliente == id_cliente, LecturaConsumo.anio == anio, LecturaConsumo.mes == mes)
    )
    total = db.scalar(stmt)
    return int(total or 0)

def calcular_totales(kwh_total: int) -> tuple[float, float, float, float]:
    tarifa_base = kwh_total * TARIFA_UNITARIA
    cargos = tarifa_base * PORC_CARGOS
    iva = (tarifa_base + cargos) * IVA
    total = tarifa_base + cargos + iva
    return (tarifa_base, cargos, iva, total)
