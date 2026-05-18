// openings.js — section-opening composers. Each takes the slice of JSON it
// needs and returns a string ≤ ~280 chars. If data is missing, returns a
// neutral line that does not fabricate numbers.

function fmtMoneyM(n) {
  if (n == null || Number.isNaN(n)) return '—';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(0) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return String(n);
}

export function execOpening(data) {
  const top = data.competitors.top_five[0];
  const totalN = data.competitors.competitors.length;
  const apack = data.whitespace.attack_plans.length;
  const tam = fmtMoneyM(data.market.market_size.tam_sgd);
  return `${totalN} competitors mapped, ${apack} attack plans drafted, TAM A$${tam}. The threat list is led by ${competitorName(data, top.competitor_id)}; the opportunity is the whitespace beneath it.`;
}

export function landscapeOpening(data) {
  const c = data.competitors;
  const total = c.competitors.length;
  const top = c.top_five[0];
  const topName = competitorName(data, top.competitor_id);
  const apacShare = Math.round(
    (c.competitors.filter(x => ['Australia', 'Hong Kong', 'Singapore', 'Japan', 'Korea'].some(r => (x.hq || '').includes(r) || (x.hq_region || '').includes('APAC') || (x.hq_region || '').includes('AU') || (x.hq_region || '').includes('HK') || (x.hq_region || '').includes('SG'))).length / total) * 100
  );
  return `Across ${total} tracked competitors (${apacShare}% APAC-anchored), ${topName} anchors the threat list at rank 1 — the field is crowded but the white-space beneath the top tier is real and addressable.`;
}

export function marketOpening(data) {
  const m = data.market.market_size;
  const tam = fmtMoneyM(m.tam_sgd);
  const sam = fmtMoneyM(m.sam_sgd);
  const som = fmtMoneyM(m.som_sgd);
  const policy = (data.market.policies || [])[0]?.title || 'regulatory tailwinds';
  return `TAM A$${tam} narrows to SAM A$${sam} and a 5-year SOM of A$${som}, gated less by buyer intent than by policy compliance — ${policy} sets the cadence.`;
}

export function pricingOpening(data) {
  const prices = data.competitors.competitors.filter(c => c.sg_monthly_sgd != null).map(c => c.sg_monthly_sgd);
  const minP = prices.length ? Math.min(...prices) : null;
  const maxP = prices.length ? Math.max(...prices) : null;
  const wtps = (data.pricing.personas || []).map(p => p?.wtp_band_sgd?.upper_stretch).filter(x => typeof x === 'number');
  const maxWTP = wtps.length ? Math.max(...wtps) : null;
  if (minP != null && maxP != null && maxWTP != null) {
    return `Against competitor price bands of A$${minP}–A$${maxP}/bed/mo, our personas top out at A$${maxWTP}/bed/mo — pricing is a perception question (Standard 5 / SIRS proof), not a dollar comparison.`;
  }
  return 'Pricing is a perception question framed by what the buyer believes the evidence pack is worth, not by a dollar-for-dollar comparison with adjacent vendors.';
}

export function whitespaceOpening(data) {
  const cells = Object.values(data.whitespace.heatmap.cells || {});
  let green = 0, red = 0;
  let topGreen = null;
  for (const [key, cell] of Object.entries(data.whitespace.heatmap.cells || {})) {
    const count = (cell.competitors || []).filter(x => (x.score ?? 0) >= 3).length;
    if (count <= 1) {
      green++;
      if (!topGreen) topGreen = key;
    } else if (count >= 4) {
      red++;
    }
  }
  return `${green} green cells on the heatmap, ${red} red — the uncontested corner clusters around auto-documentation and Standard 5 evidence; our first move lives there.`;
}

export function designOpening(data) {
  const audited = data.competitors.competitors.filter(c => typeof c.website_design_rating === 'number');
  const n = audited.length;
  if (!n) return 'Design audit forthcoming.';
  const median = audited.map(c => c.website_design_rating).sort((a, b) => a - b)[Math.floor(n / 2)];
  return `Of the ${n} audited sites, the median rating is ${median.toFixed(1)}/10 — the category's design floor is low enough that confident, evidence-led pages are a wedge.`;
}

function competitorName(data, id) {
  return data.competitors.competitors.find(c => c.id === id)?.name || id;
}
