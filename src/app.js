const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = express();
const turnosRoutes = require('./routes/turnosRoutes');

// Middlewares obligatorios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Rutas de la API
app.use('/api/turnos', turnosRoutes);

// Cargar Certificados SSL
const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

// Servidor HTTP
http.createServer(app).listen(process.env.PORT, () => {
  console.log(`Servidor HTTP en http://localhost:${process.env.PORT}`);
});

// Servidor HTTPS
https.createServer(httpsOptions, app).listen(process.env.HTTPS_PORT, () => {
  console.log(`Servidor HTTPS seguro en https://localhost:${process.env.HTTPS_PORT}`);
});