const Turno = require('../models/Turno');

class StateMachine {
  static async aplicarComando(entry) {
    const { action, payload } = entry.command;
    try {
      switch (action) {
        case 'CREATE':
          await Turno.findByIdAndUpdate(payload._id, payload, { upsert: true, returnDocument: 'after' });
          console.log(`[StateMachine] Turno creado/sincronizado: ${payload._id}`);
          break;
        case 'UPDATE':
          await Turno.findByIdAndUpdate(payload.id, payload.data, { returnDocument: 'after' });
          console.log(`[StateMachine] Turno actualizado: ${payload.id}`);
          break;
        case 'DELETE':
          await Turno.findByIdAndDelete(payload.id);
          console.log(`[StateMachine] Turno eliminado: ${payload.id}`);
          break;
        default:
          console.warn(`[StateMachine] Acción desconocida: ${action}`);
      }
    } catch (err) {
      console.error(`[StateMachine] Error al aplicar comando ${action}:`, err.message);
    }
  }
}

module.exports = StateMachine;