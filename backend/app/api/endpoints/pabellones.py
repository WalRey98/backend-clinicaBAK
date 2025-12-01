# app/api/endpoints/pabellones.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.core.security import get_current_user
from typing import List
from pydantic import BaseModel

# -------------------------------
# Pydantic Schemas
# -------------------------------

class PabellonBase(BaseModel):
    nombre: str
    es_compleja: bool = False
    capacidad: int = 1

class PabellonCreate(PabellonBase):
    pass

class PabellonUpdate(BaseModel):
    nombre: str | None = None
    es_compleja: bool | None = None
    capacidad: int | None = None

class PabellonOut(PabellonBase):
    id: int

    class Config:
        from_attributes = True


# Inicialización del router
router = APIRouter()


# -----------------------------------------
# GET /pabellones/  (Listar todos)
# -----------------------------------------
@router.get("/", response_model=List[PabellonOut])
def leer_pabellones(
    db: Session = Depends(get_db),
    usuario = Depends(get_current_user)
):
    pabellones_db = db.query(models.Pabellon).all()
    return pabellones_db


# -----------------------------------------
# GET /pabellones/{id}  (Obtener uno)
# -----------------------------------------
@router.get("/{pabellon_id}", response_model=PabellonOut)
def obtener_pabellon(
    pabellon_id: int,
    db: Session = Depends(get_db),
    usuario = Depends(get_current_user)
):
    pab = db.query(models.Pabellon).filter(models.Pabellon.id == pabellon_id).first()
    if not pab:
        raise HTTPException(status_code=404, detail="Pabellón no encontrado")
    return pab


# -----------------------------------------
# POST /pabellones/  (Crear uno nuevo)
# -----------------------------------------
@router.post("/", response_model=PabellonOut, status_code=status.HTTP_201_CREATED)
def crear_pabellon(
    datos: PabellonCreate,
    db: Session = Depends(get_db),
    usuario = Depends(get_current_user)
):
    pab = models.Pabellon(
        nombre=datos.nombre,
        es_compleja=datos.es_compleja,
        capacidad=datos.capacidad
    )

    db.add(pab)
    db.commit()
    db.refresh(pab)
    return pab


# -----------------------------------------
# PUT /pabellones/{id}  (Actualizar)
# -----------------------------------------
@router.put("/{pabellon_id}", response_model=PabellonOut)
def actualizar_pabellon(
    pabellon_id: int,
    datos: PabellonUpdate,
    db: Session = Depends(get_db),
    usuario = Depends(get_current_user)
):

    pab = db.query(models.Pabellon).filter(models.Pabellon.id == pabellon_id).first()
    if not pab:
        raise HTTPException(status_code=404, detail="Pabellón no encontrado")

    # Actualizar solo los atributos enviados
    update_data = datos.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(pab, key, value)

    db.commit()
    db.refresh(pab)
    return pab


# -----------------------------------------
# DELETE /pabellones/{id}  (Eliminar)
# -----------------------------------------
@router.delete("/{pabellon_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pabellon(
    pabellon_id: int,
    db: Session = Depends(get_db),
    usuario = Depends(get_current_user)
):
    pab = db.query(models.Pabellon).filter(models.Pabellon.id == pabellon_id).first()
    if not pab:
        raise HTTPException(status_code=404, detail="Pabellón no encontrado")

    db.delete(pab)
    db.commit()
    return None