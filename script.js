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

