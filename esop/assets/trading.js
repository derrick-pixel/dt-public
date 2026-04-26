// Elitez ESOP — Annual Trading Window (Clause 8 / 2026 Info Rule).
// Holders: see current window, submit bid/ask, view history.
// Admin: open/close windows, toggle ROFR, run clearing, inspect trades.
(function () {
  const { renderTopbar, renderFooter, requireSession, el } = window.ESOPApp;
  const C = window.ESOPCalc;
  const Store = window.ESOPStore;
  const Committee = window.ESOPCommittee;
  const { fmt } = C;

  renderTopbar("trading");
  const session = requireSession();
  if (!session) return;

  const isAdmin = session.kind === "admin" || session.kind === "committee";
  const isCommittee = session.kind === "committee";
  const holder = !isAdmin ? C.holders().find(h => h.id === session.id) : null;

  function gatedAction(actionType, payload, label) {
    if (!isCommittee) {
      alert("This action requires a Committee session.");
      return { error: "not_committee" };
    }
    const res = Committee.act(actionType, payload);
    if (res.error) { alert("Action refused: " + res.error); return res; }
    if (res.status === "proposed") alert(`${label} proposed — Resolution ${res.resolution_id.slice(0, 12)}. Other Committee members must vote.`);
    else if (res.status === "existing") alert("A matching pending resolution already exists — vote from the Committee page.");
    return res;
  }

  const root = document.getElementById("content");
  render();

  Store.subscribe(() => {
    // Soft re-render: replace contents
    while (root.firstChild) root.removeChild(root.firstChild);
    render();
  });

  renderFooter();

  // =====================================================================

  function render() {
    const state = Store.state();
    const currentWindow = state.windows.find(w => w.status === "open");
    const pastWindows = state.windows.filter(w => w.status === "closed");

    root.appendChild(buildHero(currentWindow));

    if (isAdmin) {
      root.appendChild(buildAdminControls(currentWindow, state));
    }

    if (currentWindow) {
      root.appendChild(buildOrderSection(currentWindow, state));
      root.appendChild(buildOrderBook(currentWindow, state));
    } else {
      root.appendChild(buildNoWindowPanel());
    }

    if (pastWindows.length) {
      root.appendChild(buildWindowHistory(pastWindows));
    }
  }

  function buildHero(currentWindow) {
    return el("section", { class: "hero" }, [
      el("div", null, [
        el("div", { class: "micro", text: "Annual Trading Window · Clause 8" }),
        el("h1", { style: "margin-top:1rem;", text: currentWindow ? currentWindow.name : "Trading window" }),
        el("p", { class: "lede", style: "margin-top:1rem;" }, [
          currentWindow
            ? `Window open · closes ${fmt.date(currentWindow.closes)}. Submit your bids and asks below.`
            : "No trading window is currently open. The next scheduled window begins 16 January and runs until 31 January."
        ])
      ]),
      el("div", { class: "panel" }, [
        el("div", { class: "micro", text: "Mechanics" }),
        el("ul", { style: "margin-top:0.8rem; margin-left:1rem; line-height:1.8; font-size:0.9rem;" }, [
          el("li", { text: "Submit a bid (buy) or ask (sell) at any price." }),
          el("li", { text: "Orders are batched — clearing runs at window close." }),
          el("li", { text: "Company right-of-first-refusal: highest bid + S$0.01." }),
          el("li", { text: "Remaining crosses match in price-time priority." }),
          el("li", { text: "Exercised shares lock until the following January window." })
        ])
      ])
    ]);
  }

  function buildAdminControls(currentWindow, state) {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Administrator · window controls" }) ])
    ]);
    const panel = el("div", { class: "panel" });
    if (!currentWindow) {
      const nameInput = el("input", { type: "text", placeholder: "Window name e.g. Jan 2027", value: proposedName() });
      const opensInput = el("input", { type: "date", value: proposedOpens() });
      const closesInput = el("input", { type: "date", value: proposedCloses() });
      const openBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Open window"]);
      openBtn.onclick = () => {
        gatedAction("window_open", {
          name: nameInput.value.trim() || proposedName(),
          opens: opensInput.value,
          closes: closesInput.value
        }, "Open trading window");
      };
      panel.appendChild(el("div", { class: "grid grid-3" }, [
        field("Name", nameInput),
        field("Opens", opensInput),
        field("Closes", closesInput)
      ]));
      panel.appendChild(openBtn);
    } else {
      const useRofr = el("input", { type: "checkbox", checked: "true", id: "use-rofr" });
      const clearBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Close window & run clearing"]);
      clearBtn.onclick = () => runClearing(currentWindow, useRofr.checked);
      const dryBtn = el("button", { type: "button", class: "btn btn--ghost", style: "margin-left:0.6rem;" }, ["Dry-run clearing"]);
      dryBtn.onclick = () => previewClearing(currentWindow, useRofr.checked, panel);

      panel.appendChild(el("p", { text: `Current window: ${currentWindow.name}. Opens ${fmt.date(currentWindow.opens)}, closes ${fmt.date(currentWindow.closes)}.` }));
      panel.appendChild(el("div", { class: "rule" }));
      panel.appendChild(el("label", { style: "display:flex; align-items:center; gap:0.5rem; font-size:0.9rem;" }, [
        useRofr, document.createTextNode("Invoke Company right-of-first-refusal (buy all sell orders at highest bid + S$0.01)")
      ]));
      panel.appendChild(el("div", { style: "margin-top:1rem;" }, [clearBtn, dryBtn]));
    }
    section.appendChild(panel);
    return section;
  }

  function buildOrderSection(currentWindow, state) {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Submit an order" }) ])
    ]);

    // For admin preview, show holder selector
    let orderingHolderId = holder ? holder.id : null;
    const holderSelect = isAdmin ? (() => {
      const s = el("select");
      s.appendChild(el("option", { value: "", text: "Submit on behalf of…" }));
      C.holders().forEach(h => s.appendChild(el("option", { value: String(h.id), text: h.name })));
      s.addEventListener("change", () => { orderingHolderId = Number(s.value) || null; });
      return s;
    })() : null;

    const sideSelect = el("select");
    sideSelect.appendChild(el("option", { value: "buy", text: "Buy (bid)" }));
    sideSelect.appendChild(el("option", { value: "sell", text: "Sell (ask)" }));
    const qtyInput = el("input", { type: "number", value: "1000", step: "100", min: "1" });
    const fmv = C.currentFMV();
    const priceInput = el("input", { type: "number", value: String(fmv.toFixed(4)), step: "0.0001", min: "0" });
    const submitBtn = el("button", { type: "button", class: "btn btn--brass" }, ["Submit order"]);
    const err = el("div", { class: "alert alert--bad", style: "margin-top:0.8rem; display:none;" });

    submitBtn.onclick = () => {
      err.style.display = "none";
      if (!orderingHolderId) { err.textContent = "Pick a holder first."; err.style.display = "block"; return; }
      const qty = Number(qtyInput.value);
      const price = Number(priceInput.value);
      if (!qty || qty < 1) { err.textContent = "Quantity must be ≥ 1."; err.style.display = "block"; return; }
      if (!price || price <= 0) { err.textContent = "Price must be positive."; err.style.display = "block"; return; }
      Store.emit("order_placed", {
        side: sideSelect.value,
        holder_id: orderingHolderId,
        qty, price,
        window: currentWindow.name
      });
      alert(`Order submitted: ${sideSelect.value.toUpperCase()} ${qty} @ ${fmt.sgd(price, 4)} in ${currentWindow.name}.`);
    };

    const panel = el("div", { class: "panel" }, [
      el("div", { class: "grid grid-4" }, [
        isAdmin ? field("Holder", holderSelect) : field("You", el("input", { type: "text", value: holder ? holder.name : "", disabled: "true" })),
        field("Side", sideSelect),
        field("Quantity", qtyInput),
        field("Limit price (S$)", priceInput)
      ]),
      el("div", null, [submitBtn]),
      err,
      el("p", { class: "muted tiny", style: "margin-top:0.8rem;", text: "Orders are batched. Matches only occur when the window closes and clearing runs." })
    ]);
    section.appendChild(panel);
    return section;
  }

  function buildOrderBook(currentWindow, state) {
    const orders = state.orders.filter(o => o.window === currentWindow.name && o.status === "open");
    const buys = orders.filter(o => o.side === "buy").sort((a, b) => b.price - a.price);
    const sells = orders.filter(o => o.side === "sell").sort((a, b) => a.price - b.price);

    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Live order book" }), el("div", { class: "micro", text: `${orders.length} open orders` }) ])
    ]);
    const grid = el("div", { class: "grid grid-2" }, [
      renderSide("Bids (buy)", buys, "good"),
      renderSide("Asks (sell)", sells, "warn")
    ]);
    section.appendChild(grid);
    return section;

    function renderSide(title, rows, kind) {
      const panel = el("div", { class: "panel panel--flush" });
      panel.appendChild(el("div", { style: "padding: 1rem 1.4rem; border-bottom: 1px solid var(--line-strong); display: flex; justify-content: space-between;" }, [
        el("div", { class: "micro" + (kind === "good" ? "" : " muted"), style: "color: var(--" + (kind === "good" ? "good" : "warn") + ");", text: title }),
        el("div", { class: "tiny muted", text: rows.length + " orders" })
      ]));
      const tbl = el("table", { class: "data" });
      tbl.appendChild(el("thead", null, [ el("tr", null, [
        th("Holder"), th("Qty", true), th("Price", true), th("Submitted")
      ]) ]));
      const tbody = el("tbody");
      if (!rows.length) {
        tbody.appendChild(el("tr", null, [ el("td", { colspan: "4", class: "muted", style: "padding: 1rem 1.4rem;", text: "No orders yet." }) ]));
      } else {
        rows.forEach(o => {
          const h = C.holders().find(x => x.id === o.holder_id);
          const name = isAdmin ? (h ? h.name : ("holder#" + o.holder_id)) : (h && h.id === holder.id ? h.name + " (you)" : "—");
          tbody.appendChild(el("tr", null, [
            td(name),
            td(fmt.num(o.qty), true),
            td(fmt.sgd(o.price, 4), true),
            td(new Date(o.at).toLocaleString("en-SG", { dateStyle: "short", timeStyle: "short" }))
          ]));
        });
      }
      tbl.appendChild(tbody);
      panel.appendChild(tbl);
      return panel;
    }
  }

  function buildNoWindowPanel() {
    return el("div", { class: "panel", style: "text-align:center; padding: 3rem 1rem; font-family: var(--serif); color: var(--muted); font-style: italic;" }, [
      el("div", { class: "serif", style: "font-size: 2rem; color: var(--ink);", text: "No window open." }),
      el("p", { style: "margin-top:0.8rem;", text: isAdmin ? "Use the Administrator controls above to open one." : "Check back in January — windows run 16–31 Jan each year." })
    ]);
  }

  function buildWindowHistory(pastWindows) {
    const section = el("section", { class: "block" }, [
      el("header", null, [ el("h2", { text: "Past windows" }) ])
    ]);
    pastWindows.slice().reverse().forEach(w => {
      const panel = el("div", { class: "panel", style: "margin-top:1rem;" });
      const trades = w.trades || [];
      const volume = trades.reduce((s, t) => s + t.qty, 0);
      const totalValue = trades.reduce((s, t) => s + t.qty * t.price, 0);
      panel.appendChild(el("div", { class: "row-between" }, [
        el("div", null, [
          el("div", { class: "micro", text: fmt.date(w.opens) + " → " + fmt.date(w.closes) }),
          el("h3", { style: "margin-top:0.4rem;", text: w.name })
        ]),
        el("span", { class: "badge badge--filled", text: "Closed" })
      ]));
      panel.appendChild(el("div", { class: "rule" }));
      panel.appendChild(el("div", { class: "grid grid-3" }, [
        statLabel("Trades", fmt.num(trades.length)),
        statLabel("Volume", fmt.num(volume) + " shares"),
        statLabel("Turnover", fmt.sgd(totalValue))
      ]));
      if (trades.length) {
        const tbl = el("table", { class: "data", style: "margin-top: 1rem;" });
        tbl.appendChild(el("thead", null, [ el("tr", null, [
          th("Buyer"), th("Seller"), th("Qty", true), th("Price", true), th("Value", true), th("Type")
        ]) ]));
        const tbody = el("tbody");
        trades.forEach(t => {
          const buyerName = t.buyer === "EGPL_TREASURY"
            ? "EGPL (Treasury)"
            : (C.holders().find(h => h.id === t.buyer)?.name || "—");
          const sellerName = C.holders().find(h => h.id === t.seller)?.name || "—";
          tbody.appendChild(el("tr", null, [
            td(buyerName),
            td(sellerName),
            td(fmt.num(t.qty), true),
            td(fmt.sgd(t.price, 4), true),
            td(fmt.sgd(t.qty * t.price), true),
            td(null, false, el("span", { class: "badge", style: `color: var(--${t.via === "rofr" ? "brass" : "navy"}); border-color: var(--${t.via === "rofr" ? "brass" : "navy"});`, text: t.via === "rofr" ? "ROFR" : "Peer" }))
          ]));
        });
        tbl.appendChild(tbody);
        panel.appendChild(tbl);
      }
      section.appendChild(panel);
    });
    return section;
  }

  // -------- Clearing algorithm -----------------------------------------

  function collectWindowOrders(w) {
    const state = Store.state();
    return state.orders.filter(o => o.window === w.name && o.status === "open");
  }

  function computeClearing(windowObj, useRofr) {
    const orders = collectWindowOrders(windowObj);
    const buys = orders.filter(o => o.side === "buy").map(o => ({ ...o, remaining: o.qty }));
    const sells = orders.filter(o => o.side === "sell").map(o => ({ ...o, remaining: o.qty }));
    buys.sort((a, b) => b.price - a.price || new Date(a.at) - new Date(b.at));
    sells.sort((a, b) => a.price - b.price || new Date(a.at) - new Date(b.at));

    const trades = [];

    if (useRofr && sells.length) {
      const highestBid = buys.length ? buys[0].price : 0;
      const rofrPrice = Math.round((highestBid + 0.01) * 10000) / 10000;
      sells.forEach(sell => {
        const qty = sell.remaining;
        if (qty > 0) {
          trades.push({
            buyer: "EGPL_TREASURY",
            seller: sell.holder_id,
            qty,
            price: rofrPrice,
            via: "rofr",
            sell_order_ids: [sell.id],
            buy_order_ids: []
          });
          sell.remaining = 0;
        }
      });
    }

    // Peer matching between remaining buys and sells
    buys.forEach(buy => {
      sells.forEach(sell => {
        if (buy.remaining <= 0 || sell.remaining <= 0) return;
        if (buy.price < sell.price) return;
        const qty = Math.min(buy.remaining, sell.remaining);
        const price = sell.price; // clear at ask
        trades.push({
          buyer: buy.holder_id,
          seller: sell.holder_id,
          qty, price,
          via: "peer",
          sell_order_ids: [sell.id],
          buy_order_ids: [buy.id]
        });
        buy.remaining -= qty;
        sell.remaining -= qty;
      });
    });

    const unmatched = {
      buys: buys.filter(o => o.remaining > 0),
      sells: sells.filter(o => o.remaining > 0)
    };

    return { trades, unmatched };
  }

  function previewClearing(windowObj, useRofr, parent) {
    const existing = document.getElementById("clearing-preview");
    if (existing) existing.remove();
    const res = computeClearing(windowObj, useRofr);
    const box = el("div", { class: "alert", id: "clearing-preview", style: "margin-top:1rem;" });
    box.appendChild(el("strong", { text: `Dry-run: ${res.trades.length} trades, ${res.unmatched.buys.length + res.unmatched.sells.length} unmatched orders.` }));
    const volume = res.trades.reduce((s, t) => s + t.qty, 0);
    const turnover = res.trades.reduce((s, t) => s + t.qty * t.price, 0);
    box.appendChild(el("div", { class: "tiny muted", style: "margin-top:0.4rem;", text: `Volume ${fmt.num(volume)} shares · turnover ${fmt.sgd(turnover)}. ROFR ${useRofr ? "invoked" : "not invoked"}.` }));
    parent.appendChild(box);
  }

  function runClearing(windowObj, useRofr) {
    if (!confirm("Propose Committee resolution to close this window and commit clearing? Other members must approve.")) return;
    const res = computeClearing(windowObj, useRofr);
    gatedAction("window_close", {
      name: windowObj.name,
      trades: res.trades,
      unmatched: res.unmatched,
      rofr_invoked: useRofr
    }, `Close ${windowObj.name}`);
  }

  // -------- Small helpers ----------------------------------------------

  function proposedName() { return "Jan " + (new Date().getFullYear() + 1); }
  function proposedOpens() {
    const y = new Date().getFullYear() + 1;
    return `${y}-01-16`;
  }
  function proposedCloses() {
    const y = new Date().getFullYear() + 1;
    return `${y}-01-31`;
  }

  function field(label, control) {
    return el("div", { class: "field", style: "margin:0;" }, [
      el("label", { text: label }),
      control
    ]);
  }
  function th(text, numeric) { const n = el("th", { text }); if (numeric) n.className = "num"; return n; }
  function td(text, numeric, child) {
    const n = el("td");
    if (numeric) n.className = "num";
    if (child) n.appendChild(child); else if (text !== undefined) n.textContent = text ?? "";
    return n;
  }
  function statLabel(k, v) {
    return el("div", null, [
      el("div", { class: "micro muted", text: k }),
      el("div", { class: "serif", style: "font-size:1.4rem; margin-top:0.2rem;", text: v })
    ]);
  }
})();
