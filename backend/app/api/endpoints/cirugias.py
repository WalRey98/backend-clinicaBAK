from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, date, time, timedelta
from pydantic import BaseModel

from app.db.database import get_db
from app.db import models
from app.core.security import get_current_user
from app.schemas.cirugia import CirugiaCreate, CirugiaUpdate, CirugiaOut
from app.db.models import EstadoCirugia

router = APIRouter()
TIEMPO_ASEO = 30

# --- HELPERS ---
def combinar_fecha_hora(fecha: date, hora: time) -> datetime:
    return datetime.combine(fecha, hora)

def calcular_fin(fecha: date, hora_inicio: time, duracion: int, extra: int = 0) -> datetime:
    return combinar_fecha_hora(fecha, hora_inicio) + timedelta(minutes=duracion + extra + TIEMPO_ASEO)

def hay_solapamiento(i1, f1, i2, f2): return not (f1 <= i2 or i1 >= f2)

# 🔥 LÓGICA AUTOMÁTICA MEJORADA 🔥
def actualizar_estados_automaticos(db: Session):
    ahora = datetime.now()
    # Buscamos SOLO las programadas o en curso
    cirugias = db.query(models.Cirugia).filter(models.Cirugia.estado.in_([EstadoCirugia.PROGRAMADA, EstadoCirugia.EN_CURSO])).all()
    
    for c in cirugias:
        inicio_real = combinar_fecha_hora(c.fecha, c.hora_inicio)
        fin_estimado = inicio_real + timedelta(minutes=c.duracion_programada + (c.extra_time or 0))
        
        # 1. PASAR A EN CURSO AUTOMÁTICAMENTE
        if c.estado == EstadoCirugia.PROGRAMADA:
            # Si ya es la hora (o pasó la hora), se activa
            if ahora >= inicio_real:
                print(f"⚡ ACTIVANDO CIRUGÍA ID {c.id}: {inicio_real} vs {ahora}")
                c.estado = EstadoCirugia.EN_CURSO
                db.add(c)

        # 2. PASAR A COMPLICADA (OPCIONAL: SI SE PASA DEL TIEMPO)
        elif c.estado == EstadoCirugia.EN_CURSO:
            if ahora >= fin_estimado:
                c.estado = EstadoCirugia.COMPLICADA
                db.add(c)

    db.commit()

def cirugia_to_out(c):
    return CirugiaOut(
        id=c.id, paciente_id=c.paciente_id, doctor_id=c.doctor_id, pabellon_id=c.pabellon_id,
        tipo_cirugia_id=c.tipo_cirugia_id, fecha=c.fecha, hora_inicio=c.hora_inicio,
        duracion_programada=c.duracion_programada, extra_time=c.extra_time or 0,
        estado=c.estado, es_aseo=False, 
        hora_fin_estimada=calcular_fin(c.fecha, c.hora_inicio, c.duracion_programada, c.extra_time or 0)
    )

# --- ENDPOINTS ---

@router.get("/", response_model=List[CirugiaOut])
def listar_cirugias(pabellon_id: int | None = None, fecha: date | None = None, db: Session = Depends(get_db)):
    q = db.query(models.Cirugia)
    if pabellon_id: q = q.filter(models.Cirugia.pabellon_id == pabellon_id)
    if fecha: q = q.filter(models.Cirugia.fecha == fecha)
    return [cirugia_to_out(c) for c in q.order_by(models.Cirugia.fecha, models.Cirugia.hora_inicio).all()]

@router.post("/", response_model=CirugiaOut, status_code=201)
def crear_cirugia(datos: CirugiaCreate, db: Session = Depends(get_db)):
    # Validar overlap (considerando aseo)
    ini = combinar_fecha_hora(datos.fecha, datos.hora_inicio)
    fin = ini + timedelta(minutes=datos.duracion_programada + (datos.extra_time or 0) + TIEMPO_ASEO)
    
    ocupados = db.query(models.Cirugia).filter(
        models.Cirugia.pabellon_id == datos.pabellon_id, models.Cirugia.fecha == datos.fecha,
        models.Cirugia.estado.notin_([EstadoCirugia.FINALIZADA, EstadoCirugia.CANCELADA])
    ).all()
    
    for o in ocupados:
        o_ini = combinar_fecha_hora(o.fecha, o.hora_inicio)
        o_fin = o_ini + timedelta(minutes=o.duracion_programada + (o.extra_time or 0) + TIEMPO_ASEO)
        if hay_solapamiento(ini, fin, o_ini, o_fin):
            raise HTTPException(400, "Choque de horario (incluyendo 30min aseo)")

    nueva = models.Cirugia(**datos.dict(), estado=EstadoCirugia.PROGRAMADA, es_aseo=False)
    db.add(nueva); db.commit(); db.refresh(nueva)
    return cirugia_to_out(nueva)

@router.put("/{cirugia_id}", response_model=CirugiaOut)
def modificar(cirugia_id: int, datos: CirugiaUpdate, db: Session = Depends(get_db)):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if not c: raise HTTPException(404, "No existe")
    for k, v in datos.dict(exclude_unset=True).items(): setattr(c, k, v)
    db.commit(); db.refresh(c)
    return cirugia_to_out(c)

@router.patch("/{cirugia_id}/estado", response_model=CirugiaOut)
def estado(cirugia_id: int, body: dict, db: Session = Depends(get_db)):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if not c: raise HTTPException(404)
    c.estado = body.get("nuevo_estado")
    db.commit(); db.refresh(c)
    return cirugia_to_out(c)

@router.patch("/{cirugia_id}", response_model=CirugiaOut)
def mover(cirugia_id: int, body: dict, db: Session = Depends(get_db)):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if c: c.pabellon_id = body.get("pabellon_id"); db.commit(); db.refresh(c)
    return cirugia_to_out(c)

@router.patch("/{cirugia_id}/extra-time", response_model=CirugiaOut)
def extra(cirugia_id: int, body: dict, db: Session = Depends(get_db)):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if c: c.extra_time = body.get("extra_time"); db.commit(); db.refresh(c)
    return cirugia_to_out(c)

@router.delete("/{cirugia_id}", status_code=204)
def delete(cirugia_id: int, db: Session = Depends(get_db)):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if c: db.delete(c); db.commit()

# --- IMPORTANTE: Endpoint para el polling ---
@router.post("/actualizar-estados")
def trigger_actualizar(db: Session = Depends(get_db)):
    actualizar_estados_automaticos(db)
    return {"ok": True}