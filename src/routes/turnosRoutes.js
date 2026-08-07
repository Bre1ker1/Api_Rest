// src/routes/turnosRoutes.js
const express = require('express');
const router = express.Router();
let turnos = require('../data/turnosMock');

// READ: Obtener todos los turnos
router.get('/', (req, res) => {
  res.json({ status: 'ok', data: turnos });
});

// READ: Obtener un turno por ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const turno = turnos.find(t => t.id === id);

  if (!turno) {
    return res.status(404).json({ status: 'error', message: 'Turno no encontrado' });
  }

  res.json({ status: 'ok', data: turno });
});

// CREATE: Crear un nuevo turno
router.post('/', (req, res) => {
  const { paciente, medico, fecha, hora } = req.body;

  if (!paciente || !medico || !fecha || !hora) {
    return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios' });
  }

  const nuevoTurno = {
    id: turnos.length > 0 ? Math.max(...turnos.map(t => t.id)) + 1 : 1,
    paciente,
    medico,
    fecha,
    hora,
    estado: 'pendiente'
  };

  turnos.push(nuevoTurno);
  res.status(201).json({ status: 'ok', data: nuevoTurno });
});

// UPDATE: Actualizar un turno existente
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = turnos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'Turno no encontrado' });
  }

  turnos[index] = { ...turnos[index], ...req.body };
  res.json({ status: 'ok', data: turnos[index] });
});

// DELETE: Eliminar un turno
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = turnos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'Turno no encontrado' });
  }

  const turnoEliminado = turnos.splice(index, 1);
  res.json({ status: 'ok', message: 'Turno eliminado correctamente', data: turnoEliminado[0] });
});

module.exports = router;