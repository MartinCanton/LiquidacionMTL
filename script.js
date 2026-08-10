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

