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
const SITE = Deno.env.get("ESOP_SITE_URL") ?? "https://esop.derrickteo.com";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("method not allowed", { status: 405 });
  }

  const auth = req.headers.get("authorization");
  if (!auth) return new Response("unauthenticated", { status: 401 });

  const userClient = createClient(SUPA_URL, ANON, {
    global: { headers: { Authorization: auth } },
  });
  const { data: caller } = await userClient.auth.getUser();
  if (!caller?.user) return new Response("unauthenticated", { status: 401 });

  const admin = createClient(SUPA_URL, SERVICE);
  const { data: callerProfile } = await admin
    .from("profiles")
    .select("role,email")
    .eq("id", caller.user.id)
    .single();
  if (callerProfile?.role !== "admin") {
    return new Response("forbidden", { status: 403 });
  }

  let body: { email?: string; full_name?: string; role?: string; holder_id?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("bad request", { status: 400 });
  }
  const { email, full_name, role, holder_id } = body;
  if (
    !email ||
    !full_name ||
    !role ||
    !["holder", "committee", "admin"].includes(role)
  ) {
    return new Response("bad request", { status: 400 });
  }

  const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${SITE}/set-password.html`,
    data: { full_name, role, holder_id },
  });
  if (error) return new Response(error.message, { status: 400 });

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

  return Response.json({ ok: true, user_id: invite.user.id });
});
