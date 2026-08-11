const express = require('express');
const router = express.Router();

// Datos mockeados en memoria
let turnos = [];

// GET /api/turnos - Listar todos los registros (200 OK)
router.get('/', (req, res) => {
  res.status(200).json({ status: 'ok', data: turnos });
});

// GET /api/turnos/:id - Consultar un registro individual (200 OK / 404 Not Found)
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const turno = turnos.find(t => t.id == id);

  if (!turno) {
    return res.status(404).json({ 
      status: 'error', 
      message: 'El turno solicitado no existe.' 
    });
  }

  res.status(200).json({ status: 'ok', data: turno });
});

// POST /api/turnos - Crear un nuevo registro (201 Created / 400 Bad Request)
router.post('/', (req, res) => {
  const { paciente, medico, fecha, hora } = req.body;

  // Validaciones de campos obligatorios
  if (!paciente || !medico || !fecha || !hora) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Todos los campos (paciente, medico, fecha, hora) son obligatorios.' 
    });
  }

  // Normalizar fecha
  let fechaNormalizada = fecha;
  if (fecha.includes('/')) {
    const partes = fecha.split('/');
    if (partes.length === 3) {
      fechaNormalizada = `${partes[2]}-${partes[1].padStart(2, '0')}-${partes[0].padStart(2, '0')}`;
    }
  }

  // Validar que la fecha no sea pasada
  const hoy = new Date().toISOString().split('T')[0];
  if (fechaNormalizada < hoy) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'No se pueden agendar turnos en fechas pasadas.' 
    });
  }

  // Validar turno duplicado para mismo médico, fecha y hora
  const turnoExistente = turnos.find(
    t => t.medico === medico && t.fecha === fechaNormalizada && t.hora === hora
  );

  if (turnoExistente) {
    return res.status(400).json({
      status: 'error',
      message: `El ${medico} ya tiene un turno reservado el día ${fechaNormalizada} a las ${hora} hs.`
    });
  }

  const nuevoTurno = {
    id: Date.now(),
    paciente,
    medico,
    fecha: fechaNormalizada,
    hora,
    estado: 'pendiente'
  };

  turnos.push(nuevoTurno);
  res.status(201).json({ status: 'ok', data: nuevoTurno });
});

// PUT /api/turnos/:id - Modificar un registro existente (200 OK / 400 Bad Request / 404 Not Found)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { estado, paciente, medico, fecha, hora } = req.body;

  const turno = turnos.find(t => t.id == id);
  if (!turno) {
    return res.status(404).json({ 
      status: 'error', 
      message: 'Turno no encontrado.' 
    });
  }

  if (estado) turno.estado = estado;
  if (paciente) turno.paciente = paciente;
  if (medico) turno.medico = medico;
  if (fecha) turno.fecha = fecha;
  if (hora) turno.hora = hora;

  res.status(200).json({ status: 'ok', data: turno });
});

// DELETE /api/turnos/:id - Eliminar un registro (204 No Content / 404 Not Found)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = turnos.findIndex(t => t.id == id);

  if (index === -1) {
    return res.status(404).json({ 
      status: 'error', 
      message: 'El turno a eliminar no existe.' 
    });
  }

  turnos.splice(index, 1);
  // 204 No Content (operación correcta sin cuerpo de respuesta)
  res.status(204).send();
});

module.exports = router;