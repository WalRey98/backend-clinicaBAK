🏥 Backend - Gestión de Pabellones Clínica BAK

Sistema de gestión de backend para la administración, agendamiento y monitoreo de pabellones de cirugía en tiempo real. Desarrollado con FastAPI y conectado a Azure PostgreSQL.

🚀 Tecnologías Utilizadas

Lenguaje: Python 3.10+

Framework: FastAPI

Base de Datos: PostgreSQL (Azure Cloud)

ORM: SQLAlchemy

Autenticación: JWT (JSON Web Tokens)

Seguridad: Bcrypt (Hashing de contraseñas)

---------------------------------------------

README – Frontend Sistema de Gestión de Cirugías (Angular)

Descripción General

Este proyecto implementa el frontend del sistema de gestión quirúrgica de la clínica.
Permite programar cirugías, visualizar la agenda diaria por pabellón mediante un tablero Scrum Kanban, arrastrar y soltar procedimientos entre pabellones (drag & drop) y gestionar el estado dinámico de las cirugías.

El sistema trabaja en conjunto con un backend FastAPI + PostgreSQL y expone una interfaz optimizada para la coordinación del área quirúrgica.

⸻

Características Principales

1. Agenda por Pabellón (Scrum Board)

Cada pabellón se representa como una columna.
Cada cirugía se renderiza como una tarjeta que se puede arrastrar:
	•	Lista de pabellones dinámica
	•	Cirugías ordenadas automáticamente por hora
	•	Drag & drop completo entre columnas
	•	Recalculo de agenda al mover cirugías
	•	Carga automática de tiempos estimados y extra time
	•	Visualización clara de estado, colores y duración

2. Estados de Cirugía

Los estados soportados y gestionados por backend son:
PROGRAMADA
Cirugía agendada en futuro
EN_CURSO
Inicia automáticamente a la hora de inicio
FINALIZADA
Término normal o con extra time
CANCELADA
Cancelada manualmente
COMPLICADA
Cirugía con extra_time activado que aún no termina
EN_ASEO
Cirugía generada automáticamente después de la principal
LIBRE
No se utiliza (ocupación vacía)

El frontend solo los muestra; la lógica automática ocurre en backend.

⸻

3. Cirugía de Aseo Automática

Cada cirugía principal genera una cirugía de aseo:
	•	Se crea automáticamente al programar la cirugía
	•	No posee paciente ni doctor
	•	Se marca visualmente distinta en el Scrum
	•	No se puede editar, eliminar ni agregar tiempo extra desde frontend
	•	Se mueve automáticamente con la cirugía principal

⸻

4. Formularios y Validaciones

El modal de registro y edición incluye:
	•	Selección dinámica de paciente
	•	Selección dinámica de doctor
	•	Selección dinámica de tipo de cirugía
	•	Selección de pabellón
	•	Fecha y hora
	•	Tiempo programado o duración estimada automática
	•	Extra time opcional
	•	Validaciones completas antes de enviar al backend

⸻

5. Drag & Drop (SortableJS)

El tablero usa dustfoundation-ngx-sortablejs, que integra SortableJS con Angular.

Funcionalidades:
	•	Arrastrar cirugías entre pabellones
	•	Persistencia de cambios vía PATCH /cirugias/{id}
	•	Recalculo del orden posterior en backend
	•	Clases visuales de ghost, drag y animaciones

⸻

6. Distinción Visual de Estados

El componente aplica colores específicos para cada caso:
	•	Finalizada: verde suave
	•	En Curso: azul suave
	•	Complicada: rojo suave
	•	Programada: gris claro
	•	Aseo: amarillo tenue, sin controles

⸻

Requisitos Previos
	•	NodeJS >= 18
	•	Angular CLI >= 15
	•	Backend en FastAPI corriendo (ver repositorio backend)
	•	Configuración de .env para endpoints de API


Instalación
npm install

Ejecutar en Desarrollo
ng serve

Luego entrar a:
http://localhost:4200

