from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración para JWT (En producción esto va en variables de entorno)
SECRET_KEY = os.getenv("SECRET_KEY", "clave-por-defecto-insegura")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 # El token dura 1 hora

# Contexto para encriptar contraseñas con Bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    """Verifica si la contraseña ingresada coincide con la encriptada."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Encripta una contraseña plana."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Genera el Token JWT que se enviará al Frontend."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt