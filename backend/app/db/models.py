# app/db/models.py

from sqlalchemy import (
    Column, Integer, String, Boolean, Date, Time,
    ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from .database import Base
import enum


# ---------------------------------------------------
# ENUM de estado quirúrgico
# ---------------------------------------------------
class EstadoCirugia(enum.Enum):
    PROGRAMADA = "PROGRAMADA"
    EN_CURSO = "EN_CURSO"
    FINALIZADA = "FINALIZADA"
    CANCELADA = "CANCELADA"
    COMPLICADA = "COMPLICADA"
    EN_ASEO = "EN_ASEO"
    LIBRE = "LIBRE"


# ---------------------------------------------------
# USUARIOS
# ---------------------------------------------------
class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    nombre_completo = Column(String)
    rol = Column(String)
    es_activo = Column(Boolean, default=True)

    # Cirugías donde este usuario actúa como doctor
    cirugias_doctor = relationship("Cirugia", back_populates="doctor_rel")


# ---------------------------------------------------
# PACIENTES
# ---------------------------------------------------
class Paciente(Base):
    __tablename__ = "pacientes"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    rut = Column(String, unique=True)
    telefono = Column(String)
    email = Column(String)
    fecha_nacimiento = Column(Date)
    direccion = Column(String)

    cirugias = relationship("Cirugia", back_populates="paciente_rel")


# ---------------------------------------------------
# TIPOS DE CIRUGÍA
# ---------------------------------------------------
class TipoCirugia(Base):
    __tablename__ = "tipos_cirugia"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    duracion_estimada = Column(Integer, nullable=False)  # min
    descripcion = Column(String)

    cirugias = relationship("Cirugia", back_populates="tipo_cirugia_rel")


# ---------------------------------------------------
# PABELLONES
# ---------------------------------------------------
class Pabellon(Base):
    __tablename__ = "pabellones"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True, unique=True)
    es_compleja = Column(Boolean, default=False)
    capacidad = Column(Integer, default=1)

    cirugias = relationship("Cirugia", back_populates="pabellon_rel")


# ---------------------------------------------------
# CIRUGÍAS (EVENTO AGENDADO)
# ---------------------------------------------------
class Cirugia(Base):
    __tablename__ = "cirugias"

    id = Column(Integer, primary_key=True, index=True)

    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=True)   # antes False
    doctor_id = Column(Integer, ForeignKey("usuarios.id"), nullable=True)     # antes False
    pabellon_id = Column(Integer, ForeignKey("pabellones.id"), nullable=False)
    tipo_cirugia_id = Column(Integer, ForeignKey("tipos_cirugia.id"), nullable=False)

    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)

    duracion_programada = Column(Integer, nullable=False)
    extra_time = Column(Integer, default=0)

    estado = Column(
        Enum(EstadoCirugia, name="estadocirugia"),
        default=EstadoCirugia.PROGRAMADA,
        nullable=False
    )

    es_aseo = Column(Boolean, default=False, nullable=False)

    # Relaciones ORM
    paciente_rel = relationship("Paciente", back_populates="cirugias")
    doctor_rel = relationship("Usuario", back_populates="cirugias_doctor")
    pabellon_rel = relationship("Pabellon", back_populates="cirugias")
    tipo_cirugia_rel = relationship("TipoCirugia", back_populates="cirugias")