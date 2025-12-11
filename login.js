// === USUARIOS Y PERMISOS ===
const USUARIOS = {
  ceo: { pass: 'HALCO2025MARCOS', rol: 'CEO', permisos: ['todo'] },
  supervisor: { pass: 'SupPucala2025', rol: 'Supervisor', permisos: ['scan','crear','editar'] },
  agente: { pass: 'VENDEDOR00', rol: 'Agente', permisos: ['scan','crear'] }
};

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
  const rol = document.getElementById('userRole').value;
  const pass = document.getElementById('userPass').value;
  const btn = document.getElementById('btnLogin');

  if (!rol || !USUARIOS[rol] || USUARIOS[rol].pass !== pass) {
    document.getElementById('loginError').style.display = 'block';
    return;
  }

  sessionStorage.setItem('rol', rol);
  sessionStorage.setItem('usuario', USUARIOS[rol].rol);

  document.getElementById('loginError').style.display = 'none';
  btn.textContent = '✅ Accediendo...';
  btn.disabled = true;

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 800);
};
