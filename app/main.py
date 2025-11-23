# app/main.py
from fastapi import FastAPI
from app.db.database import Base, engine
from app.api.endpoints import pabellones, cirugias, auth
from app.db import models

# Crea todas las tablas en la base de datos (solo si no existen)
models.Base.metadata.create_all(bind=engine)

# Inicializa la aplicación FastAPI
app = FastAPI(
    title="API Gestión de Pabellones - Clínica BAK",
    description="Backend para gestionar la asignación de pabellones de cirugía en tiempo real.",
    version="1.0.0"
)

# Agrega los routers de los endpoints para que FastAPI los reconozca
app.include_router(auth.router, tags=["Autenticación"])
app.include_router(pabellones.router, prefix="/pabellones", tags=["Pabellones"])
app.include_router(cirugias.router, prefix="/cirugias", tags=["Cirugías"])

@app.get("/", tags=["Root"])
def read_root():
    # Endpoint simple para verificar que el backend esté vivo
    return {"message": "API de Gestión de Pabellones activa. Ir a /docs para la documentación."}