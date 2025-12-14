🏥 Sistema de Gestión Clínica BAK
Plataforma integral para la administración, agendamiento y monitoreo en tiempo real de pabellones quirúrgicos.

Este proyecto implementa una solución Full Stack para optimizar el flujo de trabajo en la Clínica BAK. Permite programar cirugías, visualizar la agenda diaria mediante un tablero Scrum Kanban interactivo, gestionar estados operativos y monitorear la ocupación de pabellones en tiempo real.

El sistema está construido con una arquitectura moderna, separando el backend (API REST) del frontend (Cliente Web), y utiliza Azure PostgreSQL como base de datos en la nube.

🚀 Tecnologías Utilizadas
Backend (API & Lógica)
Lenguaje: Python 3.10+

Framework: FastAPI (Alto rendimiento y validación de datos)

Base de Datos: PostgreSQL (Alojada en Azure Cloud)

ORM: SQLAlchemy (Gestión de modelos de datos)

Autenticación: JWT (JSON Web Tokens)

Seguridad: Bcrypt (Hashing de contraseñas)

Frontend (Interfaz de Usuario)
Framework: Angular 15+

Estilos: TailwindCSS (Diseño responsivo)

Interactividad: ngx-sortablejs (Drag & Drop fluido)

Alertas: SweetAlert2

✨ Características Principales
1. Agenda por Pabellón (Scrum Board)
Cada pabellón se visualiza como una columna dinámica en un tablero Kanban.

Tarjetas Inteligentes: Cada cirugía es una tarjeta que muestra paciente, doctor, hora y estado.

Drag & Drop: Permite arrastrar y soltar cirugías entre pabellones para reagendar instantáneamente (los cambios persisten en la base de datos).

Ordenamiento Automático: Las cirugías se ordenan cronológicamente dentro de cada pabellón.

2. Gestión de Estados y Ciclo de Vida
El sistema gestiona el flujo completo de la cirugía mediante estados visuales:

🟢 FINALIZADA: Término exitoso del procedimiento.

🔵 EN CURSO: Cirugía activa (Color azul).

🟣 EN ASEO: Estado especial de limpieza post-operatoria (Color morado, bloquea el pabellón).

🟡 PROGRAMADA: Agendada para el futuro.

🔴 COMPLICADA: Cirugía que ha excedido su tiempo estimado.

3. Lógica de Aseo Automática
A diferencia de sistemas manuales, nuestra plataforma integra el aseo en el flujo:

Al terminar una cirugía, el usuario inicia el "Modo Aseo".

La tarjeta cambia a estado EN ASEO (visualización destacada).

El Dashboard contabiliza este pabellón como "En Aseo" en tiempo real.

El sistema reserva automáticamente tiempos de holgura (Buffer) para evitar topes de horario.

4. Dashboard de Gestión
Panel de control superior que muestra métricas en vivo por pabellón:

Conteo de cirugías activas.

Conteo de pabellones en proceso de aseo.

Carga total de trabajo (minutos estimados).

5. Validaciones y Seguridad
Control de Horarios: El backend impide agendar cirugías si existe un tope de horario con otra operación o un bloque de aseo.

Acceso Seguro: Todo el sistema requiere inicio de sesión. Las contraseñas están encriptadas y las sesiones protegidas por tokens JWT.

🛠️ Instalación y Ejecución
El proyecto está diseñado para ser descargado y ejecutado fácilmente. Sigue estos pasos:

Paso 1: Clonar el Proyecto
Descarga el código fuente o clona el repositorio:

Bash

git clone https://github.com/walrey98/backend-clinicabak.git
cd backend-clinicabak
Paso 2: Ejecutar el Backend (Servidor)
Recomendación: Abrir una ventana de Símbolo del sistema (CMD) o PowerShell.

Navega a la carpeta del backend:

Bash

cd backend
Crea y activa un entorno virtual (opcional pero recomendado):

Bash

python -m venv venv
venv\Scripts\activate  # En Windows
Instala las dependencias:

Bash

pip install -r requirements.txt
Inicia el servidor:

Bash

python run.py
El servidor iniciará en http://localhost:8000.

Paso 3: Ejecutar el Frontend (Cliente)
Recomendación: Usar la terminal integrada de VSCode.

Abre una nueva terminal y navega a la carpeta frontend:

Bash

cd frontend
Instala las dependencias de Node:

Bash

npm install
Inicia la aplicación Angular:

Bash

ng serve
Abre tu navegador y ve a: http://localhost:4200

👥 Equipo de Desarrollo
Proyecto desarrollado como parte del examen de la asignatura "Desarrollo de Proyectos Tecnológicos".

Carlos Antonio Jara Vicencio - Frontend Developer & UI

Cesar Matías Araya Carreño - Product Owner & QA

Walter Ignacio Reyes Silva - Backend Developer & Database Architect

Felix Quispe Angulo - Scrum Master & DevOps