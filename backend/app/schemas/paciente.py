from pydantic import BaseModel
from datetime import date
from typing import Optional


class PacienteBase(BaseModel):
    nombre: str
    rut: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    direccion: Optional[str] = None


class PacienteCreate(PacienteBase):
    nombre: str


class PacienteUpdate(BaseModel):
    nombre: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[str] = None
    direccion: Optional[str] = None
    fecha_nacimiento: Optional[date] = None


class PacienteOut(PacienteBase):
    id: int

    class Config:
        from_attributes = True