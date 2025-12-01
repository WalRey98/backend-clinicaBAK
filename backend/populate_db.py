from app.db.database import SessionLocal, engine
from app.db import models
from app.core.security import get_password_hash

# Inicializa las tablas en la base de datos
models.Base.metadata.create_all(bind=engine)

def init_db():
    db = SessionLocal()
    print("🌱 Iniciando población de base de datos...")

    # 1. Crear Usuario Administrador
    if not db.query(models.Usuario).filter(models.Usuario.username == "admin").first():
        admin_user = models.Usuario(
            username="admin",
            hashed_password=get_password_hash("1234"),
            nombre_completo="Administrador de Sistemas",
            rol="Admin"
        )
        db.add(admin_user)
        print("👤 Usuario 'admin' creado.")
    else:
        print("ℹ️ El usuario 'admin' ya existe.")

    # 2. Crear Pabellones Clínicos
    if not db.query(models.Pabellon).first():
        lista_pabellones = []

        # Pabellones Centrales (Complejos)
        lista_pabellones.append(models.Pabellon(nombre="Pabellón Central 1", es_compleja=True))
        lista_pabellones.append(models.Pabellon(nombre="Pabellón Central 2", es_compleja=True))

        # Pabellones Generales
        for i in range(1, 15):
            lista_pabellones.append(models.Pabellon(nombre=f"Pabellón General {i}", es_compleja=False))

        # Pabellones Obstetricia
        for i in range(1, 9):
            lista_pabellones.append(models.Pabellon(nombre=f"Pabellón Obstetricia {i}", es_compleja=False))

        # Quirófanos Ambulatorios
        for i in range(1, 7):
            lista_pabellones.append(models.Pabellon(nombre=f"Ambulatorio {i}", es_compleja=False))

        # Sala Hemodinámica
        lista_pabellones.append(models.Pabellon(nombre="Sala Hemodinámica", es_compleja=True))

        db.add_all(lista_pabellones)
        print(f"🏥 Se han creado {len(lista_pabellones)} pabellones.")
    else:
        print("ℹ️ Los pabellones ya existen.")

    db.commit()
    db.close()
    print("✅ Proceso finalizado correctamente.")

if __name__ == "__main__":
    init_db()