// donut.js — target-market distribution donut.

const PALETTE = ['#dc2626','#1e293b','#f59e0b','#0ea5e9','#16a34a','#a855f7','#ec4899','#64748b'];

export function renderMarketDonut({ canvas, competitors }) {
  const counts = {};
  for (const c of competitors) for (const m of (c.target_market || [])) {
    counts[m] = (counts[m] || 0) + 1;
  }
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  // eslint-disable-next-line no-undef
  return new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{ data: entries.map(e => e[1]), backgroundColor: PALETTE, borderColor: '#ffffff', borderWidth: 2 }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '60%',
      plugins: {
        legend: { position: 'right', labels: { font: { family: 'Inter', size: 12 }, padding: 12, usePointStyle: true, boxWidth: 8 } },
        tooltip: { backgroundColor: '#0f172a', padding: 10 },
      },
    },
  });
}
