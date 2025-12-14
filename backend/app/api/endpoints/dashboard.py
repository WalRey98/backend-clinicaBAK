from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime
from typing import List

from app.db.database import get_db
from app.db import models
from app.core.security import get_current_user
from app.db.models import EstadoCirugia

router = APIRouter()

@router.get("/resumen")
def obtener_resumen_dashboard(
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    hoy = date.today()

    # 1. KPIs Generales (Solo de hoy)
    # -------------------------------
    cirugias_hoy = db.query(models.Cirugia).filter(
        models.Cirugia.fecha == hoy,
        models.Cirugia.es_aseo == False
    ).all()

    total_hoy = len(cirugias_hoy)
    en_ejecucion = sum(1 for c in cirugias_hoy if c.estado == EstadoCirugia.EN_CURSO)
    retrasos = sum(1 for c in cirugias_hoy if c.estado == EstadoCirugia.COMPLICADA)
    
    # Aseo activo ahora mismo
    aseo_activo = db.query(models.Cirugia).filter(
        models.Cirugia.fecha == hoy,
        models.Cirugia.es_aseo == True,
        models.Cirugia.estado == EstadoCirugia.EN_ASEO
    ).count()

    # 2. Datos para Gráfico de Torta (Estados de hoy)
    # -----------------------------------------------
    # Contamos cuántas hay de cada estado hoy
    stats_estados = db.query(
        models.Cirugia.estado, func.count(models.Cirugia.id)
    ).filter(
        models.Cirugia.fecha == hoy,
        models.Cirugia.es_aseo == False # Excluimos aseos del gráfico principal
    ).group_by(models.Cirugia.estado).all()

    # Convertimos a diccionario: { "PROGRAMADA": 5, "EN_CURSO": 2 ... }
    grafico_map = {estado.name: count for estado, count in stats_estados}

    # Definimos el orden y categorías fijas para el gráfico
    labels_fijos = ["PROGRAMADA", "EN_CURSO", "FINALIZADA", "CANCELADA"]
    series_data = [grafico_map.get(k, 0) for k in labels_fijos]

    # 3. Próximas Cirugías (Las siguientes 5 pendientes)
    # --------------------------------------------------
    proximas = db.query(models.Cirugia).filter(
        models.Cirugia.fecha >= hoy,
        models.Cirugia.estado == EstadoCirugia.PROGRAMADA,
        models.Cirugia.es_aseo == False
    ).order_by(models.Cirugia.fecha, models.Cirugia.hora_inicio).limit(5).all()

    lista_proximas = []
    for p in proximas:
        paciente_nombre = p.paciente_rel.nombre if p.paciente_rel else "Sin Paciente"
        pabellon_nombre = p.pabellon_rel.nombre if p.pabellon_rel else "Sin Pabellón"
        lista_proximas.append({
            "id": p.id,
            "hora": p.hora_inicio.strftime("%H:%M"),
            "fecha": p.fecha.strftime("%Y-%m-%d"),
            "paciente": paciente_nombre,
            "pabellon": pabellon_nombre,
            "cirugia": p.tipo_cirugia_rel.nombre if p.tipo_cirugia_rel else "General"
        })

    return {
        "kpis": {
            "total_hoy": total_hoy,
            "en_ejecucion": en_ejecucion,
            "retrasos": retrasos,
            "aseo_activo": aseo_activo
        },
        "grafico_estados": {
            "series": series_data,
            "labels": labels_fijos
        },
        "proximas_cirugias": lista_proximas
    }