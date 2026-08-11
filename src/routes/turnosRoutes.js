const express = require('express');
const router = express.Router();

// Base de datos temporal en memoria
let turnos = [];

// GET: Obtener todos los turnos
router.get('/', (req, res) => {
  res.json({ status: 'ok', data: turnos });
});

// POST: Crear un nuevo turno
router.post('/', (req, res) => {
  const { paciente, medico, fecha, hora } = req.body;

  // 1. Validar campos obligatorios
  if (!paciente || !medico || !fecha || !hora) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Todos los campos son obligatorios.' 
    });
  }

  // 2. Normalizar la fecha a formato YYYY-MM-DD
  let fechaNormalizada = fecha;
  if (fecha.includes('/')) {
    const partes = fecha.split('/');
    if (partes.length === 3) {
      // Maneja formatos DD/MM/YYYY
      fechaNormalizada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
  }

  // 3. Validar que la fecha no sea anterior a hoy
  const hoy = new Date().toISOString().split('T')[0];
  if (fechaNormalizada < hoy) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'No se pueden agendar turnos en fechas pasadas.' 
    });
  }

  // 4. Crear y guardar el nuevo turno
  const nuevoTurno = {
    id: Date.now(), // ID único basado en timestamp
    paciente,
    medico,
    fecha: fechaNormalizada,
    hora,
    estado: 'pendiente'
  };

  turnos.push(nuevoTurno);
  res.status(201).json({ status: 'ok', data: nuevoTurno });
});

// PUT: Actualizar estado del turno (Confirmar)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const turno = turnos.find(t => t.id == id);
  if (!turno) {
    return res.status(404).json({ status: 'error', message: 'Turno no encontrado.' });
  }

  if (estado) turno.estado = estado;

  res.json({ status: 'ok', data: turno });
});

// DELETE: Eliminar / Cancelar turno
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = turnos.findIndex(t => t.id == id);

  if (index === -1) {
    return res.status(404).json({ status: 'error', message: 'Turno no encontrado.' });
  }

  turnos.splice(index, 1);
  res.json({ status: 'ok', message: 'Turno cancelado correctamente.' });
});

module.exports = router;