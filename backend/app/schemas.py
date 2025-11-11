from datetime import datetime
from pydantic import BaseModel, Field, EmailStr
from typing import Optional

# =========================
# CLIENTE
# =========================
class ClienteBase(BaseModel):
    rut: str = Field(..., examples=["12.345.678-9"])
    nombre_razon: str
    email_contacto: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion_facturacion: Optional[str] = None
    estado: bool = True

class ClienteCreate(ClienteBase):
    pass

class ClienteUpdate(ClienteBase):
    pass

class ClienteOut(ClienteBase):
    id_cliente: int
    class Config:
        from_attributes = True


# =========================
# MEDIDOR
# =========================
class MedidorBase(BaseModel):
    codigo_medidor: str
    id_cliente: int
    direccion_suministro: str
    estado: bool = True

class MedidorCreate(MedidorBase):
    pass

class MedidorUpdate(MedidorBase):
    pass

class MedidorOut(MedidorBase):
    id_medidor: int
    cliente_nombre: Optional[str] = None
    class Config:
        from_attributes = True

class MedidorRowOut(MedidorOut):
    # Extiende lo que ya devuelves para incluir el nombre del cliente
    cliente_nombre: str


# =========================
# LECTURA (ALINEADO CON EL FRONT)
# =========================
class LecturaCreate(BaseModel):
    id_medidor: int
    anio: int = Field(..., ge=2000, le=2100)
    mes: int = Field(..., ge=1, le=12)
    lectura_kwh: float = Field(..., ge=0)
    observacion: Optional[str] = None   # ⬅️ NUEVO

class LecturaOut(BaseModel):
    id_lectura: int
    id_medidor: int
    anio: int
    mes: int
    lectura_kwh: float
    observacion: Optional[str] = None   # ⬅️ NUEVO
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
# =========================
# BOLETA
# =========================
class BoletaCreate(BaseModel):
    id_cliente: int
    anio: int
    mes: int

class BoletaOut(BaseModel):
    id_boleta: int
    id_cliente: int
    anio: int
    mes: int
    kwh_total: float
    tarifa_base: float
    cargos: float
    iva: float
    total_pagar: float
    estado: str

    class Config:
        from_attributes = True
