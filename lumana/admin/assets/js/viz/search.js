// search.js — pure filter predicate + debounced wiring + deep-link support.
// Owns the four-filter API (category, hqRegion, threatLevelMin, pricingFlag).

export function matchesCompetitor(c, query = '', filters = {}) {
  const q = (query || '').trim().toLowerCase();
  if (q) {
    const haystack = [
      c.name, c.primary_value_prop, c.hq,
      ...(c.features || []),
      ...(c.strengths || []),
    ].filter(Boolean).join(' ').toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (filters.category && c.category !== filters.category) return false;
  if (filters.hqRegion && c.hq_region !== filters.hqRegion) return false;
  if (filters.pricingFlag && c.pricing_flag !== filters.pricingFlag) return false;
  const min = filters.threatLevelMin != null && filters.threatLevelMin !== '' ? Number(filters.threatLevelMin) : null;
  if (min != null && (c.threat_level ?? 0) < min) return false;
  return true;
}

export function debounce(fn, ms = 150) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

// Pure pagination helper. Clamps page to a valid range.
export function computePageIndex(totalMatches, currentPage, pageSize) {
  const totalPages = Math.max(1, Math.ceil(totalMatches / pageSize));
  const page = Math.min(Math.max(0, currentPage), totalPages - 1);
  const start = page * pageSize;
  const end = Math.min(start + pageSize, totalMatches);
  return { start, end, totalPages, page };
}

// Read state from URL (?q=, ?category=, ?hq=, ?threat=, ?flag=).
export function readStateFromURL(url = window.location.href) {
  const u = new URL(url);
  return {
    query: u.searchParams.get('q') || '',
    filters: {
      category: u.searchParams.get('category') || undefined,
      hqRegion: u.searchParams.get('hq') || undefined,
      threatLevelMin: u.searchParams.get('threat') || undefined,
      pricingFlag: u.searchParams.get('flag') || undefined,
    },
  };
}

// Push state into the URL without scrolling.
export function writeStateToURL(state) {
  const u = new URL(window.location.href);
  const set = (k, v) => v ? u.searchParams.set(k, v) : u.searchParams.delete(k);
  set('q', state.query);
  set('category', state.filters.category);
  set('hq', state.filters.hqRegion);
  set('threat', state.filters.threatLevelMin);
  set('flag', state.filters.pricingFlag);
  history.replaceState(null, '', u.toString());
}

export function wireSearch({ input, filtersEl, resetButton, competitors, onUpdate }) {
  const initial = readStateFromURL();
  const state = { query: initial.query, filters: { ...initial.filters } };
  if (input && initial.query) input.value = initial.query;
  if (filtersEl) {
    for (const [k, v] of Object.entries(initial.filters)) {
      if (!v) continue;
      const sel = filtersEl.querySelector(`[name="filter-${k}"]`);
      if (sel) sel.value = v;
    }
  }
  const recompute = () => {
    const result = competitors.filter(c => matchesCompetitor(c, state.query, state.filters));
    writeStateToURL(state);
    onUpdate(result, state);
  };
  const debounced = debounce(recompute, 150);
  if (input) input.addEventListener('input', e => { state.query = e.target.value; debounced(); });
  if (filtersEl) {
    filtersEl.addEventListener('change', e => {
      const name = e.target?.name || '';
      if (!name.startsWith('filter-')) return;
      const key = name.replace('filter-', '');
      state.filters[key] = e.target.value || undefined;
      recompute();
    });
  }
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      state.query = '';
      state.filters = {};
      if (input) input.value = '';
      if (filtersEl) filtersEl.querySelectorAll('select').forEach(s => { s.value = ''; });
      recompute();
    });
  }
  recompute();
}
