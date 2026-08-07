const API_URL = '/api/turnos';

const staffMedico = [
  { especialidad: "Cardiología", medicos: ["Dr. Pérez", "Dr. Gómez", "Dra. Benítez"] },
  { especialidad: "Pediatría", medicos: ["Dra. Rodríguez", "Dr. Fernández", "Dra. Castro"] },
  { especialidad: "Dermatología", medicos: ["Dra. Martínez", "Dr. Silva"] },
  { especialidad: "Traumatología", medicos: ["Dr. López", "Dra. Morales", "Dr. Rossi"] },
  { especialidad: "Neurología", medicos: ["Dr. Soria", "Dra. Navarro"] },
  { especialidad: "Oftalmología", medicos: ["Dra. Blanco", "Dr. Torres"] }
];

// Bloquear fechas pasadas
const hoy = new Date().toISOString().split('T')[0];
document.getElementById('fecha').setAttribute('min', hoy);

// Cargar médicos agrupados
const selectMedico = document.getElementById('medico');
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

// GET: Obtener turnos
async function cargarTurnos() {
  const res = await fetch(API_URL);
  const { data } = await res.json();
  const contenedor = document.getElementById('listaTurnos');
  contenedor.innerHTML = '';

  if (!data || data.length === 0) {
    contenedor.innerHTML = '<p style="text-align:center; color:#94a3b8;">No hay turnos agendados.</p>';
    return;
  }

  data.forEach(t => {
    const item = document.createElement('div');
    item.className = 'turno-item';
    item.innerHTML = `
      <div class="turno-info">
        <strong>${t.paciente}</strong>
        <span>👨‍⚕️ ${t.medico}</span><br>
        <span>📅 ${t.fecha} - ⏰ ${t.hora}</span><br>
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

// POST: Crear turno
document.getElementById('turnoForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const nuevoTurno = {
    paciente: document.getElementById('paciente').value,
    medico: selectMedico.value,
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value
  };

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(nuevoTurno)
  });

  if (res.ok) {
    e.target.reset();
    document.getElementById('fecha').setAttribute('min', hoy);
    cargarTurnos();
  } else {
    const err = await res.json();
    alert(err.message || 'Error al agendar el turno');
  }
});

// PUT: Confirmar
async function confirmarTurno(id) {
  await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ estado: 'confirmado' })
  });
  cargarTurnos();
}

// DELETE: Cancelar
async function eliminarTurno(id) {
  if (confirm('¿Estás seguro de cancelar este turno?')) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    cargarTurnos();
  }
}

cargarTurnos();