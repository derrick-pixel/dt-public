// donut.js — target-market distribution donut.
// Colour palette: Elitez orange family + amber + charcoal accents.

const PALETTE = [
  '#FF6A00', // orange (primary)
  '#FFB366', // amber (accent)
  '#D14A00', // orange-deep
  '#FF8A2C', // orange-bright
  '#2A211A', // charcoal
  '#B66A00', // dark amber
  '#6B5C4D', // muted brown
  '#FFD9B0'  // light amber
];

export function renderMarketDonut({ canvas, competitors }) {
  const counts = {};
  for (const c of competitors) for (const m of (c.target_market || [])) {
    counts[m] = (counts[m] || 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (entries.length === 0) return null;
  // eslint-disable-next-line no-undef
  return new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{
        data: entries.map(e => e[1]),
        backgroundColor: entries.map((_, i) => PALETTE[i % PALETTE.length]),
        borderColor: '#FFF7EE',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '58%',
      plugins: {
        legend: { position: 'right', labels: { color: '#15110D', font: { size: 12, weight: '500' }, boxWidth: 14, padding: 10 } },
        tooltip: { backgroundColor: '#0A0604', titleColor: '#FFB366', bodyColor: '#FFF7EE' }
      }
    }
  });
}
