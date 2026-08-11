const API_URL = '/api/turnos';

const staffMedico = [
  { especialidad: "Cardiología", medicos: ["Dr. Pérez", "Dr. Gómez", "Dra. Benítez"] },
  { especialidad: "Pediatría", medicos: ["Dra. Rodríguez", "Dr. Fernández", "Dra. Castro"] },
  { especialidad: "Dermatología", medicos: ["Dra. Martínez", "Dr. Silva"] },
  { especialidad: "Traumatología", medicos: ["Dr. López", "Dra. Morales", "Dr. Rossi"] },
  { especialidad: "Neurología", medicos: ["Dr. Soria", "Dra. Navarro"] },
  { especialidad: "Oftalmología", medicos: ["Dra. Blanco", "Dr. Torres"] }
];

function generarHorariosCadaCincoMinutos() {
  const horarios = [];
  for (let h = 8; h < 18; h++) {
    for (let m = 0; m < 60; m += 5) {
      horarios.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return horarios;
}

const horariosDisponibles = generarHorariosCadaCincoMinutos();
let turnosGuardados = [];

const selectMedico = document.getElementById('medico');
const inputFecha = document.getElementById('fecha');
const selectHora = document.getElementById('hora');

const hoy = new Date().toISOString().split('T')[0];
inputFecha.setAttribute('min', hoy);

staffMedico.forEach(grupo => {
  const optgroup = document.createElement('optgroup');
  optgroup.label = `🩺 ${grupo.especialidad}`;
  grupo.medicos.forEach(m => {
    const opt = document.createElement('option');
    opt.value = `${m} (${grupo.especialidad})`;
    opt.textContent = m;
    optgroup.appendChild(opt);
  });
  selectMedico.appendChild(optgroup);
});

function actualizarHorariosDisponibles() {
  const fechaSel = inputFecha.value;
  const medicoSel = selectMedico.value;

  selectHora.innerHTML = '';

  if (!fechaSel || !medicoSel) {
    selectHora.innerHTML = '<option value="">Seleccione fecha y médico primero</option>';
    return;
  }

  const horasOcupadas = turnosGuardados
    .filter(t => t.medico === medicoSel && t.fecha === fechaSel)
    .map(t => t.hora);

  const defaultOption = document.createElement('option');
  defaultOption.value = '';
  defaultOption.textContent = '-- Seleccione una hora --';
  selectHora.appendChild(defaultOption);

  horariosDisponibles.forEach(hora => {
    const option = document.createElement('option');
    option.value = hora;
    
    if (horasOcupadas.includes(hora)) {
      option.textContent = `${hora} hs - (Ocupado)`;
      option.disabled = true;
    } else {
      option.textContent = `${hora} hs`;
    }
    selectHora.appendChild(option);
  });
}

selectMedico.addEventListener('change', actualizarHorariosDisponibles);
inputFecha.addEventListener('change', actualizarHorariosDisponibles);

async function cargarTurnos() {
  try {
    const res = await fetch(API_URL);
    const { data } = await res.json();
    turnosGuardados = data || [];

    const contenedor = document.getElementById('listaTurnos');
    contenedor.innerHTML = '';

    if (turnosGuardados.length === 0) {
      contenedor.innerHTML = '<p style="text-align:center; color:#94a3b8;">No hay turnos agendados.</p>';
    } else {
      turnosGuardados.forEach(t => {
        const item = document.createElement('div');
        item.className = 'turno-item';
        item.innerHTML = `
          <div class="turno-info">
            <strong>${t.paciente}</strong>
            <span>👨‍⚕️ ${t.medico}</span><br>
            <span>📅 ${t.fecha} - ⏰ ${t.hora} hs</span><br>
            <span class="badge ${t.estado}">${t.estado}</span>
          </div>
          <div class="actions">
            ${t.estado === 'pendiente' ? `<button class="btn-action btn-confirm" onclick="confirmarTurno(${t.id})">Confirmar</button>` : ''}
            <button class="btn-action btn-delete" onclick="eliminarTurno(${t.id})">Cancelar</button>
          </div>
        `;
        contenedor.appendChild(item);
      });
    }

    actualizarHorariosDisponibles();
  } catch (error) {
    console.error('Error al cargar turnos:', error);
  }
}

document.getElementById('turnoForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevoTurno = {
    paciente: document.getElementById('paciente').value,
    medico: selectMedico.value,
    fecha: inputFecha.value,
    hora: selectHora.value
  };

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoTurno)
    });

    const data = await res.json();

    if (res.ok) {
      e.target.reset();
      inputFecha.setAttribute('min', hoy);
      selectHora.innerHTML = '<option value="">Seleccione fecha y médico primero</option>';
      cargarTurnos();
    } else {
      alert(data.message || 'Error al agendar el turno');
    }
  } catch (error) {
    console.error('Error en la petición POST:', error);
    alert('No se pudo conectar con el servidor.');
  }
});

async function confirmarTurno(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: 'confirmado' })
    });
    if (res.ok) cargarTurnos();
  } catch (error) {
    console.error('Error al confirmar turno:', error);
  }
}

async function eliminarTurno(id) {
  if (confirm('¿Estás seguro de cancelar este turno?')) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok || res.status === 204) cargarTurnos();
    } catch (error) {
      console.error('Error al eliminar turno:', error);
    }
  }
}

cargarTurnos();