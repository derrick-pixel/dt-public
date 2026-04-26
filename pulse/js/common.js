// Elitez Pulse — common.js
// Injects nav + footer, loads active theme. Exports esc() for HTML escaping.

export function esc(s) {
  if (s === null || s === undefined) return "";
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c])
  );
}

// Parse a trusted/pre-escaped HTML string into DOM nodes and swap into el.
// Avoids innerHTML assignment. All dynamic strings in callers MUST pass through esc().
export function swapMarkup(el, html) {
  if (typeof DOMParser === "undefined") return; // no-op in Node
  const parsed = new DOMParser().parseFromString(html, "text/html");
  el.replaceChildren(...parsed.body.childNodes);
}

function getBase() {
  return (typeof document !== "undefined" && document.body?.dataset?.base) || ".";
}

async function loadActiveTheme() {
  const BASE = getBase();
  const link = document.getElementById("theme-css");
  if (!link) return;
  let themeId = "sticker";
  try {
    const stored = localStorage.getItem("ep_activeTheme");
    if (stored) themeId = stored;
    else {
      const res = await fetch(`${BASE}/data/templates.json?v=1`);
      const data = await res.json();
      themeId = data.active || "sticker";
    }
  } catch (e) {
    themeId = "sticker";
  }
  link.href = `${BASE}/assets/theme-${themeId}.css?v=1`;
  document.documentElement.dataset.theme = themeId;
}

function renderNav(container) {
  const BASE = getBase();
  const tpl = `
    <nav class="nav">
      <a href="${BASE}/" class="nav__logo logo-lockup" aria-label="Elitez Pulse home">
        <img class="logo-lockup__elitez" src="${BASE}/assets/logo-elitez.png" alt="Elitez">
        <span class="logo-lockup__pulse">PULSE ★</span>
      </a>
      <div class="nav__links">
        <a href="${BASE}/services.html">Services</a>
        <a href="${BASE}/pricing.html">Pricing</a>
        <a href="${BASE}/work.html">Work</a>
        <a href="${BASE}/about.html">About</a>
        <a href="${BASE}/diagnostic.html">Diagnostic</a>
        <a href="${BASE}/admin/" style="opacity:0.55;">Admin</a>
      </div>
      <a href="${BASE}/contact.html" class="nav__cta">Talk to us →</a>
    </nav>`;
  swapMarkup(container, tpl);
}

async function renderFooter(container) {
  const BASE = getBase();
  let company = {
    name: "Elitez Pulse",
    parent: "Elitez Group",
    contactEmail: "pulse@elitez.asia",
    social: { linkedin: "" }
  };
  try {
    const res = await fetch(`${BASE}/data/company.json?v=1`);
    if (res.ok) company = await res.json();
  } catch (e) { /* fallback */ }

  const year = new Date().getFullYear();
  const linkedin = esc(company.social?.linkedin || "");
  const email = esc(company.contactEmail || "");
  const parent = esc(company.parent || "Elitez Group");
  const name = esc(company.name || "Elitez Pulse");

  const tpl = `
    <footer class="footer">
      <div class="container">
        <div class="footer__grid">
          <div>
            <span class="logo-lockup logo-lockup--lg" style="margin-bottom:20px; background: var(--cream); padding: 12px 14px; border-radius: 10px;">
              <img class="logo-lockup__elitez" src="${BASE}/assets/logo-elitez.png" alt="Elitez">
              <span class="logo-lockup__pulse">PULSE ★</span>
            </span>
            <p style="max-width:320px; opacity:0.75; margin-bottom:20px;">Bundled marketing retainers for SMEs. SG-led, AI-augmented, backed by Elitez Group.</p>
            <a href="https://elitez.asia" target="_blank" rel="noopener" class="footer__parent">
              <img src="${BASE}/assets/logo-elitez.png" alt="Elitez Group" height="18" style="background: var(--cream); padding: 2px 6px; border-radius: 4px;">
              <span>Part of Elitez Group</span>
            </a>
          </div>
          <div>
            <h4>Services</h4>
            <p><a href="${BASE}/services.html">Capabilities</a></p>
            <p><a href="${BASE}/pricing.html">Pricing</a></p>
            <p><a href="${BASE}/diagnostic.html">ROI Diagnostic</a></p>
          </div>
          <div>
            <h4>Company</h4>
            <p><a href="${BASE}/about.html">About</a></p>
            <p><a href="${BASE}/work.html">Work</a></p>
            <p><a href="${BASE}/contact.html">Contact</a></p>
          </div>
          <div>
            <h4>Reach us</h4>
            <p><a href="mailto:${email}">${email}</a></p>
            ${linkedin ? `<p><a href="${linkedin}" target="_blank" rel="noopener">LinkedIn</a></p>` : ""}
          </div>
        </div>
        <div class="footer__bottom">
          <span>© ${year} ${name}. All rights reserved.</span>
          <span class="mono">v0.1 · sticker-zine</span>
        </div>
      </div>
    </footer>`;
  swapMarkup(container, tpl);
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    loadActiveTheme();
    const nav = document.querySelector("[data-nav]");
    const foot = document.querySelector("[data-footer]");
    if (nav) renderNav(nav);
    if (foot) renderFooter(foot);
  });
}
