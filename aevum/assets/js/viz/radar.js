// radar.js — Chart.js radar builder. "us" gets thick + filled styling.
// Filters to a focusedIds list when provided so the chart stays readable.

const PALETTE = [
  'rgba(26,37,48,1)',     // ink
  'rgba(179,58,58,1)',    // rose
  'rgba(92,107,130,1)',   // muted
  'rgba(14,138,74,1)',    // green
  'rgba(184,118,31,1)',   // amber
  'rgba(139,79,191,1)',   // plum
  'rgba(37,99,235,1)',    // blue
  'rgba(120,53,15,1)',
];

const US_COLOR = 'rgba(13,116,136,1)';     // teal
const US_FILL  = 'rgba(13,116,136,0.30)';

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
      backgroundColor: isUs ? US_FILL : color.replace(',1)', ',0.08)'),
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
          ticks: { display: false, stepSize: 1 },
          pointLabels: { font: { size: 12, weight: '500' }, color: '#1A2530' },
          grid: { color: 'rgba(11,41,72,0.10)' },
          angleLines: { color: 'rgba(11,41,72,0.10)' },
        }
      },
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 14, padding: 8, font: { size: 11 }, color: '#1A2530' } },
        tooltip: { enabled: true, backgroundColor: '#1A2530', padding: 10 },
      }
    }
  });
}
