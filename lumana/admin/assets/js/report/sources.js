// sources.js — extract source citations across all upstream JSON.
// Returns a de-duplicated, sorted list of { label, url|note } records.

function pushIfUrl(list, value, label) {
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
    list.push({ label: label || value.replace(/^https?:\/\//i, '').slice(0, 80), url: value });
  }
}

export function collectSources(data) {
  const out = [];

  // competitors[].url
  for (const c of data.competitors.competitors || []) {
    pushIfUrl(out, c.url, c.name);
  }
  // competitors meta coverage_notes — many bare URLs/domains. We list the meta
  // coverage_notes block as a single citation (Agent 1 wrote it as the master
  // source list).
  if (data.competitors?.meta?.coverage_notes) {
    out.push({ label: 'Competitor coverage notes (Agent 1, master source list)', note: 'see competitors.json → meta.coverage_notes' });
  }

  // market policies
  for (const p of data.market.policies || []) {
    pushIfUrl(out, p.url, p.title);
  }

  // pricing grants
  for (const g of data.pricing.grants || []) {
    if (g.url) pushIfUrl(out, g.url, g.name);
  }

  // dedupe by url
  const byUrl = new Map();
  for (const s of out) {
    const k = s.url || `note:${s.label}`;
    if (!byUrl.has(k)) byUrl.set(k, s);
  }
  return [...byUrl.values()].sort((a, b) => (a.label || '').localeCompare(b.label || ''));
}
