// radar.js — Chart.js radar builder. "us" gets thick + filled styling.
// Palette = Lemon Man brand DNA: ink/sour/lemon/peach + warm cream-friendly accents.

const PALETTE = [
  'rgba(33,29,18,1)',     // ink
  'rgba(168,106,0,1)',    // sour
  'rgba(230,133,92,1)',   // peach
  'rgba(196,95,58,1)',    // peach_deep
  'rgba(111,103,80,1)',   // ink-3
  'rgba(184,55,42,1)',    // flag (used in public site)
  'rgba(77,122,20,1)',    // leafy green for contrast
  'rgba(120,53,15,1)',    // deep amber
  'rgba(50,90,120,1)',    // muted teal
  'rgba(140,90,170,1)',   // soft plum
];

const US_COLOR = 'rgba(227,164,0,1)';   // lemon — primary brand colour for "us"
const US_FILL  = 'rgba(227,164,0,0.35)';

export function buildRadarData({ dimensions, scores }) {
  const labels = dimensions.map(d => d.label);
  const ids = Object.keys(scores);
  const ordered = ['us', ...ids.filter(k => k !== 'us')];

  const datasets = ordered.map((id, i) => {
    const isUs = id === 'us';
    const data = dimensions.map(d => scores[id]?.[d.key] ?? 0);
    const color = isUs ? US_COLOR : PALETTE[(i - 1) % PALETTE.length];
    return {
      label: id, data,
      borderColor: color,
      backgroundColor: isUs ? US_FILL : color.replace(',1)', ',0.1)'),
      borderWidth: isUs ? 3 : 1.5,
      fill: isUs,
      pointRadius: isUs ? 4 : 2,
    };
  });

  return { labels, datasets };
}

export function renderRadar({ canvas, dimensions, scores, max = 5 }) {
  const ctx = canvas.getContext('2d');
  const data = buildRadarData({ dimensions, scores });
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
