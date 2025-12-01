from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.db.database import get_db
from app.db import models
from app.core.security import get_current_user

from app.schemas.paciente import (
    PacienteCreate, PacienteUpdate, PacienteOut
)

router = APIRouter()


# -----------------------------------------
# GET /pacientes/  → listar pacientes
# -----------------------------------------
@router.get("/", response_model=List[PacienteOut])
def listar_pacientes(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    return db.query(models.Paciente).all()


# -----------------------------------------
# GET /pacientes/{id} → obtener paciente
# -----------------------------------------
@router.get("/{paciente_id}", response_model=PacienteOut)
def obtener_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()
    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    return paciente


# -----------------------------------------
# POST /pacientes/ → crear paciente
# -----------------------------------------
@router.post("/", response_model=PacienteOut)
def crear_paciente(
    datos: PacienteCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    # Validación opcional: rut único
    if datos.rut:
        existe_rut = db.query(models.Paciente).filter(models.Paciente.rut == datos.rut).first()
        if existe_rut:
            raise HTTPException(status_code=400, detail="Ya existe un paciente con ese RUT")

    paciente = models.Paciente(**datos.dict())
    db.add(paciente)
    db.commit()
    db.refresh(paciente)

    return paciente


# -----------------------------------------
# PUT /pacientes/{id} → actualizar paciente
# -----------------------------------------
@router.put("/{paciente_id}", response_model=PacienteOut)
def actualizar_paciente(
    paciente_id: int,
    datos: PacienteUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()

    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    # Update flexible (solo los campos enviados)
    for campo, valor in datos.dict(exclude_unset=True).items():
        setattr(paciente, campo, valor)

    db.commit()
    db.refresh(paciente)

    return paciente


# -----------------------------------------
# DELETE /pacientes/{id} → eliminar paciente
# -----------------------------------------
@router.delete("/{paciente_id}")
def eliminar_paciente(
    paciente_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    paciente = db.query(models.Paciente).filter(models.Paciente.id == paciente_id).first()

    if not paciente:
        raise HTTPException(status_code=404, detail="Paciente no encontrado")

    db.delete(paciente)
    db.commit()

    return {"message": "Paciente eliminado correctamente"}