from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db import models
from app.core import security
from app.core.security import get_current_user
from pydantic import BaseModel
from typing import List, Optional
import secrets
import string

def generar_password_aleatoria(length=10):
    caracteres = string.ascii_letters + string.digits
    return ''.join(secrets.choice(caracteres) for _ in range(length))

def normalizar_estado(valor, default=True):
    if valor is None:
        return default
    if isinstance(valor, bool):
        return valor
    if isinstance(valor, str):
        return valor.lower() == "active"
    return default

router = APIRouter()

# ----------------------------
# SCHEMAS Pydantic
# ----------------------------

class UsuarioBase(BaseModel):
    username: str
    nombre_completo: str
    rol: str
    es_activo: bool = True

class UsuarioCreate(BaseModel):
    username: str
    nombre_completo: str
    rol: str
    es_activo: bool | str = True 
    password: str | None = None   # ← opcional

class UsuarioUpdate(BaseModel):
    nombre_completo: Optional[str] = None
    rol: Optional[str] = None
    es_activo: Optional[bool] = None
    password: Optional[str] = None

class UsuarioOut(UsuarioBase):
    id: int

    class Config:
        from_attributes = True

class ResetPasswordRequest(BaseModel):
    password: str

# ----------------------------
# ENDPOINTS CRUD
# ----------------------------

# 1. Crear usuario
@router.post("/", response_model=UsuarioOut)
def crear_usuario(
    usuario: UsuarioCreate,
    usuario_actual = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Verificar existencia
    existe = db.query(models.Usuario).filter(models.Usuario.username == usuario.username).first()
    if existe:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    # Si no viene password, generarla automáticamente
    if not usuario.password:
        usuario.password = generar_password_aleatoria()
        print(f"Contraseña generada para {usuario.username}: {usuario.password}")

    hashed = security.get_password_hash(usuario.password)

    # Normalizar es_activo ("active"/"inactive" → boolean)
    estado = normalizar_estado(usuario.es_activo, default=True)

    db_usuario = models.Usuario(
        username=usuario.username,
        hashed_password=hashed,
        nombre_completo=usuario.nombre_completo,
        rol=usuario.rol,
        es_activo=estado,
    )

    db.add(db_usuario)
    db.commit()
    db.refresh(db_usuario)

    return db_usuario

# 2. Listar todos los usuarios
@router.get("/", response_model=List[UsuarioOut])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(models.Usuario).all()

# 3. Obtener usuario por ID
@router.get("/{usuario_id}", response_model=UsuarioOut)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario

# 4. Actualizar usuario
@router.put("/{usuario_id}", response_model=UsuarioOut)
def actualizar_usuario(usuario_id: int, datos: UsuarioUpdate, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Normalizar es_activo ("active"/"inactive" → boolean)
    estado = normalizar_estado(usuario.es_activo, default=None)

    # Actualizar campos
    if datos.nombre_completo is not None:
        usuario.nombre_completo = datos.nombre_completo
    if datos.rol is not None:
        usuario.rol = datos.rol
    if datos.es_activo is not None:
        usuario.es_activo=estado
    if datos.password is not None:
        usuario.hashed_password = security.get_password_hash(datos.password)

    db.commit()
    db.refresh(usuario)
    return usuario

# 5. Eliminar usuario
@router.delete("/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario)
    db.commit()

    return {"mensaje": "Usuario eliminado correctamente"}

@router.post("/cambiar-password")
def cambiar_password(
    current_password: str,
    new_password: str,
    db: Session = Depends(get_db),
    usuario_actual = Depends(get_current_user)
):
    """
    Permite que un usuario autenticado cambie su propia contraseña.
    """
    
    # 1. Validar contraseña actual
    if not security.verify_password(current_password, usuario_actual.hashed_password):
        raise HTTPException(status_code=400, detail="La contraseña actual es incorrecta")

    # 2. Asignar la nueva contraseña encriptada
    usuario_actual.hashed_password = security.get_password_hash(new_password)

    # 3. Guardar cambios
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente"}

@router.post("/{usuario_id}/reset-password")
def reset_password(
    usuario_id: int,
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
    usuario_actual = Depends(get_current_user)
):
    
    nueva_clave = body.password

    """
    Permite que un admin cambie contraseña de cualquier usuario.
    """
    # Verificar rol
    if usuario_actual.rol != "Admin":
        raise HTTPException(status_code=403, detail="No autorizado")

    usuario_db = db.query(models.Usuario).filter(models.Usuario.id == usuario_id).first()

    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db.hashed_password = security.get_password_hash(nueva_clave)
    db.commit()

    return {"mensaje": f"Contraseña del usuario {usuario_id} actualizada"}