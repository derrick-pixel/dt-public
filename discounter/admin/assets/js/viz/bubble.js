// bubble.js — threat × beatability scatter; bubble size = market share, color = category.

const CATEGORY_COLOR = {
  global_incumbent:    'rgba(30, 41, 59, 0.78)',
  sg_local:            'rgba(220, 38, 38, 0.78)',
  regional_challenger: 'rgba(245, 158, 11, 0.85)',
  diy_alternative:     'rgba(100, 116, 139, 0.78)',
  adjacent:            'rgba(14, 165, 233, 0.78)',
};
const CATEGORY_LABEL = {
  global_incumbent:    'Global incumbent',
  sg_local:            'SG local',
  regional_challenger: 'Regional challenger',
  diy_alternative:     'DIY alternative',
  adjacent:            'Adjacent',
};

export function renderThreatBubble({ canvas, competitors }) {
  const byCat = {};
  for (const c of competitors) {
    if (c.threat_level == null || c.beatability == null) continue;
    const cat = c.category || 'global_incumbent';
    (byCat[cat] = byCat[cat] || []).push({
      x: c.beatability,
      y: c.threat_level,
      r: 6 + Math.sqrt((c.market_share_estimate_pct ?? 1) * 4),
      _name: c.name,
      _share: c.market_share_estimate_pct,
    });
  }
  const datasets = Object.entries(byCat).map(([cat, points]) => ({
    label: CATEGORY_LABEL[cat] || cat,
    data: points,
    backgroundColor: CATEGORY_COLOR[cat] || 'rgba(100,116,139,0.7)',
    borderColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5,
    hoverBorderWidth: 2,
  }));

  // eslint-disable-next-line no-undef
  return new Chart(canvas.getContext('2d'), {
    type: 'bubble',
    data: { datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { family: 'Inter', size: 12 }, padding: 14, usePointStyle: true, boxWidth: 8 },
        },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 12, titleFont: { family: 'Inter', weight: '700' }, bodyFont: { family: 'Inter' },
          callbacks: {
            label: ctx => {
              const p = ctx.raw;
              const share = p._share != null ? `${p._share}% share` : 'share n/a';
              return `${p._name} — threat ${p.y} · beatability ${p.x} · ${share}`;
            },
          },
        },
      },
      scales: {
        x: {
          min: 0.5, max: 5.5,
          title: { display: true, text: 'Beatability  →', font: { family: 'Inter', weight: '600', size: 12 }, color: '#64748b' },
          grid: { color: '#e2e8f0', drawBorder: false },
          ticks: { color: '#64748b', stepSize: 1 },
        },
        y: {
          min: 0.5, max: 5.5,
          title: { display: true, text: 'Threat level  →', font: { family: 'Inter', weight: '600', size: 12 }, color: '#64748b' },
          grid: { color: '#e2e8f0', drawBorder: false },
          ticks: { color: '#64748b', stepSize: 1 },
        },
      },
    },
  });
}

export function renderCategoryDonut({ canvas, competitors }) {
  const counts = {};
  for (const c of competitors) {
    const cat = c.category || 'unknown';
    counts[cat] = (counts[cat] || 0) + 1;
  }
  const order = ['global_incumbent','sg_local','regional_challenger','diy_alternative','adjacent'];
  const sorted = order.filter(k => counts[k]).map(k => [k, counts[k]]);
  // eslint-disable-next-line no-undef
  return new Chart(canvas.getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: sorted.map(([k]) => CATEGORY_LABEL[k] || k),
      datasets: [{
        data: sorted.map(([,v]) => v),
        backgroundColor: sorted.map(([k]) => (CATEGORY_COLOR[k] || 'rgba(100,116,139,0.78)').replace('0.78', '0.92')),
        borderColor: '#ffffff', borderWidth: 2,
      }],
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: {
        legend: {
          position: 'right',
          labels: { font: { family: 'Inter', size: 12 }, padding: 12, usePointStyle: true, boxWidth: 8 },
        },
        tooltip: {
          backgroundColor: '#0f172a', padding: 10,
          callbacks: { label: ctx => `${ctx.label}: ${ctx.raw} competitors` },
        },
      },
    },
  });
}
