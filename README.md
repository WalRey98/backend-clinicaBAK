📘 Documentación de API - Clínica BAK

Para el equipo de Frontend

🌐 Configuración Inicial

Base URL: http://TU_IP_REAL_O_NGROK:8001
(Reemplaza TU_IP... por la IP que te pase el backend o el link de Ngrok)

🔐 1. Autenticación (Login)

Usa esto para loguear al usuario y obtener el Token que necesitaras para las demas peticiones

Endpoint: /token

Método: POST

Tipo de Contenido: application/x-www-form-urlencoded (Form Data)

Datos a enviar (Body):
| Campo | Tipo | Ejemplo |
| :--- | :--- | :--- |
| username | String | admin |
| password | String | 1234 |

Respuesta Exitosa (200 OK):

{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "token_type": "bearer"
}


⚠️ IMPORTANTE: Guarda el access_token. Para todas las peticiones de abajo, debes enviarlo en el Header así: Authorization: Bearer TU_TOKEN.

🏥 2. Pabellones

Obtiene la lista de todas las salas para dibujar el calendario.

Endpoint: /pabellones/

Método: GET

Header: Authorization: Bearer <TOKEN>

Respuesta Exitosa (Ejemplo):

[
  {
    "id": 1,
    "nombre": "Pabellón Central 1 (Complejo)",
    "es_compleja": true,
    "capacidad": 1
  },
  {
    "id": 2,
    "nombre": "Pabellón General 1",
    "es_compleja": false,
    "capacidad": 1
  }
]


🩺 3. Cirugías

A. Agendar Nueva Cirugía

Endpoint: /cirugias/

Método: POST

Header: Authorization: Bearer <TOKEN>

Cuerpo de la Petición (JSON):

{
  "nombre_paciente": "Juan Perez",
  "cirujano": "Dr. Soto",
  "anestesista": "Dra. Muñoz",
  "personal_apoyo": "Enfermera 1, Arsenalero 2",
  "fecha_inicio_planeada": "2025-11-23T09:00:00",
  "duracion_estimada_min": 120,
  "pabellon_id": 1,
  "requiere_aseo_profundo": false
}


B. Ver Detalle de Cirugía

Endpoint: /cirugias/{id}

Método: GET

Ejemplo: /cirugias/5

C. Modificar Cirugía (Editar)

Si se equivocaron en algún dato.

Endpoint: /cirugias/{id}

Método: PUT

Body: Envía el mismo JSON que en "Crear", pero con los datos corregidos.

D. Cambiar Estado (Reportar Evento)

Para que la enfermera marque el inicio, fin o problemas en tiempo real.

Endpoint: /cirugias/{id}/estado

Método: PATCH

Parámetro (Query): nuevo_estado

Opciones de Estado Válidas:

En Curso (Para iniciar)

Finalizada (Para terminar y liberar sala)

Complicada (Si hubo problemas)

Suspendida (Si se cancela)

En Aseo

Ejemplo de URL:
http://.../cirugias/5/estado?nuevo_estado=En%20Curso