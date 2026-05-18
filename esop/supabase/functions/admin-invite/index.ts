// admin-invite — Edge Function callable by signed-in admins to invite a holder
// or committee member. Sends a Supabase magic-link inviting the user to set
// their password.
//
// Auth model:
//   - Caller passes their JWT in the Authorization header.
//   - We verify the caller is an admin by reading their profile.
//   - The actual user creation uses the service-role key, which lives only in
//     this function's environment.
//
// Body: { email, full_name, role, holder_id? }
//   role ∈ {'holder','committee','admin'}

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPA_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const SITE = Deno.env.get("ESOP_SITE_URL") ?? "https://esop.elitez.com.sg";

// SEC-P1 fix: pin CORS to the production origin (and localhost for dev).
// A stolen admin JWT replayed from evil.com used to succeed because ACAO
// was "*"; now the browser blocks the preflight from any other origin.
const ALLOWED_ORIGINS = new Set([
  "https://esop.elitez.com.sg",
  "https://esop.derrickteo.com",  // legacy alias, can be removed once retired
  "http://localhost:8000",
]);

function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  const allow = ALLOWED_ORIGINS.has(origin) ? origin : "https://esop.elitez.com.sg";
  return {
    "Access-Control-Allow-Origin": allow,
    "Vary": "Origin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  };
}

function cors(req: Request, body: BodyInit | null, init: ResponseInit = {}): Response {
  return new Response(body, {
    ...init,
    headers: { ...corsHeaders(req), ...(init.headers ?? {}) },
  });
}

function corsJson(req: Request, payload: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: { ...corsHeaders(req), "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return cors(req, null, { status: 204 });
  if (req.method !== "POST") return cors(req, "method not allowed", { status: 405 });

  const auth = req.headers.get("authorization");
  if (!auth) return cors(req, "unauthenticated", { status: 401 });

  const userClient = createClient(SUPA_URL, ANON, {
    global: { headers: { Authorization: auth } },
  });
  const { data: caller } = await userClient.auth.getUser();
  if (!caller?.user) return cors(req, "unauthenticated", { status: 401 });

  const admin = createClient(SUPA_URL, SERVICE);
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role,email")
    .eq("id", caller.user.id)
    .single();
  if (callerProfile?.role !== "admin") {
    return cors(req, "forbidden", { status: 403 });
  }

  let body: { email?: string; full_name?: string; role?: string; holder_id?: string };
  try {
    body = await req.json();
  } catch {
    return cors(req, "bad request", { status: 400 });
  }
  const { email, full_name, role, holder_id } = body;
  if (
    !email ||
    !full_name ||
    !role ||
    !["holder", "committee", "admin"].includes(role)
  ) {
    return cors(req, "bad request", { status: 400 });
  }

  const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${SITE}/set-password.html`,
    data: { full_name, role, holder_id },
  });
  if (error) return cors(req, error.message, { status: 400 });

  await admin.from("profiles").upsert({
    id: invite.user.id,
    email,
    full_name,
    role,
    holder_id: holder_id ?? null,
  });

  await admin.from("audit_log").insert({
    actor_id: caller.user.id,
    actor_email: caller.user.email,
    action: "magic_link_sent",
    target: email,
    metadata: { role, holder_id },
  });

  return corsJson(req, { ok: true, user_id: invite.user.id });
});
