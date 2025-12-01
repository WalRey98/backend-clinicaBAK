# app/api/endpoints/cirugias.py

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


# -------------------------------------------------------------------
# Helpers de tiempo
# -------------------------------------------------------------------
def combinar_fecha_hora(fecha: date, hora: time) -> datetime:
    return datetime.combine(fecha, hora)


def calcular_fin(
    fecha: date,
    hora_inicio: time,
    duracion_min: int,
    extra_min: int = 0,
) -> datetime:
    inicio = combinar_fecha_hora(fecha, hora_inicio)
    return inicio + timedelta(minutes=duracion_min + extra_min)


def hay_solapamiento(
    nueva_inicio: datetime,
    nueva_fin: datetime,
    existente_inicio: datetime,
    existente_fin: datetime,
) -> bool:
    """
    Se solapan si NO es cierto que una termina antes que la otra empiece.
    """
    return not (nueva_fin <= existente_inicio or nueva_inicio >= existente_fin)


# -------------------------------------------------------------------
# Helpers de ASEO
# -------------------------------------------------------------------
def crear_cirugia_aseo_relacionada(
    db: Session,
    cirugia_principal: models.Cirugia,
) -> models.Cirugia:
    """
    Crea automáticamente una cirugía de ASEO inmediatamente después
    de la cirugía principal.
    """
    ASEO_DURACION_MIN = 30  # configurable

    # Fin de la cirugía principal (considera extra_time)
    fin_principal = calcular_fin(
        cirugia_principal.fecha,
        cirugia_principal.hora_inicio,
        cirugia_principal.duracion_programada,
        cirugia_principal.extra_time,
    )

    aseo = models.Cirugia(
        paciente_id=None,
        doctor_id=None,
        pabellon_id=cirugia_principal.pabellon_id,
        tipo_cirugia_id=cirugia_principal.tipo_cirugia_id,
        fecha=fin_principal.date(),
        hora_inicio=fin_principal.time(),
        duracion_programada=ASEO_DURACION_MIN,
        extra_time=0,
        # Se agenda como PROGRAMADA; cuando llegue la hora pasa EN_ASEO
        estado=EstadoCirugia.PROGRAMADA,
        es_aseo=True,
    )

    db.add(aseo)
    db.commit()
    db.refresh(aseo)
    return aseo


# -------------------------------------------------------------------
# Estados automáticos
# -------------------------------------------------------------------
def actualizar_estados_automaticos(
    db: Session,
    ahora: datetime | None = None,
):
    """
    Actualiza estados de cirugías según reglas:

    CIRUGÍA PRINCIPAL (es_aseo == False)
    ------------------------------------
    PROGRAMADA:
        - si ahora >= inicio → EN_CURSO

    EN_CURSO:
        - fin_sin_extra = inicio + duracion_programada
        - fin_con_extra = fin_sin_extra + extra_time

        * si ahora < fin_sin_extra → sigue EN_CURSO
        * si ahora >= fin_sin_extra y extra_time > 0 y ahora < fin_con_extra → COMPLICADA
        * si ahora >= fin_con_extra → FINALIZADA

    COMPLICADA:
        - fin_con_extra = inicio + duracion_programada + extra_time
        * si ahora >= fin_con_extra → FINALIZADA

    CIRUGÍA DE ASEO (es_aseo == True)
    ---------------------------------
    PROGRAMADA:
        - si ahora >= inicio → EN_ASEO

    EN_ASEO:
        - si ahora >= fin_estimada → FINALIZADA
    """

    if ahora is None:
        ahora = datetime.now()

    cirugias = (
        db.query(models.Cirugia)
        .filter(
            models.Cirugia.estado.in_(
                [
                    EstadoCirugia.PROGRAMADA,
                    EstadoCirugia.EN_CURSO,
                    EstadoCirugia.COMPLICADA,
                    EstadoCirugia.EN_ASEO,
                ]
            )
        )
        .all()
    )

    for c in cirugias:
        inicio = combinar_fecha_hora(c.fecha, c.hora_inicio)
        fin_sin_extra = inicio + timedelta(minutes=c.duracion_programada)
        fin_con_extra = inicio + timedelta(
            minutes=c.duracion_programada + (c.extra_time or 0)
        )

        # ---------------------------------------------------------
        # CIRUGÍA DE ASEO
        # ---------------------------------------------------------
        if c.es_aseo:
            if c.estado == EstadoCirugia.PROGRAMADA:
                if ahora >= inicio:
                    c.estado = EstadoCirugia.EN_ASEO
            elif c.estado == EstadoCirugia.EN_ASEO:
                if ahora >= fin_con_extra:
                    c.estado = EstadoCirugia.FINALIZADA

            db.add(c)
            continue

        # ---------------------------------------------------------
        # CIRUGÍA PRINCIPAL
        # ---------------------------------------------------------
        if c.estado == EstadoCirugia.PROGRAMADA:
            if ahora >= inicio:
                c.estado = EstadoCirugia.EN_CURSO

        elif c.estado == EstadoCirugia.EN_CURSO:
            if ahora < fin_sin_extra:
                # sigue en curso
                pass
            else:
                # ya pasó la duración base
                if (c.extra_time or 0) > 0 and ahora < fin_con_extra:
                    # está usando tiempo extra
                    c.estado = EstadoCirugia.COMPLICADA
                else:
                    # terminó (con o sin extra)
                    c.estado = EstadoCirugia.FINALIZADA

        elif c.estado == EstadoCirugia.COMPLICADA:
            if ahora >= fin_con_extra:
                c.estado = EstadoCirugia.FINALIZADA

        db.add(c)

    db.commit()


# -------------------------------------------------------------------
# Recalcular agenda de un pabellón (solo cirugías principales)
# -------------------------------------------------------------------
def recalcular_agenda_pabellon(
    db: Session,
    pabellon_id: int,
    fecha: date,
):
    """
    Recalcula las horas de inicio de las cirugías PRINCIPALES
    (es_aseo == False) para el pabellón y fecha dados.
    Las cirugías de aseo no se reordenan aquí; se calculan
    a partir de la principal.
    """
    cirugias = (
        db.query(models.Cirugia)
        .filter(models.Cirugia.pabellon_id == pabellon_id)
        .filter(models.Cirugia.fecha == fecha)
        .filter(models.Cirugia.es_aseo == False)  # solo principales
        .order_by(models.Cirugia.hora_inicio)
        .all()
    )

    if not cirugias:
        return

    cursor: datetime | None = None

    for c in cirugias:
        duracion_total = c.duracion_programada + (c.extra_time or 0)

        if cursor is None:
            # Respetamos la hora de inicio de la primera cirugía del día
            cursor = combinar_fecha_hora(c.fecha, c.hora_inicio)
        else:
            # A partir de la segunda, empujamos la hora de inicio
            c.hora_inicio = cursor.time()

        cursor = cursor + timedelta(minutes=duracion_total)
        db.add(c)

    db.commit()


# -------------------------------------------------------------------
# Helper: convertir ORM → DTO con hora_fin_estimada
# -------------------------------------------------------------------
def cirugia_to_out(c: models.Cirugia) -> CirugiaOut:
    hora_fin_estimada = calcular_fin(
        c.fecha,
        c.hora_inicio,
        c.duracion_programada,
        c.extra_time or 0,
    )

    return CirugiaOut(
        id=c.id,
        paciente_id=c.paciente_id,
        doctor_id=c.doctor_id,
        pabellon_id=c.pabellon_id,
        tipo_cirugia_id=c.tipo_cirugia_id,
        fecha=c.fecha,
        hora_inicio=c.hora_inicio,
        duracion_programada=c.duracion_programada,
        extra_time=c.extra_time or 0,
        estado=c.estado,
        es_aseo=c.es_aseo,
        hora_fin_estimada=hora_fin_estimada,
    )


# -------------------------------------------------------------------
# 1. Listar cirugías (opcional filtrar)
# -------------------------------------------------------------------
@router.get("/", response_model=List[CirugiaOut])
def listar_cirugias(
    pabellon_id: int | None = None,
    fecha: date | None = None,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    q = db.query(models.Cirugia)

    if pabellon_id is not None:
        q = q.filter(models.Cirugia.pabellon_id == pabellon_id)

    if fecha is not None:
        q = q.filter(models.Cirugia.fecha == fecha)

    cirugias = q.order_by(models.Cirugia.fecha, models.Cirugia.hora_inicio).all()
    return [cirugia_to_out(c) for c in cirugias]


# -------------------------------------------------------------------
# 2. Leer una cirugía
# -------------------------------------------------------------------
@router.get("/{cirugia_id}", response_model=CirugiaOut)
def leer_cirugia(
    cirugia_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cirugía no encontrada")

    return cirugia_to_out(c)


# -------------------------------------------------------------------
# 3. Crear cirugía (principal + aseo)
# -------------------------------------------------------------------
@router.post("/", response_model=CirugiaOut, status_code=status.HTTP_201_CREATED)
def crear_cirugia(
    datos: CirugiaCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    # 1. Validar relaciones
    paciente = (
        db.query(models.Paciente).filter(models.Paciente.id == datos.paciente_id).first()
    )
    if not paciente:
        raise HTTPException(status_code=400, detail="Paciente no válido")

    doctor = db.query(models.Usuario).filter(models.Usuario.id == datos.doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=400, detail="Doctor no válido")

    pabellon = (
        db.query(models.Pabellon).filter(models.Pabellon.id == datos.pabellon_id).first()
    )
    if not pabellon:
        raise HTTPException(status_code=400, detail="Pabellón no válido")

    tipo = (
        db.query(models.TipoCirugia)
        .filter(models.TipoCirugia.id == datos.tipo_cirugia_id)
        .first()
    )
    if not tipo:
        raise HTTPException(status_code=400, detail="Tipo de cirugía no válido")

    # 2. Duración programada
    duracion_programada = datos.duracion_programada or tipo.duracion_estimada

    # 3. Calcular inicio / fin
    nueva_inicio = combinar_fecha_hora(datos.fecha, datos.hora_inicio)
    nueva_fin = calcular_fin(
        datos.fecha, datos.hora_inicio, duracion_programada, datos.extra_time or 0
    )

    # 4. Validar solapamiento para cirugías principales de ese pabellón y día
    cirugias_mismo_pabellon = (
        db.query(models.Cirugia)
        .filter(models.Cirugia.pabellon_id == datos.pabellon_id)
        .filter(models.Cirugia.fecha == datos.fecha)
        .filter(models.Cirugia.es_aseo == False)
        .filter(models.Cirugia.estado != EstadoCirugia.FINALIZADA)
        .filter(models.Cirugia.estado != EstadoCirugia.CANCELADA)
        .all()
    )

    for c in cirugias_mismo_pabellon:
        existente_inicio = combinar_fecha_hora(c.fecha, c.hora_inicio)
        existente_fin = calcular_fin(
            c.fecha, c.hora_inicio, c.duracion_programada, c.extra_time or 0
        )

        if hay_solapamiento(nueva_inicio, nueva_fin, existente_inicio, existente_fin):
            raise HTTPException(
                status_code=400,
                detail=f"El pabellón ya tiene una cirugía en ese horario (cirugía ID {c.id}).",
            )

    # 5. Crear cirugía principal
    nueva = models.Cirugia(
        paciente_id=datos.paciente_id,
        doctor_id=datos.doctor_id,
        pabellon_id=datos.pabellon_id,
        tipo_cirugia_id=datos.tipo_cirugia_id,
        fecha=datos.fecha,
        hora_inicio=datos.hora_inicio,
        duracion_programada=duracion_programada,
        extra_time=datos.extra_time or 0,
        estado=EstadoCirugia.PROGRAMADA,
        es_aseo=False,
    )

    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    # 6. Crear cirugía de ASEO asociada automáticamente
    crear_cirugia_aseo_relacionada(db, nueva)

    return cirugia_to_out(nueva)


# -------------------------------------------------------------------
# 4. Modificar cirugía
# -------------------------------------------------------------------
@router.put("/{cirugia_id}", response_model=CirugiaOut)
def modificar_cirugia(
    cirugia_id: int,
    datos: CirugiaUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cirugía no encontrada")

    update_data = datos.dict(exclude_unset=True)

    # Si cambia pabellón, fecha, hora o duración → validar solapamiento (solo principales)
    campos_tiempo = {"pabellon_id", "fecha", "hora_inicio", "duracion_programada", "extra_time"}
    requiere_validar = any(k in update_data for k in campos_tiempo) and not c.es_aseo

    # Aplicar cambios en memoria primero
    for campo, valor in update_data.items():
        setattr(c, campo, valor)

    # Resolver duración si quedó en None y hay tipo asociado
    if c.duracion_programada is None and c.tipo_cirugia_id:
        tipo = (
            db.query(models.TipoCirugia)
            .filter(models.TipoCirugia.id == c.tipo_cirugia_id)
            .first()
        )
        if tipo:
            c.duracion_programada = tipo.duracion_estimada

    if requiere_validar:
        nueva_inicio = combinar_fecha_hora(c.fecha, c.hora_inicio)
        nueva_fin = calcular_fin(
            c.fecha, c.hora_inicio, c.duracion_programada, c.extra_time or 0
        )

        cirugias_mismo_pabellon = (
            db.query(models.Cirugia)
            .filter(models.Cirugia.pabellon_id == c.pabellon_id)
            .filter(models.Cirugia.fecha == c.fecha)
            .filter(models.Cirugia.id != c.id)
            .filter(models.Cirugia.es_aseo == False)
            .filter(models.Cirugia.estado != EstadoCirugia.FINALIZADA)
            .filter(models.Cirugia.estado != EstadoCirugia.CANCELADA)
            .all()
        )

        for otra in cirugias_mismo_pabellon:
            existente_inicio = combinar_fecha_hora(otra.fecha, otra.hora_inicio)
            existente_fin = calcular_fin(
                otra.fecha,
                otra.hora_inicio,
                otra.duracion_programada,
                otra.extra_time or 0,
            )

            if hay_solapamiento(nueva_inicio, nueva_fin, existente_inicio, existente_fin):
                raise HTTPException(
                    status_code=400,
                    detail=f"El pabellón ya tiene una cirugía en ese horario (cirugía ID {otra.id}).",
                )

    db.commit()
    db.refresh(c)

    return cirugia_to_out(c)


# -------------------------------------------------------------------
# 5. Cambiar estado de la cirugía
# -------------------------------------------------------------------
class EstadoUpdate(BaseModel):
    nuevo_estado: EstadoCirugia


@router.patch("/{cirugia_id}/estado", response_model=CirugiaOut)
def cambiar_estado_cirugia(
    cirugia_id: int,
    body: EstadoUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cirugía no encontrada")

    c.estado = body.nuevo_estado
    db.commit()
    db.refresh(c)

    # Si se cancela una cirugía principal, intentar cancelar su ASEO asociado
    if body.nuevo_estado == EstadoCirugia.CANCELADA and not c.es_aseo:
        fin_principal = calcular_fin(
            c.fecha,
            c.hora_inicio,
            c.duracion_programada,
            c.extra_time or 0,
        )
        aseo = (
            db.query(models.Cirugia)
            .filter(models.Cirugia.pabellon_id == c.pabellon_id)
            .filter(models.Cirugia.es_aseo == True)
            .filter(models.Cirugia.fecha == fin_principal.date())
            .filter(models.Cirugia.hora_inicio == fin_principal.time())
            .first()
        )
        if aseo:
            aseo.estado = EstadoCirugia.CANCELADA
            db.add(aseo)
            db.commit()

    return cirugia_to_out(c)


# -------------------------------------------------------------------
# 6. Ajustar extra_time y recalcular agenda
# -------------------------------------------------------------------
class ExtraTimeUpdate(BaseModel):
    extra_time: int  # minutos, puede ser positivo (atraso)


@router.patch("/{cirugia_id}/extra-time", response_model=CirugiaOut)
def actualizar_extra_time(
    cirugia_id: int,
    body: ExtraTimeUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cirugía no encontrada")

    c.extra_time = body.extra_time
    db.commit()
    db.refresh(c)

    # Recalcular agenda del pabellón para cirugías principales
    if not c.es_aseo:
        recalcular_agenda_pabellon(db, c.pabellon_id, c.fecha)

    db.refresh(c)
    return cirugia_to_out(c)


# -------------------------------------------------------------------
# 7. Mover cirugía a otro pabellón
# -------------------------------------------------------------------
@router.patch("/{cirugia_id}", response_model=CirugiaOut)
def mover_cirugia(
    cirugia_id: int,
    body: dict,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    c = db.query(models.Cirugia).filter(models.Cirugia.id == cirugia_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Cirugía no encontrada")

    if "pabellon_id" in body:
        c.pabellon_id = body["pabellon_id"]

    db.commit()
    db.refresh(c)

    # Recalcular agenda del nuevo pabellón (solo si es principal)
    if not c.es_aseo:
        recalcular_agenda_pabellon(db, c.pabellon_id, c.fecha)

    db.refresh(c)
    return cirugia_to_out(c)


# -------------------------------------------------------------------
# 8. Endpoint utilitario para actualizar estados
# -------------------------------------------------------------------
@router.post("/actualizar-estados", status_code=200)
def endpoint_actualizar_estados(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """
    Endpoint para que el front fuerce actualización de estados.
    Se puede llamar al abrir la pantalla o vía intervalo.
    """
    actualizar_estados_automaticos(db)
    return {"detail": "Estados actualizados automáticamente"}