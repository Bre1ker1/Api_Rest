// src/routes/turnosRoutes.js
const express = require('express');
const router = express.Router();
let turnos = require('../data/turnosMock');
const { adquirirLock, liberarLock } = require('../utils/lock');

// GET /api/turnos - Obtener todos los turnos (con o sin filtros)
router.get('/', (req, res) => {
  const { medico, fecha } = req.query;
  let resultado = turnos;

  if (medico) {
    resultado = resultado.filter(t => t.medico.toLowerCase() === medico.toLowerCase());
  }

  if (fecha) {
    resultado = resultado.filter(t => t.fecha === fecha);
  }

  res.status(200).json(resultado);
});

// GET /api/turnos/:id - Obtener turno por ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const turno = turnos.find(t => t.id === id);

  if (!turno) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }

  res.status(200).json(turno);
});

// POST /api/turnos - Crear un nuevo turno
router.post('/', (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud está vacío' });
  }

  const { paciente, medico, fecha, hora } = req.body;

  if (!paciente || !medico || !fecha || !hora) {
    return res.status(400).json({ error: 'Los campos paciente, medico, fecha y hora son obligatorios' });
  }

  const nuevoId = turnos.length > 0 ? Math.max(...turnos.map(t => t.id)) + 1 : 1;
  const nuevoTurno = { id: nuevoId, paciente, medico, fecha, hora };

  turnos.push(nuevoTurno);
  res.status(201).json(nuevoTurno);
});

// PUT /api/turnos/:id - Actualizar un turno existente con Lock Concurrente
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const index = turnos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({ error: 'El cuerpo de la solicitud está vacío' });
  }

  const { paciente, medico, fecha, hora } = req.body;

  if (!paciente || !medico || !fecha || !hora) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // --- LÓGICA DE DISTRIBUTED LOCK ---
  const tokenPropietario = `token_${Date.now()}_${Math.random()}`;
  const lockAdquirido = await adquirirLock(id, tokenPropietario, 5);

  if (!lockAdquirido) {
    return res.status(409).json({
      error: 'Recurso bloqueado',
      mensaje: 'Otro usuario está modificando este turno. Intenta nuevamente en unos segundos.'
    });
  }

  try {
    // Simulación de delay de procesamiento (3 segundos)
    await new Promise(resolve => setTimeout(resolve, 3000));

    turnos[index] = { id, paciente, medico, fecha, hora };
    res.status(200).json(turnos[index]);
  } finally {
    await liberarLock(id, tokenPropietario);
  }
});

// DELETE /api/turnos/:id - Eliminar un turno con Lock Concurrente
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id);
  const index = turnos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }

  // --- LÓGICA DE DISTRIBUTED LOCK ---
  const tokenPropietario = `token_${Date.now()}_${Math.random()}`;
  const lockAdquirido = await adquirirLock(id, tokenPropietario, 5);

  if (!lockAdquirido) {
    return res.status(409).json({
      error: 'Recurso bloqueado',
      mensaje: 'Otro usuario está procesando este turno. Intenta nuevamente.'
    });
  }

  try {
    turnos.splice(index, 1);
    res.status(204).send();
  } finally {
    await liberarLock(id, tokenPropietario);
  }
});

module.exports = router;