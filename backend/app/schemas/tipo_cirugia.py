from pydantic import BaseModel
from typing import Optional


class TipoCirugiaBase(BaseModel):
    nombre: str
    duracion_estimada: int
    descripcion: Optional[str] = None


class TipoCirugiaCreate(TipoCirugiaBase):
    pass


class TipoCirugiaUpdate(BaseModel):
    nombre: Optional[str] = None
    duracion_estimada: Optional[int] = None
    descripcion: Optional[str] = None


class TipoCirugiaOut(TipoCirugiaBase):
    id: int

    class Config:
        from_attributes = True