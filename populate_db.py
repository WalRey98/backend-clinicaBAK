# populate_db.py
from app.db.database import SessionLocal, engine
from app.db import models
# IMPORTANTE: Importamos la función para encriptar la clave
# Asegúrate de que app/core/security.py exista y tenga la función get_password_hash
from app.core.security import get_password_hash 

# Asegurarse de que las tablas existan (incluida la nueva de Usuarios)
models.Base.metadata.create_all(bind=engine)

def init_db():
    db = SessionLocal()
    print("🌱 Iniciando creación de datos iniciales...")

    # -------------------------------------------------------
    # 1. CREAR USUARIO ADMIN
    # -------------------------------------------------------
    # Verificamos si ya existe el admin para no duplicarlo
    if not db.query(models.Usuario).filter(models.Usuario.username == "admin").first():
        print("👤 Creando usuario administrador 'admin'...")
        admin_user = models.Usuario(
            username="admin",
            # Encriptamos la contraseña "1234" antes de guardarla
            hashed_password=get_password_hash("1234"), 
            nombre_completo="Administrador del Sistema",
            rol="Admin"
        )
        db.add(admin_user)
    else:
        print("⚠️ El usuario 'admin' ya existe.")

    # -------------------------------------------------------
    # 2. CREAR PABELLONES
    # -------------------------------------------------------
    if not db.query(models.Pabellon).first():
        print("🏥 Creando pabellones de la Clínica BAK...")
        lista_pabellones = []

        # Salas Complejas (2)
        lista_pabellones.append(models.Pabellon(nombre="Pabellón Central 1 (Complejo)", es_compleja=True))
        lista_pabellones.append(models.Pabellon(nombre="Pabellón Central 2 (Complejo)", es_compleja=True))

        # Salas Grandes Normales (14 restantes de las 16)
        for i in range(1, 15):
            lista_pabellones.append(models.Pabellon(nombre=f"Pabellón General {i}", es_compleja=False))

        # Salas Obstetricia (8)
        for i in range(1, 9):
            lista_pabellones.append(models.Pabellon(nombre=f"Pabellón Obstetricia {i}", es_compleja=False))

        # Quirófanos Ambulatorios (6)
        for i in range(1, 7):
            lista_pabellones.append(models.Pabellon(nombre=f"Ambulatorio {i}", es_compleja=False))

        # Hemodinámica (1)
        lista_pabellones.append(models.Pabellon(nombre="Sala Hemodinámica", es_compleja=True))

        db.add_all(lista_pabellones)
        print(f"✅ Se han agregado {len(lista_pabellones)} pabellones a la lista de creación.")
    else:
        print("⚠️ Los pabellones ya existen en la base de datos.")

    # 3. Guardar todo en la base de datos
    db.commit()
    db.close()
    print("🚀 ¡Base de datos poblada exitosamente! Ya puedes iniciar sesión.")

if __name__ == "__main__":
    init_db()