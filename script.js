// ================== ROLES Y BARRA SUPERIOR ==================

// Verificar rol actual
function getRolActual() {
  return sessionStorage.getItem('rol') || null;
}

function esCEO() { return getRolActual() === 'ceo'; }
function esSupervisor() { return getRolActual() === 'supervisor'; }

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
  const rol = getRolActual();
  const linkSesion = document.getElementById('linkSesion');
  const linkInicio = document.getElementById('linkInicio');
  const linkSoporte = document.getElementById('linkSoporte');

  if (!linkSesion) return; // por si se llama antes de cargar el DOM

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

const lblTiempo = document.getElementById('lblTiempoAgente'); // span en la top-bar
const inicioSesion = Number(sessionStorage.getItem('inicioSesion') || 0);

if (lblTiempo && inicioSesion) {
  const actualizarTiempo = () => {
    const diffMs = Date.now() - inicioSesion;
    const totalSeg = Math.floor(diffMs / 1000);
    const horas = Math.floor(totalSeg / 3600);
    const mins = Math.floor((totalSeg % 3600) / 60);
    const segs = totalSeg % 60;

    const hh = String(horas).padStart(2, '0');
    const mm = String(mins).padStart(2, '0');
    const ss = String(segs).padStart(2, '0');

    lblTiempo.textContent = `Tiempo activo: ${hh}:${mm}:${ss}`;
  };

  actualizarTiempo();               // al entrar
  setInterval(actualizarTiempo, 1000); // cada 1 segundo
}

// ================== CONFIG GOOGLE FORM ==================
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvuVe2ckG2xfz3pvU-v5z9edLAVbtA/formResponse";

const GOOGLE_ENTRY_CODE = "entry.1389898450";        // Código escaneado
const GOOGLE_ENTRY_EQUIPO = "entry.1581479368";      // Campo EQUIPO

// ================== VARIABLES ==================
let scanner = null;

const beepAudio = document.getElementById('beepAudio');

const resultDiv = document.getElementById('result');
const codeDiv = document.getElementById('code');

const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnCopyCode = document.getElementById('btnCopyCode');
const btnSendForm = document.getElementById('btnSendForm');

const btnGenBarcode = document.getElementById('btnGenBarcode');
const btnGenQR = document.getElementById('btnGenQR');
const btnDownloadPng = document.getElementById('btnDownloadPng');
const btnDownloadJpg = document.getElementById('btnDownloadJpg');

// === BOTONES PANEL LATERAL Y RESUMEN (SOLO CEO) ===
const btnJugadores  = document.getElementById('btnJugadores');
const btnDirectiva  = document.getElementById('btnDirectiva');
const tituloResumen = document.querySelector('.side-panel h4');
const panelAgentes  = document.getElementById('panelAgentes');

if (!esCEO()) {
  // Si NO es CEO, ocultamos todo lo sensible
  if (btnJugadores)  btnJugadores.style.display  = 'none';
  if (btnDirectiva)  btnDirectiva.style.display  = 'none';
  if (tituloResumen) tituloResumen.style.display = 'none';
  if (panelAgentes)  panelAgentes.style.display  = 'none';
} else {
  // Si es CEO, activamos botones y mostramos todo
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
      () => {
        // errores por frame, ignorar
      }
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
const GOOGLEFORMACTION = 'https://docs.google.com/forms/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvuVe2ckG2xfz3pvU-v5z9edLAVbtA/formResponse';

const GOOGLEENTRYCODE     = 'entry.1389898450'; // Código escaneado
const GOOGLEENTRYEQUIPO   = 'entry.1581479368'; // Equipo
const GOOGLEENTRYJUGADOR  = 'entry.74934614';   // JUGADOR
const GOOGLEENTRYDIRECTIVA = 'entry.822667573'; // DIRECTIVA

/**
 * tipoRegistro:
 *  - 'publico'   -> solo código + equipo (como antes)
 *  - 'jugador'   -> llena campo JUGADOR
 *  - 'directiva' -> llena campo DIRECTIVA
 */
function sendToGoogleForm(codigo, equipoSeleccionado, tipoRegistro = 'publico', nombrePersona = '') {
  if (!codigo) return;

  const formData = new FormData();
  formData.append(GOOGLEENTRYCODE, codigo);

  if (equipoSeleccionado) {
    formData.append(GOOGLEENTRYEQUIPO, equipoSeleccionado);
  }

  // Limpiamos el texto por si acaso
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

  const modules = qr.getModuleCount();
  const cellSize = Math.floor(canvas.width / modules);
  const margin = Math.floor((canvas.width - cellSize * modules) / 2);

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

  const mime = format === 'jpg' ? 'image/jpeg' : 'image/png';
  const dataURL = canvas.toDataURL(mime);

  const a = document.createElement('a');
  a.href = dataURL;
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
const btnClearQR = document.getElementById('btnClearQR');
const barcodeCanvas = document.getElementById('barcodeCanvas');
const qrCanvas = document.getElementById('qrCanvas');

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
const inputEquipo = document.getElementById('nuevoEquipo');
const btnAddEquipo = document.getElementById('btnAddEquipo');
const listaEquipos = document.getElementById('listaEquipos');

// registro por agente (usar código único)
const nombreAgente = sessionStorage.getItem('codigo') || 'Sin código';
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
  card.dataset.monto = monto;
}

// calcula equipo top global (entre todos los equipos)
function actualizarTopEquipo() {
  let topNombre = '—';
  let topMonto = -1;

  document.querySelectorAll('.equipo-card').forEach(card => {
    const header = card.querySelector('.equipo-card-header');
    if (!header) return;
    const nombre = header.textContent.trim();
    const monto = Number(card.dataset.monto || 0);

    if (monto > topMonto) {
      topMonto = monto;
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

// panel lateral: resumen por agente
function renderPanelAgentes() {
  const panel = document.getElementById('panelAgentes');
  if (!panel) return;

  panel.innerHTML = '';

  Object.keys(ventasPorAgente).forEach(nombre => {
    const data = ventasPorAgente[nombre];
    const div = document.createElement('div');
    div.style.marginBottom = '6px';
    div.style.padding = '4px 6px';
    div.style.background = '#ffffff';
    div.style.borderRadius = '6px';

    const topEq = data.topEquipo || '—';
    const fecha = data.fecha || 'sin fecha';
    div.textContent = `${nombre}: ${data.tickets} tickets / S/ ${data.monto} / Top: ${topEq} / ${fecha}`;

    // ESTA LÍNEA FALTABA
    panel.appendChild(div);
  });
}


// FECHA DE RESUMEN DE CUADRO QUE SOLO VE EL CEO // 
const btnClearResumen = document.getElementById('btnClearResumen');
if (btnClearResumen && esCEO()) {
  btnClearResumen.addEventListener('click', () => {
    if (!confirm('¿Borrar el resumen de agentes? Esto no borra los datos del Google Sheet.')) return;
    Object.keys(ventasPorAgente).forEach(k => delete ventasPorAgente[k]);
    guardarVentasAgente();
    renderPanelAgentes();
  });
}




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
  const totalMontoCircle = document.getElementById('totalMontoCircle');
  if (totalTicketsCircle && totalMontoCircle) {
    totalTicketsCircle.textContent = total;
    totalMontoCircle.textContent = total * 3; // precio por ticket
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
    let montoEquipo = ticketsEquipo * 3;

    // guardamos en data- atributos para usar en "equipo top"
    setDatosEquipo(card, ticketsEquipo, montoEquipo);

    // +
    const btnMas = document.createElement('button');
    btnMas.textContent = '+';
    btnMas.className = 'btn btn-green';
    btnMas.addEventListener('click', () => {
      equipos[nombre] += 1;
      ultimoEquipoSeleccionado = nombre;

      // registrar en ventasPorAgente
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

      // totales generales del agente
      dataAgente.tickets += 1;
      dataAgente.monto += 3; // precio por ticket

      // detalle por equipo para ese agente
      if (!dataAgente.equipos[nombre]) {
        dataAgente.equipos[nombre] = 0;
      }
      dataAgente.equipos[nombre] += 1;

      // recalcular equipo TOP del agente
      let mejorEquipo = '—';
      let maxTickets = -1;
      Object.keys(dataAgente.equipos).forEach(eq => {
        const t = dataAgente.equipos[eq];
        if (t > maxTickets) {
          maxTickets = t;
          mejorEquipo = eq;
        }
      });
      dataAgente.topEquipo = mejorEquipo;

      // guardar y refrescar todo
      guardarVentasAgente();
      guardarEquipos();
      renderEquipos();
      renderPanelAgentes();
    });
    body.appendChild(btnMas);

    // -
const btnMenos = document.createElement('button');
btnMenos.textContent = '-';
btnMenos.className = 'btn btn-yellow';

btnMenos.addEventListener('click', () => {
  if (equipos[nombre] > 0) {
    equipos[nombre] -= 1;
    ultimoEquipoSeleccionado = nombre;

    // Restar también al agente actual
    const dataAgente = ventasPorAgente[nombreAgente];
    if (dataAgente) {
      if (dataAgente.tickets > 0) dataAgente.tickets -= 1;
      if (dataAgente.monto > 0) dataAgente.monto -= 3;

      if (dataAgente.equipos && dataAgente.equipos[nombre]) {
        dataAgente.equipos[nombre] -= 1;
        if (dataAgente.equipos[nombre] <= 0) {
          delete dataAgente.equipos[nombre];
        }

        // recalcular equipo TOP del agente
        let mejorEquipo = '—';
        let maxTickets = -1;
        Object.keys(dataAgente.equipos).forEach(eq => {
          const t = dataAgente.equipos[eq];
          if (t > maxTickets) {
            maxTickets = t;
            mejorEquipo = eq;
          }
        });
        dataAgente.topEquipo = mejorEquipo;
      }
    }

    guardarVentasAgente();
    guardarEquipos();
    renderEquipos();
    renderPanelAgentes();
  }
});

body.appendChild(btnMenos);


    // EDITAR
    const btnEdit = document.createElement('button');
    btnEdit.className = 'btn btn-edit';
    btnEdit.textContent = '✏ Editar';
    btnEdit.addEventListener('click', () => {
      // Si ya es CEO o Supervisor, edita directo
      if (!esCEO() && !esSupervisor()) {
        // Agente: debe pedir permiso
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

        // Cambia estos valores para que coincidan con login.js
        const PASS_SUPERVISOR = 'SupPucala2025';
        const PASS_CEO = 'HALCO2025MARCOS';

        const ok =
          (tipo === 'S' && pass === PASS_SUPERVISOR) ||
          (tipo === 'C' && pass === PASS_CEO);

        if (!ok) {
          alert('Contraseña incorrecta. No se puede editar el equipo.');
          return;
        }
        // Si pasó la verificación, continúa y deja editar
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

    // ELIMINAR
    const btnDelete = document.createElement('button');
    btnDelete.className = 'btn btn-red';
    btnDelete.textContent = '✖';
    btnDelete.addEventListener('click', () => {
      // Solo CEO puede eliminar
      const PASS_CEO = 'HALCO2025MARCOS'; // misma que login.js
      if (!esCEO()) {
        const pass = prompt('🔐 Solo el CEO puede eliminar equipos.\nContraseña de CEO:');
        if (pass !== PASS_CEO) {
          alert('Contraseña incorrecta. No se eliminó el equipo.');
          return;
        }
      }
      if (confirm(`¿Eliminar el equipo "${nombre}"?`)) {
        delete equipos[nombre];
        guardarEquipos();
        renderEquipos();
      }
    });
    body.appendChild(btnDelete);

    card.appendChild(body);
    listaEquipos.appendChild(card);
  });

  // actualizar equipo top global
  actualizarTopEquipo();
}

// pintar equipos y panel de agentes al cargar
renderEquipos();
renderPanelAgentes();

// ================== REGISTRO MANUAL DE CÓDIGO ==================
const inputCodigoManual   = document.getElementById('codigoManual');
const btnRegistrarPublico = document.getElementById('btnRegistrarPublico');
const btnRegistrarJugador = document.getElementById('btnRegistrarJugador');
const btnRegistrarDirectiva = document.getElementById('btnRegistrarDirectiva');

function validarBaseManual() {
  const codigo = inputCodigoManual.value.trim();
  if (!codigo) {
    alert('Escribe o pega el código / nombre primero');
    return null;
  }
  if (!ultimoEquipoSeleccionado) {
    alert('Primero selecciona un equipo y suma al menos 1 ticket con el botón +');
    return null;
  }
  return codigo;
}

// Público (como antes)
if (btnRegistrarPublico && inputCodigoManual) {
  btnRegistrarPublico.addEventListener('click', () => {
    const codigo = validarBaseManual();
    if (!codigo) return;

    sendToGoogleForm(codigo, ultimoEquipoSeleccionado, 'publico');
    alert('Registro de PÚBLICO guardado correctamente.');
    inputCodigoManual.value = '';
  });
}

// Jugador
if (btnRegistrarJugador && inputCodigoManual) {
  btnRegistrarJugador.addEventListener('click', () => {
    const codigo = validarBaseManual();
    if (!codigo) return;

    const nombreJugador = prompt('Nombre del JUGADOR (ej. Juan Pérez):', '');
    if (!nombreJugador) return;

    sendToGoogleForm(codigo, ultimoEquipoSeleccionado, 'jugador', nombreJugador);
    alert('Registro de JUGADOR guardado correctamente.');
    inputCodigoManual.value = '';
  });
}

// Directiva
if (btnRegistrarDirectiva && inputCodigoManual) {
  btnRegistrarDirectiva.addEventListener('click', () => {
    const codigo = validarBaseManual();
    if (!codigo) return;

    const nombreDirectiva = prompt('Nombre de la DIRECTIVA (ej. Presidente, delegado):', '');
    if (!nombreDirectiva) return;

    sendToGoogleForm(codigo, ultimoEquipoSeleccionado, 'directiva', nombreDirectiva);
    alert('Registro de DIRECTIVA guardado correctamente.');
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
  const codigo = sessionStorage.getItem('codigo');   // AGE-01 / SUP-01 / CEO-01
  const rango  = sessionStorage.getItem('usuario');  // Agente / Supervisor / CEO

  if (!codigo || !rango) {
    alert('Debes iniciar sesión para registrar en el formulario.');
    return;
  }

  // URL base de tu formulario (sin parámetros)
  const baseUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvuVe2ckG2xfz3pvU-v5z9edLAVbtA/viewform?usp=pp_url';

  // entry.1375230144 -> USUARIO   |  entry.2139797690 -> RANGO_ENTRANTE
  const url = `${baseUrl}&entry.1375230144=${encodeURIComponent(codigo)}&entry.2139797690=${encodeURIComponent(rango)}`;

  window.open(url, '_blank');   // abre el Form en nueva pestaña
}
