const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Turno = require('../models/Turno');
const logger = require('../utils/logger');
const { acquireLock, releaseLock } = require('../utils/lock');

/**
 * @openapi
 * /api/turnos:
 *   get:
 *     summary: Obtener todos los turnos
 *     responses:
 *       200:
 *         description: Lista de turnos obtenida exitosamente
 */
router.get('/', async (req, res) => {
  try {
    const turnos = await Turno.find();
    logger.info(`GET /api/turnos - Se consultaron ${turnos.length} turnos`);
    res.json(turnos);
  } catch (error) {
    logger.error(`Error en GET /api/turnos: ${error.message}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /api/turnos/{id}:
 *   get:
 *     summary: Obtener turno por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turno encontrado
 *       400:
 *         description: ID con formato inválido
 *       404:
 *         description: Turno no encontrado
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    logger.warn(`GET /api/turnos/${id} - Formato de ID inválido`);
    return res.status(400).json({ error: 'El ID provisto no tiene un formato válido' });
  }

  try {
    const turno = await Turno.findById(id);
    if (!turno) {
      logger.warn(`GET /api/turnos/${id} - Turno no encontrado`);
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    logger.info(`GET /api/turnos/${id} - Turno obtenido correctamente`);
    res.json(turno);
  } catch (error) {
    logger.error(`Error en GET /api/turnos/${id}: ${error.message}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /api/turnos:
 *   post:
 *     summary: Crear un nuevo turno
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Turno'
 *     responses:
 *       201:
 *         description: Turno creado exitosamente
 *       400:
 *         description: Error de validación de datos
 */
router.post('/', async (req, res) => {
  try {
    const nuevoTurno = new Turno(req.body);
    const turnoGuardado = await nuevoTurno.save();
    logger.info(`POST /api/turnos - Creado turno ID: ${turnoGuardado._id}`);
    res.status(201).json(turnoGuardado);
  } catch (error) {
    if (error.name === 'ValidationError') {
      logger.warn(`POST /api/turnos - Error de validación: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
    logger.error(`Error en POST /api/turnos: ${error.message}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * @openapi
 * /api/turnos/{id}:
 *   put:
 *     summary: Actualizar un turno (Protegido con Redis Lock)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turno actualizado
 *       409:
 *         description: Conflicto de concurrencia
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const lockKey = `lock:turno:${id}`;
  const lockAcquired = await acquireLock(lockKey, 5000);

  if (!lockAcquired) {
    logger.warn(`PUT /api/turnos/${id} - Bloqueado por concurrencia (Redis Lock)`);
    return res.status(409).json({ error: 'El recurso está siendo modificado por otra solicitud. Reintente.' });
  }

  try {
    const turnoActualizado = await Turno.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    if (!turnoActualizado) {
      logger.warn(`PUT /api/turnos/${id} - Turno no encontrado`);
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    logger.info(`PUT /api/turnos/${id} - Turno actualizado correctamente`);
    res.json(turnoActualizado);
  } catch (error) {
    if (error.name === 'ValidationError') {
      logger.warn(`PUT /api/turnos/${id} - Error de validación: ${error.message}`);
      return res.status(400).json({ error: error.message });
    }
    logger.error(`Error en PUT /api/turnos/${id}: ${error.message}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    await releaseLock(lockKey);
  }
});

/**
 * @openapi
 * /api/turnos/{id}:
 *   delete:
 *     summary: Eliminar un turno (Protegido con Redis Lock)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turno eliminado
 *       409:
 *         description: Conflicto de concurrencia
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'ID inválido' });
  }

  const lockKey = `lock:turno:${id}`;
  const lockAcquired = await acquireLock(lockKey, 5000);

  if (!lockAcquired) {
    logger.warn(`DELETE /api/turnos/${id} - Bloqueado por concurrencia (Redis Lock)`);
    return res.status(409).json({ error: 'El recurso está siendo modificado por otra solicitud.' });
  }

  try {
    const turnoEliminado = await Turno.findByIdAndDelete(id);
    if (!turnoEliminado) {
      logger.warn(`DELETE /api/turnos/${id} - Turno no encontrado`);
      return res.status(404).json({ error: 'Turno no encontrado' });
    }
    logger.info(`DELETE /api/turnos/${id} - Turno eliminado exitosamente`);
    res.json({ mensaje: 'Turno eliminado correctamente', id });
  } catch (error) {
    logger.error(`Error en DELETE /api/turnos/${id}: ${error.message}`);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    await releaseLock(lockKey);
  }
});

module.exports = router;