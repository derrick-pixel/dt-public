// brand-bootstrap.js — hydrates meta.brand_tokens from JSON into CSS custom properties.
// Call applyBrand(brandTokens) once per page after loadAppData() resolves so the page
// re-skins itself if the underlying project ever changes.

const TOKEN_TO_VAR = {
  primary: '--brand-primary',
  secondary: '--brand-secondary',
  accent: '--brand-accent',
  neutral_dark: '--neutral-dark',
  neutral_light: '--neutral-light',
  font_display: '--font-display',
  font_body: '--font-body',
};

function hexToRgba(hex, alpha) {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex || '');
  if (!m) return null;
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 0xff;
  const g = (v >> 8) & 0xff;
  const b = v & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function applyBrand(brand) {
  if (!brand || typeof brand !== 'object') return;
  const root = document.documentElement;
  for (const [k, cssVar] of Object.entries(TOKEN_TO_VAR)) {
    if (brand[k]) root.style.setProperty(cssVar, brand[k]);
  }
  if (brand.primary) {
    const fill = hexToRgba(brand.primary, 0.32);
    const soft = hexToRgba(brand.accent || brand.primary, 0.14);
    if (fill) root.style.setProperty('--us-fill', fill);
    if (soft) root.style.setProperty('--accent-soft', soft);
  }
}

// Load Google Fonts (Noto Serif + Manrope) once. Idempotent.
let fontsLoaded = false;
export function ensureFonts() {
  if (fontsLoaded || typeof document === 'undefined') return;
  fontsLoaded = true;
  const preconn = document.createElement('link');
  preconn.rel = 'preconnect';
  preconn.href = 'https://fonts.gstatic.com';
  preconn.crossOrigin = 'anonymous';
  document.head.appendChild(preconn);
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Noto+Serif:ital,wght@0,400;0,600;0,700;1,400&display=swap';
  document.head.appendChild(link);
}
