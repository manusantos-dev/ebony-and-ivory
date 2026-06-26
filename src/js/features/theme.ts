// INIT: Visual Theme & Zen Mode Controller
export function initThemeControls(): void {
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') document.body.classList.add('dark-theme');

  const themeBtn = document.createElement('button');
  themeBtn.className = 'btn btn-ghost theme-toggle';
  themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  themeBtn.onclick = () => {
    document.body.classList.toggle('dark-theme');
    const isDark = document.body.classList.contains('dark-theme');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
  };

  const langSwitch = document.querySelector('.lang-switch');
  if (langSwitch) langSwitch.before(themeBtn);

  const zenBtn = document.createElement('button');
  zenBtn.className = 'btn-ghost-small zen-toggle';
  zenBtn.textContent = '👁️ Modo Zen';
  zenBtn.onclick = () => document.body.classList.add('zen-mode');

  const editorActions = document.getElementById('editorActions');
  if (editorActions) editorActions.prepend(zenBtn);

  const exitZenBtn = document.createElement('button');
  exitZenBtn.className = 'btn-exit-zen';
  exitZenBtn.innerHTML = '❌ Salir (Esc)';
  exitZenBtn.onclick = () => document.body.classList.remove('zen-mode');
  document.body.appendChild(exitZenBtn);

  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && document.body.classList.contains('zen-mode')) {
      document.body.classList.remove('zen-mode');
    }
  });
}
