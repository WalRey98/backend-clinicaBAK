# app/api/endpoints/cirugias.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.schemas import cirugia as schemas_cirugia
from typing import List
from datetime import datetime, timedelta

# Crea un router para agrupar todos los endpoints de cirugia
router = APIRouter()

# Funcion de ayuda que se puede usar en la logica del negocio
def get_cirugias_por_dia(db: Session, dia: datetime) -> List[models.Cirugia]:
    return db.query(models.Cirugia).all()

# -------------------------------------------------------
# 1. CREAR CIRUGÍA (RQ02 / RQ03)
# -------------------------------------------------------
@router.post("/", response_model=schemas_cirugia.Cirugia)
def crear_cirugia(cirugia: schemas_cirugia.CirugiaBase, db: Session = Depends(get_db)):
    """
    RQ02: Agendar una nueva cirugía.
    """
    # VALIDACIÓN BÁSICA DE DISPONIBILIDAD (Lógica de Negocio)
    # Buscamos si hay cirugías en ese pabellón que choquen con el horario
    fecha_fin_estimada = cirugia.fecha_inicio_planeada + timedelta(minutes=cirugia.duracion_estimada_min)
    
    choque = db.query(models.Cirugia).filter(
        models.Cirugia.pabellon_id == cirugia.pabellon_id,
        models.Cirugia.estado != models.EstadoCirugia.FINALIZADA, # Ignoramos las terminadas
        models.Cirugia.estado != models.EstadoCirugia.SUSPENDIDA, # Ignoramos las canceladas
        models.Cirugia.fecha_inicio_planeada < fecha_fin_estimada,
        # Esta lógica es simplificada, en producción se requiere comparar rangos completos
    ).first()

    

    #     raise HTTPException(status_code=400, detail="⚠️ El pabellón está ocupado en ese horario.")

    db_cirugia = models.Cirugia(**cirugia.model_dump())
    db.add(db_cirugia)
    db.commit()
    db.refresh(db_cirugia)
    return db_cirugia

# -------------------------------------------------------
# 2. LEER CIRUGÍA
# -------------------------------------------------------
@router.get("/{cirugia_id}", response_model=schemas_cirugia.Cirugia)
def leer_cirugia(cirugia_id: int, db: Session = Depends(get_db)):
    db_cirugia = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if db_cirugia is None:
        raise HTTPException(status_code=404, detail="Cirugía no encontrada")
    return db_cirugia

# -------------------------------------------------------
# 3. MODIFICAR CIRUGÍA (RQ04)
# -------------------------------------------------------
@router.put("/{cirugia_id}", response_model=schemas_cirugia.Cirugia)
def modificar_cirugia(cirugia_id: int, datos_nuevos: schemas_cirugia.CirugiaBase, db: Session = Depends(get_db)):
    """
    RQ04: Permite corregir datos de una cirugía (ej. cambiaron al cirujano o la hora).
    """
    db_cirugia = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if db_cirugia is None:
        raise HTTPException(status_code=404, detail="Cirugía no encontrada")

    # Actualizamos los campos
    for key, value in datos_nuevos.model_dump().items():
        setattr(db_cirugia, key, value)

    db.commit()
    db.refresh(db_cirugia)
    return db_cirugia

# -------------------------------------------------------
# 4. REPORTAR EVENTO / CAMBIAR ESTADO (RQ07)
# -------------------------------------------------------
@router.patch("/{cirugia_id}/estado")
def cambiar_estado_cirugia(cirugia_id: int, nuevo_estado: str, db: Session = Depends(get_db)):
    """
    RQ07: Permite reportar eventos en tiempo real.
    Ejemplo: La enfermera marca "EN_CURSO", "FINALIZADA" o "COMPLICADA".
    """
    db_cirugia = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if db_cirugia is None:
        raise HTTPException(status_code=404, detail="Cirugía no encontrada")

    # Validamos que el estado exista en nuestro Enum
    try:
        # Convertimos el string (ej "En Curso") al Enum del modelo
        estado_enum = models.EstadoCirugia(nuevo_estado)
        db_cirugia.estado = estado_enum
        
        # Si finaliza, guardamos la hora real
        if estado_enum == models.EstadoCirugia.FINALIZADA:
            db_cirugia.fecha_fin_real = datetime.utcnow()
            
    except ValueError:
        raise HTTPException(status_code=400, detail="Estado no válido. Use: Planificada, En Curso, Finalizada, etc.")

    db.commit()
    db.refresh(db_cirugia)
    return {"mensaje": "Estado actualizado", "nuevo_estado": db_cirugia.estado}