// Elitez ESOP API — Cloudflare Worker entry point.
// Hosts the append-only event ledger that powers multi-user state.
// Identity is enforced by Cloudflare Access (JWT validated here too).

import { identify } from "./auth.js";
import { appendEvent, listEvents, validateChain } from "./events.js";

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

// Events the BACKEND will accept directly. The frontend sends these as raw
// type strings; everything else is rejected so a compromised browser can't
// emit arbitrary events. Roles enforce who can submit which.
const ALLOWED_EVENTS = {
  // ops — single signatory
  login:                   ["committee", "holder", "admin"],
  document_issued:         ["committee", "admin"],
  password_set:            ["committee", "holder", "admin"],
  scenario_saved:          ["committee", "admin"],
  // holder-initiated
  grant_accepted:          ["holder", "committee"],
  exercise_submitted:      ["holder", "committee"],
  order_placed:            ["holder", "committee"],
  // resolution lifecycle (committee voting)
  resolution_proposed:     ["committee"],
  resolution_voted:        ["committee"],
  resolution_executed:     ["committee"],
  resolution_expired:      ["committee"],
  // executor side-effects (only emitted as a result of an executed resolution)
  grant_approved:          ["committee"],
  grant_rejected:          ["committee"],
  allocation_changed:      ["committee"],
  scenario_committed:      ["committee"],
  valuation_added:         ["committee"],
  valuation_activated:     ["committee"],
  leaver_determined:       ["committee"],
  window_opened:           ["committee"],
  window_closed:           ["committee"],
  special_dividend_declared: ["committee"],
  committee_member_appointed: ["committee"],
  committee_member_removed:   ["committee"],
  threshold_changed:       ["committee"],
  state_reset_authorised:  ["committee"],
  state_import_authorised: ["committee"],
  // exercise workflow (Trustee confirmation, not gated)
  exercise_confirmed:      ["committee"],
  exercise_rejected:       ["committee"],
  // bulk doc audit
  statements_bulk_issued:  ["committee", "admin"],
  // holder lifecycle
  holder_added:            ["committee"],
  holder_updated:          ["committee"],
  holder_archived:         ["committee"]
};

function corsHeaders(request) {
  const origin = request.headers.get("origin") || "*";
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-credentials": "true",
    "access-control-allow-headers": "content-type, cf-access-jwt-assertion",
    "access-control-allow-methods": "GET, POST, OPTIONS"
  };
}

function json(body, init = {}) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: { ...JSON_HEADERS, ...(init.headers || {}) }
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = corsHeaders(request);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    // Identify the caller. Allow the cf-access-authenticated-user-email
    // header fallback only when the request is going via the Access proxy
    // (which sets the header). We still validate the JWT when present.
    const me = await identify(request, env, { allowHeaderFallback: true });

    try {
      let res;
      if (url.pathname === "/api/health") {
        res = json({ ok: true, time: new Date().toISOString() });
      } else if (url.pathname === "/api/whoami") {
        res = json({ identity: me });
      } else if (!me) {
        res = json({ error: "unauthenticated" }, { status: 401 });
      } else if (url.pathname === "/api/events" && request.method === "GET") {
        res = await handleListEvents(request, env, me);
      } else if (url.pathname === "/api/events" && request.method === "POST") {
        res = await handleAppendEvent(request, env, me);
      } else if (url.pathname === "/api/events/sse" && request.method === "GET") {
        res = await handleSSE(request, env, me);
      } else if (url.pathname === "/api/audit/validate" && request.method === "GET") {
        if (me.role !== "committee") { res = json({ error: "committee_only" }, { status: 403 }); }
        else { res = json(await validateChain(env.DB)); }
      } else if (url.pathname === "/api/backup" && request.method === "GET") {
        if (me.role !== "committee") { res = json({ error: "committee_only" }, { status: 403 }); }
        else { res = await handleBackup(env, me); }
      } else {
        res = json({ error: "not_found" }, { status: 404 });
      }

      // Append CORS to every response
      const headers = new Headers(res.headers);
      Object.entries(cors).forEach(([k, v]) => headers.set(k, v));
      return new Response(res.body, { status: res.status, headers });
    } catch (e) {
      return json({ error: "server_error", detail: String(e && e.message || e) }, { status: 500, headers: cors });
    }
  }
};

async function handleListEvents(request, env, me) {
  const url = new URL(request.url);
  const since = url.searchParams.get("since") || null;
  const limit = Number(url.searchParams.get("limit") || 5000);
  const events = await listEvents(env.DB, { since, limit });
  return json({ events });
}

async function handleAppendEvent(request, env, me) {
  const body = await request.json();
  const type = (body && body.type || "").trim();
  if (!type) return json({ error: "type_required" }, { status: 400 });

  const allowedRoles = ALLOWED_EVENTS[type];
  if (!allowedRoles) return json({ error: "event_not_allowed", type }, { status: 400 });
  if (!allowedRoles.includes(me.role)) return json({ error: "role_not_permitted", type, role: me.role }, { status: 403 });

  // Light payload validation
  const payload = body.payload || {};
  if (typeof payload !== "object" || Array.isArray(payload)) {
    return json({ error: "payload_must_be_object" }, { status: 400 });
  }

  // Holder-self-service guard: a holder can only act on their own holder_id
  if (me.role === "holder") {
    const subjectId = payload.holder_id;
    // We don't have the holder_id ↔ email map here (it's in data.js client-side).
    // Trusting the email-derived identity, but we attach actor_email so any
    // abuse is auditable. In production, mirror the holder map server-side.
    if (subjectId == null && type !== "login") {
      // Permit login + password_set without holder_id
      if (type !== "password_set") return json({ error: "holder_id_required" }, { status: 400 });
    }
  }

  const stored = await appendEvent(env.DB, { type, payload, actor: me });

  // Notify any active SSE clients (best effort — Workers SSE is per-request,
  // so we use Durable Objects for fan-out in production. Here we just return.)
  return json({ ok: true, event: stored });
}

async function handleSSE(request, env, me) {
  // Server-Sent Events: clients poll-via-stream every 5s for new events.
  // Lightweight long-poll equivalent — Workers free tier limits long-lived
  // connections. Frontend will fall back to polling if SSE drops.
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();
  const enc = new TextEncoder();
  const url = new URL(request.url);
  let lastAt = url.searchParams.get("since") || new Date().toISOString();

  // Send a heartbeat + new events every 5 seconds for up to 30 seconds.
  // After 30s, the client reconnects. This stays well under any per-request
  // budget on free Workers.
  (async () => {
    try {
      await writer.write(enc.encode(`: connected at ${new Date().toISOString()}\n\n`));
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const events = await listEvents(env.DB, { since: lastAt, limit: 100 });
        if (events.length) {
          for (const e of events) {
            await writer.write(enc.encode(`event: append\ndata: ${JSON.stringify(e)}\n\n`));
          }
          lastAt = events[events.length - 1].at;
        } else {
          await writer.write(enc.encode(`: heartbeat ${new Date().toISOString()}\n\n`));
        }
      }
      await writer.close();
    } catch (e) {
      try { await writer.abort(e); } catch {}
    }
  })();

  return new Response(readable, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-store",
      "connection": "keep-alive",
      "x-accel-buffering": "no"
    }
  });
}

async function handleBackup(env, me) {
  const events = await listEvents(env.DB, { limit: 50000 });
  const integrity = await validateChain(env.DB);
  const blob = JSON.stringify({
    backup_at: new Date().toISOString(),
    backup_by: me.email,
    integrity,
    events
  }, null, 2);
  return new Response(blob, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="elitez-esop-backup-${new Date().toISOString().slice(0,10)}.json"`
    }
  });
}
