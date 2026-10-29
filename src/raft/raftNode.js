const axios = require('axios');
const RaftPersistence = require('./raftPersistence');
const StateMachine = require('./stateMachine');

class RaftNode {
  constructor(nodeId, clusterConfig) {
    this.nodeId = nodeId;
    this.peers = clusterConfig.filter(p => p.id !== nodeId);
    
    this.state = 'FOLLOWER'; // FOLLOWER, CANDIDATE, LEADER
    this.currentTerm = 0;
    this.votedFor = null;
    this.log = [];

    this.commitIndex = 0;
    this.lastApplied = 0;

    this.leaderId = null;
    this.electionTimeout = null;
    this.heartbeatInterval = null;

    this.persistence = new RaftPersistence(nodeId);
    this.stateMachine = new StateMachine();
  }

  async init() {
    const savedState = await this.persistence.loadState();
    if (savedState) {
      this.currentTerm = savedState.currentTerm || 0;
      this.votedFor = savedState.votedFor || null;
      this.log = savedState.log || [];
    }
    console.log(`[Raft ${this.nodeId}] Inicializado. State: ${this.state}, Term: ${this.currentTerm}`);
    this.resetElectionTimeout();
  }

  async save() {
    await this.persistence.saveState({
      currentTerm: this.currentTerm,
      votedFor: this.votedFor,
      log: this.log
    });
  }

  resetElectionTimeout() {
    if (this.electionTimeout) clearTimeout(this.electionTimeout);
    // Timeout aleatorio entre 1500ms y 3000ms para evitar colisiones
    const timeout = Math.floor(Math.random() * 1500) + 1500;
    this.electionTimeout = setTimeout(() => this.startElection(), timeout);
  }

  async startElection() {
    this.state = 'CANDIDATE';
    this.currentTerm += 1;
    this.votedFor = this.nodeId;
    this.leaderId = null;
    await this.save();

    console.log(`[Raft ${this.nodeId}] Iniciando elección. Term: ${this.currentTerm}`);
    this.resetElectionTimeout();

    let votesReceived = 1;

    for (const peer of this.peers) {
      try {
        const response = await axios.post(`http://localhost:${peer.port}/raft/request-vote`, {
          term: this.currentTerm,
          candidateId: this.nodeId,
          lastLogIndex: this.log.length,
          lastLogTerm: this.log.length > 0 ? this.log[this.log.length - 1].term : 0
        }, { timeout: 1000 });

        if (response.data.voteGranted) {
          votesReceived++;
        } else if (response.data.term > this.currentTerm) {
          this.currentTerm = response.data.term;
          this.state = 'FOLLOWER';
          this.votedFor = null;
          await this.save();
          this.resetElectionTimeout();
          return;
        }
      } catch (err) {
        // Peer no disponible o iniciando
      }
    }

    // Quorum (mayoría de 3 nodos es >= 2)
    if (this.state === 'CANDIDATE' && votesReceived >= 2) {
      this.becomeLeader();
    }
  }

  becomeLeader() {
    this.state = 'LEADER';
    this.leaderId = this.nodeId;
    if (this.electionTimeout) clearTimeout(this.electionTimeout);
    console.log(`\n=================================`);
    console.log(`[Raft ${this.nodeId}] ¡ELECTO LEADER EN TERM ${this.currentTerm}!`);
    console.log(`=================================\n`);
    this.startHeartbeats();
  }

  startHeartbeats() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    this.sendAppendEntries();
    this.heartbeatInterval = setInterval(() => this.sendAppendEntries(), 500);
  }

  async sendAppendEntries() {
    if (this.state !== 'LEADER') {
      if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
      return;
    }

    for (const peer of this.peers) {
      try {
        const prevIndex = this.log.length;
        const prevTerm = prevIndex > 0 ? this.log[prevIndex - 1].term : 0;

        const response = await axios.post(`http://localhost:${peer.port}/raft/append-entries`, {
          term: this.currentTerm,
          leaderId: this.nodeId,
          prevLogIndex: prevIndex,
          prevLogTerm: prevTerm,
          entries: [],
          leaderCommit: this.commitIndex
        }, { timeout: 500 });

        if (response.data.term > this.currentTerm) {
          this.currentTerm = response.data.term;
          this.state = 'FOLLOWER';
          this.votedFor = null;
          this.leaderId = null;
          if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
          await this.save();
          this.resetElectionTimeout();
          return;
        }
      } catch (err) {
        // Peer no respondió al heartbeat
      }
    }
  }

  handleRequestVote({ term, candidateId }) {
    if (term > this.currentTerm) {
      this.currentTerm = term;
      this.state = 'FOLLOWER';
      this.votedFor = null;
      this.leaderId = null;
      void this.save();
    }

    let voteGranted = false;
    if (term === this.currentTerm && (this.votedFor === null || this.votedFor === candidateId)) {
      voteGranted = true;
      this.votedFor = candidateId;
      void this.save();
      this.resetElectionTimeout();
    }

    return { term: this.currentTerm, voteGranted };
  }

  async handleAppendEntries({ term, leaderId, entries, leaderCommit }) {
    if (term < this.currentTerm) {
      return { term: this.currentTerm, success: false };
    }

    if (term > this.currentTerm || this.state !== 'FOLLOWER') {
      this.currentTerm = term;
      this.state = 'FOLLOWER';
      this.votedFor = null;
      await this.save();
    }

    this.leaderId = leaderId;
    this.resetElectionTimeout();

    if (entries && entries.length > 0) {
      this.log.push(...entries);
      await this.save();
    }

    if (leaderCommit > this.commitIndex) {
      this.commitIndex = Math.min(leaderCommit, this.log.length);
      await this.aplicarEntradas();
    }

    return { term: this.currentTerm, success: true };
  }

  async aplicarEntradas() {
    while (this.commitIndex > this.lastApplied) {
      this.lastApplied++;
      const entry = this.log[this.lastApplied - 1];
      if (entry) {
        await this.stateMachine.apply(entry);
      }
    }
  }
}

module.exports = RaftNode;