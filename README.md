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

Proyecto de API RESTful desarrollada con **Node.js** y **Express** para la gestión de turnos médicos trabajando con datos en memoria, complementada con una interfaz web en el Frontend y validaciones CRUD completas.

---

## 🛠️ Guía Paso a Paso para Ejecutar el Proyecto

Si es la primera vez que ejecutas este proyecto en tu computadora y no tienes nada configurado, sigue estos simples pasos:

### 1. Requisitos Previos (Instalación por única vez)

Asegúrate de tener instalados en tu equipo:

- **Node.js (versión LTS):** Descárgalo e instálalo desde [nodejs.org](https://nodejs.org/).
- **Git:** Descárgalo e instálalo desde [git-scm.com](https://git-scm.com/).

---

### 2. Pasos para Clonar y Ejecutar la Aplicación

1. **Abrir la Terminal o Consola de Comandos:**
   Abre **CMD**, **PowerShell** o la terminal integrada de **Visual Studio Code**.

2. **Clonar el Repositorio de GitHub:**
   Ejecuta el siguiente comando para descargar el código en tu computadora:
   ```bash
   git clone [https://github.com/Bre1ker1/Api_Rest.git](https://github.com/Bre1ker1/Api_Rest.git)
   ```

### 3. Ingresar a la Carpeta del Proyecto:

cd_Api_Rest

### 4. Instalar Dependencias:

Ejecuta el siguiente comando para descargar las librerias necesarias

npm install

### 5. Iniciar el Servidor:

npm start

### 6. Acceder a la Aplicacion:

Una vez que aparezca el mensaje: Servidor escuchando en http://localhost:3000, abre tu navegador e ingresa a : http://localhost:3000

## Estructura del Proyecto

API_REST/
├── public/
│ ├── index.html
│ ├── script.js
│ └── styles.css
├── src/
│ ├── data/
│ │ └── turnosMock.js
│ ├── routes/
│ │ └── turnosRoutes.js
│ └── app.js
├── .gitignore
├── package-lock.json
├── package.json
└── README.md

## Lógica CRUD y Endpoints REST:

Se implementaron las operaciones fundamentales utilizando express.Router() y respuestas en formato JSON:
MétodoEndpointDescripciónCódigo HTTP ExitosoCódigo HTTP ErrorGET/api/turnosRetorna el listado completo de turnos (permite filtro por query params)200 OK500 Internal Server ErrorGET/api/turnos/:idBusca un turno específico por su ID200 OK404 Not FoundPOST/api/turnosAgenda un nuevo turno previa validación201 Created400 Bad RequestPUT/api/turnos/:idActualiza o confirma un turno existente200 OK400 Bad Request / 404 Not FoundDELETE/api/turnos/:idCancela/elimina un turno por su ID204 No Content404 Not Found

## Reglas de Validación Implementadas:

Campos obligatorios: Valida que la solicitud incluya paciente, medico, fecha y hora.

Incompatibilidad de horarios: Impide registrar dos turnos para el mismo médico en la misma fecha y hora.

Fechas pasadas: Bloquea la creación de citas en fechas anteriores al día actual.

Manejo de errores: Devuelve un código 404 Not Found si el ID consultado, modificado o eliminado no existe.

## Concepto REST: Idempotencia

En la API desarrollada, los métodos GET, PUT y DELETE son idempotentes, ya que realizar la misma solicitud múltiples veces consecutivas produce el mismo efecto final en el estado del servidor. Por ejemplo, ejecutar DELETE /api/turnos/123 eliminará el turno la primera vez y las peticiones subsecuentes mantendrán el recurso como inexistente sin alterar otros registros. En cambio, el método POST no es idempotente, debido a que cada ejecución repetida genera un nuevo registro con un ID único en el arreglo en memoria.

## Persistencia de Datos

Los turnos se almacenan temporalmente en la memoria RAM a través de un arreglo JavaScript. Al ser memoria volátil, los datos modificados se restablecen a su estado inicial si el servidor de Node.js se detiene o reinicia.

### Pasos para subir la actualización a GitHub:

En la terminal de VS Code ejecuta:

1. `git add README.md`
2. `git commit -m "Mejora las instrucciones de instalacion y ejecucion en el README"`
3. `git push origin main` _(o `git push origin master`)_
