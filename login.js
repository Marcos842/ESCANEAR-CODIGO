// === USUARIOS Y PERMISOS (CON CÓDIGO) ===
const USUARIOS = {
  "CEO-01": { pass: "HALCO2025MARCOS", rol: "CEO", permisos: ["todo"], rolClave: "ceo" },

  "SUP-01": { pass: "SupPucala2025S1", rol: "Supervisor", permisos: ["scan","crear","editar"], rolClave: "supervisor" },
  "SUP-02": { pass: "SupPucala2025S2", rol: "Supervisor", permisos: ["scan","crear","editar"], rolClave: "supervisor" },
  "SUP-03": { pass: "SupPucala2025S3", rol: "Supervisor", permisos: ["scan","crear","editar"], rolClave: "supervisor" },
  "SUP-04": { pass: "SupPucala2025S4", rol: "Supervisor", permisos: ["scan","crear","editar"], rolClave: "supervisor" },
  "SUP-05": { pass: "SupPucala2025S5", rol: "Supervisor", permisos: ["scan","crear","editar"], rolClave: "supervisor" },

  "AGE-01": { pass: "Vendedor00A1", rol: "Agente", permisos: ["scan","crear"], rolClave: "agente" },
  "AGE-02": { pass: "Vendedor00A2", rol: "Agente", permisos: ["scan","crear"], rolClave: "agente" },
  "AGE-03": { pass: "Vendedor00A3", rol: "Agente", permisos: ["scan","crear"], rolClave: "agente" },
  "AGE-04": { pass: "Vendedor00A4", rol: "Agente", permisos: ["scan","crear"], rolClave: "agente" },
  "AGE-05": { pass: "Vendedor00A5", rol: "Agente", permisos: ["scan","crear"], rolClave: "agente" }
};
// === OPCIONES DE CÓDIGO POR RANGO ===
const opcionesPorRango = {
  ceo: [
    { valor: "CEO-01", texto: "CEO-01" }
  ],
  supervisor: [
    { valor: "SUP-01", texto: "SUP-01" },
    { valor: "SUP-02", texto: "SUP-02" },
    { valor: "SUP-03", texto: "SUP-03" },
    { valor: "SUP-04", texto: "SUP-04" },
    { valor: "SUP-05", texto: "SUP-05" }
  ],
  agente: [
    { valor: "AGE-01", texto: "AGE-01" },
    { valor: "AGE-02", texto: "AGE-02" },
    { valor: "AGE-03", texto: "AGE-03" },
    { valor: "AGE-04", texto: "AGE-04" },
    { valor: "AGE-05", texto: "AGE-05" }
  ]
};

// Cuando cambie el rango, actualizar códigos
const selectRol = document.getElementById('userRole');
const selectCodigo = document.getElementById('codigoUsuario');

selectRol.addEventListener('change', () => {
  const rol = selectRol.value; // ceo / supervisor / agente
  // limpiar
  selectCodigo.innerHTML = '<option value="">Código</option>';

  if (!opcionesPorRango[rol]) return;

  opcionesPorRango[rol].forEach(op => {
    const opt = document.createElement('option');
    opt.value = op.valor;
    opt.textContent = op.texto;
    selectCodigo.appendChild(opt);
  });
});


// === BOTÓN MODO OSCURO (LUNA) ===
const btnThemeToggle = document.getElementById('btnThemeToggle');

if (btnThemeToggle) {
  btnThemeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });
}

// Mostrar / ocultar contraseña
document.getElementById('togglePass').onclick = function () {
  const input = document.getElementById('userPass');
  const isPass = input.type === 'password';
  input.type = isPass ? 'text' : 'password';
  this.textContent = isPass ? '🙈' : '👁️';
};

// Login
document.getElementById('btnLogin').onclick = function () {
  const rolSelect = document.getElementById('userRole').value; // ceo / supervisor / agente
  const codigo = document.getElementById('codigoUsuario').value; // CEO-01, SUP-01, AGE-01, etc.
  const pass = document.getElementById('userPass').value;
  const btn = document.getElementById('btnLogin');

  const user = USUARIOS[codigo];

  // Validar que exista el código, contraseña correcta y que coincida con el rango elegido
  if (
    !rolSelect ||
    !codigo ||
    !user ||
    user.pass !== pass ||
    user.rolClave !== rolSelect
  ) {
    document.getElementById('loginError').style.display = 'block';
    return;
  }

  // Guardar datos de sesión
  sessionStorage.setItem('rol', user.rolClave);     // ceo / supervisor / agente
  sessionStorage.setItem('usuario', user.rol);      // CEO / Supervisor / Agente
  sessionStorage.setItem('codigo', codigo);         // CEO-01, SUP-01, AGE-01
  sessionStorage.setItem('permisos', JSON.stringify(user.permisos));

  const formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSe_0E3-hsF4nbq0nArjQvuVe2ckG2xfz3pvU-v5z9edLAVbtA/formResponse';
  const formData = new URLSearchParams();
  formData.append('entry.1375230144', codigo);  // USUARIO
  formData.append('entry.2139797690', user.rol); // RANGO_ENTRANTE

  navigator.sendBeacon(formUrl, formData);

  // Historial de accesos básico
  const acceso = {
    codigo: codigo,
    rol: user.rol,
    fecha: new Date().toLocaleString('es-PE')
  };
  let historial = JSON.parse(localStorage.getItem('historialAccesos')) || [];
  historial.unshift(acceso);
  localStorage.setItem('historialAccesos', JSON.stringify(historial));

  document.getElementById('loginError').style.display = 'none';
  btn.textContent = '✅ Accediendo...';
  btn.disabled = true;

  const ahora = Date.now();
  sessionStorage.setItem('inicioSesion', String(ahora));

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 800);
};
