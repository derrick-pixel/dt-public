import { esc, swapMarkup } from "../common.js?v=1";

export async function render(root) {
  const override = JSON.parse(localStorage.getItem("ep_settings") || "null");
  const fallback = await fetch("../data/company.json?v=1").then(r => r.json());
  const company = override || fallback;

  const tpl = `
    <h1>Settings</h1>

    <section style="max-width:540px;">
      <h3>Company info</h3>
      <label>Company name<input id="s-name" value="${esc(company.name)}" style="width:100%; margin-top:6px;"></label>
      <label style="margin-top:12px;">Parent<input id="s-parent" value="${esc(company.parent)}" style="width:100%; margin-top:6px;"></label>
      <label style="margin-top:12px;">Contact email<input id="s-email" value="${esc(company.contactEmail)}" style="width:100%; margin-top:6px;"></label>
      <label style="margin-top:12px;">Phone<input id="s-phone" value="${esc(company.phone || "")}" style="width:100%; margin-top:6px;"></label>
      <label style="margin-top:12px;">LinkedIn URL<input id="s-linkedin" value="${esc(company.social?.linkedin || "")}" style="width:100%; margin-top:6px;"></label>
      <button type="button" class="btn btn--primary" id="save" style="margin-top:16px; padding:10px 18px; font-size:13px;">Save</button>
    </section>

    <section style="margin-top:40px;">
      <h3>Backup & export</h3>
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <button type="button" class="btn btn--outline" id="export-all" style="padding:10px 18px; font-size:13px;">Download all data as JSON</button>
        <button type="button" class="btn btn--outline" id="clear-leads" style="padding:10px 18px; font-size:13px; border-color:#c0392b; color:#c0392b;">Clear all leads</button>
      </div>
      <p class="subtle" style="margin-top:12px; font-size:13px;">Backup pulls every <code>ep_*</code> key out of browser localStorage. Clear-leads is irreversible unless you've exported.</p>
    </section>`;
  swapMarkup(root, tpl);

  document.getElementById("save").addEventListener("click", () => {
    const updated = {
      ...company,
      name: document.getElementById("s-name").value,
      parent: document.getElementById("s-parent").value,
      contactEmail: document.getElementById("s-email").value,
      phone: document.getElementById("s-phone").value,
      social: { ...(company.social || {}), linkedin: document.getElementById("s-linkedin").value }
    };
    localStorage.setItem("ep_settings", JSON.stringify(updated));
    alert("Saved.");
  });

  document.getElementById("export-all").addEventListener("click", () => {
    const snapshot = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("ep_")) {
        try { snapshot[k] = JSON.parse(localStorage.getItem(k)); }
        catch { snapshot[k] = localStorage.getItem(k); }
      }
    }
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `elitez-pulse-backup-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  document.getElementById("clear-leads").addEventListener("click", () => {
    if (confirm("Clear ALL leads? This cannot be undone.")) {
      localStorage.removeItem("ep_leads");
      alert("Leads cleared.");
    }
  });
}
