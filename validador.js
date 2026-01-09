// ================== CONFIGURACIÓN ==================
const CLAVE_SECRETA = "2026halconesMarcosBarbozaD22";
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwcpSwMUvTf3774sok06FfRmxEHW_MtK8ykPGVDFz6B4n-T1GEJuQWX-8FCPBEmffw0/exec";

// ⬇️ 
if (typeof CryptoJS === 'undefined') {
    alert("❌ ERROR: CryptoJS no se cargó. Recarga la página.");
}

// ================== DESENCRIPTACIÓN LOCAL ==================
function desencriptarLocal(textoEncriptado) {
    try {
        const bytes = CryptoJS.AES.decrypt(textoEncriptado, CLAVE_SECRETA);
        const datosTexto = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!datosTexto) {
            return { valido: false, motivo: "QR inválido o clave incorrecta" };
        }
        
        const datos = JSON.parse(datosTexto);
        
        // Verificar expiración
        const ahora = new Date();
        const fechaExpiracion = new Date(datos.expira);
        
        if (fechaExpiracion < ahora) {
            return { valido: false, motivo: "Ticket expirado", datos };
        }
        
        return { valido: true, datos };
        
    } catch (error) {
        return { valido: false, motivo: "Error al desencriptar" };
    }
}

// ================== REGISTRAR EN SHEETS (JSONP) ==================
function registrarEnSheets(qrEncriptado, callback) {
    const callbackName = 'jsonpCallback_' + Date.now();
    
    window[callbackName] = function(response) {
        callback(response);
        // Limpiar
        delete window[callbackName];
        document.body.removeChild(script);
    };
    
    const url = `${WEB_APP_URL}?qr=${encodeURIComponent(qrEncriptado)}&callback=${callbackName}`;
    const script = document.createElement('script');
    script.src = url;
    script.onerror = function() {
        callback({ success: false, mensaje: "Error de conexión" });
        delete window[callbackName];
        document.body.removeChild(script);
    };
    
    document.body.appendChild(script);
}

// ================== VALIDAR Y REGISTRAR ==================
async function validarYRegistrar() {
    const qrInput = document.getElementById("qrInput").value.trim();
    const resultadoDiv = document.getElementById("resultado");
    const detallesDiv = document.getElementById("detalles");
    
    if (!qrInput) {
        mostrarError("Por favor, pega el código QR encriptado");
        return;
    }
    
    // Desencriptar localmente primero
    const resultado = desencriptarLocal(qrInput);
    
    if (!resultado.valido) {
        mostrarError(resultado.motivo);
        actualizarContador(false);
        return;
    }
    
    // Mostrar resultado válido
    mostrarExito(resultado.datos);
    actualizarContador(true);
    
    // Registrar en Google Sheets usando JSONP
    registrarEnSheets(qrInput, (data) => {
        if (data.success) {
            const registroMsg = document.createElement("p");
            registroMsg.innerHTML = "📝 <strong>Registrado en Google Sheets correctamente</strong>";
            registroMsg.style.color = "#2196F3";
            registroMsg.style.marginTop = "10px";
            detallesDiv.appendChild(registroMsg);
        } else {
            const errorMsg = document.createElement("p");
            errorMsg.innerHTML = "⚠️ <strong>Ticket válido pero no se pudo registrar en Google Sheets</strong>";
            errorMsg.style.color = "#FF9800";
            errorMsg.style.marginTop = "10px";
            detallesDiv.appendChild(errorMsg);
        }
    });
    
    // Limpiar input
    document.getElementById("qrInput").value = "";
}

// ================== INTERFAZ ==================
function mostrarError(motivo) {
    const resultadoDiv = document.getElementById("resultado");
    const detallesDiv = document.getElementById("detalles");
    
    resultadoDiv.className = "resultado error";
    resultadoDiv.innerHTML = `
        <h2>❌ ERROR</h2>
        <p><strong>Motivo:</strong> ${motivo}</p>
        <p>El código QR no es válido, está corrupto o no pertenece a este sistema.</p>
    `;
    
    detallesDiv.innerHTML = `
        <h3>🚫 ACCESO DENEGADO</h3>
    `;
    
    resultadoDiv.style.display = "block";
}

function mostrarExito(datos) {
    const resultadoDiv = document.getElementById("resultado");
    const detallesDiv = document.getElementById("detalles");
    
    const fechaExpira = new Date(datos.expira).toLocaleString('es-PE');
    
    resultadoDiv.className = "resultado exito";
    resultadoDiv.innerHTML = `
        <h2>✅ TICKET VÁLIDO</h2>
    `;
    
    detallesDiv.innerHTML = `
        <h3>📋 Detalles del Ticket:</h3>
        <ul>
            <li><strong>ID:</strong> ${datos.id}</li>
            <li><strong>Nombre:</strong> ${datos.nombre}</li>
            <li><strong>Evento:</strong> ${datos.evento}</li>
            <li><strong>Asiento:</strong> ${datos.asiento}</li>
            <li><strong>Precio:</strong> ${datos.precio}</li>
            <li><strong>Válido hasta:</strong> ${fechaExpira}</li>
        </ul>
        <h3 style="color: #4CAF50; margin-top: 20px;">🎉 ACCESO PERMITIDO</h3>
    `;
    
    resultadoDiv.style.display = "block";
}

function actualizarContador(esValido) {
    const span = document.getElementById("ticketsValidados");
    let contador = parseInt(localStorage.getItem("ticketsValidados") || "0");
    
    if (esValido) {
        contador++;
        localStorage.setItem("ticketsValidados", contador.toString());
    }
    
    span.textContent = contador;
}

// ================== INICIALIZACIÓN ==================
document.addEventListener("DOMContentLoaded", () => {
    // Cargar contador
    const contador = parseInt(localStorage.getItem("ticketsValidados") || "0");
    document.getElementById("ticketsValidados").textContent = contador;
    
    // Botón validar
    document.getElementById("btnValidar").addEventListener("click", validarYRegistrar);
    
    // Enter para validar
    document.getElementById("qrInput").addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            validarYRegistrar();
        }
    });
});
