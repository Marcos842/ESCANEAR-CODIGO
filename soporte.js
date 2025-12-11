// === CONFIG SOPORTE ===

// Mismo Google Form que el escáner (puedes cambiarlo si haces uno nuevo)
const SOPORTE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvuVe2ckG2xfz3pvU-v5z9edLAVbtA/formResponse";

// Usa los entry reales del formulario
const SOPORTE_ENTRY_NOMBRE   = "entry.2022577019";   // Nombre del agente
const SOPORTE_ENTRY_PROBLEMA = "entry.2117243958";   // Descripción del problema


// Número de WhatsApp en formato internacional sin + ni 0 inicial.
// Perú (+51) 904874232 => 51904874232
const WHATSAPP_NUM = "51904874232";

// Mensaje base para WhatsApp
function buildWhatsappUrl(nombre, problema) {
  let text = "Hola, soy " + (nombre || "AGENTE") +
    ". Tengo un problema " + (problema || "");
  const encoded = encodeURIComponent(text);
  return `https://wa.me/${WHATSAPP_NUM}?text=${encoded}`;
}

// Botón WhatsApp
const btnWhatsapp = document.getElementById('btnWhatsapp');
if (btnWhatsapp) {
  btnWhatsapp.addEventListener('click', () => {
    const nombre = (document.getElementById('nombreAgente')?.value || "").trim();
    const problema = (document.getElementById('descripcionProblema')?.value || "").trim();
    const url = buildWhatsappUrl(nombre, problema);
    window.open(url, "_blank");
  });
}

// Enviar reporte al mismo Google Form
const btnEnviarSoporte = document.getElementById('btnEnviarSoporte');
if (btnEnviarSoporte) {
  btnEnviarSoporte.addEventListener('click', () => {
    const nombre = (document.getElementById('nombreAgente')?.value || "").trim();
    const problema = (document.getElementById('descripcionProblema')?.value || "").trim();

    if (!nombre || !problema) {
      alert("Completa el nombre del agente y la descripción del problema.");
      return;
    }

    const formData = new FormData();
    formData.append(SOPORTE_ENTRY_NOMBRE, nombre);
    formData.append(SOPORTE_ENTRY_PROBLEMA, problema);

    fetch(SOPORTE_FORM_ACTION, {
      method: "POST",
      mode: "no-cors",
      body: formData
    })
    .then(() => {
      alert("Reporte enviado correctamente. Gracias.");
      document.getElementById('nombreAgente').value = "";
      document.getElementById('descripcionProblema').value = "";
    })
    .catch(() => {
      alert("No se pudo enviar el reporte. Intenta más tarde.");
    });
  });
}
