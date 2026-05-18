// radar.js — Chart.js radar builder. "us" gets thick + filled styling.
// Palette: Elitez orange/amber for "us" + charcoal/muted tones for competitors.

const PALETTE = [
  'rgba(42,33,26,1)',    // charcoal
  'rgba(107,92,77,1)',   // muted brown
  'rgba(139,124,109,1)', // muted2
  'rgba(209,74,0,1)',    // orange-deep
  'rgba(180,90,50,1)',   // rust
  'rgba(120,80,60,1)',   // dark brown
  'rgba(80,60,50,1)',    // dark charcoal
  'rgba(150,120,100,1)', // taupe
  'rgba(100,85,70,1)',   // walnut
  'rgba(60,45,35,1)'     // espresso
];

const US_COLOR = 'rgba(255,106,0,1)';      // ee-orange
const US_FILL  = 'rgba(255,106,0,0.35)';   // 35% alpha per contract

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
      backgroundColor: isUs ? US_FILL : color.replace(',1)', ',0.08)'),
      borderWidth: isUs ? 3 : 1.5,
      fill: isUs,
      pointRadius: isUs ? 4 : 2,
      pointBackgroundColor: color,
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
          pointLabels: { font: { size: 12, weight: '600' }, color: '#15110D' },
          grid: { color: 'rgba(20,17,13,0.10)' },
          angleLines: { color: 'rgba(20,17,13,0.10)' },
        }
      },
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 14, padding: 8,
            color: '#15110D', font: { size: 11, weight: '500' }
          }
        },
        tooltip: {
          enabled: true,
          backgroundColor: '#0A0604',
          titleColor: '#FFB366',
          bodyColor: '#FFF7EE',
        },
      }
    }
  });
}
