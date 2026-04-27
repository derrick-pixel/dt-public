// price-bars.js — horizontal bar chart of sg_monthly_sgd across competitors.

export function renderPriceBars({ canvas, competitors, ourPriceSgd = null }) {
  const visible = competitors.filter(c => c.sg_monthly_sgd != null && c.sg_monthly_sgd > 0).slice(0, 20);
  const labels = visible.map(c => c.name);
  const data = visible.map(c => c.sg_monthly_sgd);
  const datasets = [{
    label: 'S$/mo',
    data,
    backgroundColor: 'rgba(220, 38, 38, 0.78)',
    borderColor: '#dc2626', borderWidth: 0,
    borderRadius: 4, barThickness: 18,
  }];
  if (ourPriceSgd != null) {
    datasets.push({
      label: 'Us', data: labels.map(() => ourPriceSgd), type: 'line',
      borderColor: '#1e293b', borderWidth: 2, borderDash: [6, 4], pointRadius: 0, fill: false,
    });
  }
  // eslint-disable-next-line no-undef
  return new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      scales: {
        x: { beginAtZero: true, grid: { color: '#e2e8f0' }, ticks: { color: '#64748b', font: { family: 'Inter' } }, title: { display: true, text: 'S$ / month', color: '#64748b' } },
        y: { grid: { display: false }, ticks: { color: '#334155', font: { family: 'Inter', size: 12 } } },
      },
      plugins: {
        legend: { position: 'top', labels: { font: { family: 'Inter' }, usePointStyle: true } },
        tooltip: { backgroundColor: '#0f172a', padding: 10 },
      },
    },
  });
}
