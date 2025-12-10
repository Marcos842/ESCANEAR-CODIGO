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
      (decodedText, decodedResult) => {
        playBeep();
        codeDiv.textContent = decodedText;
        resultDiv.style.display = 'block';
        stopScan();
      },
      (errorMessage) => {
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


// ================== ENVIAR A GOOGLE FORM ==================
function sendToGoogleForm(codigo, equipoSeleccionado) {
  if (!codigo) return;

  const formData = new FormData();
  formData.append(GOOGLE_ENTRY_CODE, codigo);

  if (equipoSeleccionado) {
    formData.append(GOOGLE_ENTRY_EQUIPO, equipoSeleccionado);
  }

  fetch(GOOGLE_FORM_ACTION, {
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
    totalMontoCircle.textContent = total * 3;
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

    // +
    const btnMas = document.createElement('button');
    btnMas.textContent = '+';
    btnMas.className = 'btn btn-green';
    btnMas.addEventListener('click', () => {
      equipos[nombre] += 1;
      ultimoEquipoSeleccionado = nombre;
      guardarEquipos();
      renderEquipos();
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
}





// pintar equipos al cargar
renderEquipos();

// ================== REGISTRO MANUAL DE CÓDIGO ==================

const btnRegistrarManual = document.getElementById('btnRegistrarManual');
const inputCodigoManual = document.getElementById('codigoManual');

if (btnRegistrarManual && inputCodigoManual) {
  btnRegistrarManual.addEventListener('click', () => {
    const codigo = inputCodigoManual.value.trim();
    if (!codigo) {
      alert('Escribe o pega el código primero');
      return;
    }
    // usa último equipo seleccionado si existe
    sendToGoogleForm(codigo, ultimoEquipoSeleccionado);
    alert('Código registrado correctamente.');
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






