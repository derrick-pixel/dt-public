// admin-roster.js — Roster tab for the admin console. Lists all profiles,
// lets an admin invite new users or resend the magic-link to existing ones.
// Uses the admin-invite Edge Function so the service-role key never touches
// the browser.
(function () {
  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (k === "text") e.textContent = v;
        else if (k === "class") e.className = v;
        else if (v != null) e.setAttribute(k, String(v));
      }
    }
    if (children) for (const c of children) if (c != null) e.appendChild(c);
    return e;
  }

  function buildSection(tbody) {
    const addBtn = el("button", { id: "add-holder-btn", class: "btn", type: "button", text: "Invite holder / member" });
    const header = el("header", { class: "row", style: "justify-content: space-between; align-items: baseline;" }, [
      el("h2", { style: "margin:0;", text: "Holder Roster" }),
      addBtn,
    ]);
    const blurb = el("p", { class: "muted tiny", text:
      "Inviting a user sends a one-time magic-link to their work email. They set their own password on first sign-in. All invites are recorded in the Activity Log."
    });
    const thead = el("thead", null, [
      el("tr", null, ["Holder ID", "Name", "Email", "Role", ""].map((t) => el("th", { text: t })))
    ]);
    const table = el("table", { id: "roster-table", class: "data-table", style: "margin-top:1rem; width:100%;" }, [thead, tbody]);
    const errBox = el("div", { id: "roster-error", class: "alert alert--bad", style: "margin-top:1rem; display:none;" });
    const section = el("section", { id: "tab-roster", class: "panel", "data-tab": "roster" }, [header, blurb, table, errBox]);
    return { section, addBtn, errBox };
  }

  function rowFor(profile) {
    const tr = el("tr");
    tr.appendChild(el("td", { text: profile.holder_id ?? "" }));
    tr.appendChild(el("td", { text: profile.full_name }));
    tr.appendChild(el("td", { text: profile.email }));
    tr.appendChild(el("td", { text: profile.role }));
    const btn = el("button", { class: "btn-small", type: "button", text: "Re-send invite" });
    btn.dataset.action = "resend";
    btn.dataset.email = profile.email;
    btn.dataset.name = profile.full_name;
    btn.dataset.role = profile.role;
    btn.dataset.holder = profile.holder_id ?? "";
    tr.appendChild(el("td", null, [btn]));
    return tr;
  }

  async function loadRoster(tbody) {
    const supa = window.ESOPSupa && window.ESOPSupa.client;
    tbody.replaceChildren();
    if (!supa) {
      tbody.appendChild(el("tr", null, [el("td", { colspan: 5, class: "muted", text: "Supabase not initialised." })]));
      return;
    }
    const { data: profiles, error } = await supa
      .from("profiles")
      .select("id,email,full_name,role,holder_id")
      .order("full_name");
    if (error) {
      const td = el("td", { colspan: 5, class: "alert alert--bad", text: error.message });
      tbody.appendChild(el("tr", null, [td]));
      return;
    }
    for (const p of profiles) tbody.appendChild(rowFor(p));
  }

  async function invite({ email, full_name, role, holder_id }) {
    const supa = window.ESOPSupa.client;
    const { data: { session } } = await supa.auth.getSession();
    if (!session) throw new Error("not signed in");
    const url = window.ESOP_CONFIG.supabase_url + "/functions/v1/admin-invite";
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, full_name, role, holder_id }),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async function init() {
    await window.ESOPAuth.ready();
    const s = window.ESOPAuth.readSession();
    if (!s || (s.kind !== "admin" && s.kind !== "committee")) return;

    const content = document.getElementById("content");
    if (!content) return;

    const tbody = el("tbody");
    const { section, addBtn, errBox } = buildSection(tbody);
    content.appendChild(section);

    await loadRoster(tbody);

    addBtn.addEventListener("click", async () => {
      const holder_id = prompt("Holder ID (e.g. 29; leave blank for committee/admin):");
      if (holder_id === null) return;
      const full_name = prompt("Full legal name (must match what they'll type when signing):");
      if (!full_name) return;
      const email = prompt("Email:");
      if (!email) return;
      const role = prompt("Role (holder / committee / admin):", "holder");
      if (!role) return;
      try {
        await invite({ email, full_name, role, holder_id: holder_id || null });
        alert(`Invite sent to ${email}.`);
        await loadRoster(tbody);
      } catch (e) {
        errBox.textContent = "Invite failed: " + e.message;
        errBox.style.display = "block";
      }
    });

    section.querySelector("#roster-table").addEventListener("click", async (e) => {
      if (e.target.dataset.action !== "resend") return;
      const t = e.target;
      if (!confirm(`Resend invite to ${t.dataset.email}?`)) return;
      try {
        await invite({
          email: t.dataset.email,
          full_name: t.dataset.name,
          role: t.dataset.role,
          holder_id: t.dataset.holder || null,
        });
        alert("Re-sent.");
      } catch (err) {
        errBox.textContent = "Re-send failed: " + err.message;
        errBox.style.display = "block";
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
