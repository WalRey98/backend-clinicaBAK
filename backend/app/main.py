# app/main.py
from fastapi import FastAPI
from app.db.database import Base, engine
# AGREGAMOS 'dashboard' AQUÍ
from app.api.endpoints import pabellones, cirugias, auth, usuarios, pacientes, tipos_cirugia, dashboard 
from app.db import models
from fastapi.middleware.cors import CORSMiddleware

# Crea todas las tablas en la base de datos (solo si no existen)
models.Base.metadata.create_all(bind=engine)

# Inicializa la aplicación FastAPI
app = FastAPI(
    title="API Gestión de Pabellones - Clínica BAK",
    description="Backend para gestionar la asignación de pabellones de cirugía en tiempo real.",
    version="1.0.0"
)

# Habilitar CORS
origins = [
    "http://localhost:4200",
    "http://127.0.0.1:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Agrega los routers de los endpoints para que FastAPI los reconozca
app.include_router(auth.router, tags=["Autenticación"])
app.include_router(pabellones.router, prefix="/pabellones", tags=["Pabellones"])
app.include_router(cirugias.router, prefix="/cirugias", tags=["Cirugías"])
app.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
app.include_router(pacientes.router, prefix="/pacientes", tags=["Pacientes"])
app.include_router(tipos_cirugia.router, prefix="/tipos-cirugia", tags=["Tipos de Cirugía"])

# NUEVO ROUTER PARA DASHBOARD
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

@app.get("/", tags=["Root"])
def read_root():
    # Endpoint simple para verificar que el backend esté vivo
    return {"message": "API de Gestión de Pabellones activa. Ir a /docs para la documentación."}