from datetime import datetime, date
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

# --- Cliente ---
class ClienteBase(BaseModel):
    rut: str = Field(..., examples=["12.345.678-9"])
    nombre_razon: str
    email_contacto: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion_facturacion: Optional[str] = None
    estado: bool = True

class ClienteCreate(ClienteBase): pass
class ClienteUpdate(ClienteBase): pass

class ClienteOut(ClienteBase):
    id_cliente: int
    class Config: from_attributes = True

# --- Medidor ---
class MedidorBase(BaseModel):
    codigo_medidor: str
    id_cliente: int
    direccion_suministro: str
    estado: bool = True

class MedidorCreate(MedidorBase): pass
class MedidorUpdate(MedidorBase): pass

class MedidorOut(MedidorBase):
    id_medidor: int
    class Config: from_attributes = True

# --- Lectura ---
class LecturaBase(BaseModel):
    medidor_id: int
    fecha_lectura: date
    lectura_actual: int

class LecturaCreate(LecturaBase):
    medidor_id: int
    fecha: date
    lectura_actual: float

class LecturaOut(LecturaBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
# --- Boleta ---
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
    class Config: from_attributes = True
