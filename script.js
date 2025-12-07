// ================== CONFIG GOOGLE FORM ==================
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvuVe2ckG2xfz3pvU-v5z9edLAVbtA/formResponse";

const GOOGLE_ENTRY_CODE = "entry.1389898450";

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
  // indicar formatos que queremos (QR + barras comunes)
  const formatsToSupport = [
    Html5QrcodeSupportedFormats.QR_CODE,
    Html5QrcodeSupportedFormats.CODE_128,
    Html5QrcodeSupportedFormats.CODE_39,
    Html5QrcodeSupportedFormats.EAN_13,
    Html5QrcodeSupportedFormats.EAN_8,
    Html5QrcodeSupportedFormats.UPC_A,
    Html5QrcodeSupportedFormats.UPC_E
  ];

  // pasar formatsToSupport EN EL CONSTRUCTOR
  scanner = new Html5Qrcode("reader", {
    formatsToSupport: formatsToSupport,
    experimentalFeatures: {
      useBarCodeDetectorIfSupported: true
    }
  });

  const config = {
    fps: 10,
    qrbox: { width: 300, height: 120 }, // más ancho para barras
    disableFlip: true
  };

  try {
    await scanner.start(
      { facingMode: "environment" },
      config,
      (decodedText, decodedResult) => {
        // callback de éxito
        playBeep();
        codeDiv.textContent = decodedText;
        resultDiv.style.display = 'block';
        stopScan();
      },
      (errorMessage) => {
        // callback de error por frame; lo dejamos vacío
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
function sendToGoogleForm(codigo) {
  if (!codigo) return;
  const formData = new FormData();
  formData.append(GOOGLE_ENTRY_CODE, codigo);

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

    // JsBarcode SOLO acepta canvas, img, svg o un selector;
    // aquí le pasamos directamente el canvas
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

// ================== EVENTOS ==================
btnStart.addEventListener('click', startScan);
btnStop.addEventListener('click', stopScan);

btnCopyCode.addEventListener('click', copyCode);

btnSendForm.addEventListener('click', () => {
  const code = codeDiv.textContent.trim();
  if (!code) return alert('No hay código escaneado');
  sendToGoogleForm(code);
  alert('Código enviado al formulario');
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
