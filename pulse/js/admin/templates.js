import { esc, swapMarkup } from "../common.js?v=1";

export async function render(root) {
  const data = await fetch("../data/templates.json?v=1").then(r => r.json());
  const active = localStorage.getItem("ep_activeTheme") || data.active;
  const activeVar = data.variants.find(v => v.id === active) || data.variants[0];

  const swatch = (accents) => accents.map(c =>
    `<span style="display:inline-block; width:16px; height:16px; border-radius:4px; background:${esc(c)}; margin-right:4px; border:1px solid rgba(0,0,0,0.15); vertical-align:middle;"></span>`
  ).join("");

  const tpl = `
    <h1>Templates</h1>
    <p class="subtle">Your site is running <strong>${esc(activeVar.name)}</strong>. Click <em>Set as active</em> on any variant — refresh public pages to see the swap.</p>

    <div class="grid grid--3" style="margin-top:24px;">
      ${data.variants.map(v => `
        <div class="card ${active === v.id ? 'card--mustard' : ''}" style="padding:22px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="margin:0;">${esc(v.name)}</h3>
            ${active === v.id ? '<span class="sticker sticker--ink" style="font-size:10px;">ACTIVE ★</span>' : ''}
          </div>
          <p class="subtle" style="font-size:13px; min-height:60px;">${esc(v.description)}</p>
          <p style="margin:8px 0;">${swatch([v.palette.bg, v.palette.ink, ...v.palette.accents])}</p>
          <p class="mono subtle" style="font-size:11px;">${esc(v.font)} · ${esc(v.vibe)}</p>
          <div style="display:flex; gap:8px; margin-top:14px; flex-wrap:wrap;">
            <a class="btn btn--outline" href="template-preview.html?v=${esc(v.id)}" target="_blank" rel="noopener" style="padding:8px 12px; font-size:12px;">Preview →</a>
            <button type="button" class="btn btn--primary" data-activate="${esc(v.id)}" style="padding:8px 12px; font-size:12px;" ${active === v.id ? "disabled" : ""}>${active === v.id ? "★ Active" : "Set active"}</button>
          </div>
        </div>
      `).join("")}
    </div>`;
  swapMarkup(root, tpl);

  root.querySelectorAll("[data-activate]").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.activate;
      localStorage.setItem("ep_activeTheme", id);
      alert(`Active theme set to ${id}. Refresh public pages to see the swap.`);
      render(root);
    });
  });
}
