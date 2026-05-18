// price-bars.js — horizontal bar chart of estimated SGD per 600-PAX D&D-equivalent event.
//
// Note for Elitez Events context: competitors[*].sg_monthly_sgd is null across the
// dataset because event-management is per-event, not per-month. We instead parse
// pricing_range_published strings into a comparable per-event midpoint using a
// 600-PAX D&D reference scenario (matches our recommended Standard tier).

const REF_PAX = 600;

// Pure helper: try to extract a comparable per-event SGD midpoint from a
// published pricing string. Returns null if unparseable.
export function estimatePerEventSgd(c) {
  // Prefer explicit per-event ranges (e.g. "corporate event SGD 25,000-70,000")
  // Fall back to per-pax (e.g. "SGD 80-250/pax") × REF_PAX
  // Fall back to family day or D&D anchors.
  if (c.sg_monthly_sgd != null) return c.sg_monthly_sgd; // future-proof
  const s = (c.pricing_range_published || '').replace(/,/g, '');
  if (!s) return null;

  const isPerUnitContext = /\/\s*pax|\/\s*seat|per[-\s]seat|per[-\s]pax/i.test(s);

  // 1) Per-pax / per-seat range — scale to REF_PAX.
  const perUnitRangeAfter = s.match(/SGD\s*~?(\d+)\s*[-–to]+\s*~?(\d+)\s*(?:\/\s*pax|\/\s*seat|\/pax|\/seat|per[-\s]seat|per[-\s]pax)/i);
  if (perUnitRangeAfter) {
    const lo = Number(perUnitRangeAfter[1]), hi = Number(perUnitRangeAfter[2]);
    return Math.round(((lo + hi) / 2) * REF_PAX);
  }
  // Per-unit context BEFORE the price (e.g. "Per-seat experiences from SGD ~30-150").
  if (isPerUnitContext) {
    const rangeAny = s.match(/SGD\s*~?(\d+)\s*[-–to]+\s*~?(\d+)/i);
    if (rangeAny) {
      const lo = Number(rangeAny[1]), hi = Number(rangeAny[2]);
      return Math.round(((lo + hi) / 2) * REF_PAX);
    }
  }
  const perUnitSingle = s.match(/SGD\s*~?(\d+)\s*(?:\/\s*pax|\/\s*seat|per[-\s]seat|per[-\s]pax)/i);
  if (perUnitSingle) {
    return Math.round(Number(perUnitSingle[1]) * REF_PAX);
  }

  // 2) "from SGD X" minimum spend — use the floor.
  const minSpend = s.match(/from\s+SGD\s*(\d{3,})/i);
  if (minSpend) {
    return Number(minSpend[1]);
  }

  // 3) Per-event range >= 1,000 (4-digit and up).
  const eventRange = s.match(/SGD\s*(\d{4,})\s*[-–to]+\s*(\d{4,})/i);
  if (eventRange) {
    const lo = Number(eventRange[1]), hi = Number(eventRange[2]);
    return Math.round((lo + hi) / 2);
  }

  return null;
}

// Pricing flag → bar fill style.
const FLAG_COLOR = {
  public:           'rgba(255,106,0,0.85)',   // orange (most reliable)
  partial:          'rgba(255,138,44,0.65)',  // orange-bright (medium reliability)
  hidden_estimated: 'rgba(255,179,102,0.55)', // amber (estimated)
};

export function renderPriceBars({ canvas, competitors, ourPriceSgd = null, ourLabel = 'Elitez Standard (SGD 50K / event)' }) {
  // Build (competitor, estimate, flag) tuples for items we can actually price.
  const rows = competitors
    .map(c => ({
      name: c.name,
      flag: c.pricing_flag,
      sgd: estimatePerEventSgd(c),
      pub: c.pricing_range_published || ''
    }))
    .filter(r => r.sgd != null && r.sgd > 0)
    .sort((a, b) => a.sgd - b.sgd);

  if (rows.length === 0) {
    // Render a friendly empty-state box on the canvas's parent.
    const parent = canvas.parentElement;
    if (parent) {
      const note = document.createElement('p');
      note.style.cssText = 'opacity:0.7;text-align:center;padding:32px;font-style:italic;';
      note.textContent = 'No competitors publish parseable SGD pricing — see strategy canvas instead.';
      parent.appendChild(note);
    }
    return null;
  }

  const labels = rows.map(r => r.name);
  const data = rows.map(r => r.sgd);
  const bg = rows.map(r => FLAG_COLOR[r.flag] || FLAG_COLOR.hidden_estimated);

  const datasets = [{
    label: 'Estimated SGD / event (600 PAX D&D-equivalent)',
    data,
    backgroundColor: bg,
    borderColor: '#0A0604',
    borderWidth: 1,
    borderRadius: 4,
  }];

  if (ourPriceSgd != null) {
    datasets.push({
      label: ourLabel,
      data: labels.map(() => ourPriceSgd),
      type: 'line',
      borderColor: '#FF6A00',
      backgroundColor: 'rgba(255,106,0,0.1)',
      borderWidth: 3,
      borderDash: [6, 4],
      pointRadius: 0,
      fill: false
    });
  }

  // eslint-disable-next-line no-undef
  return new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: { labels, datasets },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          title: { display: true, text: 'SGD per event (parsed midpoint)', color: '#15110D', font: { size: 12, weight: '600' } },
          grid: { color: 'rgba(20,17,13,0.06)' },
          ticks: { color: '#15110D', callback: (v) => 'S$' + Number(v).toLocaleString() }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#15110D', font: { size: 11 } }
        }
      },
      plugins: {
        legend: { position: 'top', labels: { color: '#15110D', font: { size: 12, weight: '500' } } },
        tooltip: {
          backgroundColor: '#0A0604',
          titleColor: '#FFB366',
          bodyColor: '#FFF7EE',
          callbacks: {
            label: (ctx) => {
              const r = rows[ctx.dataIndex];
              if (ctx.dataset.type === 'line') return `${ctx.dataset.label}: S$${Number(ctx.raw).toLocaleString()}`;
              return [
                `Est: S$${Number(ctx.raw).toLocaleString()} / event`,
                `Flag: ${r?.flag ?? 'unknown'}`,
                `Source: ${r?.pub?.slice(0, 80) ?? ''}`,
              ];
            }
          }
        }
      }
    }
  });
}
