#!/usr/bin/env node
// Applies roster/roster.csv back to assets/data.json:
//   - Updates email / dept / title / nationality / ic_masked on existing holders.
//   - Moves any holder with action=skip + status=leaver from holders[] into leavers[].
//   - Updates grants qty per FY when CSV cell differs.
//   - Skips the IC field for rows where ic_masked is "NEEDS RE-ENTRY".
//   - Reports each change to stdout. Does NOT send invites.

import { readFileSync, writeFileSync } from "node:fs";

const CSV = "roster/roster.csv";
const JSON_PATH = "assets/data.json";

function parseCsv(text) {
  const rows = [];
  let cur = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], n = text[i + 1];
    if (q) {
      if (c === '"' && n === '"') { field += '"'; i++; }
      else if (c === '"') q = false;
      else field += c;
    } else {
      if (c === '"') q = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else if (c === "\r") { /* skip */ }
      else field += c;
    }
  }
  if (field || cur.length) { cur.push(field); rows.push(cur); }
  return rows;
}

const raw = readFileSync(CSV, "utf8");
const grid = parseCsv(raw).filter(r => r.length > 1);
const header = grid.shift();
const idx = Object.fromEntries(header.map((h, i) => [h.trim(), i]));

const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));
const holdersById = new Map(data.holders.map(h => [h.id, h]));
const changes = [];

const csvLeavers = [];

for (const row of grid) {
  const id = Number(row[idx.holder_id]);
  const action = row[idx.action];
  const name = row[idx.name];
  const status = row[idx.status];
  const email = row[idx.email].trim();
  const ic = row[idx.ic_masked].trim();
  const dept = row[idx.dept].trim();
  const title = row[idx.title].trim();
  const nat = row[idx.nationality].trim();
  const notes = row[idx.notes];

  // Existing-holder updates
  const h = holdersById.get(id);
  if (!h) {
    if (action === "new") {
      console.log(`+ would create new holder id=${id} name="${name}" — NOT IMPLEMENTED in this pass`);
    } else if (status === "leaver" && action === "skip") {
      // Pure leaver row (e.g., Samion, Philip, Asmond) — already in leavers[]
    }
    continue;
  }

  // Move to leavers if marked skip/leaver
  if (action === "skip" && status === "leaver") {
    csvLeavers.push({
      name: h.name,
      note: notes || `Marked leaver via roster update on ${new Date().toISOString().slice(0,10)}`
    });
    holdersById.delete(id);
    changes.push(`- moved id=${id} ${h.name} to leavers[]`);
    continue;
  }

  // Update fields if changed
  if (email && h.email !== email) {
    changes.push(`~ id=${id} ${h.name}: email "${h.email}" -> "${email}"`);
    h.email = email;
  }
  if (dept && h.dept !== dept) {
    changes.push(`~ id=${id} ${h.name}: dept "${h.dept}" -> "${dept}"`);
    h.dept = dept;
  }
  if (title && h.title !== title) {
    changes.push(`~ id=${id} ${h.name}: title "${h.title}" -> "${title}"`);
    h.title = title;
  }
  if (nat && h.nat !== nat) {
    changes.push(`~ id=${id} ${h.name}: nat "${h.nat}" -> "${nat}"`);
    h.nat = nat;
  }
  if (ic && ic !== "NEEDS RE-ENTRY" && h.ic !== ic) {
    changes.push(`~ id=${id} ${h.name}: ic "${h.ic}" -> "${ic}"`);
    h.ic = ic;
  } else if (ic === "NEEDS RE-ENTRY") {
    changes.push(`! id=${id} ${h.name}: ic flagged NEEDS RE-ENTRY (kept existing "${h.ic}")`);
  }

  // Grant qty updates (FY2022 / FY2024 / FY2025)
  for (const fy of ["FY2022", "FY2024", "FY2025"]) {
    const col = fy.toLowerCase() + "_qty";
    const csvQty = row[idx[col]].trim();
    if (csvQty === "") continue;
    const newQty = Number(csvQty);
    const existing = h.grants.find(g => g.fy === fy);
    if (existing) {
      if (existing.qty !== newQty) {
        changes.push(`~ id=${id} ${h.name}: ${fy} qty ${existing.qty} -> ${newQty}`);
        existing.qty = newQty;
      }
    } else {
      changes.push(`+ id=${id} ${h.name}: ${fy} grant ${newQty} added`);
      h.grants.push({ fy, grant_date: fy === "FY2025" ? null : null, qty: newQty, status: fy === "FY2025" ? "draft" : "active" });
    }
  }
}

// Rebuild holders[] from the map (preserving original order minus removed)
data.holders = data.holders.filter(h => holdersById.has(h.id));
data.leavers = [...(data.leavers || []), ...csvLeavers];

if (changes.length === 0) {
  console.log("No changes detected.");
  process.exit(0);
}

console.log("Changes:");
for (const c of changes) console.log("  " + c);
console.log(`\nTotal: ${changes.length} change(s)`);

writeFileSync(JSON_PATH, JSON.stringify(data, null, 2) + "\n");
console.log(`\nWrote ${JSON_PATH}`);
