const axios = require('axios');
const RaftPersistence = require('./raftPersistence');
const StateMachine = require('./stateMachine');

class RaftNode {
  constructor(nodeId, clusterConfig) {
    this.nodeId = nodeId;
    this.clusterConfig = clusterConfig;
    this.peers = clusterConfig.filter(p => p.id !== nodeId);

    this.state = 'FOLLOWER'; // FOLLOWER, CANDIDATE, LEADER
    this.currentTerm = 0;
    this.votedFor = null;
    this.log = [];

    this.commitIndex = 0;
    this.lastApplied = 0;

    this.nextIndex = {};
    this.matchIndex = {};

    this.leaderId = null;
    this.heartbeatTimer = null;
    this.electionTimeoutTimer = null;
  }

  async init() {
    const estado = await RaftPersistence.cargarEstado();
    this.currentTerm = estado.currentTerm;
    this.votedFor = estado.votedFor;
    this.log = estado.log;
    this.resetElectionTimeout();
    console.log(`[Raft ${this.nodeId}] Inicializado. State: ${this.state}, Term: ${this.currentTerm}`);
  }

  resetElectionTimeout() {
    if (this.electionTimeoutTimer) clearTimeout(this.electionTimeoutTimer);
    const randomTimeout = Math.floor(Math.random() * 1500) + 1500;
    this.electionTimeoutTimer = setTimeout(() => {
      void this.iniciarEleccion();
    }, randomTimeout);
  }

  async iniciarEleccion() {
    this.state = 'CANDIDATE';
    this.currentTerm += 1;
    this.votedFor = this.nodeId;
    this.leaderId = null;
    await RaftPersistence.guardarEstado(this);

    console.log(`[Raft ${this.nodeId}] Iniciando elección. Term: ${this.currentTerm}`);
    this.resetElectionTimeout();

    let votos = 1;
    const lastLogIndex = this.log.length;
    const lastLogTerm = lastLogIndex > 0 ? this.log[lastLogIndex - 1].term : 0;

    const promesasVotos = this.peers.map(async (peer) => {
      try {
        const res = await axios.post(`http://localhost:${peer.raftPort}/raft/request-vote`, {
          term: this.currentTerm,
          candidateId: this.nodeId,
          lastLogIndex,
          lastLogTerm
        }, { timeout: 1000 });

        if (res.data.voteGranted) {
          votos += 1;
        } else if (res.data.term > this.currentTerm) {
          this.currentTerm = res.data.term;
          this.votedFor = null;
          this.state = 'FOLLOWER';
          await RaftPersistence.guardarEstado(this);
          this.resetElectionTimeout();
        }
      } catch (err) {
        // Peer no disponible
      }
    });

    await Promise.all(promesasVotos);

    const mayoria = Math.floor(this.clusterConfig.length / 2) + 1;
    if (this.state === 'CANDIDATE' && votos >= mayoria) {
      this.convertirEnLider();
    }
  }

  convertirEnLider() {
    this.state = 'LEADER';
    this.leaderId = this.nodeId;
    if (this.electionTimeoutTimer) clearTimeout(this.electionTimeoutTimer);
    console.log(`[Raft ${this.nodeId}] ¡ELECTO LEADER! Term: ${this.currentTerm}`);

    this.peers.forEach(p => {
      this.nextIndex[p.id] = this.log.length + 1;
      this.matchIndex[p.id] = 0;
    });

    void this.enviarHeartbeats();
    this.heartbeatTimer = setInterval(() => {
      void this.enviarHeartbeats();
    }, 500);
  }

  async enviarHeartbeats() {
    if (this.state !== 'LEADER') return;

    const promesasHeartbeats = this.peers.map(async (peer) => {
      const prevLogIndex = (this.nextIndex[peer.id] || 1) - 1;
      const prevLogTerm = prevLogIndex > 0 ? this.log[prevLogIndex - 1].term : 0;
      const entries = this.log.slice(prevLogIndex);

      try {
        const res = await axios.post(`http://localhost:${peer.raftPort}/raft/append-entries`, {
          term: this.currentTerm,
          leaderId: this.nodeId,
          prevLogIndex,
          prevLogTerm,
          entries,
          leaderCommit: this.commitIndex
        }, { timeout: 800 });

        if (res.data.success) {
          this.nextIndex[peer.id] = prevLogIndex + entries.length + 1;
          this.matchIndex[peer.id] = prevLogIndex + entries.length;
          this.verificarCommit();
        } else if (res.data.term > this.currentTerm) {
          this.currentTerm = res.data.term;
          this.state = 'FOLLOWER';
          this.votedFor = null;
          if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
          await RaftPersistence.guardarEstado(this);
          this.resetElectionTimeout();
        } else {
          this.nextIndex[peer.id] = Math.max(1, this.nextIndex[peer.id] - 1);
        }
      } catch (err) {
        // Peer inalcanzable
      }
    });

    await Promise.all(promesasHeartbeats);
  }

  verificarCommit() {
    const mayoria = Math.floor(this.clusterConfig.length / 2) + 1;
    for (let index = this.log.length; index > this.commitIndex; index--) {
      if (this.log[index - 1].term === this.currentTerm) {
        let matches = 1;
        for (const peer of this.peers) {
          if (this.matchIndex[peer.id] >= index) matches++;
        }
        if (matches >= mayoria) {
          this.commitIndex = index;
          void this.aplicarEntradas();
          break;
        }
      }
    }
  }

  async aplicarEntradas() {
    while (this.commitIndex > this.lastApplied) {
      this.lastApplied += 1;
      const entry = this.log[this.lastApplied - 1];
      await StateMachine.aplicarComando(entry);
    }
  }

  async proponerComando(command) {
    if (this.state !== 'LEADER') {
      throw new Error(`Nodo no es líder. Líder actual: ${this.leaderId}`);
    }

    const nuevaEntrada = {
      term: this.currentTerm,
      index: this.log.length + 1,
      command
    };

    this.log.push(nuevaEntrada);
    await RaftPersistence.guardarEstado(this);

    await this.enviarHeartbeats();

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        if (this.lastApplied >= nuevaEntrada.index) {
          clearInterval(interval);
          resolve(true);
        }
      }, 50);

      setTimeout(() => {
        clearInterval(interval);
        reject(new Error("Timeout esperando confirmación de Quorum Raft"));
      }, 5000);
    });
  }
}

module.exports = RaftNode;