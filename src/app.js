require('dotenv').config();
const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const connectDB = require('./config/db');
const swaggerSpec = require('./config/swagger');
const turnosRoutes = require('./routes/turnosRoutes');
const logger = require('./utils/logger');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Conexión a MongoDB
connectDB();

// Documentación Swagger / OpenAPI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Rutas API
app.use('/api/turnos', turnosRoutes);

// Servidor HTTP
const HTTP_PORT = process.env.PORT || 3000;
http.createServer(app).listen(HTTP_PORT, () => {
  logger.info(`Servidor HTTP activo en puerto http://localhost:${HTTP_PORT}`);
  logger.info(`Documentación Swagger disponible en http://localhost:${HTTP_PORT}/api-docs`);
});

// Servidor HTTPS
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
try {
  const options = {
    key: fs.readFileSync(path.resolve(process.env.SSL_KEY_PATH)),
    cert: fs.readFileSync(path.resolve(process.env.SSL_CERT_PATH))
  };

  https.createServer(options, app).listen(HTTPS_PORT, () => {
    logger.info(`Servidor HTTPS seguro activo en https://localhost:${HTTPS_PORT}`);
  });
} catch (err) {
  logger.error(`No se pudo iniciar el servidor HTTPS: ${err.message}`);
}