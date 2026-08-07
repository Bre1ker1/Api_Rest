# 🏥 API REST - Gestión de Turnos Hospitalarios

Proyecto de API RESTful desarrollada paso a paso con **Node.js** y **Express** para la gestión de turnos médicos, complementada con una interfaz web en el Frontend y pruebas aisladas con Postman.

---

## 🛠️ Tecnologías e Instalación

### Requisitos Previos
- **Node.js** y **npm** instalados en el sistema.
- **Git** para control de versiones.

### Instalación de Dependencias

Para reproducir este proyecto desde cero, ejecuta en la terminal:

1. **Inicializar proyecto de Node:**
   `npm init -y`

2. **Instalar el framework Express:**
   `npm install express`

3. **Ejecutar el servidor:**
   `npm start`

---

## 📂 Pasos de Construcción del Proyecto

### Paso 1: Configuración de la Estructura de Archivos
Se creó una arquitectura modular desacoplando datos, rutas y la configuración del servidor:

    API_REST/
    ├── docs/
    ├── node_modules/
    ├── public/
    │   └── index.html
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

### Paso 2: Creación de los Datos Simulados (`src/data/turnosMock.js`)
Se definieron los datos iniciales almacenados en memoria (RAM) mediante un arreglo de objetos JavaScript:

    let turnos = [
      { id: 1, paciente: "María Gómez", medico: "Dr. Pérez (Cardiología)", fecha: "2026-08-10", hora: "10:00", estado: "pendiente" },
      { id: 2, paciente: "Juan López", medico: "Dra. Rodríguez (Pediatría)", fecha: "2026-08-11", hora: "11:30", estado: "confirmado" }
    ];
    module.exports = turnos;

---

### Paso 3: Lógica CRUD y Endpoints REST (`src/routes/turnosRoutes.js`)
Se implementaron los métodos HTTP utilizando `express.Router()`:

| Método | Endpoint | Descripción | Código HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/turnos` | Retorna el listado completo de turnos | `200 OK` |
| **GET** | `/api/turnos/:id` | Busca un turno específico por su ID | `200 OK` / `404 Not Found` |
| **POST** | `/api/turnos` | Crea un nuevo turno con un ID dinámico | `201 Created` / `400 Bad Request` |
| **PUT** | `/api/turnos/:id` | Actualiza un turno existente | `200 OK` / `404 Not Found` |
| **DELETE** | `/api/turnos/:id` | Elimina un turno por su ID | `200 OK` / `404 Not Found` |

---

### Paso 4: Inicialización del Servidor (`src/app.js`)
Se configuró el servidor Express para:
- Parsear datos entrantes en formato JSON (`express.json()`).
- Servir los archivos estáticos del Frontend desde la carpeta `public/` (`express.static('public')`).
- Conectar las rutas creadas bajo la dirección `/api/turnos`.
- Escuchar peticiones en el puerto `3000`.

---

### Paso 5: Script de Inicio (`package.json`)
Se agregó el script personalizado en `package.json` para ejecutar la aplicación:

    "scripts": {
      "start": "node src/app.js"
    }

---

### Paso 6: Implementación del Frontend (`public/index.html`)
Se creó una interfaz web liviana que consume la API REST usando la Web API asíncrona `fetch()` de JavaScript nativo:
- **Petición GET:** Renderiza la lista de turnos dinámicamente.
- **Petición POST:** Envía un objeto JSON capturado desde un formulario.
- **Petición DELETE:** Elimina el turno seleccionado al presionar el botón de cancelación.

---

### Paso 7: Pruebas con Postman y Repositorio Git
- **Postman:** Se verificaron aisladamente las peticiones `GET` y `POST` a `http://localhost:3000/api/turnos` obteniendo respuestas con código de estado HTTP `200 OK`.
- **Git:** Se configuró `.gitignore` para ignorar `node_modules/` y se vincularon los cambios al repositorio remoto en GitHub.

---

## 🧠 Persistencia de Datos
Los turnos se almacenan temporalmente en la **memoria RAM** a través del archivo `turnosMock.js`. Al ser memoria volátil, los turnos creados o eliminados mediante el Frontend o Postman se restablecen a su estado inicial si el servidor de Node.js se detiene o reinicia.