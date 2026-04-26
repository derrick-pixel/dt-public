// contact.js — form submit → localStorage lead.

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contact-form");
  if (!form) return;

  // Prefill package from URL ?pkg=core
  const params = new URLSearchParams(location.search);
  const pkg = params.get("pkg");
  if (pkg && form.elements.pkg) form.elements.pkg.value = pkg;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const company = String(fd.get("company") || "").trim();
    const email = String(fd.get("email") || "").trim();
    if (!name || !company || !email) {
      alert("Name, company and email are required.");
      return;
    }
    const lead = {
      id: `ld_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ts: Date.now(),
      source: "contact",
      name,
      company,
      email,
      package: fd.get("pkg") || null,
      message: String(fd.get("message") || "").trim(),
      stage: "New",
      stageHistory: [{ stage: "New", ts: Date.now() }]
    };
    const leads = JSON.parse(localStorage.getItem("ep_leads") || "[]");
    leads.push(lead);
    localStorage.setItem("ep_leads", JSON.stringify(leads));

    form.style.display = "none";
    const s = document.getElementById("success");
    if (s) s.style.display = "block";
  });
});
