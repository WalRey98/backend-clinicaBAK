from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.core import security
from pydantic import BaseModel

router = APIRouter()

@router.post("/token")
def login_para_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    """
    Login con códigos de error especiales para el frontend.
    """

    # 1. Buscar usuario
    usuario = db.query(models.Usuario).filter(
        models.Usuario.username == form_data.username
    ).first()

    # 451 → Usuario no encontrado
    if not usuario:
        raise HTTPException(
            status_code=451,
            detail="Usuario no encontrado"
        )

    # 455 → Usuario inactivo
    if usuario.es_activo is False:
        raise HTTPException(
            status_code=455,
            detail="Usuario inactivo"
        )

    # 452 → Credenciales incorrectas
    if not security.verify_password(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=452,
            detail="Credenciales incorrectas"
        )

    # 453 → Usuario no permitido (si aplica)
    # Ejemplo: solo admins pueden ingresar
    if usuario.rol not in ["Admin", "Administrador", "Supervisor"]:
        raise HTTPException(
            status_code=453,
            detail="Usuario no permitido"
        )

    # 200 OK → Generar token
    access_token = security.create_access_token(
        data={"sub": usuario.username, "rol": usuario.rol}
    )

    return {
        "data": {
            "token": access_token,
            "user": {
                "id": usuario.id,
                "name": usuario.nombre_completo,
                "username": usuario.username,
                "rol": usuario.rol,
            }
        }
    }