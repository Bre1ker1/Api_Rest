const mongoose = require('mongoose');

const raftStateSchema = new mongoose.Schema({
  nodeId: { type: String, required: true, unique: true },
  currentTerm: { type: Number, default: 0 },
  votedFor: { type: String, default: null },
  log: { type: Array, default: [] }
});

const RaftState = mongoose.models.RaftState || mongoose.model('RaftState', raftStateSchema);

class RaftPersistence {
  constructor(nodeId) {
    this.nodeId = nodeId;
  }

  async loadState() {
    try {
      const doc = await RaftState.findOne({ nodeId: this.nodeId });
      if (doc) {
        return {
          currentTerm: doc.currentTerm,
          votedFor: doc.votedFor,
          log: doc.log
        };
      }
    } catch (err) {
      console.error(`[Persistencia ${this.nodeId}] Error al cargar estado:`, err.message);
    }
    return null;
  }

  async saveState({ currentTerm, votedFor, log }) {
    try {
      await RaftState.findOneAndUpdate(
        { nodeId: this.nodeId },
        { currentTerm, votedFor, log },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`[Persistencia ${this.nodeId}] Error al guardar estado:`, err.message);
    }
  }
}

module.exports = RaftPersistence;