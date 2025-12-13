from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date, datetime
from typing import List, Any

from app.db.database import get_db
from app.db import models
from app.db.models import EstadoCirugia

router = APIRouter()

@router.get("/resumen")
def obtener_resumen_dashboard(
    db: Session = Depends(get_db)
):
    hoy = date.today()
    ahora = datetime.now()

    # 1. Total Cirugías Hoy (Sin contar los aseos)
    total_hoy = db.query(models.Cirugia).filter(
        models.Cirugia.fecha == hoy,
        models.Cirugia.es_aseo == False
    ).count()

    # 2. En Ejecución (En Curso o Complicada)
    en_ejecucion = db.query(models.Cirugia).filter(
        models.Cirugia.fecha == hoy,
        models.Cirugia.es_aseo == False,
        models.Cirugia.estado.in_([EstadoCirugia.EN_CURSO, EstadoCirugia.COMPLICADA])
    ).count()

    # 3. Retrasos Críticos (Complicadas)
    retrasos = db.query(models.Cirugia).filter(
        models.Cirugia.fecha == hoy,
        models.Cirugia.estado == EstadoCirugia.COMPLICADA
    ).count()

    # 4. Pabellones ocupados en Aseo ahora mismo
    aseo_activo = db.query(models.Cirugia).filter(
        models.Cirugia.fecha == hoy,
        models.Cirugia.es_aseo == True,
        models.Cirugia.estado == EstadoCirugia.EN_ASEO
    ).count()

    # 5. Próximos Ingresos (Las siguientes 5 cirugías 'Programadas' de hoy)
    proximas = (
        db.query(models.Cirugia)
        .filter(
            models.Cirugia.fecha == hoy,
            models.Cirugia.es_aseo == False,
            models.Cirugia.estado == EstadoCirugia.PROGRAMADA,
            models.Cirugia.hora_inicio >= ahora.time() 
        )
        .order_by(models.Cirugia.hora_inicio)
        .limit(5)
        .all()
    )

    # Formateamos la lista para que el frontend la lea fácil
    lista_proximas = []
    for p in proximas:
        # Usamos los nombres si existen las relaciones, si no, ponemos un placeholder
        paciente_nombre = p.paciente_rel.nombre if p.paciente_rel else "Sin Paciente"
        tipo_nombre = p.tipo_cirugia_rel.nombre if p.tipo_cirugia_rel else "General"
        pabellon_nombre = p.pabellon_rel.nombre if p.pabellon_rel else f"Pab {p.pabellon_id}"
        
        lista_proximas.append({
            "hora": p.hora_inicio.strftime("%H:%M"),
            "paciente": paciente_nombre,
            "tipo": tipo_nombre,
            "pabellon": pabellon_nombre
        })

    return {
        "kpis": {
            "total_hoy": total_hoy,
            "en_ejecucion": en_ejecucion,
            "retrasos": retrasos,
            "aseo_activo": aseo_activo
        },
        "proximas_cirugias": lista_proximas
    }