from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

# Definimos las opciones de estado para que Pydantic las valide
class EstadoCirugia(str, Enum):
    PLANIFICADA = "Planificada"
    EN_CURSO = "En Curso"
    COMPLICADA = "Complicada"
    FINALIZADA = "Finalizada"
    SUSPENDIDA = "Suspendida"
    EN_ASEO = "En Aseo"
    LIBRE = "Libre"

# Molde base: Lo que recibimos al CREAR o EDITAR
class CirugiaBase(BaseModel):
    nombre_paciente: str
    cirujano: str
    anestesista: Optional[str] = None
    personal_apoyo: Optional[str] = None
    fecha_inicio_planeada: datetime
    duracion_estimada_min: int
    pabellon_id: int
    requiere_aseo_profundo: bool = False

# Molde de respuesta: Lo que enviamos de vuelta (incluye ID y Estado)
class Cirugia(CirugiaBase):
    id: int
    estado: EstadoCirugia
    fecha_fin_real: Optional[datetime] = None

    class Config:
        # Esto permite que Pydantic lea los datos directo de la Base de Datos
        from_attributes = True