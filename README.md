# 🏥 API REST - Gestión de Turnos Hospitalarios Distribuidos

**Universidad Champagnat**  
**Carrera:** Licenciatura en Sistemas de Información  
**Materia:** Programación Distribuida  
**Trabajo Práctico N° 4:** Sistemas Distribuidos, Consenso Raft y Exclusión Mutua  
**Estudiante:** Brian Villalba  
**DNI:** 46868103  
**Recurso Modelado:** Turnos Médicos (`turnos`)

---

## 📋 Descripción

Evolución del sistema de gestión de turnos médicos a una **arquitectura distribuida de alta disponibilidad** compuesta por un clúster de **3 nodos independientes**. 

El sistema garantiza la consistencia de datos, tolerancia a fallos y sincronización entre instancias utilizando:
* **Algoritmo de Consenso Raft:** Elección de líder, gestión de mandatos (*terms*) y replicación del registro de operaciones (*log replication*).
* **Persistencia por Nodo:** Cada instancia almacena de forma independiente su estado de Raft y colecciones de datos en **MongoDB**.
* **Exclusión Mutua Distribuida:** Cerrojos atómicos globales coordinados a través de **Redis / Memurai** utilizando scripts Lua para el control de concurrencia.

---

## 📐 Arquitectura del Clúster

El sistema levanta 3 procesos Node.js interconectados en local:

| Nodo | Puerto API / Raft RPC | Base de Datos MongoDB |
| :--- | :---: | :--- |
| **node1** | `3001` | `mongodb://localhost:27017/db_node1` |
| **node2** | `3002` | `mongodb://localhost:27017/db_node2` |
| **node3** | `3003` | `mongodb://localhost:27017/db_node3` |

* **Redis / Memurai:** Escuchando en `localhost:6379` para la gestión centralizada de cerrojos de concurrencia.

---

## 🛠️ Requisitos Previos

Asegúrate de contar con los siguientes servicios instalados y corriendo en tu equipo:

- **Node.js (v18 o superior):** Descárgalo e instálalo desde [nodejs.org](https://nodejs.org/).
- **MongoDB Community Server:** Descárgalo desde [mongodb.com](https://www.mongodb.com/try/download/community) (Servicio activo en `localhost:27017`).
- **Memurai / Redis:** Descárgalo desde [memurai.com](https://www.memurai.com/) (Servicio activo en `localhost:6379`).

---

## 🚀 Guía de Instalación y Ejecución

### 1. Clonar e instalar dependencias

```bash
git clone [https://github.com/Bre1ker1/Api_Rest.git](https://github.com/Bre1ker1/Api_Rest.git)
cd Api_Rest
npm install
2. Iniciar el Clúster Distribuido (3 Nodos)
Abre 3 terminales independientes en la raíz del proyecto dentro de Visual Studio Code y ejecuta un nodo en cada una:

Terminal 1:

Bash
npm run node1
Terminal 2:

Bash
npm run node2
Terminal 3:

Bash
npm run node3
Al iniciar las 3 terminales, los nodos negociarán votos automáticamente mediante Raft e informarán en consola quién fue electo como LEADER.

📡 Endpoints REST y Diagnóstico
1. Diagnóstico de Estado Raft (Hito 1)
Permite inspeccionar el rol y término de cualquier nodo del clúster.

GET http://localhost:3001/api/raft/status (o puertos 3002 / 3003)

Ejemplo de respuesta:

JSON
{
  "nodeId": "node1",
  "state": "LEADER",
  "currentTerm": 6,
  "leaderId": "node1",
  "votedFor": "node1",
  "commitIndex": 0,
  "lastApplied": 0,
  "logLength": 0
}
2. Operaciones CRUD en la Máquina de Estados (Hitos 2 y 3)
GET /api/turnos - Obtiene el listado completo de turnos.

GET /api/turnos/:id - Obtiene la información de un turno por su ID.

POST /api/turnos - Crea un nuevo turno (valida disponibilidad y adquiere cerrojo en Redis).

PUT /api/turnos/:id - Modifica/confirma un turno existente.

DELETE /api/turnos/:id - Cancela/elimina un turno por su ID.

📂 Estructura del Proyecto
Plaintext
Api_Rest/
├── src/
│   ├── models/            # Modelos y esquemas Mongoose (Turno, RaftState)
│   ├── raft/
│   │   ├── raftNode.js        # Lógica central Raft (Elecciones, Quorum y Heartbeats)
│   │   ├── raftPersistence.js # Persistencia de estado de Raft en MongoDB
│   │   └── stateMachine.js    # Aplicador de comandos a la base de datos
│   ├── routes/            # Definición de rutas API REST (`turnosRoutes.js`)
│   ├── utils/             # Cerrojos distribuidos con Redis y scripts Lua
│   └── app.js             # Punto de entrada Express y endpoints RPC Raft
├── package.json           # Scripts de arranque de nodos y dependencias
└── README.md
📤 Actualizar en GitHub
Para subir la documentación finalizada a tu repositorio, ejecuta en la terminal:

DOS
