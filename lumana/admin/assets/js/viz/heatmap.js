// heatmap.js — HTML+CSS-grid heatmap.
// Pure: cellCount, cellBand, buildCellDetail. Rendering: renderHeatmap, renderCellDetail.

import { h, mount } from '../dom.js';

export function cellCount(cell) {
  if (!cell || !Array.isArray(cell.competitors)) return 0;
  return cell.competitors.filter(c => (c.score ?? 0) >= 3).length;
}

export function cellBand(count) {
  if (count <= 1) return 'green';
  if (count <= 3) return 'amber';
  return 'red';
}

const VERDICTS = {
  green: 'WHITESPACE · ATTACK',
  amber: 'CONTESTED · CHOOSE WISELY',
  red:   'CROWDED · AVOID',
};

export function buildCellDetail({ segmentId, needId, segmentName, needName, cell }) {
  const count = cellCount(cell);
  const band = cellBand(count);
  const competitors = [...(cell?.competitors || [])].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return (a.name || '').localeCompare(b.name || '');
  });
  return {
    segmentId, needId,
    headline: `${segmentName} × ${needName}`,
    band,
    verdict: VERDICTS[band],
    ourScore: cell?.our_score ?? 0,
    count,
    competitors,
  };
}

export function renderHeatmap({ container, segments, needs, cells, onCellClick }) {
  container.classList.add('heatmap-grid');
  container.setAttribute('role', 'grid');
  container.setAttribute('aria-label', `Whitespace heatmap, ${segments.length} segments by ${needs.length} needs`);
  container.style.gridTemplateColumns = `220px repeat(${needs.length}, 1fr)`;
  const nodes = [];

  nodes.push(h('div', { class: 'heatmap-header-col', role: 'columnheader' }, 'SEGMENT \\ NEED'));
  for (const need of needs) {
    nodes.push(h('div', { class: 'heatmap-header-row', role: 'columnheader', title: need.name }, need.short));
  }

  let selectedNode = null;
  function clearSelection() {
    if (selectedNode) {
      selectedNode.classList.remove('cell-selected');
      selectedNode.setAttribute('aria-pressed', 'false');
      selectedNode = null;
    }
  }
  function activate(cellNode, payload) {
    if (selectedNode === cellNode) {
      clearSelection();
      container.dispatchEvent(new CustomEvent('heatmap:cell-selected', { detail: null }));
      onCellClick?.(null);
      return;
    }
    clearSelection();
    cellNode.classList.add('cell-selected');
    cellNode.setAttribute('aria-pressed', 'true');
    selectedNode = cellNode;
    container.dispatchEvent(new CustomEvent('heatmap:cell-selected', { detail: payload }));
    onCellClick?.(payload);
  }

  for (const seg of segments) {
    nodes.push(h('div', { class: 'heatmap-header-col', role: 'rowheader' },
      h('strong', {}, seg.name),
      h('span', { class: 'descriptor' }, seg.descriptor || '')
    ));
    for (const need of needs) {
      const key = `${seg.id}:${need.id}`;
      const cell = cells[key] || { competitors: [], our_score: 0 };
      const count = cellCount(cell);
      const band = cellBand(count);
      const detail = buildCellDetail({ segmentId: seg.id, needId: need.id, segmentName: seg.name, needName: need.name, cell });
      const cellNode = h('button', {
        type: 'button',
        class: `heatmap-cell cell-${band}`,
        role: 'gridcell',
        'aria-label': `${seg.name} × ${need.name}, ${count} competitors at score 3 or above. Verdict: ${VERDICTS[band]}.`,
        'aria-pressed': 'false',
        dataset: { segmentId: seg.id, needId: need.id, band },
        onClick: () => activate(cellNode, detail),
      },
        h('span', { class: 'count' }, String(count)),
        h('span', { class: 'sub' }, band === 'green' ? 'whitespace' : band === 'amber' ? 'contested' : 'crowded')
      );
      nodes.push(cellNode);
    }
  }
  mount(container, ...nodes);

  // Esc deselects.
  if (!container.dataset.escWired) {
    container.dataset.escWired = '1';
    container.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        clearSelection();
        container.dispatchEvent(new CustomEvent('heatmap:cell-selected', { detail: null }));
        onCellClick?.(null);
      }
    });
  }
}

export function renderCellDetail(panel, detail) {
  if (!detail) {
    mount(panel, h('p', { class: 'placeholder' }, 'Select a heatmap cell to see the verdict, our score, and how each competitor specialises in this segment-need pair.'));
    return;
  }
  mount(panel,
    h('div', { class: `verdict ${detail.band}` }, detail.verdict),
    h('h3', {}, detail.headline),
    h('p', {},
      h('strong', {}, 'Lumana score: '), `${detail.ourScore}/5 · `,
      h('strong', {}, 'Competitors at score ≥ 3: '), String(detail.count)
    ),
    detail.competitors.length === 0
      ? h('p', { class: 'placeholder' }, 'No competitor scored — this is open ground.')
      : h('ul', {}, detail.competitors.map(c =>
          h('li', {},
            h('strong', {}, c.name || c.id),
            h('span', { class: 'score-pill' }, `score ${c.score}`),
            c.specialisation_for_cell || '—'
          )
        ))
  );
}
