from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.core import security
from pydantic import BaseModel

# Schema simple para la respuesta del Token
class Token(BaseModel):
    access_token: str
    token_type: str

router = APIRouter()

@router.post("/token", response_model=Token)
def login_para_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    RQ01: Endpoint para iniciar sesión.
    Recibe username y password. Retorna un Token JWT si son correctos.
    """
    # 1. Buscar usuario en la BD
    usuario = db.query(models.Usuario).filter(models.Usuario.username == form_data.username).first()
    
    # 2. Verificar si existe y si la contraseña coincide
    if not usuario or not security.verify_password(form_data.password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Generar Token
    access_token = security.create_access_token(
        data={"sub": usuario.username, "rol": usuario.rol}
    )
    
    return {"access_token": access_token, "token_type": "bearer"}