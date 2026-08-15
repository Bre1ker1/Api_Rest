// src/app.js
const express = require('express');
const app = express();
const PORT = 3000;

// Requerimos el archivo con las rutas de los turnos
const turnosRoutes = require('./routes/turnosRoutes');

// Middlewares obligatorios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir la carpeta estática para el frontend
app.use(express.static('public'));

// Rutas de la API
app.use('/api/turnos', turnosRoutes);

// Iniciamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});