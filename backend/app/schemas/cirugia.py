from pydantic import BaseModel
from datetime import date, time, datetime
from typing import Optional
from app.db.models import EstadoCirugia


class CirugiaBase(BaseModel):
    paciente_id: int
    doctor_id: int
    pabellon_id: int
    tipo_cirugia_id: int

    fecha: date
    hora_inicio: time

    duracion_programada: Optional[int] = None
    extra_time: int = 0


class CirugiaCreate(CirugiaBase):
    pass


class CirugiaUpdate(BaseModel):
    paciente_id: Optional[int] = None
    doctor_id: Optional[int] = None
    pabellon_id: Optional[int] = None
    tipo_cirugia_id: Optional[int] = None

    fecha: Optional[date] = None
    hora_inicio: Optional[time] = None
    duracion_programada: Optional[int] = None
    extra_time: Optional[int] = None
    estado: Optional[EstadoCirugia] = None


class CirugiaOut(BaseModel):
    id: int
    paciente_id: Optional[int] = None
    doctor_id: Optional[int] = None
    pabellon_id: int
    tipo_cirugia_id: int
    fecha: date
    hora_inicio: time
    duracion_programada: int
    extra_time: int
    estado: EstadoCirugia
    es_aseo: bool   # IMPORTANTE: incluir esto para el front
    hora_fin_estimada: datetime

    class Config:
        from_attributes = True