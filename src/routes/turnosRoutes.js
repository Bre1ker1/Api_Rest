// src/routes/turnosRoutes.js
const express = require('express');
const router = express.Router();
let turnos = require('../data/turnosMock');

// GET /api/turnos - Obtener todos los turnos
router.get('/', (req, res) => {
  res.status(200).json(turnos);
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

  // Validación de conflicto de horario
  const existeConflicto = turnos.some(t => t.medico === medico && t.fecha === fecha && t.hora === hora);
  if (existeConflicto) {
    return res.status(400).json({ error: 'El médico ya tiene un turno reservado en esa fecha y hora' });
  }

  const nuevoId = turnos.length > 0 ? Math.max(...turnos.map(t => t.id)) + 1 : 1;
  const nuevoTurno = { id: nuevoId, paciente, medico, fecha, hora };

  turnos.push(nuevoTurno);
  res.status(201).json(nuevoTurno);
});

// PUT /api/turnos/:id - Actualizar un turno existente
router.put('/:id', (req, res) => {
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

  turnos[index] = { id, paciente, medico, fecha, hora };
  res.status(200).json(turnos[index]);
});

// DELETE /api/turnos/:id - Eliminar un turno
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = turnos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Turno no encontrado' });
  }

  turnos.splice(index, 1);
  res.status(204).send();
});

module.exports = router;