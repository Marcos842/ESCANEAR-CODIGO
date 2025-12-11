// Leer preferencia guardada
const savedTheme = localStorage.getItem('theme'); // 'dark' o 'light'

if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
}

// Cambiar icono según tema actual
function updateThemeIcon() {
  const btn = document.getElementById('btnThemeToggle');
  if (!btn) return;
  const isDark = document.body.classList.contains('dark-mode');
  btn.textContent = isDark ? '☀️' : '🌙';
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btnThemeToggle');
  if (!btn) return;

  // Ajustar icono al cargar
  updateThemeIcon();

  btn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateThemeIcon();
  });
});
