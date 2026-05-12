// ── dt-site-creator ── ecosystem.js ─────────────────────────
// Renders the production-stack ecosystem diagram on /ecosystem.html.
// Data source: dashboard/data/ecosystem.json.
// Subsequent tasks add: SVG connection lines, filter pills,
// URL hash sync, hover tooltips, click navigation.

(function() {
  'use strict';

  const DATA_URL = 'dashboard/data/ecosystem.json';
  let data = null;
  let activePath = null;
  let suppressHashListener = false;

  async function init() {
    try {
      const resp = await fetch(DATA_URL);
      if (!resp.ok) throw new Error('Failed to fetch ' + DATA_URL + ': ' + resp.status);
      data = await resp.json();
    } catch (err) {
      console.error('ecosystem.js load error:', err);
      const canvas = document.getElementById('eco-canvas');
      if (canvas) {
        const errEl = document.createElement('p');
        errEl.style.cssText = 'color:#f87171;padding:24px;';
        errEl.textContent = 'Failed to load ecosystem data. See console.';
        canvas.appendChild(errEl);
      }
      return;
    }
    renderLayers();
    renderPills();

    // Initialize from URL hash
    const initial = pathFromHash();
    if (initial) {
      setActivePath(initial);
    }

    // Tooltip
    const tip = document.createElement('div');
    tip.className = 'eco-tooltip';
    tip.style.display = 'none';
    document.body.appendChild(tip);

    document.querySelectorAll('.eco-node').forEach(function(el) {
      el.addEventListener('mouseenter', function() {
        const id = el.dataset.nodeId;
        const node = data.nodes[id];
        if (!node) return;
        tip.innerHTML = '';
        const main = document.createElement('div');
        main.textContent = node.summary;
        tip.appendChild(main);
        if (!node.shipped) {
          const sub = document.createElement('div');
          sub.style.marginTop = '4px';
          sub.style.opacity = '0.7';
          sub.style.fontSize = '12px';
          sub.textContent = 'Stack candidate — evaluated, not yet shipped';
          tip.appendChild(sub);
        }
        const r = el.getBoundingClientRect();
        tip.style.left = (window.scrollX + r.left) + 'px';
        tip.style.top = (window.scrollY + r.bottom + 8) + 'px';
        tip.style.display = 'block';
      });
      el.addEventListener('mouseleave', function() {
        tip.style.display = 'none';
      });
    });

    requestAnimationFrame(function() {
      if (activePath) renderPathLines();
      else renderDefaultLines();
    });
    window.addEventListener('resize', function() {
      requestAnimationFrame(function() {
        if (activePath) renderPathLines();
        else renderDefaultLines();
      });
    });
  }

  function renderLayers() {
    const canvas = document.getElementById('eco-canvas');
    if (!canvas) return;
    canvas.innerHTML = '';
    data.layers.forEach(function(layer) {
      const card = document.createElement('div');
      card.className = 'eco-layer';
      card.dataset.layerId = layer.id;

      const label = document.createElement('div');
      label.className = 'eco-layer-label';
      label.textContent = layer.label;
      card.appendChild(label);

      const nodesWrap = document.createElement('div');
      nodesWrap.className = 'eco-layer-nodes';
      layer.nodes.forEach(function(nodeId) {
        const node = data.nodes[nodeId];
        if (!node) return;
        const el = document.createElement('a');
        el.className = 'eco-node' + (node.shipped ? '' : ' is-candidate');
        el.dataset.nodeId = nodeId;
        if (node.link) {
          el.href = node.link;
        }

        const icon = document.createElement('span');
        icon.className = 'eco-node-icon';
        icon.textContent = node.icon;
        el.appendChild(icon);

        const labelSpan = document.createElement('span');
        labelSpan.className = 'eco-node-label';
        labelSpan.textContent = node.label;
        el.appendChild(labelSpan);

        nodesWrap.appendChild(el);
      });
      card.appendChild(nodesWrap);
      canvas.appendChild(card);
    });
  }

  function getRelativeRect(el, refEl) {
    const r = el.getBoundingClientRect();
    const ref = refEl.getBoundingClientRect();
    return { x: r.left - ref.left, y: r.top - ref.top, w: r.width, h: r.height };
  }

  function renderDefaultLines() {
    const svg = document.getElementById('eco-svg');
    const frame = svg && svg.parentElement;
    if (!svg || !frame) return;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 ' + frame.clientWidth + ' ' + frame.clientHeight);

    for (let i = 0; i < data.layers.length - 1; i++) {
      const top = data.layers[i];
      const bottom = data.layers[i + 1];
      const topNodes = top.nodes
        .map(function(id) { return document.querySelector('.eco-node[data-node-id="' + id + '"]'); })
        .filter(Boolean);
      const botNodes = bottom.nodes
        .map(function(id) { return document.querySelector('.eco-node[data-node-id="' + id + '"]'); })
        .filter(Boolean);
      topNodes.forEach(function(srcEl) {
        const src = getRelativeRect(srcEl, frame);
        let best = null;
        let bestDist = Infinity;
        botNodes.forEach(function(destEl) {
          const dest = getRelativeRect(destEl, frame);
          const dist = Math.abs((src.x + src.w / 2) - (dest.x + dest.w / 2));
          if (dist < bestDist) { bestDist = dist; best = dest; }
        });
        if (!best) return;
        const sx = src.x + src.w / 2;
        const sy = src.y + src.h;
        const dx = best.x + best.w / 2;
        const dy = best.y;
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', 'M ' + sx + ' ' + sy + ' C ' + sx + ' ' + (sy + 24) + ', ' + dx + ' ' + (dy - 24) + ', ' + dx + ' ' + dy);
        path.setAttribute('stroke', 'rgba(255,255,255,0.15)');
        path.setAttribute('stroke-width', '1');
        path.setAttribute('fill', 'none');
        svg.appendChild(path);
      });
    }
  }

  function pathFromHash() {
    const hash = window.location.hash || '';
    const re = /^#path=([a-z-]+)$/i;
    const m = re.exec(hash);
    if (!m) return null;
    return data && data.paths && data.paths[m[1]] ? m[1] : null;
  }

  function renderPills() {
    const wrap = document.getElementById('eco-filters');
    if (!wrap) return;
    wrap.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'eco-pill';
    allBtn.dataset.pathId = '';
    allBtn.textContent = 'All paths';
    allBtn.addEventListener('click', function() { setActivePath(null); });
    wrap.appendChild(allBtn);

    Object.entries(data.paths).forEach(function(entry) {
      const id = entry[0];
      const path = entry[1];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eco-pill';
      btn.dataset.pathId = id;
      btn.style.setProperty('--pill-color', path.color);

      const iconSpan = document.createElement('span');
      iconSpan.textContent = path.icon;
      btn.appendChild(iconSpan);

      const labelSpan = document.createElement('span');
      labelSpan.textContent = path.label;
      btn.appendChild(labelSpan);

      btn.addEventListener('click', function() { setActivePath(id); });
      wrap.appendChild(btn);
    });

    refreshPillsActive();
  }

  function refreshPillsActive() {
    document.querySelectorAll('.eco-pill').forEach(function(b) {
      const isActive = (activePath === null && b.dataset.pathId === '') || b.dataset.pathId === activePath;
      b.classList.toggle('active', isActive);
    });
  }

  function setActivePath(pathId) {
    activePath = pathId;
    refreshPillsActive();
    applyPathToNodes();
    renderPathLines();
    // Sync to URL hash without triggering our own hashchange listener
    suppressHashListener = true;
    if (pathId) {
      history.replaceState(null, '', '#path=' + pathId);
    } else if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setTimeout(function() { suppressHashListener = false; }, 0);
  }

  function applyPathToNodes() {
    const canvas = document.getElementById('eco-canvas');
    if (!canvas) return;
    if (!activePath) {
      canvas.classList.remove('has-active-path');
      canvas.style.removeProperty('--path-color');
      document.querySelectorAll('.eco-node.is-on-path').forEach(function(el) {
        el.classList.remove('is-on-path');
      });
      return;
    }
    const path = data.paths[activePath];
    canvas.classList.add('has-active-path');
    canvas.style.setProperty('--path-color', path.color);
    const idsOnPath = new Set(path.nodes);
    document.querySelectorAll('.eco-node').forEach(function(el) {
      el.classList.toggle('is-on-path', idsOnPath.has(el.dataset.nodeId));
    });
  }

  function renderPathLines() {
    if (!activePath) {
      renderDefaultLines();
      return;
    }
    const path = data.paths[activePath];
    const svg = document.getElementById('eco-svg');
    const frame = svg && svg.parentElement;
    if (!svg || !frame) return;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 ' + frame.clientWidth + ' ' + frame.clientHeight);

    const layerOf = {};
    data.layers.forEach(function(layer) {
      layer.nodes.forEach(function(n) { layerOf[n] = layer.id; });
    });
    const byLayer = {};
    data.layers.forEach(function(layer) { byLayer[layer.id] = []; });
    path.nodes.forEach(function(id) {
      const lid = layerOf[id];
      if (lid) byLayer[lid].push(id);
    });

    for (let i = 0; i < data.layers.length - 1; i++) {
      const topIds = byLayer[data.layers[i].id];
      const botIds = byLayer[data.layers[i + 1].id];
      if (!topIds.length || !botIds.length) continue;
      topIds.forEach(function(sId) {
        botIds.forEach(function(dId) {
          const sEl = document.querySelector('.eco-node[data-node-id="' + sId + '"]');
          const dEl = document.querySelector('.eco-node[data-node-id="' + dId + '"]');
          if (!sEl || !dEl) return;
          const src = getRelativeRect(sEl, frame);
          const dst = getRelativeRect(dEl, frame);
          const sx = src.x + src.w / 2;
          const sy = src.y + src.h;
          const dx = dst.x + dst.w / 2;
          const dy = dst.y;
          const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          p.setAttribute('d', 'M ' + sx + ' ' + sy + ' C ' + sx + ' ' + (sy + 24) + ', ' + dx + ' ' + (dy - 24) + ', ' + dx + ' ' + dy);
          p.setAttribute('stroke', path.color);
          p.setAttribute('stroke-width', '2');
          p.setAttribute('fill', 'none');
          p.setAttribute('opacity', '0.9');
          svg.appendChild(p);
        });
      });
    }
  }

  window.addEventListener('hashchange', function() {
    if (suppressHashListener) return;
    setActivePath(pathFromHash());
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
