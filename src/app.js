// src/app.js
const express = require('express');
const app = express();
const PORT = 3000;

// Requerimos el archivo con las rutas de los turnos
const turnosRoutes = require('./routes/turnosRoutes');

// Middleware para que Express entienda el formato JSON en las peticiones
app.use(express.json());

// Servir la carpeta estática para el frontend (la crearemos en el paso que sigue)
app.use(express.static('public'));

// Conectamos la ruta base /api/turnos con nuestro archivo de rutas
app.use('/api/turnos', turnosRoutes);

// Iniciamos el servidor en el puerto 3000
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});