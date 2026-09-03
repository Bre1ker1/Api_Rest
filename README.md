# 🏥 API REST - Sistema de Gestión de Turnos Hospitalarios

**Universidad UCH Champagnat**[cite: 6]
**Carrera:** Licenciatura en Sistemas de Información[cite: 6]
**Materia:** Programación Distribuida[cite: 6]
**Trabajo Práctico N° 3:** Persistencia, Logging, Documentación de APIs REST e Integración[cite: 6]
**Integrantes:** Brian Villalba, Nicolás Fenoy, Tomas Rodriguez, Gustavo Balderrama, Juan Ignacio Colucci[cite: 6]
**Recurso Modelado:** Turnos Médicos (`turnos`)[cite: 6]

---

## 📋 ¿Qué es este proyecto? (Explicación Sencilla)

Este proyecto es una **API REST**, es decir, un sistema backend que funciona como el "cerebro" detrás de una aplicación de gestión de turnos médicos[cite: 6]. Permite crear, consultar, modificar y cancelar citas médicas de forma segura, ordenada y persistente[cite: 6].

A lo largo de los trabajos prácticos fuimos haciendo evolucionar el sistema[cite: 6]. En esta versión final (TP N° 3), el sistema cuenta con todas las herramientas necesarias para funcionar en un entorno real de producción profesional[cite: 6].

---

## 🛠️ ¿Qué tecnologías integra y para qué sirve cada una?

Para entender cómo funciona el sistema, aquí explicamos en palabras simples qué hace cada componente que agregamos:

1. **MongoDB y Mongoose (Base de Datos Real):**
   - *¿Qué hace?* Es nuestra base de datos no relacional[cite: 6]. Antes, si apagábamos el servidor, los turnos guardados en la memoria RAM se borraban[cite: 6]. Ahora con MongoDB, los datos se guardan en el disco rígido de forma permanente[cite: 6]. Si el servidor se apaga o se corta la luz, los turnos siguen guardados[cite: 6]. Mongoose nos ayuda a definir qué datos son obligatorios (como el nombre del paciente o la fecha)[cite: 6].

2. **Winston (Sistema de Registro e Historial / Logging):**
   - *¿Qué hace?* Es la "caja negra" del sistema[cite: 6]. Guarda una bitácora o historial de todo lo que sucede mientras el sistema funciona[cite: 6]. Nos dice qué peticiones se hicieron, cuándo ocurrieron y si hubo algún problema[cite: 6]. Además, rota los archivos por día (crea un archivo de registro nuevo cada día) para no llenar el disco del servidor[cite: 6].

3. **Swagger / OpenAPI (Manual de Instrucciones Interactivo):**
   - *¿Qué hace?* Crea una página web donde se muestra de forma clara y visual cómo usar cada función del sistema[cite: 6]. Cualquier programador (por ejemplo, el que haga la aplicación móvil o el sitio web) puede ingresar ahí, ver qué datos enviar y probar las funciones directamente desde el navegador[cite: 6].

4. **Redis y Distributed Lock (Control de Concurrencia):**
   - *¿Qué hace?* Evita que dos personas modifiquen o cancelen el mismo turno exacto al mismo segundo (condición de carrera)[cite: 6]. Funciona como un "candado digital": cuando alguien entra a modificar un turno, Redis le pone candado por unos segundos[cite: 6]. Si alguien más intenta tocarlo al mismo tiempo, el sistema lo rebota avisándole que la operación está bloqueada para evitar errores[cite: 6].

5. **HTTPS (Conexión Segura):**
   - *¿Qué hace?* Encripta toda la información que viaja entre el usuario y el servidor usando certificados de seguridad de 2048 bits para que nadie pueda interceptar datos sensibles[cite: 6].

---

## 🚀 Guía Paso a Paso para Ejecutar el Proyecto

Si es la primera vez que vas a probar el proyecto, sigue estas instrucciones:

### 1. Requisitos Previos

Tener instalados en la computadora:
- **Node.js (versión LTS):** Descargable desde [nodejs.org](https://nodejs.org/).
- **MongoDB Community Server:** Corriendo en el puerto predeterminado `27017`.
- **Redis Server / Memurai:** Corriendo en el puerto `6379`.

---

### 2. Pasos para Clonar y Configurar

1. **Clonar el Repositorio de GitHub:**
   git clone https://github.com/Bre1ker1/Api_Rest.git
   cd Api_Rest

2. **Instalar Dependencias:**
   npm install

3. **Configurar las Variables de Entorno (`.env`):**
   Crea un archivo llamado `.env` en la raíz del proyecto (puedes copiar el contenido de `.env.example`)[cite: 6]:
   PORT=3000
   HTTPS_PORT=3443
   SSL_KEY_PATH=./certs/server.key
   SSL_CERT_PATH=./certs/server.cert
   REDIS_URL=redis://localhost:6379
   MONGO_URI=mongodb://localhost:27017/hospital_db

---

### 3. Iniciar el Servidor

Ejecuta el comando:

npm start

Verás en la pantalla mensajes confirmando que todo está funcionando correctamente:
- `Servidor HTTP activo en http://localhost:3000`[cite: 6]
- `Documentación Swagger disponible en http://localhost:3000/api-docs`[cite: 6]
- `Servidor HTTPS seguro activo en https://localhost:3443`[cite: 6]
- `MongoDB conectado: localhost`[cite: 6]

---

## 📂 Estructura del Código

El proyecto está organizado de forma limpia y modular:

Api_Rest/
├── certs/                 # Certificados de seguridad SSL/TLS para HTTPS
├── logs/                  # Carpeta donde Winston guarda el historial de eventos por fecha
├── public/                # Interfaz web visual para interacción básica con el usuario
├── src/
│   ├── config/            # Configuraciones de conexión a MongoDB y Swagger
│   ├── models/            # Esquema y reglas del turno médico (Mongoose)
│   ├── routes/            # Lógica y funciones de cada ruta del sistema (endpoints)
│   └── utils/             # Herramientas auxiliares (Logger Winston y Bloqueo Redis)
│   └── app.js             # Archivo principal que enciende el servidor
├── .env.example           # Modelo de variables de configuración
├── package.json           # Lista de paquetes y dependencias del proyecto
└── README.md              # Este manual explicativo

---

## 🔗 Rutas del Sistema (Endpoints) y Manual Interactivo

Para ver el manual interactivo y probar el sistema desde el navegador, ingresa a:
👉 **http://localhost:3000/api-docs**[cite: 6]

Para ver la especificación técnica en formato JSON puro:
👉 **http://localhost:3000/api-docs.json**[cite: 6]

### Resumen de Acciones Disponibles:

| Método | Endpoint | ¿Qué hace en el sistema? | Resultado Exitoso | ¿Qué pasa si falla? |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/api/turnos` | Trae la lista completa de todos los turnos agendados en la base de datos[cite: 6]. | `200 OK`[cite: 6] | `500 Error interno`[cite: 6] |
| **GET** | `/api/turnos/:id` | Busca la información detallada de un turno según su código único ID[cite: 6]. | `200 OK`[cite: 6] | `400 ID Inválido` / `404 No Existe`[cite: 6] |
| **POST** | `/api/turnos` | Crea y valida un nuevo turno médico (requiere paciente, médico, fecha, etc.)[cite: 6]. | `201 Creado`[cite: 6] | `400 Datos incompletos o mal formados`[cite: 6] |
| **PUT** | `/api/turnos/:id` | Modifica los datos de un turno existente (protegido con bloqueo Redis)[cite: 6]. | `200 OK`[cite: 6] | `404 No Existe` / `409 Bloqueado por concurrencia`[cite: 6] |
| **DELETE**| `/api/turnos/:id` | Cancela/elimina un turno del sistema (protegido con bloqueo Redis)[cite: 6]. | `200 OK`[cite: 6] | `404 No Existe` / `409 Bloqueado por concurrencia`[cite: 6] |
