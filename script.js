// ================== CONFIG GOOGLE FORM ==================
const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/u/0/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvUVe2ckG2xfz3pvU-v5z9edLAVbtA/formResponse";
// CAMBIA esto por tu entry real desde la pestaña Payload/Form Data
const GOOGLE_ENTRY_CODE = "entry.XXXXXXXXXX";  // <-- reemplaza XXXXXXXXXX

// ================== VARIABLES GLOBALES ==================
let scanner = null;
let excelData = [];
let jsBarcodeLoaded = false;

const resultDiv = document.getElementById('result');
const codeDiv = document.getElementById('code');
const excelBtn = document.getElementById('btnAddExcel');
const excelSection = document.getElementById('excelSection');

const beepAudio = document.getElementById('beepAudio');

// Botones
const btnStart = document.getElementById('btnStart');
const btnStop = document.getElementById('btnStop');
const btnCopyCode = document.getElementById('btnCopyCode');
const btnSendAPI = document.getElementById('btnSendAPI');
const btnShareNative = document.getElementById('btnShareNative');
const btnShareWhatsApp = document.getElementById('btnShareWhatsApp');
const btnShareTelegram = document.getElementById('btnShareTelegram');
const btnDownloadTxt = document.getElementById('btnDownloadTxt');
const btnShareImage = document.getElementById('btnShareImage');
const btnGenBarcode = document.getElementById('btnGenBarcode');
const btnGenQR = document.getElementById('btnGenQR');
const btnDownloadPng = document.getElementById('btnDownloadPng');
const btnDownloadJpg = document.getElementById('btnDownloadJpg');
const btnDownloadExcel = document.getElementById('btnDownloadExcel');
const btnCopyExcel = document.getElementById('btnCopyExcel');

// ================== SONIDO PIP ==================
function playBeep() {
    if (!beepAudio) return;
    beepAudio.currentTime = 0;
    beepAudio.play().catch(() => {});
}

// ================== ESCÁNER ==================
async function startScan() {
    scanner = new Html5Qrcode("reader");
    const config = {
        fps: 10,
        qrbox: { width: 300, height: 220 }
    };

    try {
        await scanner.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
                playBeep();
                codeDiv.textContent = decodedText;
                resultDiv.style.display = 'block';

                sendToGoogleForm(decodedText);   // guarda en Form
                addToExcelData(decodedText, 'Escaneado');
                stopScan();
            },
            () => {}
        );
    } catch (err) {
        alert("Error cámara: " + err);
    }
}

function stopScan() {
    if (scanner) {
        scanner.stop().then(() => scanner.clear());
        scanner = null;
    }
}

// ================== GENERADOR CÓDIGO DE BARRAS ==================
function ensureJsBarcode(callback) {
    if (jsBarcodeLoaded) return callback();
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js';
    script.onload = () => { jsBarcodeLoaded = true; callback(); };
    document.head.appendChild(script);
}

function generateBarcode() {
    const code = document.getElementById('codigoInput').value.trim();
    if (!code) return alert('Escribe un código primero');

    ensureJsBarcode(() => {
        const canvas = document.getElementById('barcodeCanvas');
        canvas.style.display = 'block';
        JsBarcode(canvas, code, {
            format: "CODE128",
            width: 2,
            height: 80,
            displayValue: true,
            fontSize: 16
        });
        excelBtn.style.display = 'inline-block';
    });
}

// ================== GENERADOR QR (qrcode-generator) ==================
function generateQR() {
    const code = document.getElementById('codigoInput').value.trim();
    if (!code) return alert('Escribe un código primero');

    const canvas = document.getElementById('qrCanvas');
    const ctx = canvas.getContext('2d');
    canvas.style.display = 'block';

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

    excelBtn.style.display = 'inline-block';
}

function addToExcelFromInput() {
    const code = document.getElementById('codigoInput').value.trim();
    if (!code) return alert('Escribe un código primero');
    addToExcelData(code, 'Generado');
}

// ================== EXCEL LOCAL ==================
function addToExcelData(code, tipo) {
    excelData.push({
        codigo: code,
        tipo: tipo,
        fecha: new Date().toLocaleString('es-PE')
    });
    updateExcelPreview();
    if (excelData.length > 0) {
        excelSection.style.display = 'block';
    }
}

function updateExcelPreview() {
    const texto = excelData
        .map(row => `${row.codigo}\t${row.tipo}\t${row.fecha}`)
        .join('\n');

    document.getElementById('excelPreview').innerHTML =
        `<p>${excelData.length} códigos listos</p><pre>${texto}</pre>`;
}

function downloadExcel() {
    const encabezado = 'CÓDIGO\tTIPO\tFECHA\n';
    const filas = excelData
        .map(row => `${row.codigo}\t${row.tipo}\t${row.fecha}`)
        .join('\n');
    const tsv = encabezado + filas;

    const blob = new Blob([tsv], { type: 'text/tab-separated-values' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codigos_' + new Date().toISOString().slice(0,10) + '.tsv';
    a.click();
    URL.revokeObjectURL(url);
}

function copyExcel() {
    const tsv = excelData
        .map(row => `${row.codigo}\t${row.tipo}\t${row.fecha}`)
        .join('\n');
    navigator.clipboard.writeText(tsv)
        .then(() => alert('Copiado. Pega en Excel o Google Sheets.'));
}

// ================== UTILIDADES CÓDIGO ==================
function copyCode() {
    const text = codeDiv.textContent.trim();
    if (!text) return;
    navigator.clipboard.writeText(text)
        .then(() => alert('Código copiado.'));
}

async function sendToAPI() {
    const code = codeDiv.textContent.trim();
    if (!code) return alert('No hay código escaneado.');
    const url = 'TU_API_URL_AQUI';

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo: code })
        });
        if (!resp.ok) throw new Error('Respuesta no OK');
        alert('✅ Enviado correctamente.');
    } catch (err) {
        alert('Error enviando a la API: ' + err.message);
    }
}

// ================== ENVIAR A GOOGLE FORM ==================
function sendToGoogleForm(codigo) {
    if (!GOOGLE_ENTRY_CODE.includes("entry.")) return; // por si aún no configuras

    const formData = new FormData();
    formData.append(GOOGLE_ENTRY_CODE, codigo);

    fetch(GOOGLE_FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    }).catch(() => {});
}

// ================== COMPARTIR TEXTO ==================
function getShareText() {
    const code = codeDiv.textContent.trim();
    return code ? `Código: ${code}` : '';
}

function shareNative() {
    const text = getShareText();
    if (!text) return alert('No hay código para compartir');

    if (navigator.share) {
        navigator.share({
            title: 'Código de barras',
            text: text
        }).catch(() => {});
    } else {
        alert('Compartir nativo no soportado en este navegador');
    }
}

function shareWhatsApp() {
    const text = encodeURIComponent(getShareText());
    if (!text) return alert('No hay código para compartir');
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
}

function shareTelegram() {
    const text = encodeURIComponent(getShareText());
    if (!text) return alert('No hay código para compartir');
    const url = `https://t.me/share/url?text=${text}`;
    window.open(url, '_blank');
}

function downloadTxt() {
    const text = getShareText();
    if (!text) return alert('No hay código para descargar');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codigo.txt';
    a.click();
    URL.revokeObjectURL(url);
}

// ================== IMAGEN (BARRAS o QR) ==================
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

async function shareBarcodeImage() {
    const canvas = document.getElementById('barcodeCanvas');
    if (!canvas || canvas.style.display === 'none') {
        return alert('Primero genera un código de barras');
    }

    const dataURL = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataURL)).blob();
    const file = new File([blob], 'codigo_barras.png', { type: 'image/png' });

    const shareData = { files: [file], title: 'Código de barras' };

    if (navigator.canShare && navigator.canShare(shareData) && navigator.share) {
        await navigator.share(shareData).catch(() => {});
    } else {
        alert('Tu navegador no soporta compartir imágenes directamente');
    }
}

// ================== EVENT LISTENERS ==================
btnStart.addEventListener('click', startScan);
btnStop.addEventListener('click', stopScan);
btnCopyCode.addEventListener('click', copyCode);
btnSendAPI.addEventListener('click', sendToAPI);
btnShareNative.addEventListener('click', shareNative);
btnShareWhatsApp.addEventListener('click', shareWhatsApp);
btnShareTelegram.addEventListener('click', shareTelegram);
btnDownloadTxt.addEventListener('click', downloadTxt);
btnShareImage.addEventListener('click', shareBarcodeImage);
btnGenBarcode.addEventListener('click', generateBarcode);
btnGenQR.addEventListener('click', generateQR);
excelBtn.addEventListener('click', addToExcelFromInput);

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

btnDownloadExcel.addEventListener('click', downloadExcel);
btnCopyExcel.addEventListener('click', copyExcel);
