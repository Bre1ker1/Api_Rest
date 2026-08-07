// src/data/turnosMock.js

// Simulamos una base de datos con un arreglo de objetos JS en memoria
let turnos = [
  {
    id: 1,
    paciente: "María Gómez",
    medico: "Dr. Pérez (Cardiología)",
    fecha: "2026-08-10",
    hora: "10:00",
    estado: "pendiente"
  },
  {
    id: 2,
    paciente: "Juan López",
    medico: "Dra. Rodríguez (Pediatría)",
    fecha: "2026-08-11",
    hora: "11:30",
    estado: "confirmado"
  }
];

// Exportamos el arreglo para poder usarlo en las rutas
module.exports = turnos;