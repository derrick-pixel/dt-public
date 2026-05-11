// activity-log.js — Activity Log tab. Calls the public.activity_log RPC
// (which UNIONs events + audit_log and filters server-side) and renders a
// paginated table with filters and CSV export.
(function () {
  function el(tag, attrs, children) {
    const e = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k === "text") e.textContent = v;
      else if (k === "class") e.className = v;
      else if (v != null) e.setAttribute(k, String(v));
    }
    if (children) for (const c of children) if (c != null) e.appendChild(c);
    return e;
  }

  const LIMIT = 100;
  let offset = 0;
  let lastFilters = {};
  let tbody;
  let pageInfo;

  function readFilters(form) {
    return {
      p_from: form.from.value ? new Date(form.from.value).toISOString() : null,
      p_to: form.to.value ? new Date(form.to.value).toISOString() : null,
      p_actor_email: form.actor_email.value || null,
      p_action_prefix: form.action_prefix.value || null,
      p_ip_contains: form.ip_contains.value || null,
    };
  }

  async function load() {
    const supa = window.ESOPSupa && window.ESOPSupa.client;
    if (!supa) return;
    tbody.replaceChildren();
    const { data, error } = await supa.rpc("activity_log", {
      ...lastFilters, p_limit: LIMIT, p_offset: offset,
    });
    if (error) {
      tbody.appendChild(el("tr", null, [el("td", { colspan: 7, class: "alert alert--bad", text: error.message })]));
      return;
    }
    if (!data.length) {
      tbody.appendChild(el("tr", null, [el("td", { colspan: 7, class: "muted", text: "No rows for these filters." })]));
      pageInfo.textContent = "0";
      return;
    }
    for (const r of data) {
      const ua = String(r.user_agent || "");
      const tr = el("tr");
      tr.appendChild(el("td", { text: new Date(r.at).toLocaleString() }));
      tr.appendChild(el("td", { text: r.actor_email ?? "" }));
      tr.appendChild(el("td", { text: r.actor_role ?? "" }));
      tr.appendChild(el("td", { text: r.action }));
      tr.appendChild(el("td", { text: r.target ?? "" }));
      tr.appendChild(el("td", { text: r.ip ?? "" }));
      const td = el("td", { text: ua.slice(0, 30) });
      td.setAttribute("title", ua);
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    pageInfo.textContent = `${offset + 1}–${offset + data.length}`;
  }

  async function exportCsv() {
    const supa = window.ESOPSupa.client;
    const { data, error } = await supa.rpc("activity_log", {
      ...lastFilters, p_limit: 10000, p_offset: 0,
    });
    if (error) { alert(error.message); return; }
    const esc = (v) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const lines = ["at,actor_email,actor_role,action,target,ip,user_agent"];
    for (const r of data) {
      lines.push([r.at, r.actor_email, r.actor_role, r.action, r.target, r.ip, r.user_agent].map(esc).join(","));
    }
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `activity-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
    await supa.from("audit_log").insert({
      action: "audit_export_downloaded",
      target: "activity_log",
      metadata: { filters: lastFilters, rows: data.length },
    });
  }

  async function init() {
    await window.ESOPAuth.ready();
    const s = window.ESOPAuth.readSession();
    if (!s || (s.kind !== "admin" && s.kind !== "committee")) return;

    const content = document.getElementById("content");
    if (!content) return;

    const form = el("form", { class: "form-row", style: "display:flex; flex-wrap:wrap; gap:0.8rem; align-items:flex-end; margin-bottom:1rem;" });
    const fromInput = el("input", { type: "datetime-local", name: "from" });
    const toInput = el("input", { type: "datetime-local", name: "to" });
    const actorInput = el("input", { type: "text", name: "actor_email", placeholder: "contains..." });
    const actionInput = el("input", { type: "text", name: "action_prefix", placeholder: "e.g. login_" });
    const ipInput = el("input", { type: "text", name: "ip_contains" });
    form.appendChild(el("label", { text: "From" }, [fromInput]));
    form.appendChild(el("label", { text: "To" }, [toInput]));
    form.appendChild(el("label", { text: "Actor email" }, [actorInput]));
    form.appendChild(el("label", { text: "Action prefix" }, [actionInput]));
    form.appendChild(el("label", { text: "IP contains" }, [ipInput]));
    const applyBtn = el("button", { class: "btn", type: "submit", text: "Apply" });
    const exportBtn = el("button", { class: "btn", type: "button", text: "Download CSV" });
    form.appendChild(applyBtn);
    form.appendChild(exportBtn);

    tbody = el("tbody");
    const thead = el("thead", null, [
      el("tr", null, ["Time", "Actor", "Role", "Action", "Target", "IP", "UA"].map((t) => el("th", { text: t })))
    ]);
    const table = el("table", { class: "data-table", style: "width:100%;" }, [thead, tbody]);

    const prevBtn = el("button", { class: "btn-small", type: "button", text: "Prev" });
    const nextBtn = el("button", { class: "btn-small", type: "button", text: "Next" });
    pageInfo = el("span", { class: "muted", style: "margin: 0 0.8rem;", text: "" });
    const pager = el("nav", { class: "pager", style: "margin-top: 0.8rem;" }, [prevBtn, pageInfo, nextBtn]);

    const section = el("section", { id: "tab-activity", class: "panel", "data-tab": "activity" }, [
      el("header", null, [el("h2", { text: "Activity Log" })]),
      el("p", { class: "muted tiny", text: "Union of state-changing events and authentication events. Committee + Admin only." }),
      form, table, pager
    ]);
    content.appendChild(section);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      lastFilters = readFilters(form);
      offset = 0; load();
    });
    prevBtn.addEventListener("click", () => { offset = Math.max(0, offset - LIMIT); load(); });
    nextBtn.addEventListener("click", () => { offset += LIMIT; load(); });
    exportBtn.addEventListener("click", exportCsv);

    load();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
