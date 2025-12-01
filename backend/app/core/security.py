from datetime import datetime, timedelta
from typing import Optional

import os
from dotenv import load_dotenv

from passlib.context import CryptContext
from jose import jwt, JWTError

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from sqlalchemy.orm import Session   # ← IMPORT NECESARIO

from app.db.database import get_db
from app.db import models

# ======================================================
# CONFIGURACIÓN
# ======================================================

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "clave-por-defecto-insegura")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 720   

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/token")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ======================================================
# FUNCIONES DE CONTRASEÑAS
# ======================================================

def verify_password(plain_password, hashed_password):
    """Verifica si la contraseña ingresada coincide con la encriptada."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Encripta una contraseña plana."""
    return pwd_context.hash(password)

# ======================================================
# JWT
# ======================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Genera el Token JWT que se enviará al Frontend."""
    to_encode = data.copy()

    expire = datetime.utcnow() + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ======================================================
# VALIDACIÓN DEL TOKEN
# ======================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    """
    Valida el token JWT, verifica existencia del usuario y su estado.
    Devuelve códigos compatibles con el frontend:
      - 401 → Token inválido o expirado
      - 455 → Usuario inactivo
    """

    # -----------------------------
    # 1. Validación del token JWT
    # -----------------------------
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")

        if username is None:
            raise HTTPException(
                status_code=401,
                detail="Token inválido o expirado",
                headers={"WWW-Authenticate": "Bearer"}
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # -----------------------------
    # 2. Verificar usuario en BD
    # -----------------------------
    usuario = db.query(models.Usuario).filter(
        models.Usuario.username == username
    ).first()

    if usuario is None:
        # Si el token era correcto pero el usuario ya no existe
        raise HTTPException(
            status_code=401,
            detail="Usuario no encontrado (token inválido)",
            headers={"WWW-Authenticate": "Bearer"}
        )

    # -----------------------------
    # 3. Usuario inactivo → 455
    # -----------------------------
    if usuario.es_activo is False:
        raise HTTPException(
            status_code=455,
            detail="Usuario inactivo"
        )

    return usuario