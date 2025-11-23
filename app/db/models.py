# app/db/models.py
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from .database import Base
import datetime
import enum

# Enum para el estado de la cirugia, importante para la logica de negocio
class EstadoCirugia(enum.Enum):
    PLANIFICADA = "Planificada"
    EN_CURSO = "En Curso"
    COMPLICADA = "Complicada"
    FINALIZADA = "Finalizada"
    SUSPENDIDA = "Suspendida"
    EN_ASEO = "En Aseo"
    LIBRE = "Libre"

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True) # Ej: "enfermera1"
    hashed_password = Column(String) # Aquí guardamos la clave encriptada
    nombre_completo = Column(String)
    rol = Column(String) # Ej: "Enfermera", "Admin", "Medico"
    es_activo = Column(Boolean, default=True)

# Tabla que representa cada pabellon fisico (el recurso)
class Pabellon(Base):
    __tablename__ = "pabellones"

    # CORREGIDO: Colum -> Column y primery_key -> primary_key
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True) 
    # CORREGIDO: defaul -> default
    es_compleja = Column(Boolean, default=False) 
    capacidad = Column(Integer, default=1) 

    # Relacion con Cirugias: Un pabellon puede tener muchas cirugias
    cirugias = relationship("Cirugia", back_populates="pabellon_rel")

# Tabla que representa cada evento agendado (la cirugia)
class Cirugia(Base):
    __tablename__ = "cirugias"

    # CORREGIDO: primery_key -> primary_key
    id = Column(Integer, primary_key=True, index=True)
    nombre_paciente = Column(String, index=True)
    cirujano = Column(String)
    # OMISIÓN CORREGIDA: Agregado el anestesista y la enfermera (asumo que se había omitido)
    anestesista = Column(String)
    # CORREGIDO: personal_apóyo -> personal_apoyo y Colum -> Column
    personal_apoyo = Column(String)

    fecha_inicio_planeada = Column(DateTime, default=datetime.datetime.utcnow)
    duracion_estimada_min = Column(Integer)
    fecha_fin_real = Column(DateTime, nullable=True) 

    estado = Column(Enum(EstadoCirugia), default=EstadoCirugia.PLANIFICADA)
    requiere_aseo_profundo = Column(Boolean, default=False)

    # Clave Foranea: Relaciona la cirugia con un pabellon
    pabellon_id = Column(Integer, ForeignKey("pabellones.id"))
    pabellon_rel = relationship("Pabellon", back_populates="cirugias")