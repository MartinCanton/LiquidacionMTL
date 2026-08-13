const API_URL = 'http://localhost:3000/api';

function getToken() {
    return localStorage.getItem('token');
}

function getUsuario() {
    const raw = localStorage.getItem('usuario');
    return raw ? JSON.parse(raw): null;
}

function guardarSesion(token, usuario) {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
}

function cerrarSesion() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    mostrarPanelAuth();
}

async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = {'Content-Type': 'application/json'};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch (`${API_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (res.status === 401 || res.status === 403) {
        cerrarSesion();
        return null;
    }

    return res.json();
}

function mesKey(date) {
    return date ? date.slice(0, 7) : '';
}

function mesLabel(key) {
    const [y, m] = key.split('-');
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return `${meses[parseInt(m) -1]} ${y}`;
}

function currentMesKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function formatFecha(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.slice(0, 10).split('-');
    return `${d}/${m}/${y}`;
}

function numFmt(n) {
    if(n === null || n === undefined || n === '') return '';
    const nume = parseFloat(n);
    return isNaN(num) ? '' : num.toString();
}

function mostrarPanelAuth() {
    document.getElementById('app').style.display = 'none';
    document.getElementById('panel-auth').style.display = 'flex';
    document.getElementById('auth-error').textContent = '';
}

function mostrarApp() {
    document.getElementById('panel-auth').style.display = 'none';
    document.getElementById('app').style.display = 'block';
}

async function login() {
    const legajo = document.getElementById('auth-legajo').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');

    if (!legajo || !password) {
        errorEl.textContent = 'Ingresa tu legajo y contraseña.';
        return;
    }

    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ legajo, password})
    });

    if (!data || data.error) {
        errorEl.textContent = data?.error || 'Error al iniciar sesion';
        return;
    }

    guardarSesion(data.token, data.usuario);
    mostrarApp();
    init();
}

async function updateHeader() {
    const usuario = getUsuario();
    const nombre = usuario?.nombre || 'Sin nombre';
    const mk = currentMesKey();
    const viajes = await apiFetch(`/viajes?mes=${mk.split('-')[1]}&anio=${mk.split('-')[0]}`);
    const km = viajes ? viajes.reduce((s, v) => s + (parseFloat(v.kilometros) || 0), 0) : 0;
    document.getElementById('header-meta').textContent = 
    `${nombre}  ·  ${mesLabel(mk)}  ·  ${km.toFixed(1)} km` ;
}

async function fillSelectors() {
    const viajes = await apiFetch('/viajes') || [];
    const keys = [...new Set(viajes.map(v => mesKey(v.fecha.slice(0, 10))))].filter(Boolean).sort().reverse();
    if (!keys.includes(currentMesKey())) keys.unshift(currentMesKey());

    ['selector-mes', 'selector-mes-inf', 'selector-mes-del'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const cur = el.value;
        el.innerHTML = keys.map(l => `<option value="${k}">${mesLabel(k)}</option>`).join('');
        if (cur && keys.includes(cur)) el.value = cur;
    });
}

async function updateKmBadge() {
    const mk = currentMesKey();
    const viajes = await apiFetch(`/viajes?mes=${mk.split('-')[1]}&anio=${mk.split('-')[0]}`) || [];
    const km = viajes.reduce((s, v) => s + (parseFloat(v.kilometros) || 0), 0);
    document.getElementById('km-total-badge').textContent = km.toFixed(1);
    document.getElementById('km-meta-badge').textContent =
    `${viajes.length} viaje${viajes.length !== 1 ? 's' : ''} · ${mesLabel(mk)}`;    
}

async function agregarViaje() {
    const fecha = document.getElementById('f-fecha').value;
    const hr_ida = document.getElementById('f-hoja-ida').value.trim();
    const hr_vuelta = document.getElementById('f-hoja-vuelta').value.trim();
    const kilometros = document.getElementById('f-kms').value;
    const pax_ida = document.getElementById('f-pax-ida').value;
    const pax_vuelta = document.getElementById('f-pax-vuelta').value;
    const unidad = document.getElementById('f-unidad').value.trim();
    const observaciones = document.getElementById('f-obs').value.trim();
    const alertEl = document.getElementById('alert-carga');

    if (!fecha) {
        alertEl.className = 'alert-error';
        alertEl.textContent = 'La fecha es obligatoria';
        return;
    }

    if (!kilometros || isNaN(parseFloat(kilometros))) {
        alertEl.className = 'alert error';
        alertEl.textContent = 'Ingresa los kms del viaje';
        return;
    }

    const data = await apiFetch('/viajes', {
        method: 'POST',
        body: JSON.stringify({ fecha, hr_ida, hr_vuelta, kilometros, pax_ida, pax_vuelta, unidad, observaciones})
    });

    if (!data || data.error) {
        alertEl.className = 'alert error';
        alertEl.textContent = data?.error || 'Error al guardar el viaje';
        return;
    }
    
    alertEl.className = 'alert success';
    alertEl.textContent = `Viaje del ${formatFecha(fecha)} agregado correctamente`;
    setTimeout(() => { alertEl.className = 'alert'; }, 3000);

    limpiarForm();
    await renderReciente();
    await updateKmBadge();
    await updateHeader();
    await fillSelectors();
}

function limpiarForm() {
    ['f-hoja-ida', 'f-hoja-vuelta', 'f-kms', 'f-pax-ida', 'f-pax-vuelta', 'f-unidad', 'f-obs'].forEach(id => {
        document.getElementById(id).value = '';
    });
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('f-fecha').value = today;
}


async function renderReciente() {
    const mk = currentMesKey();
    const viajes = await apiFetch(`/viajes?mes=${mk.split('-')[1]}&anio=${mk.split('-')[0]}`) || [];
    const recientes = viajes.slice().reverse().slice(0, 10);
    const tbody = document.getElementById('tabla-reciente');

    if (recientes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No hay viajes cargados este mes todavía.</td></tr>`;
        return;
    }

    tbody.innerHTML = recientes.map(v => `
        <tr>
          <td class="fecha">${formatFecha(v.fecha)}</td>
          <td>${v.hr_ida || '—'}</td>
          <td>${v.hr_vuelta || '—'}</td>
          <td class="kms">${numFmt(v.kilometros)} km</td>
          <td>${numFmt(v.pax_ida) || '—'}</td>
          <td>${numFmt(v.pax_vuelta) || '—'}</td>
          <td>${v.unidad || '—'}</td>
          <td style="color:var(--muted)">${v.observaciones || '—'}</td>
          <td><button class="del-btn" data-id="${v.id}" title="Eliminar">✕</button></td>
        </tr>
    `).join('');
}

