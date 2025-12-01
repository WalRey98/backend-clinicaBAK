from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.db import models
from app.core.security import get_current_user

from app.schemas.tipo_cirugia import (
    TipoCirugiaCreate,
    TipoCirugiaUpdate,
    TipoCirugiaOut
)

router = APIRouter()


# ------------------------------------------------------
# GET /tipos-cirugia/ → Listar tipos de cirugía
# ------------------------------------------------------
@router.get("/", response_model=List[TipoCirugiaOut])
def listar_tipos_cirugia(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.TipoCirugia).all()


# ------------------------------------------------------
# GET /tipos-cirugia/{id} → Obtener un tipo
# ------------------------------------------------------
@router.get("/{tipo_id}", response_model=TipoCirugiaOut)
def obtener_tipo(
    tipo_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tipo = db.query(models.TipoCirugia).filter(models.TipoCirugia.id == tipo_id).first()

    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de cirugía no encontrado")

    return tipo


# ------------------------------------------------------
# POST /tipos-cirugia/ → Crear nuevo tipo
# ------------------------------------------------------
@router.post("/", response_model=TipoCirugiaOut)
def crear_tipo_cirugia(
    datos: TipoCirugiaCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    existe = db.query(models.TipoCirugia).filter(models.TipoCirugia.nombre == datos.nombre).first()
    if existe:
        raise HTTPException(status_code=400, detail="Ya existe un tipo de cirugía con ese nombre")

    tipo = models.TipoCirugia(**datos.dict())

    db.add(tipo)
    db.commit()
    db.refresh(tipo)

    return tipo


# ------------------------------------------------------
# PUT /tipos-cirugia/{id} → Actualizar tipo
# ------------------------------------------------------
@router.put("/{tipo_id}", response_model=TipoCirugiaOut)
def actualizar_tipo_cirugia(
    tipo_id: int,
    datos: TipoCirugiaUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tipo = db.query(models.TipoCirugia).filter(models.TipoCirugia.id == tipo_id).first()

    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de cirugía no encontrado")

    for campo, valor in datos.dict(exclude_unset=True).items():
        setattr(tipo, campo, valor)

    db.commit()
    db.refresh(tipo)

    return tipo


# ------------------------------------------------------
# DELETE /tipos-cirugia/{id} → Eliminar tipo
# ------------------------------------------------------
@router.delete("/{tipo_id}")
def eliminar_tipo_cirugia(
    tipo_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    tipo = db.query(models.TipoCirugia).filter(models.TipoCirugia.id == tipo_id).first()

    if not tipo:
        raise HTTPException(status_code=404, detail="Tipo de cirugía no encontrado")

    db.delete(tipo)
    db.commit()

    return {"message": "Tipo de cirugía eliminado correctamente"}