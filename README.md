# 🏥 API REST - Gestión de Turnos Hospitalarios

**Universidad UCH Champagnat**  
**Carrera:** Licenciatura en Sistemas de Información  
**Materia:** Programación Distribuida  
**Trabajo Práctico N° 2:** API REST, Seguridad (HTTPS), Configuración y Concurrencia (Redis)  
**Estudiante:** Brian Villalba  
**DNI:** 46868103  
**Recurso Modelado:** Turnos Médicos (`turnos`)

---

##  Descripción

Proyecto de API RESTful desarrollado con **Node.js**, **Express** y **Redis**. Evolución del TP N° 1 que incorpora:

1. **Seguridad SSL/TLS (HTTPS)** mediante certificados digitales autofirmados de 2048 bits.
2. **Variables de Entorno (`.env`)** para proteger configuraciones sensibles.
3. **Control de Concurrencia (Distributed Lock)** con Redis para evitar que dos usuarios modifiquen o cancelen el mismo turno al mismo tiempo.

---

##  Explicación Sencilla de las Nuevas Funcionalidades

Si no tienes experiencia previa en sistemas, aquí te explicamos qué hacen los nuevos componentes:

- **¿Qué es `.env` (Variables de Entorno)?**
  Es como una "caja fuerte" donde guardamos las llaves y datos sensibles del sistema (como contraseñas o puertos de red). De esta forma, el código público no expone información privada.
- **¿Qué es HTTPS?**
  Es el candado de seguridad que ves en el navegador. En lugar de enviar la información en texto plano (como en HTTP), HTTPS la viaja encriptada para que nadie pueda interceptarla en el camino.
- **¿Qué es Redis y el Bloqueo Distribuido (Distributed Lock)?**
  Imagínate una ventanilla de atención con un cartel que dice **"Ocupado"**. Si dos personas intentan atenderse exacto al mismo segundo, el sistema le entrega la atención a la primera y le muestra un cartel de "Ocupado, intente en unos segundos" a la segunda. Esto evita que dos usuarios cambien o borren el mismo turno al mismo tiempo.

---

##  Guía Paso a Paso para Ejecutar el Proyecto

### 1. Requisitos Previos (Instalación por única vez)

- **Node.js (versión LTS):** Descárgalo e instálalo desde nodejs.org.
- **Git:** Descárgalo e instálalo desde git-scm.com.
- **Redis Server (Puerto 6379):** Debe estar instalado o ejecutándose en tu equipo (por ejemplo, mediante Memurai o WSL en Windows) para permitir el control de concurrencia.

---

### 2. Pasos para Clonar y Configurar

1. **Clonar el Repositorio:**
   git clone https://github.com/Bre1ker1/Api_Rest.git
   cd Api_Rest

2. **Instalar Dependencias:**
   npm install

3. **Configurar el archivo `.env`:**
   Crea un archivo llamado `.env` en la raíz del proyecto (puedes copiar el contenido de `.env.example`):
   PORT=3000
   HTTPS_PORT=3443
   SSL_KEY_PATH=./certs/server.key
   SSL_CERT_PATH=./certs/server.cert
   REDIS_URL=redis://localhost:6379

---

### 3. Iniciar el Servidor

Ejecuta el siguiente comando para generar automáticamente los certificados de seguridad e iniciar los servidores HTTP, HTTPS y Redis:

npm start

Verás una confirmación en consola indicando:

- `Servidor HTTP en http://localhost:3000`
- `Servidor HTTPS seguro en https://localhost:3443`
- `Conectado a Redis exitosamente.`

---

##  Estructura del Proyecto

Api_Rest/
├── certs/ # Certificados SSL/TLS generados automáticamente (.key, .cert)
├── public/ # Interfaz Web (Frontend)
│ ├── index.html
│ ├── script.js
│ └── styles.css
├── src/
│ ├── data/
│ │ └── turnosMock.js # Datos en memoria
│ ├── routes/
│ │ └── turnosRoutes.js# Rutas CRUD y lógica de bloqueo concurrente
│ ├── utils/
│ │ └── lock.js # Lógica del Distributed Lock con Redis
│ └── app.js # Punto de entrada (servidores HTTP y HTTPS)
├── .env # Variables de entorno (Ignorado en Git)
├── .env.example # Plantilla de variables de entorno
├── .gitignore
├── generarCert.js # Script automatizado de certificados de 2048 bits
├── package.json
└── README.md

---

##  Endpoints REST y Códigos de Respuesta

| Método | Endpoint        | Descripción                                       | Respuesta Exitosa       | Respuesta Error                                |
| :----- | :-------------- | :------------------------------------------------ | :---------------------- | :--------------------------------------------- |
| GET    | /api/turnos     | Retorna el listado completo de turnos.            | 200 OK                  | 500 Internal Server Error                      |
| GET    | /api/turnos/:id | Busca un turno específico por su ID.              | 200 OK                  | 404 Not Found                                  |
| POST   | /api/turnos     | Agenda un nuevo turno médica previa validación.   | 201 Created             | 400 Bad Request                                |
| PUT    | /api/turnos/:id | Actualiza un turno existente (Con Bloqueo Redis). | 200 OK                  | 400 Bad Request / 404 Not Found / 409 Conflict |
| DELETE | /api/turnos/:id | Cancela un turno por su ID (Con Bloqueo Redis).   | 200 OK / 204 No Content | 404 Not Found / 409 Conflict                   |

> Nota sobre el Error HTTP 409 Conflict: Ocurre cuando dos solicitudes compiten al mismo tiempo por el mismo turno. La segunda solicitud es rebotada de forma segura mediante el Bloqueo Distribuido de Redis.

---

##  Pasos para Subir Cambios a GitHub

Si realizas modificaciones en el código, sube los cambios a tu repositorio con los siguientes comandos:

git add .
git commit -m "Actualizacion del README con documentacion del TP2"
git push origin main
