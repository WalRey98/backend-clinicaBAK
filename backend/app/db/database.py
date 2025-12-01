import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# ----------------------------------------------------------------
# CONFIGURACIÓN DE BASE DE DATOS (NUBE AZURE)
# ----------------------------------------------------------------
# Usuario: *******
# Pass: *********
# Host: postgres-uni.postgres.database.azure.com
# DB: postgres
# ----------------------------------------------------------------

# Construimos la URL de conexión segura
# 1. Cargar variables del archivo .env
load_dotenv()

# 2. Leer la URL desde la variable de entorno (Si no existe, falla)
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Validación de seguridad
if not SQLALCHEMY_DATABASE_URL:
    raise ValueError("FATAL: No se encontró la variable DATABASE_URL en el archivo .env")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()