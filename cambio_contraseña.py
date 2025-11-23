from app.db.database import SessionLocal
from app.db import models
from app.core.security import get_password_hash

def cambiar_contrasena(usuario, nueva_clave):
    db = SessionLocal()

    # 1. Buscar al usuario
    user_db = db.query(models.Usuario).filter(models.Usuario.username == usuario).first()

    if user_db:
        print(f"👤 Usuario '{usuario}' encontrado.")
        # 2. Encriptar y actualizar la nueva clave
        user_db.hashed_password = get_password_hash(nueva_clave)
        db.commit()
        print(f"✅ ¡Contraseña actualizada exitosamente a: {nueva_clave}!")
    else:
        print(f"❌ Error: El usuario '{usuario}' no existe.")

    db.close()

if __name__ == "__main__":
    # AQUÍ PON EL NOMBRE DE USUARIO Y LA NUEVA CLAVE QUE QUIERAS
    usuario_a_cambiar = "admin"
    nueva_contrasena_segura = "Admin222"

    cambiar_contrasena(usuario_a_cambiar, nueva_contrasena_segura)