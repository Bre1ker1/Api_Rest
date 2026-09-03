const mongoose = require('mongoose');

const turnoSchema = new mongoose.Schema({
  paciente: {
    type: String,
    required: [true, 'El nombre del paciente es obligatorio'],
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres']
  },
  medico: {
    type: String,
    required: [true, 'El nombre del médico es obligatorio'],
    trim: true
  },
  especialidad: {
    type: String,
    required: [true, 'La especialidad es obligatoria'],
    enum: ['Cardiologia', 'Pediatria', 'Clinica', 'Traumatologia', 'Dermatologia']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria'],
    validate: {
      validator: function(value) {
        return value >= new Date();
      },
      message: 'La fecha del turno no puede ser en el pasado'
    }
  },
  estado: {
    type: String,
    enum: ['Pendiente', 'Confirmado', 'Cancelado'],
    default: 'Pendiente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Turno', turnoSchema);