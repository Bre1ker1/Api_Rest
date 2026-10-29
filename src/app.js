const express = require('express');
const mongoose = require('mongoose');
const RaftNode = require('./raft/raftNode');
const turnosRoutes = require('./routes/turnosRoutes');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;
const NODE_ID = process.env.NODE_ID || 'node1';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/db_node1';

const clusterConfig = [
  { id: 'node1', port: 3001 },
  { id: 'node2', port: 3002 },
  { id: 'node3', port: 3003 }
];

const raftNode = new RaftNode(NODE_ID, clusterConfig);

app.use((req, res, next) => {
  req.raftNode = raftNode;
  next();
});

app.use('/api', turnosRoutes);

app.get('/api/raft/status', (req, res) => {
  res.json({
    nodeId: raftNode.nodeId,
    state: raftNode.state,
    currentTerm: raftNode.currentTerm,
    leaderId: raftNode.leaderId,
    votedFor: raftNode.votedFor,
    commitIndex: raftNode.commitIndex,
    lastApplied: raftNode.lastApplied,
    logLength: raftNode.log.length
  });
});

app.post('/raft/request-vote', (req, res) => {
  const result = raftNode.handleRequestVote(req.body);
  res.json(result);
});

app.post('/raft/append-entries', async (req, res) => {
  const result = await raftNode.handleAppendEntries(req.body);
  res.json(result);
});

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`[${NODE_ID}] Conectado a MongoDB`);

    app.listen(PORT, async () => {
      console.log(`[${NODE_ID}] API escuchando en http://localhost:${PORT}`);
      await raftNode.init();
    });
  } catch (error) {
    console.error(`Error al iniciar ${NODE_ID}:`, error);
  }
}

startServer();