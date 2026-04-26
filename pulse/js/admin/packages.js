import { esc, swapMarkup } from "../common.js?v=1";

const KEY = "ep_pkgOverride";
const IDS = ["entry", "core", "premium"];

export async function render(root) {
  const override = JSON.parse(localStorage.getItem(KEY) || "null");
  let data = override;
  if (!data) {
    const res = await fetch("../data/packages.json?v=1");
    data = await res.json();
  }

  const tpl = `
    <h1>Pricing Packages</h1>
    <p class="subtle" style="margin-bottom:24px;">Edit in place. <strong>Save</strong> persists changes to your browser only. <strong>Download JSON</strong> to replace <code>data/packages.json</code> in the repo when permanent.</p>
    <div id="tiers" class="grid grid--3"></div>
    <h2 style="margin-top:40px;">Add-ons</h2>
    <div id="addons" style="margin-top:12px;"></div>
    <div style="display:flex; gap:12px; margin-top:24px; flex-wrap:wrap;">
      <button type="button" class="btn btn--primary" id="save" style="padding:10px 18px; font-size:13px;">Save</button>
      <button type="button" class="btn btn--outline" id="download" style="padding:10px 18px; font-size:13px;">Download JSON</button>
      <button type="button" class="btn btn--outline" id="reset" style="padding:10px 18px; font-size:13px;">Reset to default</button>
      <a class="btn btn--outline" href="../pricing.html" target="_blank" rel="noopener" style="padding:10px 18px; font-size:13px;">Preview /pricing.html →</a>
    </div>`;
  swapMarkup(root, tpl);

  renderTiers(data.tiers);
  renderAddons(data.addOns);

  document.getElementById("save").addEventListener("click", () => {
    localStorage.setItem(KEY, JSON.stringify(collect()));
    alert("Saved to this browser. Refresh /pricing.html to preview.");
  });
  document.getElementById("download").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(collect(), null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "packages.json";
    a.click();
    URL.revokeObjectURL(a.href);
  });
  document.getElementById("reset").addEventListener("click", () => {
    if (confirm("Reset to default packages.json?")) {
      localStorage.removeItem(KEY);
      render(root);
    }
  });
}

function renderTiers(tiers) {
  const host = document.getElementById("tiers");
  const tpl = tiers.map((t, i) => `
    <div class="card" style="padding:20px;">
      <input class="tier-name" data-i="${i}" value="${esc(t.name)}" style="font-size:20px; font-weight:900; width:100%; border:none; border-bottom:2px solid var(--ink); background:transparent; padding:4px 0;">
      <input class="tier-tagline" data-i="${i}" value="${esc(t.tagline)}" style="width:100%; border:none; opacity:0.7; margin:8px 0; padding:4px 0; background:transparent;">
      <div style="display:flex; gap:10px; margin-top:10px;">
        <label style="flex:1; font-size:11px; font-weight:700;">From<br><input type="number" class="tier-from" data-i="${i}" value="${t.priceFrom}" style="width:100%;"></label>
        <label style="flex:1; font-size:11px; font-weight:700;">To<br><input type="number" class="tier-to" data-i="${i}" value="${t.priceTo}" style="width:100%;"></label>
      </div>
      <label style="display:block; margin-top:10px; font-size:12px;">
        <input type="checkbox" class="tier-popular" data-i="${i}" ${t.popular ? "checked" : ""}>
        Popular (most-picked sticker)
      </label>
      <label style="display:block; margin-top:10px; font-size:11px; font-weight:700;">Features (one per line)
        <textarea class="tier-features" data-i="${i}" rows="6" style="width:100%; margin-top:4px; font-size:13px;">${esc(t.features.join("\n"))}</textarea>
      </label>
    </div>`).join("");
  swapMarkup(host, tpl);
}

function renderAddons(addons) {
  const host = document.getElementById("addons");
  const tpl = `<table class="tbl">
    <thead><tr><th>Name</th><th>From</th><th>To</th><th>Unit</th></tr></thead>
    <tbody>${addons.map((a, i) => `
      <tr>
        <td><input class="ao-name" data-i="${i}" value="${esc(a.name)}" style="width:100%; border:none; background:transparent; padding:4px;"></td>
        <td><input class="ao-from" type="number" data-i="${i}" value="${a.priceFrom}" style="width:90px;"></td>
        <td><input class="ao-to" type="number" data-i="${i}" value="${a.priceTo}" style="width:90px;"></td>
        <td><input class="ao-unit" data-i="${i}" value="${esc(a.unit)}" style="width:100%; border:none; background:transparent; padding:4px;"></td>
      </tr>`).join("")}
    </tbody>
  </table>`;
  swapMarkup(host, tpl);
}

function collect() {
  const tiers = IDS.map((id, i) => ({
    id,
    name: document.querySelector(`.tier-name[data-i="${i}"]`).value,
    tagline: document.querySelector(`.tier-tagline[data-i="${i}"]`).value,
    priceFrom: Number(document.querySelector(`.tier-from[data-i="${i}"]`).value),
    priceTo: Number(document.querySelector(`.tier-to[data-i="${i}"]`).value),
    currency: "SGD",
    cadence: "per month",
    popular: document.querySelector(`.tier-popular[data-i="${i}"]`).checked,
    features: document.querySelector(`.tier-features[data-i="${i}"]`).value.split("\n").map(s => s.trim()).filter(Boolean),
    cta: ["Start with Entry", "Pick Core", "Go Premium"][i] || "Book a call"
  }));
  const addOnInputs = document.querySelectorAll(".ao-name");
  const addOns = [...addOnInputs].map((el, i) => ({
    name: el.value,
    priceFrom: Number(document.querySelector(`.ao-from[data-i="${i}"]`).value),
    priceTo: Number(document.querySelector(`.ao-to[data-i="${i}"]`).value),
    unit: document.querySelector(`.ao-unit[data-i="${i}"]`).value
  }));
  return { tiers, addOns };
}
