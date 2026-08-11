const API_URL = '/api/turnos';

const staffMedico = [
  { especialidad: "Cardiología", medicos: ["Dr. Pérez", "Dr. Gómez", "Dra. Benítez"] },
  { especialidad: "Pediatría", medicos: ["Dra. Rodríguez", "Dr. Fernández", "Dra. Castro"] },
  { especialidad: "Dermatología", medicos: ["Dra. Martínez", "Dr. Silva"] },
  { especialidad: "Traumatología", medicos: ["Dr. López", "Dra. Morales", "Dr. Rossi"] },
  { especialidad: "Neurología", medicos: ["Dr. Soria", "Dra. Navarro"] },
  { especialidad: "Oftalmología", medicos: ["Dra. Blanco", "Dr. Torres"] }
];

// Bloquear fechas pasadas en el calendario HTML
const hoy = new Date().toISOString().split('T')[0];
document.getElementById('fecha').setAttribute('min', hoy);

// Cargar select de médicos agrupados por especialidad
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

// GET: Cargar turnos desde la API
async function cargarTurnos() {
  try {
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
  } catch (error) {
    console.error('Error al cargar turnos:', error);
  }
}

// POST: Registrar nuevo turno
document.getElementById('turnoForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nuevoTurno = {
    paciente: document.getElementById('paciente').value,
    medico: selectMedico.value,
    fecha: document.getElementById('fecha').value,
    hora: document.getElementById('hora').value
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
      document.getElementById('fecha').setAttribute('min', hoy);
      cargarTurnos();
    } else {
      alert(data.message || 'Error al agendar el turno');
    }
  } catch (error) {
    console.error('Error en la petición POST:', error);
    alert('No se pudo conectar con el servidor.');
  }
});

// PUT: Confirmar turno
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

// DELETE: Cancelar turno
async function eliminarTurno(id) {
  if (confirm('¿Estás seguro de cancelar este turno?')) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (res.ok) cargarTurnos();
    } catch (error) {
      console.error('Error al eliminar turno:', error);
    }
  }
}

// Inicializar la lista al abrir la página
cargarTurnos();