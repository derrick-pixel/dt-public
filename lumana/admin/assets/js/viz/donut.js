// donut.js — donut/bar of competitor target-market frequency.
// Reads brand tokens for the leading slice; cycles a warm palette for the rest.

const REGISTRY = new WeakMap();

function readVar(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

const PALETTE = ['#0D6B5C', '#C8860A', '#08564A', '#B05B24', '#4E7A9A', '#74A284', '#A86B6B', '#54655F', '#C0A24E'];

export function buildTargetMarketCounts(competitors, limit = 9) {
  const counts = new Map();
  for (const c of competitors) {
    for (const m of (c.target_market || [])) {
      counts.set(m, (counts.get(m) || 0) + 1);
    }
  }
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  if (entries.length <= limit) return entries;
  const top = entries.slice(0, limit - 1);
  const other = entries.slice(limit - 1).reduce((s, [, n]) => s + n, 0);
  top.push(['Other', other]);
  return top;
}

export function renderMarketDonut({ canvas, competitors }) {
  if (!canvas || typeof Chart === 'undefined') return null;
  const prev = REGISTRY.get(canvas);
  if (prev) prev.destroy();
  const entries = buildTargetMarketCounts(competitors, 9);
  const primary = readVar('--brand-primary', '#0D6B5C');
  const accent = readVar('--brand-accent', '#C8860A');
  const colors = entries.map((_, i) => i === 0 ? primary : (i === 1 ? accent : PALETTE[(i + 2) % PALETTE.length]));

  canvas.setAttribute('aria-label', `Doughnut chart of target-market frequency across ${entries.length} buckets`);
  canvas.setAttribute('role', 'img');

  // eslint-disable-next-line no-undef
  const chart = new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: entries.map(e => e[0]),
      datasets: [{ data: entries.map(e => e[1]), backgroundColor: colors, borderColor: '#FBF8F2', borderWidth: 2 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'right', labels: { boxWidth: 12, padding: 8, font: { family: 'Manrope, sans-serif', size: 12 } } },
        tooltip: { backgroundColor: 'rgba(15,36,32,0.92)', padding: 10, callbacks: { label: c => `${c.label}: ${c.parsed} competitor(s)` } },
      },
      cutout: '55%',
    }
  });
  REGISTRY.set(canvas, chart);
  return chart;
}
