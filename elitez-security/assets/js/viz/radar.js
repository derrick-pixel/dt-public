// radar.js — Chart.js radar builder. "us" gets thick + filled styling.
// Filters to a focusedIds list when provided so the chart stays readable.

const PALETTE = [
  'rgba(248,113,113,1)',   // red
  'rgba(245,158,11,1)',    // amber
  'rgba(96,165,250,1)',    // blue
  'rgba(167,139,250,1)',   // violet
  'rgba(244,114,182,1)',   // pink
  'rgba(251,191,36,1)',    // gold
  'rgba(94,234,212,1)',    // teal
  'rgba(180,180,180,1)',   // grey
];

const US_COLOR = 'rgba(52,211,153,1)';     // accent green
const US_FILL  = 'rgba(52,211,153,0.30)';

export function buildRadarData({ dimensions, scores, focusedIds = null }) {
  const labels = dimensions.map(d => d.label);
  const ids = Object.keys(scores);
  let ordered = ['us', ...ids.filter(k => k !== 'us')];
  if (focusedIds && focusedIds.length) {
    const set = new Set(['us', ...focusedIds]);
    ordered = ordered.filter(id => set.has(id));
  }

  const datasets = ordered.map((id, i) => {
    const isUs = id === 'us';
    const data = dimensions.map(d => scores[id]?.[d.key] ?? 0);
    const color = isUs ? US_COLOR : PALETTE[(i - 1) % PALETTE.length];
    return {
      label: id, data,
      borderColor: color,
      backgroundColor: isUs ? US_FILL : color.replace(',1)', ',0.10)'),
      borderWidth: isUs ? 3 : 1.5,
      fill: isUs,
      pointRadius: isUs ? 4 : 2,
    };
  });

  return { labels, datasets };
}

export function renderRadar({ canvas, dimensions, scores, max = 5, focusedIds = null }) {
  const ctx = canvas.getContext('2d');
  const data = buildRadarData({ dimensions, scores, focusedIds });
  // eslint-disable-next-line no-undef
  return new Chart(ctx, {
    type: 'radar',
    data,
    options: {
      responsive: true, maintainAspectRatio: false,
      scales: {
        r: {
          beginAtZero: true, min: 0, max,
          ticks: { display: false, stepSize: 1, color: 'rgba(255,255,255,0.4)', backdropColor: 'transparent' },
          pointLabels: { font: { size: 12, weight: '500' }, color: '#fafafa' },
          grid: { color: 'rgba(255,255,255,0.10)' },
          angleLines: { color: 'rgba(255,255,255,0.10)' },
        }
      },
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 14, padding: 8, font: { size: 11 }, color: '#fafafa' } },
        tooltip: { enabled: true, backgroundColor: '#1e1e22', padding: 10 },
      }
    }
  });
}
