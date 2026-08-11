# 🏥 API REST - Gestión de Turnos Hospitalarios

**Universidad UCH Champagnat**  
**Carrera:** Licenciatura en Sistemas de Información  
**Materia:** Programación Distribuida  
**Trabajo Práctico N° 1:** API REST con Node.js y Express  
**Estudiante:** Brian Villalba  
**DNI:** 46868103
**Recurso Modelado:** Turnos Médicos (`turnos`)

---

## 📋 Descripción
Proyecto de API RESTful desarrollada con **Node.js** y **Express** para la gestión de turnos médicos trabajando con datos mockeados en memoria, complementada con una interfaz web en el Frontend y validaciones CRUD completas.

---

## 🛠️ Tecnologías e Instalación

### Requisitos Previos
- **Node.js** (versión LTS) y **npm** instalados.
- **Git** para control de versiones.

### Instalación de Dependencias

Para ejecutar el proyecto en un entorno local:

1. **Clonar o descargar el repositorio e instalar dependencias:**
   npm install

2. **Ejecutar el servidor:**
   npm start

3. **Acceder a la aplicación:**  
   Abre tu navegador en http://localhost:3000

---

## 📂 Estructura del Proyecto

API_REST/
├── node_modules/
├── public/
│   ├── index.html
│   ├── script.js
│   └── styles.css
├── src/
│   ├── data/
│   │   └── turnosMock.js
│   ├── routes/
│   │   └── turnosRoutes.js
│   └── app.js
├── .gitignore
├── package-lock.json
├── package.json
└── README.md

---

## 📡 Lógica CRUD y Endpoints REST

Se implementaron las operaciones fundamentales utilizando `express.Router()` y respuestas en formato JSON:

| Método | Endpoint | Descripción | Código HTTP Exitoso | Código HTTP Error |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/turnos` | Retorna el listado completo de turnos | `200 OK` | `500 Internal Server Error` |
| **GET** | `/api/turnos/:id` | Busca un turno específico por su ID | `200 OK` | `404 Not Found` |
| **POST** | `/api/turnos` | Agenda un nuevo turno previa validación | `201 Created` | `400 Bad Request` |
| **PUT** | `/api/turnos/:id` | Actualiza o confirma un turno existente | `200 OK` | `400 Bad Request` / `404 Not Found` |
| **DELETE** | `/api/turnos/:id` | Cancela/elimina un turno por su ID | `204 No Content` | `404 Not Found` |

---

## ⚙️ Reglas de Validación Implementadas

- **Campos obligatorios:** Valida que la solicitud incluya `paciente`, `medico`, `fecha` y `hora`.
- **Incompatibilidad de horarios:** Impide registrar dos turnos para el mismo médico en la misma fecha y hora.
- **Fechas pasadas:** Bloquea la creación de citas en fechas anteriores al día actual.
- **Manejo de errores:** Devuelve un código `404 Not Found` si el ID consultado, modificado o eliminado no existe.

---

## 🧠 Concepto REST: Idempotencia (Punto 10)

En la API desarrollada, los métodos **`GET`**, **`PUT`** y **`DELETE`** son **idempotentes**, ya que realizar la misma solicitud múltiples veces consecutivas produce el mismo efecto final en el estado del servidor. Por ejemplo, ejecutar `DELETE /api/turnos/123` eliminará el turno la primera vez y las peticiones subsecuentes mantendrán el recurso como inexistente sin alterar otros registros. En cambio, el método **`POST`** **no es idempotente**, debido a que cada ejecución repetida genera un nuevo registro con un ID único en el arreglo en memoria.

---

## 💾 Persistencia de Datos
Los turnos se almacenan temporalmente en la **memoria RAM** a través de un arreglo JavaScript. Al ser memoria volátil, los datos modificados se restablecen a su estado inicial si el servidor de Node.js se detiene o reinicia.