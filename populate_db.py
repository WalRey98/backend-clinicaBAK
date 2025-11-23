# populate_db.py
from app.db.database import SessionLocal, engine
from app.db import models
# IMPORTANTE: Importamos la función para encriptar la clave
from app.core.security import get_password_hash 

# Asegurarse de que las tablas existan
models.Base.metadata.create_all(bind=engine)

def init_db():
    db = SessionLocal()
    print("🌱 Creando datos iniciales...")

    # -------------------------------------------------------
    # 1. ESTA ES LA PARTE QUE TE FALTABA (Crear Admin)
    # -------------------------------------------------------
    # Verificamos si ya existe el usuario 'admin'
    if not db.query(models.Usuario).filter(models.Usuario.username == "admin").first():
        print("👤 Creando usuario administrador 'admin'...")
        admin_user = models.Usuario(
            username="admin",
            # Encriptamos la contraseña "1234"
            hashed_password=get_password_hash("1234"), 
            nombre_completo="Administrador Sistema",
            rol="Admin"
        )
        db.add(admin_user)
    else:
        print("⚠️ El usuario 'admin' ya existe.")

    # -------------------------------------------------------
    # 2. CREAR PABELLONES
    # -------------------------------------------------------
    if not db.query(models.Pabellon).first():
        print("🏥 Creando pabellones...")
        lista_pabellones = []

        # Salas Complejas (2)
        lista_pabellones.append(models.Pabellon(nombre="Pabellón Central 1 (Complejo)", es_compleja=True))
        lista_pabellones.append(models.Pabellon(nombre="Pabellón Central 2 (Complejo)", es_compleja=True))

        # Salas Grandes Normales (14)
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
        print(f"✅ Se han creado {len(lista_pabellones)} pabellones.")
    else:
        print("⚠️ Los pabellones ya existen.")

    # 3. Guardar todo (Usuarios y Pabellones)
    db.commit()
    db.close()
    print("🚀 ¡Base de datos lista! Usuario admin creado.")

if __name__ == "__main__":
    init_db()