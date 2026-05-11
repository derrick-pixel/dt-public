// admin-payments.js — Pending Payments tab for the admin console.
// Lists payments with status='pending'; admin can mark them paid or cancel.
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

  function rowFor(p, onAction) {
    const tr = el("tr");
    tr.appendChild(el("td", { text: p.reference }));
    tr.appendChild(el("td", { text: p.holder_id }));
    tr.appendChild(el("td", { text: Number(p.amount_sgd).toFixed(2) }));
    tr.appendChild(el("td", { text: new Date(p.created_at).toLocaleString() }));
    const payBtn = el("button", { class: "btn-small", type: "button", text: "Mark paid" });
    payBtn.addEventListener("click", () => onAction("confirm", p));
    const cancelBtn = el("button", { class: "btn-small btn-small--ghost", type: "button", text: "Cancel" });
    cancelBtn.addEventListener("click", () => onAction("cancel", p));
    const td = el("td", null, [payBtn, document.createTextNode(" "), cancelBtn]);
    tr.appendChild(td);
    return tr;
  }

  async function load(tbody) {
    const supa = window.ESOPSupa && window.ESOPSupa.client;
    tbody.replaceChildren();
    if (!supa) {
      tbody.appendChild(el("tr", null, [el("td", { colspan: 5, class: "muted", text: "Supabase not initialised." })]));
      return;
    }
    const { data, error } = await supa
      .from("payments")
      .select("*")
      .eq("status", "pending")
      .order("created_at");
    if (error) {
      tbody.appendChild(el("tr", null, [el("td", { colspan: 5, class: "alert alert--bad", text: error.message })]));
      return;
    }
    if (!data.length) {
      tbody.appendChild(el("tr", null, [el("td", { colspan: 5, class: "muted", text: "No pending payments." })]));
      return;
    }
    for (const p of data) tbody.appendChild(rowFor(p, async (action, payment) => {
      const supa = window.ESOPSupa.client;
      try {
        if (action === "confirm") {
          const notes = prompt("Confirmation notes (bank txn id, time received, etc.):", "") ?? "";
          const { error } = await supa.rpc("confirm_payment", { p_payment_id: payment.id, p_notes: notes });
          if (error) throw error;
        } else {
          const reason = prompt("Cancellation reason:");
          if (!reason) return;
          const { error } = await supa.rpc("cancel_payment", { p_payment_id: payment.id, p_reason: reason });
          if (error) throw error;
        }
        await load(tbody);
      } catch (e) {
        alert("Failed: " + (e.message || e));
      }
    }));
  }

  async function init() {
    await window.ESOPAuth.ready();
    const s = window.ESOPAuth.readSession();
    if (!s || (s.kind !== "admin" && s.kind !== "committee")) return;

    const content = document.getElementById("content");
    if (!content) return;

    const tbody = el("tbody");
    const thead = el("thead", null, [
      el("tr", null, ["Reference", "Holder", "Amount (SGD)", "Submitted", ""].map((t) => el("th", { text: t })))
    ]);
    const table = el("table", { class: "data-table", style: "width:100%;" }, [thead, tbody]);
    const section = el("section", { id: "tab-payments", class: "panel", "data-tab": "payments" }, [
      el("header", null, [el("h2", { text: "Pending Payments" })]),
      el("p", { class: "muted tiny", text: "Reconcile each pending exercise against the company bank statement, then mark it paid. Marking paid emits exercise_settled, which the holder's calc consumes." }),
      table
    ]);
    content.appendChild(section);
    await load(tbody);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
