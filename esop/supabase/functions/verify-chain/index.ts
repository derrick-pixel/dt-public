// verify-chain — nightly cron that asks Postgres to verify the events
// chain end-to-end. After migration 0019 we have a server-side
// verify_chain() RPC that walks events in seq order and re-hashes from
// stored digest_input, eliminating the JS-vs-PG canonical-form mismatch
// that used to cause false-positive chain_broken reports.
//
// Schedule via Supabase dashboard → Database → Cron jobs:
//   cron:    0 17 * * *      (01:00 SGT)
//   SQL:     select net.http_post(
//              url:='https://<ref>.functions.supabase.co/verify-chain',
//              headers:='{"Authorization":"Bearer <function-secret>"}'::jsonb
//            );
//
// SEC-P2: function requires a shared secret in Authorization header.
// Set with: supabase secrets set VERIFY_CHAIN_SECRET=<random>

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const FN_SECRET = Deno.env.get("VERIFY_CHAIN_SECRET") || "";

Deno.serve(async (req) => {
  // Cheap DoS guard: require the function secret in Authorization.
  // (Cron invocation passes it; manual triggers without the secret 401.)
  if (FN_SECRET) {
    const got = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (got !== FN_SECRET) return new Response("unauthenticated", { status: 401 });
  }

  const supa = createClient(SUPA_URL, SERVICE);

  // Single round-trip — RPC walks the whole chain in Postgres.
  const { data, error } = await supa.rpc("verify_chain");
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const broken = Array.isArray(data) && data.length > 0 ? data[0] : null;
  const action = broken ? "chain_broken" : "chain_verified";

  await supa.from("audit_log").insert({
    action,
    target: broken ? broken.broken_at_id : "",
    metadata: broken
      ? { broken_at_seq: broken.broken_at_seq, expected_hash: broken.expected_hash, stored_hash: broken.stored_hash }
      : { verified_at: new Date().toISOString() },
  });

  return Response.json({ ok: !broken, broken });
});
