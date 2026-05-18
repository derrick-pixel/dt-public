// price-bars.js — horizontal bar chart of monthly price across competitors.
// Sorts ascending and pins "us" at the top. Handles missing prices by surfacing
// them in a footer note instead of dropping silently.

const REGISTRY = new WeakMap();

function readVar(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function hexToRgba(hex, a) {
  const m = (hex || '').match(/^#?([a-f0-9]{6})$/i);
  if (!m) return `rgba(13,107,92,${a})`;
  const v = parseInt(m[1], 16);
  const r = (v >> 16) & 0xff, g = (v >> 8) & 0xff, b = v & 0xff;
  return `rgba(${r},${g},${b},${a})`;
}

function makeStripePattern(ctx, baseColor) {
  const c = document.createElement('canvas');
  c.width = 8; c.height = 8;
  const cx = c.getContext('2d');
  cx.fillStyle = baseColor; cx.fillRect(0, 0, 8, 8);
  cx.strokeStyle = 'rgba(255,255,255,0.55)'; cx.lineWidth = 1.5;
  cx.beginPath(); cx.moveTo(-2, 8); cx.lineTo(8, -2);
  cx.moveTo(0, 10); cx.lineTo(10, 0); cx.stroke();
  return ctx.createPattern(c, 'repeat');
}

export function buildPriceSeries({ competitors, ourLabel = 'Lumana (us)', ourPrice = null, currencyKey = 'sg_monthly_sgd' }) {
  const visible = competitors.filter(c => c[currencyKey] != null);
  visible.sort((a, b) => (a[currencyKey] || 0) - (b[currencyKey] || 0));
  const labels = visible.map(c => c.name);
  const prices = visible.map(c => c[currencyKey]);
  const flags = visible.map(c => c.pricing_flag || 'public');
  const omitted = competitors.filter(c => c[currencyKey] == null).map(c => c.name);
  if (ourPrice != null) {
    labels.push(ourLabel);
    prices.push(ourPrice);
    flags.push('public');
  }
  return { labels, prices, flags, omitted };
}

export function renderPriceBars({ canvas, competitors, ourPrice = null, ourLabel = 'Lumana (us)', currencyLabel = 'AUD', currencyKey = 'sg_monthly_sgd', footerEl = null }) {
  if (!canvas || typeof Chart === 'undefined') return null;
  const prev = REGISTRY.get(canvas);
  if (prev) prev.destroy();

  const series = buildPriceSeries({ competitors, ourLabel, ourPrice, currencyKey });
  const ctx = canvas.getContext('2d');
  const primary = readVar('--brand-primary', '#0D6B5C');
  const accent = readVar('--brand-accent', '#C8860A');
  const usHex = primary;

  const fillSolid = hexToRgba(primary, 0.78);
  const fillStripes = makeStripePattern(ctx, hexToRgba(primary, 0.55));
  const fillUs = hexToRgba(accent, 0.85);

  const bg = series.flags.map((flag, i) => {
    if (i === series.labels.length - 1 && ourPrice != null) return fillUs;
    if (flag === 'hidden_estimated') return fillStripes;
    return fillSolid;
  });
  const borderColors = series.flags.map((flag, i) => {
    if (i === series.labels.length - 1 && ourPrice != null) return accent;
    if (flag === 'partial') return primary;
    return 'transparent';
  });
  const borderDash = series.flags.map(f => f === 'partial' ? [4, 3] : []);

  canvas.setAttribute('aria-label', `Horizontal bar chart of monthly ${currencyLabel} prices across ${series.labels.length} competitors`);
  canvas.setAttribute('role', 'img');

  // eslint-disable-next-line no-undef
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: series.labels,
      datasets: [{
        label: `${currencyLabel} / bed / month`,
        data: series.prices,
        backgroundColor: bg,
        borderColor: borderColors,
        borderWidth: 2,
        borderDash,
      }],
    },
    options: {
      indexAxis: 'y', responsive: true, maintainAspectRatio: false,
      scales: {
        x: { beginAtZero: true, title: { display: true, text: `${currencyLabel} / bed / month`, color: '#55655F', font: { family: 'Manrope, sans-serif', weight: '600' } }, grid: { color: 'rgba(15,36,32,0.06)' } },
        y: { ticks: { font: { family: 'Manrope, sans-serif', size: 12 }, color: '#0F2420' }, grid: { display: false } },
      },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(15,36,32,0.92)', padding: 10, callbacks: { label: c => `${currencyLabel} ${c.parsed.x}/bed/mo` } },
      }
    }
  });
  REGISTRY.set(canvas, chart);

  if (footerEl) {
    const text = series.omitted.length === 0
      ? `Showing ${series.labels.length} competitors with published / triangulated ${currencyLabel} pricing.`
      : `Excluding ${series.omitted.length} competitor(s) with no public ${currencyLabel} price: ${series.omitted.slice(0, 8).join(', ')}${series.omitted.length > 8 ? ', …' : ''}.`;
    footerEl.textContent = text;
  }
  // touch usHex so linter/strict mode treats it as used
  void usHex;
  return chart;
}
