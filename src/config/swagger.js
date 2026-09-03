const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API REST Gestión de Turnos Hospitalarios',
      version: '1.0.0',
      description: 'Documentación interactiva de la API'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor HTTP Local'
      },
      {
        url: 'https://localhost:3443',
        description: 'Servidor HTTPS Local'
      }
    ],
    components: {
      schemas: {
        Turno: {
          type: 'object',
          required: ['paciente', 'medico', 'especialidad', 'fecha'],
          properties: {
            paciente: { type: 'string', example: 'Juan Pérez' },
            medico: { type: 'string', example: 'Dra. López' },
            especialidad: { type: 'string', example: 'Cardiologia' },
            fecha: { type: 'string', format: 'date-time', example: '2026-10-15T10:00:00.000Z' },
            estado: { type: 'string', example: 'Pendiente' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

module.exports = swaggerJSDoc(options);