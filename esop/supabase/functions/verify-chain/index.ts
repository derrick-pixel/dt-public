// verify-chain — nightly cron that recomputes the events hash chain.
// Writes a chain_verified or chain_broken audit row.
//
// Schedule via Supabase dashboard → Database → Cron jobs:
//   cron:    0 17 * * *      (01:00 SGT)
//   SQL:     select net.http_post(
//              url:='https://<ref>.functions.supabase.co/verify-chain',
//              headers:='{"Authorization":"Bearer <service-role>"}'::jsonb
//            );

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

async function sha256Hex(s: string): Promise<string> {
  const buf = new TextEncoder().encode(s);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

Deno.serve(async () => {
  const supa = createClient(SUPA_URL, SERVICE);

  // Page through events in stable order. 10k per page is enough for years of
  // ESOP activity at ~30 users.
  let cursor: string | null = null;
  let prev = "";
  let count = 0;
  let broken: string | null = null;

  while (true) {
    let q = supa.from("events").select("*").order("at", { ascending: true }).order("id", { ascending: true }).limit(1000);
    if (cursor) q = q.gt("id", cursor);
    const { data, error } = await q;
    if (error) return new Response(error.message, { status: 500 });
    if (!data.length) break;

    for (const e of data) {
      count++;
      const stable = (e.prev_hash ?? "") + e.type + e.at + JSON.stringify(e.payload);
      const expected = await sha256Hex(stable);
      if (e.hash !== expected || (e.prev_hash ?? "") !== prev) {
        broken = e.id;
        break;
      }
      prev = e.hash;
    }
    if (broken) break;
    cursor = data[data.length - 1].id;
    if (data.length < 1000) break;
  }

  await supa.from("audit_log").insert({
    action: broken ? "chain_broken" : "chain_verified",
    target: broken ?? "",
    metadata: { event_count: count, latest_hash: prev },
  });

  return Response.json({ ok: !broken, broken, count });
});
