// heatmap.js — HTML+CSS-grid heatmap.
// Pure: cellCount, cellBand, buildCellDetail. Rendering: renderHeatmap, renderCellDetail (DOM-safe).

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
    return a.name.localeCompare(b.name);
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

// Render a top-3 competitor preview for the cell. Names truncated to fit the cell.
function topCompPreview(cell) {
  const top = [...(cell.competitors || [])]
    .filter(c => (c.score ?? 0) >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return top.map(c => h('div', { class: 'cell-comp' }, `${c.name} (${c.score})`));
}

export function renderHeatmap({ container, segments, needs, cells, onCellClick }) {
  container.classList.add('heatmap-grid');
  container.style.gridTemplateColumns = `220px repeat(${needs.length}, minmax(140px, 1fr))`;
  const nodes = [];

  // Top-left corner
  nodes.push(h('div', { class: 'heatmap-corner' }, 'SEGMENT \\ NEED'));

  // Column headers (needs)
  for (const need of needs) {
    nodes.push(h('div', { class: 'heatmap-header-row', title: need.name },
      h('span', { class: 'need-short' }, need.short)
    ));
  }

  // Rows: segment header + cells
  for (const seg of segments) {
    nodes.push(h('div', { class: 'heatmap-header-col' },
      h('strong', {}, seg.name),
      h('span', { class: 'descriptor' }, seg.descriptor || '')
    ));
    for (const need of needs) {
      const key = `${seg.id}:${need.id}`;
      const cell = cells[key] || { competitors: [], our_score: 0 };
      const count = cellCount(cell);
      const band = cellBand(count);
      const ourScore = cell.our_score ?? 0;
      const cellNode = h('button', {
        type: 'button',
        class: `heatmap-cell cell-${band}`,
        dataset: { segmentId: seg.id, needId: need.id },
        'aria-label': `${seg.name} × ${need.name}, ${count} competitors at score >= 3`,
        onClick: () => {
          container.querySelectorAll('.cell-selected').forEach(c => c.classList.remove('cell-selected'));
          cellNode.classList.add('cell-selected');
          const detail = buildCellDetail({ segmentId: seg.id, needId: need.id, segmentName: seg.name, needName: need.name, cell });
          onCellClick?.(detail);
        }
      },
        h('div', { class: 'cell-counts' },
          h('span', { class: 'cell-count', title: 'Competitors at score >= 3' }, String(count)),
          h('span', { class: 'cell-our', title: 'Our (Elitez) score' }, `Elitez: ${ourScore}/5`)
        ),
        h('div', { class: 'cell-comps' }, ...topCompPreview(cell))
      );
      nodes.push(cellNode);
    }
  }
  mount(container, ...nodes);
}

export function renderCellDetail(panel, detail) {
  mount(panel,
    h('div', { class: `verdict verdict-${detail.band}` }, detail.verdict),
    h('h3', {}, detail.headline),
    h('p', { class: 'cell-stats' },
      h('strong', {}, 'Elitez score: '), `${detail.ourScore}/5 · `,
      h('strong', {}, 'Competitors at score ≥ 3: '), String(detail.count)
    ),
    detail.competitors.length === 0
      ? h('p', { style: { fontStyle: 'italic', opacity: '0.6' } }, 'No competitors mapped to this cell.')
      : h('ul', { class: 'cell-comp-list' }, detail.competitors.map(c =>
          h('li', {},
            h('strong', {}, c.name),
            h('span', { class: 'comp-score' }, ` (${c.score}/5) `),
            ' — ',
            c.specialisation_for_cell || ''
          )
        ))
  );
}
