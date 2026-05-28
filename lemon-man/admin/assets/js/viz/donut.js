// donut.js — target-market distribution donut.

export function renderMarketDonut({ canvas, competitors }) {
  const counts = {};
  for (const c of competitors) for (const m of (c.target_market || [])) {
    counts[m] = (counts[m] || 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  // Lemon Man palette: lemon, sour, peach, ink, peach_deep, leafy green, plum, deep amber
  const LEMON_PALETTE = ['#e3a400','#a86a00','#e6855c','#211d12','#c45f3a','#4d7a14','#8c5aa0','#6f6750'];
  // eslint-disable-next-line no-undef
  return new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{ data: entries.map(e => e[1]), backgroundColor: LEMON_PALETTE }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
  });
}
