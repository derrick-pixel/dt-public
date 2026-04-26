// Append-only event log with hash chain.
// Each new event records the SHA-256 hash of (type|at|payload|prev_hash) and
// stores prev_hash so any subsequent tamper attempt is detectable by
// re-running validate().

function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return bytesToHex(buf);
}

export async function appendEvent(db, { type, payload, actor }) {
  if (!type) throw new Error("event type required");
  if (!actor || !actor.email) throw new Error("identity required");

  // Find the latest event hash for the chain
  const last = await db
    .prepare("SELECT hash FROM events ORDER BY at DESC, id DESC LIMIT 1")
    .first();
  const prev_hash = last ? last.hash : null;

  const at = new Date().toISOString();
  const id = "ev_" + Math.random().toString(36).slice(2, 10) + "_" + Date.now().toString(36);
  const payloadJson = JSON.stringify(payload || {});
  const hashSeed = `${type}|${at}|${payloadJson}|${prev_hash || ""}`;
  const hash = await sha256Hex(hashSeed);

  await db
    .prepare(
      `INSERT INTO events
        (id, type, at, payload, prev_hash, hash, actor_email, actor_role, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(id, type, at, payloadJson, prev_hash, hash, actor.email, actor.role || "unknown", Date.now())
    .run();

  return { id, type, at, payload, prev_hash, hash, actor_email: actor.email, actor_role: actor.role };
}

export async function listEvents(db, { since, limit = 5000 } = {}) {
  let sql = "SELECT id, type, at, payload, prev_hash, hash, actor_email, actor_role FROM events";
  const args = [];
  if (since) { sql += " WHERE at > ?"; args.push(since); }
  sql += " ORDER BY at ASC, id ASC LIMIT ?";
  args.push(Math.min(limit, 50000));
  const rs = await db.prepare(sql).bind(...args).all();
  return (rs.results || []).map(row => ({
    id: row.id, type: row.type, at: row.at,
    payload: JSON.parse(row.payload),
    prev_hash: row.prev_hash, hash: row.hash,
    actor_email: row.actor_email, actor_role: row.actor_role
  }));
}

// Verify the integrity of the chain. Returns the index of the first broken
// link (-1 if ok).
export async function validateChain(db) {
  const rs = await db
    .prepare("SELECT id, type, at, payload, prev_hash, hash FROM events ORDER BY at ASC, id ASC")
    .all();
  let prev = null;
  const events = rs.results || [];
  for (let i = 0; i < events.length; i++) {
    const e = events[i];
    if (e.prev_hash !== (prev ? prev.hash : null)) return { ok: false, broken_at: i, reason: "prev_hash mismatch" };
    const seed = `${e.type}|${e.at}|${e.payload}|${e.prev_hash || ""}`;
    const hash = await sha256Hex(seed);
    if (hash !== e.hash) return { ok: false, broken_at: i, reason: "hash mismatch" };
    prev = e;
  }
  return { ok: true, count: events.length };
}
