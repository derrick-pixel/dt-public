// radar.js — Chart.js radar builder. "us" gets thick + filled styling.
// "us" colour is read live from --brand-primary so a re-skin reflows visually.

const PALETTE = [
  'rgba(176, 91, 36, 1)',   // burnt sienna
  'rgba(78, 122, 154, 1)',  // muted blue
  'rgba(116, 78, 132, 1)',  // muted plum
  'rgba(60, 110, 70, 1)',   // forest
  'rgba(176, 53, 53, 1)',   // muted red
  'rgba(74, 100, 110, 1)',  // slate
  'rgba(180, 130, 60, 1)',  // ochre
  'rgba(110, 64, 50, 1)',   // cocoa
  'rgba(50, 110, 130, 1)',  // teal-blue
  'rgba(130, 90, 130, 1)',  // mauve
];

function readVar(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function hexToRgba(hex, alpha) {
  const m = (hex || '').match(/^#?([a-f0-9]{6})$/i);
  if (!m) return `rgba(13, 107, 92, ${alpha})`;
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 0xff;
  const g = (v >> 8) & 0xff;
  const b = v & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function buildRadarData({ dimensions, scores, competitorNames = {} }) {
  const labels = dimensions.map(d => d.label);
  const ids = Object.keys(scores);
  const ordered = ['us', ...ids.filter(k => k !== 'us')];

  const usHex = readVar('--brand-primary', '#0D6B5C');
  const US_COLOR = hexToRgba(usHex, 1);
  const US_FILL = hexToRgba(usHex, 0.32);

  const datasets = ordered.map((id, i) => {
    const isUs = id === 'us';
    const data = dimensions.map(d => scores[id]?.[d.key] ?? 0);
    const color = isUs ? US_COLOR : PALETTE[(i - 1) % PALETTE.length];
    return {
      label: isUs ? 'Lumana (us)' : (competitorNames[id] || id),
      data,
      borderColor: color,
      backgroundColor: isUs ? US_FILL : color.replace(', 1)', ', 0.10)'),
      borderWidth: isUs ? 3 : 1.5,
      fill: isUs,
      pointRadius: isUs ? 4 : 2,
      pointHoverRadius: isUs ? 6 : 4,
      pointBackgroundColor: color,
    };
  });

  return { labels, datasets };
}

const REGISTRY = new WeakMap();

export function renderRadar({ canvas, dimensions, scores, competitorNames = {}, max = 5 }) {
  if (!canvas || typeof Chart === 'undefined') return null;
  const prev = REGISTRY.get(canvas);
  if (prev) prev.destroy();

  const ctx = canvas.getContext('2d');
  const data = buildRadarData({ dimensions, scores, competitorNames });
  canvas.setAttribute('aria-label', `Radar chart comparing Lumana against ${data.datasets.length - 1} competitors across ${dimensions.length} strategy dimensions`);
  canvas.setAttribute('role', 'img');

  // eslint-disable-next-line no-undef
  const chart = new Chart(ctx, {
    type: 'radar',
    data,
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true, min: 0, max,
          ticks: { display: false, stepSize: 1 },
          pointLabels: { font: { size: 12, family: 'Manrope, system-ui, sans-serif', weight: '500' }, color: '#0F2420' },
          grid: { color: 'rgba(15,36,32,0.08)' },
          angleLines: { color: 'rgba(15,36,32,0.08)' },
        }
      },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 14, padding: 10,
            font: { size: 12, family: 'Manrope, system-ui, sans-serif' },
            sort: (a, b) => a.datasetIndex - b.datasetIndex,
          },
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'rgba(15,36,32,0.92)',
          padding: 10,
          titleFont: { family: 'Manrope, system-ui, sans-serif', weight: '600' },
          bodyFont: { family: 'Manrope, system-ui, sans-serif' },
        },
      }
    }
  });
  REGISTRY.set(canvas, chart);
  return chart;
}
