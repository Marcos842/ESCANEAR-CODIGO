// ================== ROLES Y BARRA SUPERIOR ==================

// Verificar rol actual
function getRolActual() {
  return sessionStorage.getItem('rol') || null;
}

function esCEO()        { return getRolActual() === 'ceo'; }
function esSupervisor() { return getRolActual() === 'supervisor'; }

// ✅ AGREGAR CLASE AL BODY SEGÚN ROL (para CSS)
function aplicarClaseRol() {
  const rol = getRolActual();
  
  if (rol === 'agente1' || rol === 'agente2' || rol === 'agente3') {
    document.body.classList.add('role-agente');
  } else if (rol === 'ceo') {
    document.body.classList.add('role-ceo');
  } else if (rol === 'supervisor') {
    document.body.classList.add('role-supervisor');
  }
}

// Ejecutar al cargar
aplicarClaseRol();

// Mostrar barra de rol (debajo del h1 en HTML)
function mostrarRolActual(rol) {
  const barra = document.createElement('div');
  barra.id = 'roleBar';
  barra.innerHTML = `
    <span>👑 Rol: ${sessionStorage.getItem('usuario')} | 
    <button onclick="sessionStorage.clear(); window.location.href='login.html';" 
      style="background:red;color:white;border:none;padding:5px 10px;border-radius:5px;cursor:pointer;">
      Salir
    </button>
    </span>`;
  barra.style.cssText = 'background:#1976d2;color:white;padding:10px;text-align:center;margin:10px 0;border-radius:8px;';
  document.body.insertBefore(barra, document.querySelector('h1').nextSibling);
}

// Ajustar barra superior según sesión
function actualizarBarraSesion() {
  const rol         = getRolActual();
  const linkSesion  = document.getElementById('linkSesion');
  const linkInicio  = document.getElementById('linkInicio');
  const linkSoporte = document.getElementById('linkSoporte');

  if (!linkSesion) return;

  if (rol) {
    // Usuario dentro: mostrar Cerrar sesión
    linkSesion.textContent = 'Cerrar sesión';
    linkSesion.href = '#';
    linkSesion.onclick = function (e) {
      e.preventDefault();
      sessionStorage.clear();
      window.location.href = 'login.html';
    };
  } else {
    // No logueado: mostrar Iniciar sesión
    linkSesion.textContent = 'Iniciar sesión';
    linkSesion.href = 'login.html';
    linkSesion.onclick = null;
  }

  // Inicio siempre lleva a index.html
  if (linkInicio) {
    linkInicio.href = 'index.html';
  }

  // Actualizar título visible con el rango
  const topTitulo = document.getElementById('topTitulo');
  if (topTitulo) {
    const nombreRol = sessionStorage.getItem('usuario'); // CEO / Supervisor / Agente
    if (rol && nombreRol) {
      topTitulo.textContent = `🖥️ Escáner LEDdecodigodebarras (${nombreRol})`;
    } else {
      topTitulo.textContent = '🖥️ Escáner LEDdecodigodebarras';
    }
  }
}

// Tiempo activo en la barra superior
const lblTiempo    = document.getElementById('lblTiempoAgente');
const inicioSesion = Number(sessionStorage.getItem('inicioSesion') || 0);

if (lblTiempo && inicioSesion) {
  const actualizarTiempo = () => {
    const diffMs   = Date.now() - inicioSesion;
    const totalSeg = Math.floor(diffMs / 1000);
    const horas    = Math.floor(totalSeg / 3600);
    const mins     = Math.floor((totalSeg % 3600) / 60);
    const segs     = totalSeg % 60;

    const hh = String(horas).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const ss = String(segs).padStart(2, '0');

    lblTiempo.textContent = `Tiempo activo: ${hh}:${mm}:${ss}`;
  };

  actualizarTiempo();
  setInterval(actualizarTiempo, 1000);
}

// ================== CONFIG GOOGLE FORM ==================
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvuVe2ckG2xfz3pvU-v5z9edLAVbtA/formResponse";

const GOOGLE_ENTRY_CODE   = "entry.1389898450"; // Código escaneado
const GOOGLE_ENTRY_EQUIPO = "entry.1581479368"; // Campo EQUIPO

// ================== VARIABLES ==================
let scanner = null;

const beepAudio = document.getElementById('beepAudio');

const resultDiv = document.getElementById('result');
const codeDiv   = document.getElementById('code');

const btnStart     = document.getElementById('btnStart');
const btnStop      = document.getElementById('btnStop');
const btnCopyCode  = document.getElementById('btnCopyCode');
const btnSendForm  = document.getElementById('btnSendForm');

const btnGenBarcode  = document.getElementById('btnGenBarcode');
const btnGenQR       = document.getElementById('btnGenQR');
const btnDownloadPng = document.getElementById('btnDownloadPng');
const btnDownloadJpg = document.getElementById('btnDownloadJpg');

// === BOTONES PANEL LATERAL Y RESUMEN (SOLO CEO) ===
const btnJugadores      = document.getElementById('btnJugadores');
const btnDirectiva      = document.getElementById('btnDirectiva');
const btnClearResumen   = document.getElementById('btnClearResumen');
const tituloResumen     = document.querySelector('.side-panel h4');
const panelAgentes      = document.getElementById('panelAgentes');
const btnResumenAgentes = document.getElementById('btnResumenAgentes');
const sidePanel         = document.querySelector('.side-panel');

// Variable para controlar si el resumen fue limpiado manualmente
let resumenLimpiado = false;

// Ocultar panel completo si NO es CEO
if (!esCEO()) {
  if (btnJugadores)  btnJugadores.style.display  = 'none';
  if (btnDirectiva)  btnDirectiva.style.display  = 'none';
  if (tituloResumen) tituloResumen.style.display = 'none';
  if (panelAgentes)  panelAgentes.style.display  = 'none';
  if (sidePanel)     sidePanel.style.display     = 'none';
} else {
  // Si es CEO, activar botones
  if (btnJugadores) {
    btnJugadores.addEventListener('click', () => {
      window.open(
        'https://docs.google.com/spreadsheets/d/1VE1dIGXNWXQzmPkGCAz9-7Nh3Zt-L5llNbc_gceCm9A/edit?resourcekey=&gid=1308734349#gid=1308734349',
        '_blank'
      );
    });
  }

  if (btnDirectiva) {
    btnDirectiva.addEventListener('click', () => {
      window.open(
        'https://docs.google.com/spreadsheets/d/1VE1dIGXNWXQzmPkGCAz9-7Nh3Zt-L5llNbc_gceCm9A/edit?resourcekey=&gid=1308734349#gid=1308734349',
        '_blank'
      );
    });
  }

  if (tituloResumen) tituloResumen.style.display = '';
  if (panelAgentes)  panelAgentes.style.display  = '';
}

// === FLECHA PARA OCULTAR / MOSTRAR PANEL LATERAL (SOLO CEO) ===
const toggleSidePanelBtn = document.getElementById('toggleSidePanel');

if (toggleSidePanelBtn && sidePanel && esCEO()) {
  toggleSidePanelBtn.addEventListener('click', () => {
    const colapsado = sidePanel.classList.toggle('collapsed');
    toggleSidePanelBtn.textContent = colapsado ? '›' : '‹';
    
    // Mover el botón junto con el panel
    if (colapsado) {
      toggleSidePanelBtn.style.right = '40px';
    } else {
      toggleSidePanelBtn.style.right = '270px';
    }
  });
} else {
  // Si NO es CEO, ocultar todo
  if (sidePanel) sidePanel.style.display = 'none';
  if (toggleSidePanelBtn) toggleSidePanelBtn.style.display = 'none';
}

// ================== SONIDO ==================
function playBeep() {
  if (!beepAudio) return;
  beepAudio.currentTime = 0;
  beepAudio.play().catch(() => {});
}

// ================== ESCÁNER (SIN ESPEJO) ==================
async function startScan() {
  const formatsToSupport = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E
  ];

  scanner = new Html5Qrcode("reader", {
    formatsToSupport: formatsToSupport,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true
    }
  });

  const config = {
    fps: 30,
    qrbox: { width: 320, height: 170 },
    disableFlip: true
  };

  try {
    await scanner.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        playBeep();
        codeDiv.textContent = decodedText;
        resultDiv.style.display = 'block';
        stopScan();
      },
      () => { /* errores por frame, ignorar */ }
    );
  } catch (err) {
    alert("Error cámara: " + err);
  }
}

function stopScan() {
  if (scanner) {
    scanner.stop()
      .then(() => {
        scanner.clear();
        scanner = null;
      })
      .catch(() => {
        scanner = null;
      });
  }
}

// ENVIAR A GOOGLE FORM (público / jugador / directiva)
const GOOGLEFORMACTION      = 'https://docs.google.com/forms/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvuVe2ckG2xfz3pvU-v5z9edLAVbtA/formResponse';
const GOOGLEENTRYCODE       = 'entry.1389898450'; // Código escaneado
const GOOGLEENTRYEQUIPO     = 'entry.1581479368'; // Equipo
const GOOGLEENTRYJUGADOR    = 'entry.74934614';   // JUGADOR
const GOOGLEENTRYDIRECTIVA  = 'entry.822667573';  // DIRECTIVA
const GOOGLEENTRYUSUARIO    = 'entry.1375230144'; // USUARIO (AGE-01, CEO-01)
const GOOGLEENTRYRANGO      = 'entry.2139797690'; // RANGO_ENTRANTE (Agente, CEO)

function sendToGoogleForm(codigo, equipoSeleccionado, tipoRegistro = 'publico', nombrePersona = '') {
  if (!codigo) return;

  const formData = new FormData();
  formData.append(GOOGLEENTRYCODE, codigo);

  if (equipoSeleccionado) {
    formData.append(GOOGLEENTRYEQUIPO, equipoSeleccionado);
  }

  // agregar datos del usuario que está logueado
  const codigoUsuario = sessionStorage.getItem('codigo') || '';
  const rangoUsuario  = sessionStorage.getItem('usuario') || '';

  if (codigoUsuario) {
    formData.append(GOOGLEENTRYUSUARIO, codigoUsuario);
  }
  if (rangoUsuario) {
    formData.append(GOOGLEENTRYRANGO, rangoUsuario);
  }

  const nombreLimpio = (nombrePersona || '').trim();

  if (tipoRegistro === 'jugador' && nombreLimpio) {
    formData.append(GOOGLEENTRYJUGADOR, nombreLimpio);
  } else if (tipoRegistro === 'directiva' && nombreLimpio) {
    formData.append(GOOGLEENTRYDIRECTIVA, nombreLimpio);
  }

  fetch(GOOGLEFORMACTION, {
    method: 'POST',
    mode: 'no-cors',
    body: formData
  }).catch(() => {});
}

// ================== UTILIDADES TEXTO ==================
function copyCode() {
  const text = codeDiv.textContent.trim();
  if (!text) return;
  navigator.clipboard.writeText(text)
    .then(() => alert('Código copiado.'));
}

// ================== GENERADOR BARRAS ==================
let jsBarcodeLoaded = false;

function ensureJsBarcode(callback) {
  if (jsBarcodeLoaded) return callback();
  const script = document.createElement('script');
  script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
  script.onload = () => { jsBarcodeLoaded = true; callback(); };
  document.head.appendChild(script);
}

function generateBarcode() {
  const code = document.getElementById('codigoInput').value.trim();
  if (!code) return alert('Escribe un código primero');

  ensureJsBarcode(() => {
    const canvas = document.getElementById('barcodeCanvas');
    if (!canvas) return alert('No se encontró el canvas de barras');

    canvas.style.display = 'inline-block';

    JsBarcode(canvas, code, {
      format: "CODE128",
      width: 2,
      height: 80,
      displayValue: true,
      fontSize: 16
    });
  });
}

// ================== GENERADOR QR ==================
function generateQR() {
  const code = document.getElementById('codigoInput').value.trim();
  if (!code) return alert('Escribe un código primero');

  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return alert('No se encontró el canvas de QR');

  const ctx = canvas.getContext('2d');
  canvas.style.display = 'inline-block';

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const qr = qrcode(0, 'H');
  qr.addData(code);
  qr.make();

  const modules  = qr.getModuleCount();
  const cellSize = Math.floor(canvas.width / modules);
  const margin   = Math.floor((canvas.width - cellSize * modules) / 2);

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#000000';
  for (let r = 0; r < modules; r++) {
    for (let c = 0; c < modules; c++) {
      if (qr.isDark(r, c)) {
        ctx.fillRect(
          margin + c * cellSize,
          margin + r * cellSize,
          cellSize,
          cellSize
        );
      }
    }
  }
}

// ================== DESCARGAS IMAGEN ==================
function downloadCanvasImage(tipo = 'barras', format = 'png') {
  const canvas = tipo === 'qr'
    ? document.getElementById('qrCanvas')
    : document.getElementById('barcodeCanvas');

  if (!canvas || canvas.style.display === 'none') {
    return alert('Primero genera el código ' + (tipo === 'qr' ? 'QR' : 'de barras'));
  }

  const mime    = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const dataURL = canvas.toDataURL(mime);

  const a = document.createElement('a');
  a.href     = dataURL;
  a.download = `codigo_${tipo}.${format}`;
  a.click();
}

// ================== MOSTRAR / OCULTAR SECCIÓN CREAR CÓDIGO ==================
function toggleCrearCodigo() {
  const seccion = document.getElementById('seccionCrearCodigo');
  if (seccion.style.display === 'none' || seccion.style.display === '') {
    seccion.style.display = 'block';
  } else {
    seccion.style.display = 'none';
  }
}

// ================== ELIMINAR CÓDIGOS (CANVAS) ==================
const btnClearBarcode = document.getElementById('btnClearBarcode');
const btnClearQR      = document.getElementById('btnClearQR');
const barcodeCanvas   = document.getElementById('barcodeCanvas');
const qrCanvas        = document.getElementById('qrCanvas');

if (btnClearBarcode && barcodeCanvas) {
  const barcodeCtx = barcodeCanvas.getContext('2d');
  btnClearBarcode.addEventListener('click', () => {
    barcodeCtx.clearRect(0, 0, barcodeCanvas.width, barcodeCanvas.height);
    barcodeCanvas.style.display = 'none';
  });
}

if (btnClearQR && qrCanvas) {
  const qrCtx = qrCanvas.getContext('2d');
  btnClearQR.addEventListener('click', () => {
    qrCtx.clearRect(0, 0, qrCanvas.width, qrCanvas.height);
    qrCanvas.style.display = 'none';
  });
}

// ================== CONTADOR DE EQUIPOS ==================
const inputEquipo   = document.getElementById('nuevoEquipo');
const btnAddEquipo = document.getElementById('btnAddEquipo');
const listaEquipos  = document.getElementById('listaEquipos');

// registro por agente (sigue para totales de la vista, pero ya no se usa en panel global)
const nombreAgente    = sessionStorage.getItem('codigo') || 'Sin código';
const ventasPorAgente = JSON.parse(localStorage.getItem('ventasPorAgente') || '{}');

function guardarVentasAgente() {
  localStorage.setItem('ventasPorAgente', JSON.stringify(ventasPorAgente));
}

const equipos = {};
let ultimoEquipoSeleccionado = null;

// Cargar desde localStorage
const equiposGuardados = localStorage.getItem('equiposAcademia');
if (equiposGuardados) {
  Object.assign(equipos, JSON.parse(equiposGuardados));
}

function guardarEquipos() {
  localStorage.setItem('equiposAcademia', JSON.stringify(equipos));
}

// helper para guardar tickets/monto en cada card
function setDatosEquipo(card, tickets, monto) {
  card.dataset.tickets = tickets;
  card.dataset.monto   = monto;
}

// calcula equipo top global (entre todos los equipos)
function actualizarTopEquipo() {
  let topNombre = '—';
  let topMonto  = -1;

  document.querySelectorAll('.equipo-card').forEach(card => {
    const header = card.querySelector('.equipo-card-header');
    if (!header) return;
    const nombre = header.textContent.trim();
    const monto  = Number(card.dataset.monto || 0);

    if (monto > topMonto) {
      topMonto  = monto;
      topNombre = nombre;
    }
  });

  const lbl = document.getElementById('lblTopEquipo');
  if (!lbl) return;

  if (topMonto >= 0) {
    lbl.textContent = `Equipo top: ${topNombre} (S/ ${topMonto})`;
  } else {
    lbl.textContent = 'Equipo top: —';
  }
}

// panel lateral: resumen por agente (SOLO DATOS GLOBALES)
function renderPanelAgentes(datosDesdeApi = null) {
  const panel = document.getElementById('panelAgentes');
  if (!panel) return;

  panel.innerHTML = '';

  if (!datosDesdeApi || !Array.isArray(datosDesdeApi) || datosDesdeApi.length === 0) {
    const div = document.createElement('div');
    div.style.marginBottom = '6px';
    div.style.padding      = '4px 6px';
    div.style.background   = '#ffffff';
    div.style.borderRadius = '6px';
    div.textContent = 'Sin datos globales todavía.';
    panel.appendChild(div);
    return;
  }

  datosDesdeApi.forEach(r => {
    const div = document.createElement('div');
    div.style.marginBottom = '6px';
    div.style.padding      = '4px 6px';
    div.style.background   = '#ffffff';
    div.style.borderRadius = '6px';

    const usuario   = r.usuario   || 'SIN_USUARIO';
    const tickets   = r.tickets   || 0;
    const monto     = r.monto     || 0;
    const topEquipo = r.topEquipo || '—';
    const fecha     = r.fecha     || '';

    div.textContent = `${usuario}: ${tickets} tickets / S/ ${monto} / Top: ${topEquipo} / ${fecha}`;
    panel.appendChild(div);
  });
}

// === URL de la API global (CEO ve todo)
const API_RESUMEN_GLOBAL = 'https://script.google.com/macros/s/AKfycby5oD-aB0J7e--ql1EwmdOLYUhHdUBlOGY71TuQbB5pHpqjAvSCIp4WSsLqKnawWVuM/exec';

// Cargar resumen global desde Google Sheets (solo CEO)
async function cargarResumenGlobal() {
  if (!esCEO()) return;

  try {
    const resp      = await fetch(API_RESUMEN_GLOBAL);
    const registros = await resp.json(); // [{usuario,tickets,monto,topEquipo,fecha}, ...]

    renderPanelAgentes(registros);
  } catch (err) {
    console.error('Error cargando resumen global', err);
    renderPanelAgentes([]);
  }
}

// Botón Limpiar resumen
if (btnClearResumen) {
  if (!esCEO()) {
    btnClearResumen.style.display = 'none';
  } else {
    btnClearResumen.addEventListener('click', () => {
      if (!confirm('¿Borrar SOLO la vista del resumen? Esto NO borra los datos de Google Sheet.')) return;
      
      // Limpiar localStorage local
      Object.keys(ventasPorAgente).forEach(k => delete ventasPorAgente[k]);
      guardarVentasAgente();
      
      // Limpiar panel visual
      renderPanelAgentes([]);
      
      // Marcar que fue limpiado manualmente
      resumenLimpiado = true;
      
      alert('Vista del resumen limpiada correctamente.');
    });
  }
}

// === EVENTO BOTÓN "Resumen por agente" ===
if (btnResumenAgentes && sidePanel && esCEO()) {
  btnResumenAgentes.addEventListener('click', () => {
    sidePanel.classList.toggle('collapsed');
    
    // Solo cargar datos si NO fue limpiado manualmente
    if (!resumenLimpiado) {
      cargarResumenGlobal();
    }
  });
}

// Alta de equipos
if (btnAddEquipo && inputEquipo && listaEquipos) {
  btnAddEquipo.addEventListener('click', () => {
    const nombre = inputEquipo.value.trim();
    if (!nombre) return alert('Escribe un nombre de equipo');
    if (equipos[nombre]) return alert('Ese equipo ya existe');

    equipos[nombre] = 0;
    inputEquipo.value = '';
    guardarEquipos();
    renderEquipos();
  });
}

function renderEquipos() {
  // total general
  let total = 0;
  Object.values(equipos).forEach(v => total += v);

  const totalSpan = document.getElementById('totalVentas');
  if (totalSpan) {
    totalSpan.textContent = `Total entradas: ${total}`;
  }

  // actualizar círculo
  const totalTicketsCircle = document.getElementById('totalTicketsCircle');
  const totalMontoCircle   = document.getElementById('totalMontoCircle');
  if (totalTicketsCircle && totalMontoCircle) {
    totalTicketsCircle.textContent = total;
    totalMontoCircle.textContent   = total * 3; // precio por ticket
  }

  // limpiar contenedor
  listaEquipos.innerHTML = '';

  // UNA TARJETA POR EQUIPO
  Object.keys(equipos).forEach(nombre => {
    const card = document.createElement('div');
    card.className = 'equipo-card';

    const header = document.createElement('div');
    header.className = 'equipo-card-header';
    header.textContent = nombre.toUpperCase();
    card.appendChild(header);

    const body = document.createElement('div');
    body.className = 'equipo-card-body';

    // contador
    const contador = document.createElement('span');
    contador.className = 'equipo-contador';
    contador.textContent = `Tickets: ${equipos[nombre]}`;
    body.appendChild(contador);

    // calculamos monto de este equipo (tickets * 3)
    let ticketsEquipo = equipos[nombre];
    let montoEquipo   = ticketsEquipo * 3;

    // guardar en data- atributos
    setDatosEquipo(card, ticketsEquipo, montoEquipo);

    // +
    const btnMas = document.createElement('button');
    btnMas.textContent = '+';
    btnMas.className   = 'btn btn-green';
    btnMas.addEventListener('click', () => {
      equipos[nombre] += 1;
      ultimoEquipoSeleccionado = nombre;

      if (!ventasPorAgente[nombreAgente]) {
        ventasPorAgente[nombreAgente] = {
          tickets: 0,
          monto: 0,
          topEquipo: '—',
          equipos: {},
          fecha: new Date().toLocaleString('es-PE')
        };
      }

      const dataAgente = ventasPorAgente[nombreAgente];

      dataAgente.tickets += 1;
      dataAgente.monto   += 3;

      if (!dataAgente.equipos[nombre]) {
        dataAgente.equipos[nombre] = 0;
      }
      dataAgente.equipos[nombre] += 1;

      let mejorEquipo = '—';
      let maxTickets  = -1;
      Object.keys(dataAgente.equipos).forEach(eq => {
        const t = dataAgente.equipos[eq];
        if (t > maxTickets) {
          maxTickets  = t;
          mejorEquipo = eq;
        }
      });
      dataAgente.topEquipo = mejorEquipo;

      guardarVentasAgente();
      guardarEquipos();
      renderEquipos();
    });
    body.appendChild(btnMas);

    // -
    const btnMenos = document.createElement('button');
    btnMenos.textContent = '-';
    btnMenos.className   = 'btn btn-yellow';

    btnMenos.addEventListener('click', () => {
      if (equipos[nombre] > 0) {
        equipos[nombre] -= 1;
        ultimoEquipoSeleccionado = nombre;

        const dataAgente = ventasPorAgente[nombreAgente];
        if (dataAgente) {
          if (dataAgente.tickets > 0) dataAgente.tickets -= 1;
          if (dataAgente.monto   > 0) dataAgente.monto   -= 3;

          if (dataAgente.equipos && dataAgente.equipos[nombre]) {
            dataAgente.equipos[nombre] -= 1;
            if (dataAgente.equipos[nombre] <= 0) {
              delete dataAgente.equipos[nombre];
            }

            let mejorEquipo = '—';
            let maxTickets  = -1;
            Object.keys(dataAgente.equipos).forEach(eq => {
              const t = dataAgente.equipos[eq];
              if (t > maxTickets) {
                maxTickets  = t;
                mejorEquipo = eq;
              }
            });
            dataAgente.topEquipo = mejorEquipo;
          }
        }

        guardarVentasAgente();
        guardarEquipos();
        renderEquipos();
      }
    });
    body.appendChild(btnMenos);

    // EDITAR
    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn btn-edit';
    btnEdit.textContent = '✏ Editar';
    btnEdit.addEventListener('click', () => {
      if (!esCEO() && !esSupervisor()) {
        const rolPermiso = prompt(
          '🔐 Permiso requerido para EDITAR.\n' +
          'Escribe "S" para Supervisor o "C" para CEO:'
        );
        if (!rolPermiso) return;

        const tipo = rolPermiso.trim().toUpperCase();
        let pass = prompt(
          tipo === 'S'
            ? 'Contraseña de SUPERVISOR:'
            : 'Contraseña de CEO:'
        );
        if (!pass) return;

        const PASS_SUPERVISOR = 'SupPucala2025';
        const PASS_CEO        = 'HALCO2025MARCOS';

        const ok =
          (tipo === 'S' && pass === PASS_SUPERVISOR) ||
          (tipo === 'C' && pass === PASS_CEO);

        if (!ok) {
          alert('Contraseña incorrecta. No se puede editar el equipo.');
          return;
        }
      }

      const nuevoNombre = prompt('Nuevo nombre del equipo:', nombre);
      if (!nuevoNombre) return;
      if (equipos[nuevoNombre]) {
        alert('Ya existe un equipo con ese nombre');
        return;
      }
      equipos[nuevoNombre] = equipos[nombre];
      delete equipos[nombre];
      guardarEquipos();
      renderEquipos();
    });
    body.appendChild(btnEdit);

    // ✅ BOTÓN ELIMINAR CON AUTORIZACIÓN CEO
    const btnEliminar = document.createElement('button');
    btnEliminar.className = 'btn btn-eliminar';
    btnEliminar.textContent = '🗑️';
    btnEliminar.addEventListener('click', () => {
      const PASSWORD_CEO = 'HALCO2025MARCOS';
      
      const password = prompt('🔐 Ingresa la contraseña de CEO para eliminar este equipo:');
      
      if (password === null) return;
      
      if (password !== PASSWORD_CEO) {
        alert('❌ Contraseña incorrecta. No tienes autorización para eliminar equipos.');
        return;
      }
      
      const confirmacion = confirm(
        `⚠️ ¿Estás seguro de eliminar el equipo "${nombre}"?\n\n` +
        `Tickets actuales: ${equipos[nombre]}\n` +
        `Esta acción NO se puede deshacer.`
      );
      
      if (!confirmacion) return;
      
      delete equipos[nombre];
      guardarEquipos();
      renderEquipos();
      
      alert(`✅ Equipo "${nombre}" eliminado correctamente.`);
    });
    body.appendChild(btnEliminar);

    card.appendChild(body);
    listaEquipos.appendChild(card);
  });

  actualizarTopEquipo();
}

// pintar equipos al cargar
renderEquipos();

// Si es CEO: cargar siempre el resumen global desde Google Sheets
if (esCEO()) {
  cargarResumenGlobal();
}

// ================== REGISTRO MANUAL DE CÓDIGO ==================
const inputCodigoManual      = document.getElementById('codigoManual');
const btnRegistrarPublico    = document.getElementById('btnRegistrarPublico');
const btnRegistrarJugador    = document.getElementById('btnRegistrarJugador');
const btnRegistrarDirectiva  = document.getElementById('btnRegistrarDirectiva');

// ✅ FUNCIÓN MEJORADA: Seleccionar/Cambiar equipo con bucle
function seleccionarOCambiarEquipo(equipoActual = null) {
  const equiposDisponibles = Object.keys(equipos);
  
  if (equiposDisponibles.length === 0) {
    alert('❌ No hay equipos disponibles. Primero crea un equipo en "Equipos / Ventas".');
    return null;
  }
  
  let mensaje = equipoActual 
    ? `🔄 Equipo actual: ${equipoActual}\n\n📋 Equipos disponibles:\n\n`
    : '📋 Selecciona el equipo:\n\n';
    
  equiposDisponibles.forEach((eq, index) => {
    mensaje += `${index + 1}. ${eq}\n`;
  });
  mensaje += '\n✍️ Escribe el NÚMERO del equipo:';
  
  const seleccion = prompt(mensaje);
  if (!seleccion) return equipoActual; // Mantiene el actual si cancela
  
  const indice = parseInt(seleccion) - 1;
  
  if (indice >= 0 && indice < equiposDisponibles.length) {
    return equiposDisponibles[indice];
  } else {
    alert('❌ Número inválido. Intenta de nuevo.');
    return seleccionarOCambiarEquipo(equipoActual); // Vuelve a preguntar
  }
}

// ✅ FUNCIÓN MEJORADA: Confirmar con opción de cambiar equipo
function confirmarConOpcionCambio(codigo, equipo, tipo, nombreExtra = '') {
  while (true) {
    let mensaje = `✅ Confirmar registro ${tipo.toUpperCase()}:\n\n`;
    
    if (nombreExtra) {
      mensaje += `Nombre: ${nombreExtra}\n`;
    }
    mensaje += `Código: ${codigo}\n`;
    mensaje += `Equipo: ${equipo}\n\n`;
    mensaje += `Opciones:\n`;
    mensaje += `1. ✅ GUARDAR (equipo correcto)\n`;
    mensaje += `2. 🔄 CAMBIAR equipo\n`;
    mensaje += `3. ❌ CANCELAR\n\n`;
    mensaje += `Escribe el NÚMERO de tu opción:`;
    
    const opcion = prompt(mensaje);
    
    if (!opcion || opcion === '3') {
      return null; // Usuario canceló
    }
    
    if (opcion === '1') {
      return equipo; // Confirma y guarda
    }
    
    if (opcion === '2') {
      const nuevoEquipo = seleccionarOCambiarEquipo(equipo);
      if (nuevoEquipo) {
        equipo = nuevoEquipo;
        // Actualizar ultimoEquipoSeleccionado
        ultimoEquipoSeleccionado = nuevoEquipo;
      }
      continue; // Vuelve a mostrar confirmación con nuevo equipo
    }
    
    alert('❌ Opción inválida. Intenta de nuevo.');
  }
}

// Público
if (btnRegistrarPublico && inputCodigoManual) {
  btnRegistrarPublico.addEventListener('click', () => {
    const codigo = inputCodigoManual.value.trim();
    if (!codigo) {
      alert('❌ Escribe o pega el código / nombre primero');
      return;
    }
    
    let equipoFinal = ultimoEquipoSeleccionado;
    
    // Si no hay equipo, OBLIGAR a seleccionar
    if (!equipoFinal) {
      alert('⚠️ DEBES SELECCIONAR UN EQUIPO PRIMERO\n\n1. Ve a "Equipos / Ventas"\n2. Toca el botón + (verde) del equipo correcto\n3. Luego vuelve aquí');
      return;
    }
    
    // Confirmar con opción de cambiar
    const equipoConfirmado = confirmarConOpcionCambio(codigo, equipoFinal, 'público');
    if (!equipoConfirmado) return;

    sendToGoogleForm(codigo, equipoConfirmado, 'publico');
    alert('✅ Registro de PÚBLICO guardado correctamente.');
    inputCodigoManual.value = '';
  });
}

// Jugador
if (btnRegistrarJugador && inputCodigoManual) {
  btnRegistrarJugador.addEventListener('click', () => {
    const codigo = inputCodigoManual.value.trim();
    if (!codigo) {
      alert('❌ Escribe o pega el código / nombre primero');
      return;
    }
    
    let equipoFinal = ultimoEquipoSeleccionado;
    
    // Si no hay equipo, OBLIGAR a seleccionar
    if (!equipoFinal) {
      alert('⚠️ DEBES SELECCIONAR UN EQUIPO PRIMERO\n\n1. Ve a "Equipos / Ventas"\n2. Toca el botón + (verde) del equipo correcto\n3. Luego vuelve aquí');
      return;
    }

    const nombreJugador = prompt('👤 Nombre del JUGADOR (ej. Juan Pérez):', '');
    if (!nombreJugador || !nombreJugador.trim()) {
      alert('❌ Debes escribir el nombre del jugador');
      return;
    }
    
    // Confirmar con opción de cambiar
    const equipoConfirmado = confirmarConOpcionCambio(codigo, equipoFinal, 'jugador', nombreJugador);
    if (!equipoConfirmado) return;

    sendToGoogleForm(codigo, equipoConfirmado, 'jugador', nombreJugador);
    alert('✅ Registro de JUGADOR guardado correctamente.');
    inputCodigoManual.value = '';
  });
}

// Directiva
if (btnRegistrarDirectiva && inputCodigoManual) {
  btnRegistrarDirectiva.addEventListener('click', () => {
    const codigo = inputCodigoManual.value.trim();
    if (!codigo) {
      alert('❌ Escribe o pega el código / nombre primero');
      return;
    }
    
    let equipoFinal = ultimoEquipoSeleccionado;
    
    // Si no hay equipo, OBLIGAR a seleccionar
    if (!equipoFinal) {
      alert('⚠️ DEBES SELECCIONAR UN EQUIPO PRIMERO\n\n1. Ve a "Equipos / Ventas"\n2. Toca el botón + (verde) del equipo correcto\n3. Luego vuelve aquí');
      return;
    }

    const nombreDirectiva = prompt('🏆 Nombre de la DIRECTIVA (ej. Presidente, Delegado):', '');
    if (!nombreDirectiva || !nombreDirectiva.trim()) {
      alert('❌ Debes escribir el nombre/cargo de la directiva');
      return;
    }
    
    // Confirmar con opción de cambiar
    const equipoConfirmado = confirmarConOpcionCambio(codigo, equipoFinal, 'directiva', nombreDirectiva);
    if (!equipoConfirmado) return;

    sendToGoogleForm(codigo, equipoConfirmado, 'directiva', nombreDirectiva);
    alert('✅ Registro de DIRECTIVA guardado correctamente.');
    inputCodigoManual.value = '';
  });
}

// ================== EVENTOS GENERALES ==================
btnStart.addEventListener('click', startScan);
btnStop.addEventListener('click', stopScan);
btnCopyCode.addEventListener('click', copyCode);

btnSendForm.addEventListener('click', () => {
  const code = codeDiv.textContent.trim();
  if (!code) return alert('No hay código escaneado');

  if (!ultimoEquipoSeleccionado) {
    return alert('Primero selecciona un equipo (toca su botón de ventas)');
  }

  sendToGoogleForm(code, ultimoEquipoSeleccionado);
  alert(`Código y equipo "${ultimoEquipoSeleccionado}" enviados al formulario`);
});

btnGenBarcode.addEventListener('click', generateBarcode);
btnGenQR.addEventListener('click', generateQR);

btnDownloadPng.addEventListener('click', () => {
  const tipo = confirm('Aceptar = Código de BARRAS, Cancelar = Código QR')
    ? 'barras'
    : 'qr';
  downloadCanvasImage(tipo, 'png');
});

btnDownloadJpg.addEventListener('click', () => {
  const tipo = confirm('Aceptar = Código de BARRAS, Cancelar = Código QR')
    ? 'barras'
    : 'qr';
  downloadCanvasImage(tipo, 'jpg');
});

// === ABRIR FORM DE GOOGLE CON DATOS DEL USUARIO ===
function abrirFormEscaneo() {
  const codigo = sessionStorage.getItem('codigo'); // AGE-01 / SUP-01 / CEO-01
  const rango  = sessionStorage.getItem('usuario'); // Agente / Supervisor / CEO

  if (!codigo || !rango) {
    alert('Debes iniciar sesión para registrar en el formulario.');
    return;
  }

  const baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvuVe2ckG2xfz3pvU-v5z9edLAVbtA/viewform?usp=pp_url';

  const url = `${baseUrl}&entry.1375230144=${encodeURIComponent(codigo)}&entry.2139797690=${encodeURIComponent(rango)}`;

  window.open(url, '_blank');
}
