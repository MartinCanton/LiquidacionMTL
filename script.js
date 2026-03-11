// ======== STATE =======
const STORAGE_KEY = 'liquidacion_pax_v2';

function getState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { config: {}, viajes: [] };
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ======== UTIL =======

function mesKey(date) {
    return date ? date.slice (0, 7) : '';    
}

function mesLabel(key) {
    const [y, m] = key.split('-');
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${meses[parseInt(m)-1]} ${y}`;
}

function currentMesKey() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
}

function getMeses() {
    const state = getState();
    const keys = [...new Set(state.viajes.map(v => mesKey(v.fecha)))].filter(Boolean).sort().reverse();
    if (!keys.includes(currentMesKey())) keys.unshift(currentMesKey());
    return keys;
}

function formatFecha(dateStr) {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-')
    return `${d}/${m}/${y}`;
}

function numFmt(n) {
    if (n === null || n === undefined ||  n === '') return '';
    const num = parseFloat(n);
    return isNaN(num) ? '': num.toString();
}

// ======== SELECTORS =======
function fillSelectors() {
    const meses = getMeses();
    ['selector-mes', 'selector-mes-inf', 'selector-mes-del'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const cur = el.value;
        el.innerHTML = meses.map(k => `<option value="${k}">${mesLabel(k)}</option>`).join('');
        if (cur && meses.includes(cur)) el.value = cur;
    });
}

// ======== HEADER =======
function updateHeader() {
    const state = getState();
    const nombre = state.config.nombre || 'Sin nombre';
    const mk = currentMesKey();
    const viajes = state.viajes.filter(v => mesKey(v.fecha) === mk);
    const km = viajes.reduce((s, v) => s + (parseFloat(v.kms) || 0), 0);
    document.getElementById('header-meta').textContent =
        `${nombre}  ·  ${mesLabel(mk)}  ·  ${km.toFixed(1)} km`;
}

// ======== NEW TRIP =======

function agregarViaje() {
    const fecha = document.getElementById('f-fecha').value;
    const hojaIda = document.getElementById('f-hoja-ida').value.trim();
    const hojaVuelta = document.getElementById('f-hoja-vuelta').value.trim();
    const kms = document.getElementById('f-kms').value;
    const paxIda = document.getElementById('f-pax-ida').value;
    const paxVuelta = document.getElementById('f-pax-vuelta').value;
    const unidad = document.getElementById('f-unidad').value.trim();
    const obs = document.getElementById('f-obs').value.trim();

    const alertEl = document.getElementById('alert-carga');

    if (!fecha) {
        alertEl.className = 'alert error';
        alertEl.textContent = 'La fecha es obligatoria';
        return;
    }
    if (!kms || isNaN(parseFloat(kms))) {
        alertEl.className = 'alert error';
        alertEl.textContent = 'Ingresá los Kms del viaje.';
        return;        
    }

    const state = getState();
    state.viajes.push({
        id: Date.now(),
        fecha,
        hojaIda,
        hojaVuelta,
        kms: parseFloat(kms),
        paxIda: paxIda !== '' ? parseInt(paxIda) : '',
        paxVuelta: paxVuelta !== '' ? parseInt(paxVuelta) : '',
        unidad,
        obs
    });

    state.viajes.sort((a, b) => a.fecha.localeCompare(b.fecha));
    saveState(state);

    alertEl.className = 'alert success';
    alertEl.textContent = `Viaje del ${formatFecha(fecha)} agregado correctamente.`;
    setTimeout(() => { 
        alertEl.className = 'alert';        
    }, 3000);

    limpiarForm();
    renderReciente();
    updateKmBadge();
    updateHeader();
    fillSelectors();
}

function limpiarForm() {
    ['f-hoja-ida', 'f-hoja-vuelta', 'f-kms', 'f-pax-ida', 'f-pax-vuelta', 'f-unidad', 'f-obs'].forEach(id => {
        document.getElementById(id).value = '';
    });
    const today = new Date().toISOString().slice(0,10);
    document.getElementById('f-fecha').value = today;
}

// ======== KM BADGE =======

function updateKmBadge() {
    const state = getState();
    const mk = currentMesKey();
    const viajes = state.viajes.filter(v => mesKey(v.fecha) === mk);
    const km = viajes.reduce((s, v) => s + (parseFloat(v.kms) || 0), 0);
    document.getElementById('km-total-badge').textContent = km.toFixed(1);
    document.getElementById('km-meta-badge').textContent = `${viajes.length} viaje${viajes.length !== 1 ? 's' : ''} · ${mesLabel(mk)}`; 
}

// ======== RECENT TABLE =======

function renderReciente() {
    const state = getState();
    const mk = currentMesKey();
    const viajes = state.viajes.filter(v => mesKey(v.fecha) === mk).slice().reverse().slice(0,10);
    const tbody = document.getElementById('tabla-reciente');

    if (viajes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No hay viajes cargados este mes todavía.</td></tr>`;
        return;
    }

    tbody.innerHTML = viajes.map(v => `
        <tr>
         <td class="fecha">${formatFecha(v.fecha)}</td>
         <td>${v.hojaIda || '—'}</td>
         <td>${v.hojaVuelta || '—'}</td>
         <td class="kms">${numFmt(v.kms)} km</td>
         <td>${numFmt(v.paxIda) || '—'}</td>
         <td>${numFmt(v.paxVuelta) || '—'}</td>
         <td>${v.unidad || '—'}</td>
         <td style="color:var(--muted)">${v.obs || '—'}</td>
         <td><button class="del-btn" data-id="${v.id}" title="Eliminar">✕</button></td>
        </tr>
        `).join('');
}

// ======== TRIPS TABLE =======

function renderViajes() {
    const mk = document.getElementById('selector-mes')?.value || currentMesKey();
    const state = getState();
    const viajes = state.viajes.filter(v => mesKey(v.fecha) === mk);
    const km = viajes.reduce((s, v) => s + (parseFloat(v.kms) || 0), 0);

    document.getElementById('km-total-viajes').textContent = km.toFixed(1);
    document.getElementById('km-meta-viajes').textContent = `${viajes.length} viaje${viajes.length !== 1 ? 's': ''} · ${mesLabel(mk)}`;

    const tbody = document.getElementById('tabla-viajes');
    if (viajes.length == 0) {
        tbody.innerHTML = `
            <tr>
             <td colspan="8" class="empty-state">No hay viajes para este periodo.</td>
            </tr>`;
        return;
    }
    tbody.innerHTML = viajes.map((v, i) => `
        <tr>
          <td style="color:var(--muted); font-size:0.75rem">${i+1}</td>
          <td class="fecha">${formatFecha(v.fecha)}</td>
          <td>${v.hojaIda || '—'}</td>
          <td>${v.hojaVuelta || '—'}</td>
          <td class="kms">${numFmt(v.kms)} km</td>
          <td>${numFmt(v.paxIda) || '—'}</td>
          <td>${numFmt(v.paxVuelta) || '—'}</td>
          <td>${v.unidad || '—'}</td>
          <td style="color:var(--muted)">${v.obs || '—'}</td>
          <td><button class="del-btn" data-id="${v.id}" title="Eliminar">✕</button></td>
        </tr>
    `).join('');      
}

// ======== DELETE =======
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.del-btn');
    if (!btn) return;
    const id = parseInt(btn.dataset.id, 10);
    if (!isNaN(id)) borrarViaje(id);
});

function borrarViaje(id) {
    if (!confirm('¿Eliminar este viaje?')) return;
    const state = getState();
    state.viajes = state.viajes.filter(v => v.id !== id);
    saveState(state);
    renderReciente();
    renderViajes();
    updateKmBadge();
    updateHeader();
    fillSelectors();
}


// ======== INFORM =======
function renderInforme() {
  const mk = document.getElementById('selector-mes-inf')?.value || currentMesKey();
  const state = getState();
  const cfg = state.config;
  const viajes = state.viajes.filter(v => mesKey(v.fecha) === mk);
  const km = viajes.reduce((s, v) => s + (parseFloat(v.kms) || 0), 0);

  const filas = viajes.map(v => `
    <tr>
      <td>${formatFecha(v.fecha)}</td>
      <td>${v.hojaIda || ''}</td>
      <td>${v.hojaVuelta || ''}</td>
      <td style="text-align:right">${numFmt(v.kms)}</td>
      <td style="text-align:center">${numFmt(v.paxIda)}</td>
      <td style="text-align:center">${numFmt(v.paxVuelta)}</td>
      <td>${v.unidad || ''}</td>
      <td>${v.obs || ''}</td>
    </tr>
  `).join('');

  const html = `
    <div class="preview-card">
      <div class="preview-header">
        <div>
          <div class="preview-title">Liquidación de Servicios</div>
          <div style="font-size:0.8rem; margin-top:4px;">${mesLabel(mk)}</div>
        </div>
        <div style="text-align:right; font-size:0.82rem; line-height:1.7;">
          <b>Chofer:</b> ${cfg.nombre || '____________________'}<br>
          <b>Legajo:</b> ${cfg.legajo || '___________'}<br>
          ${cfg.empresa ? `<b>Empresa:</b> ${cfg.empresa}<br>` : ''}
        </div>
      </div>
      <table class="preview-table">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>HR Ida</th>
            <th>HR Vuelta</th>
            <th style="text-align:right">Kms</th>
            <th style="text-align:center">PAX Ida</th>
            <th style="text-align:center">PAX Vuelta</th>
            <th>Unidad</th>
            <th>Observaciones</th>
          </tr>
        </thead>
        <tbody>
          ${filas || '<tr><td colspan="8" style="text-align:center; padding:20px; color:#999">Sin viajes registrados</td></tr>'}
        </tbody>
      </table>
      <div class="preview-total">
        <span>TOTAL KILÓMETROS:</span>
        <span style="font-size:1.2rem; color:#111">${km.toFixed(1)} km</span>
      </div>
    </div>
  `;

  document.getElementById('preview-content').innerHTML = html;
}

// ======== EXPORT =======
function exportarExcel() {
    const mk = document.getElementById('selector-mes-inf')?.value || currentMesKey();
    const state = getState();
    const cfg = state.config;
    const viajes = state.viajes.filter(v => mesKey(v.fecha) === mk);
    const km = viajes.reduce((s, v) => s + (parseFloat(v.kms) || 0), 0);

    const wb = XLSX.utils.book_new();
    const ws_data = [];

    ws_data.push(['', '', '', '', '', '', `Chofer: ${cfg.nombre || ''}`]);
    ws_data.push(['', '', '', '', '', '', `Legajo: ${cfg.legajo || ''}`]);
    if (cfg.empresa) ws_data.push(['', '', '', '', '', '', `Empresa: ${cfg.empresa}`]);
    ws_data.push([`Liquidación de Servicios - ${mesLabel(mk)}`]);
    ws_data.push([]);

    ws_data.push(['Fecha', 'Hoja de Ruta Ida', 'Hoja de Ruta Vuelta', 'Kms', 'Pax IDA', 'Pax Vuelta', 'Unidad', 'Observaciones']);

    viajes.forEach(v => {
        ws_data.push([
            formatFecha(v.fecha),
            v.hojaIda || '',
            v.hojaVuelta || '',
            v.kms || '',
            v.paxIda !== '' ? v.paxIda : '',
            v.paxVuelta !== '' ? v.paxVuelta : '',
            v.unidad || '',
            v.obs || ''
        ]);
    });

    ws_data.push([]);
    ws_data.push(['', '', '', `Total Kms: ${km.toFixed(1)}`, '', '', '', '']);

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    ws['!cols'] = [
        {wch: 14}, {wch: 18}, {wch: 18}, {wch: 10}, {wch: 10}, {wch: 12}, {wch: 14}, {wch: 30}
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Liquidación');

    const filename = `liquidacion_${cfg.nombre ? cfg.nombre.replace(/\s+/g,'_') + '_' : ''}${mk}.xlsx`;
    XLSX.writeFile(wb, filename);        
}

// ======== CFG =======

function cargarConfig(){
    const state = getState();
    const cfg = state.config || {};
    document.getElementById('cfg-nombre').value = cfg.nombre || '';
    document.getElementById('cfg-legajo').value = cfg.legajo || '';
    document.getElementById('cfg-empresa').value = cfg.empresa || '';
}

function guardarConfig() {
    const state = getState();
    state.config = {
        nombre: document.getElementById('cfg-nombre').value.trim(),
        legajo: document.getElementById('cfg-legajo').value.trim(),
        empresa: document.getElementById('cfg-empresa').value.trim(),
    };
    saveState(state);
    const alertEl = document.getElementById('alert-config');
    alertEl.className = 'alert success';
    alertEl.textContent = 'Datos guardados correctamente.';
    setTimeout(() => {alertEl.className = 'alert'; }, 3000);
    updateHeader();
}

function borrarMes() {
    const mk = document.getElementById('selector-mes-del').value;
    if (!mk) return;
    if (!confirm(`¿Eliminar TODOS los viajes de ${mesLabel(mk)}? Esta acción no se puede deshacer.`)) return;
    const state = getState();
    state.viajes = state.viajes.filter(v => mesKey(v.fecha) !== mk);
    saveState(state);
    fillSelectors();
    renderReciente();
    updateKmBadge();
    updateHeader();
    alert(`Viajes de ${mesLabel(mk)} eliminados.`);
}

function exportarBackup() {
    const state = getState();
    const blob = new Blob([JSON.stringify(state, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a')
    a.href = url;
    a.download = `backup_liquidacion_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// ======== TABS =======

function showPanel(name, tabEl) {
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    if (tabEl) tabEl.classList.add('active');

    if (name === 'viajes') renderViajes();
    if (name === 'informe') renderInforme();
    if (name === 'config') cargarConfig();
}

// ======== INIT =======

function init() {
    const today = new Date().toISOString().slice(0,10);
    document.getElementById('f-fecha').value = today;

    fillSelectors();
    updateKmBadge();
    renderReciente();
    updateHeader();    
}

init();