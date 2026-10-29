const mongoose = require('mongoose');

const raftSchema = new mongoose.Schema({
  _id: { type: String, default: 'raft_state' },
  currentTerm: { type: Number, default: 0 },
  votedFor: { type: String, default: null },
  log: { type: Array, default: [] }
}, { timestamps: true });

const RaftModel = mongoose.model('RaftState', raftSchema);

class RaftPersistence {
  static async cargarEstado() {
    try {
      let doc = await RaftModel.findById('raft_state');
      if (!doc) {
        doc = await RaftModel.create({ _id: 'raft_state', currentTerm: 0, votedFor: null, log: [] });
      }
      return { currentTerm: doc.currentTerm, votedFor: doc.votedFor, log: doc.log };
    } catch (err) {
      console.error('[RaftPersistence] Error al cargar estado:', err.message);
      return { currentTerm: 0, votedFor: null, log: [] };
    }
  }

  static async guardarEstado(raftNode) {
    try {
      await RaftModel.findByIdAndUpdate(
        'raft_state',
        {
          currentTerm: raftNode.currentTerm,
          votedFor: raftNode.votedFor,
          log: raftNode.log
        },
        { upsert: true, returnDocument: 'after' }
      );
    } catch (err) {
      console.error('[RaftPersistence] Error al guardar estado:', err.message);
    }
  }
}

module.exports = RaftPersistence;