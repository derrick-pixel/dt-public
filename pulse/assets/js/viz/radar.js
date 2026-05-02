// radar.js — Chart.js radar builder. "us" gets thick + filled styling.
// Filters to a focusedIds list when provided (typically top-5 + us) so
// 30+ competitor projects don't render an unreadable spaghetti chart.

const PALETTE = [
  'rgba(26,26,26,1)',     // ink
  'rgba(167,139,250,1)',  // violet
  'rgba(95,107,122,1)',   // muted
  'rgba(31,107,79,1)',    // good
  'rgba(184,118,31,1)',   // amber
  'rgba(31,58,86,1)',     // ink-soft
  'rgba(120,53,15,1)',
  'rgba(99,102,241,1)',
];

const US_COLOR = 'rgba(255,91,57,1)';        // Pulse coral
const US_FILL  = 'rgba(255,91,57,0.30)';

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
          pointLabels: { font: { size: 13, weight: '500' } },
          grid: { color: 'rgba(0,0,0,0.08)' },
          angleLines: { color: 'rgba(0,0,0,0.08)' },
        }
      },
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 16, padding: 8 } },
        tooltip: { enabled: true },
      }
    }
  });
}
