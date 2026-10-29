const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
  paciente: { type: String, required: true },
  medico: { type: String, required: true },
  fecha: { type: String, required: true },
  hora: { type: String, required: true }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Turno', turnoSchema);