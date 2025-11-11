from sqlalchemy import String, Integer, DateTime, ForeignKey, Boolean, UniqueConstraint, DECIMAL
from sqlalchemy.orm import relationship, Mapped, mapped_column
from datetime import datetime
from .database import Base

class Cliente(Base):
    __tablename__ = "cliente"
    id_cliente: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rut: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    nombre_razon: Mapped[str] = mapped_column(String(200))
    email_contacto: Mapped[str | None] = mapped_column(String(200), nullable=True)
    telefono: Mapped[str | None] = mapped_column(String(50), nullable=True)
    direccion_facturacion: Mapped[str | None] = mapped_column(String(250), nullable=True)
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    medidores: Mapped[list["Medidor"]] = relationship(back_populates="cliente", cascade="all, delete-orphan")
    boletas: Mapped[list["Boleta"]] = relationship(back_populates="cliente", cascade="all, delete-orphan")

class Medidor(Base):
    __tablename__ = "medidor"
    id_medidor: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    codigo_medidor: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    id_cliente: Mapped[int] = mapped_column(ForeignKey("cliente.id_cliente", ondelete="CASCADE"))
    direccion_suministro: Mapped[str] = mapped_column(String(250))
    estado: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    cliente: Mapped["Cliente"] = relationship(back_populates="medidores")
    lecturas: Mapped[list["LecturaConsumo"]] = relationship(back_populates="medidor", cascade="all, delete-orphan")

    @property
    def cliente_nombre(self) -> str | None:
        return self.cliente.nombre_razon if self.cliente else None

class LecturaConsumo(Base):
    __tablename__ = "lectura_consumo"
    id_lectura: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_medidor: Mapped[int] = mapped_column(ForeignKey("medidor.id_medidor", ondelete="CASCADE"))
    anio: Mapped[int] = mapped_column(Integer)
    mes: Mapped[int] = mapped_column(Integer)  # 1..12
    lectura_kwh: Mapped[int] = mapped_column(Integer)  # >= 0
    observacion: Mapped[str | None] = mapped_column(String(250), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("id_medidor", "anio", "mes", name="uq_medidor_mes"),)
    medidor: Mapped["Medidor"] = relationship(back_populates="lecturas")

class Boleta(Base):
    __tablename__ = "boleta"
    id_boleta: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_cliente: Mapped[int] = mapped_column(ForeignKey("cliente.id_cliente", ondelete="CASCADE"))
    anio: Mapped[int] = mapped_column(Integer)
    mes: Mapped[int] = mapped_column(Integer)
    kwh_total: Mapped[float] = mapped_column(DECIMAL(10, 2))
    tarifa_base: Mapped[float] = mapped_column(DECIMAL(10, 2))
    cargos: Mapped[float] = mapped_column(DECIMAL(10, 2))
    iva: Mapped[float] = mapped_column(DECIMAL(10, 2))
    total_pagar: Mapped[float] = mapped_column(DECIMAL(10, 2))
    estado: Mapped[str] = mapped_column(String(20), default="emitida")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    __table_args__ = (UniqueConstraint("id_cliente", "anio", "mes", name="uq_cliente_mes"),)
    cliente: Mapped["Cliente"] = relationship(back_populates="boletas")
