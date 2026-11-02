(() => {
  'use strict';
  // Run before styles load so the saved appearance is visible on the first paint.
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let appearance = 'system';
  function apply(value) {
    appearance = ['light', 'dark'].includes(value) ? value : 'system';
    const theme = appearance === 'system' ? (system.matches ? 'dark' : 'light') : appearance;
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const color = document.querySelector('meta[name="theme-color"]');
    if (color) color.setAttribute('content', theme === 'dark' ? '#11191e' : '#f2f5f8');
  }
  try {
    appearance = JSON.parse(localStorage.getItem('mots.settings.v2') || '{}')?.appearance;
  } catch {
    // The app reports unavailable storage; appearance can still follow the system.
  }
  apply(appearance);
  system.addEventListener('change', () => apply(appearance));
  window.MotsTheme = Object.freeze({ apply });
})();
