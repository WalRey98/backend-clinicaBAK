from pydantic import BaseModel

class PabellonBase(BaseModel):
    nombre: str
    es_compleja: bool
    capacidad: int

class Pabellon(PabellonBase):
    id: int

    class Config:
        from_attributes = True