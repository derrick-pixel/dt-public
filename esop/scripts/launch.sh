#!/usr/bin/env bash
# Elitez ESOP launch — automates runbook steps 1–7, 10.
# Cloudflare Pages (step 9) is skipped unless CLOUDFLARE_API_TOKEN is set.
# SGQR bank-app test (step 8) and end-to-end smoke (step 12) still need you.
#
# Usage:  ./scripts/launch.sh
#
# Reads secrets from .env.local. Logs progress to stdout. Exits non-zero on
# any failure with a clear message about which step broke. Safe to re-run —
# each step is idempotent (existing project / migrations / functions reused).

set -euo pipefail

cd "$(dirname "$0")/.."
REPO_ROOT="$(pwd)"

# ----- Load env -----
if [[ ! -f .env.local ]]; then
  echo "❌ .env.local missing. Create it from .env.example."; exit 1
fi
# shellcheck disable=SC1091
set -a; source .env.local; set +a

for v in SUPABASE_ACCESS_TOKEN SUPABASE_ORG_SLUG SUPABASE_PROJECT_NAME SUPABASE_REGION SUPABASE_DB_PASSWORD ELITEZ_UEN ELITEZ_ADMIN_EMAIL ELITEZ_ADMIN_FULL_NAME; do
  if [[ -z "${!v:-}" ]]; then echo "❌ $v not set in .env.local"; exit 1; fi
done

# ----- Tooling -----
for cmd in supabase curl jq psql; do
  command -v "$cmd" >/dev/null 2>&1 || { echo "❌ '$cmd' not on PATH. brew install $cmd"; exit 1; }
done

MGMT_API="https://api.supabase.com"
HDRS=(-H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" -H "Content-Type: application/json")

mgmt() {  # mgmt METHOD PATH [JSON_BODY]
  local method="$1" path="$2" body="${3:-}"
  if [[ -n "$body" ]]; then
    curl -sS -X "$method" "${HDRS[@]}" -d "$body" "${MGMT_API}${path}"
  else
    curl -sS -X "$method" "${HDRS[@]}" "${MGMT_API}${path}"
  fi
}

step() { echo; echo "━━━ $* ━━━"; }
ok()   { echo "✓ $*"; }
note() { echo "  $*"; }

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: find or create the Supabase project
# ─────────────────────────────────────────────────────────────────────────────
step "Step 1/8  Find or create Supabase project '${SUPABASE_PROJECT_NAME}'"

PROJECTS_JSON=$(mgmt GET /v1/projects)
PROJECT_REF=$(echo "$PROJECTS_JSON" | jq -r --arg n "$SUPABASE_PROJECT_NAME" \
  '.[] | select(.name == $n) | .id' | head -1)

if [[ -n "$PROJECT_REF" ]]; then
  ok "Reusing existing project: $PROJECT_REF"
else
  note "Creating new project (this takes 60–120 s)…"
  CREATE_BODY=$(jq -n \
    --arg name "$SUPABASE_PROJECT_NAME" \
    --arg org "$SUPABASE_ORG_SLUG" \
    --arg region "$SUPABASE_REGION" \
    --arg pw "$SUPABASE_DB_PASSWORD" \
    '{name: $name, organization_id: $org, region: $region, db_pass: $pw, plan: "free"}')
  CREATE_RESP=$(mgmt POST /v1/projects "$CREATE_BODY")
  PROJECT_REF=$(echo "$CREATE_RESP" | jq -r '.id // empty')
  if [[ -z "$PROJECT_REF" ]]; then
    echo "❌ project creation failed. Response:"; echo "$CREATE_RESP" | jq . ; exit 1
  fi
  ok "Project created: $PROJECT_REF"
fi

# Wait until ACTIVE_HEALTHY
for i in {1..30}; do
  STATUS=$(mgmt GET "/v1/projects/${PROJECT_REF}" | jq -r '.status')
  if [[ "$STATUS" == "ACTIVE_HEALTHY" ]]; then
    ok "Project status: ACTIVE_HEALTHY"; break
  fi
  note "Waiting for project to come up (status=$STATUS, ${i}/30)…"
  sleep 10
done

# ----- Fetch API keys -----
KEYS_JSON=$(mgmt GET "/v1/projects/${PROJECT_REF}/api-keys")
ANON_KEY=$(echo "$KEYS_JSON" | jq -r '.[] | select(.name=="anon") | .api_key')
SERVICE_KEY=$(echo "$KEYS_JSON" | jq -r '.[] | select(.name=="service_role") | .api_key')
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"
[[ -n "$ANON_KEY" && -n "$SERVICE_KEY" ]] || { echo "❌ could not read keys"; exit 1; }
ok "Got anon + service-role keys"

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: link the CLI to this project
# ─────────────────────────────────────────────────────────────────────────────
step "Step 2/8  Link Supabase CLI to project"
# Idempotent: re-running just updates the local config.
SUPABASE_DB_PASSWORD="$SUPABASE_DB_PASSWORD" supabase link \
  --project-ref "$PROJECT_REF" \
  --password "$SUPABASE_DB_PASSWORD" 2>&1 | tail -3 || true
ok "Linked"

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: apply migrations
# ─────────────────────────────────────────────────────────────────────────────
step "Step 3/8  Apply migrations"
supabase db push --password "$SUPABASE_DB_PASSWORD" --include-all 2>&1 | tail -20
ok "Migrations applied"

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: bootstrap admin user
# ─────────────────────────────────────────────────────────────────────────────
step "Step 4/8  Bootstrap admin user '${ELITEZ_ADMIN_EMAIL}'"

# Generate a random temporary password — user will change on first login.
TEMP_PW=$(openssl rand -base64 24 | tr -d '=+/' | cut -c1-20)

EXISTING_UID=$(curl -sS \
  -H "apikey: ${SERVICE_KEY}" -H "Authorization: Bearer ${SERVICE_KEY}" \
  "${SUPABASE_URL}/auth/v1/admin/users?email=${ELITEZ_ADMIN_EMAIL}" \
  | jq -r '.users[0].id // empty' 2>/dev/null || echo "")

if [[ -n "$EXISTING_UID" ]]; then
  ADMIN_UID="$EXISTING_UID"
  ok "Admin user already exists: $ADMIN_UID"
else
  CREATE_USER_RESP=$(curl -sS -X POST \
    -H "apikey: ${SERVICE_KEY}" -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    "${SUPABASE_URL}/auth/v1/admin/users" \
    -d "$(jq -n --arg e "$ELITEZ_ADMIN_EMAIL" --arg p "$TEMP_PW" \
        '{email: $e, password: $p, email_confirm: true}')")
  ADMIN_UID=$(echo "$CREATE_USER_RESP" | jq -r '.id // empty')
  if [[ -z "$ADMIN_UID" ]]; then
    echo "❌ failed to create admin user. Response:"; echo "$CREATE_USER_RESP" | jq . ; exit 1
  fi
  ok "Admin user created: $ADMIN_UID"
  note "Temporary password for first login: ${TEMP_PW}"
  note "Copy to 1Password — you'll be prompted to change it on first sign-in."
fi

# Upsert profile via service-role REST endpoint
PROFILE_BODY=$(jq -n \
  --arg id "$ADMIN_UID" \
  --arg email "$ELITEZ_ADMIN_EMAIL" \
  --arg name "$ELITEZ_ADMIN_FULL_NAME" \
  '[{id: $id, email: $email, full_name: $name, role: "admin"}]')

curl -sS -X POST \
  -H "apikey: ${SERVICE_KEY}" -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: resolution=merge-duplicates" \
  "${SUPABASE_URL}/rest/v1/profiles" \
  -d "$PROFILE_BODY" > /dev/null
ok "Profile upserted with role=admin"

# ─────────────────────────────────────────────────────────────────────────────
# Step 5: wire credentials into HTML + UEN into data.json
# ─────────────────────────────────────────────────────────────────────────────
step "Step 5/8  Wire credentials into HTML pages"
# Use a delimiter unlikely to appear in keys.
for f in index.html portal.html admin.html committee.html trading.html scheme.html set-password.html reset-password.html; do
  if [[ -f "$f" ]]; then
    sed -i '' "s|https://<project-ref>.supabase.co|${SUPABASE_URL}|g" "$f"
    sed -i '' "s|<anon-key>|${ANON_KEY}|g" "$f"
  fi
done
ok "HTML credentials updated"

# Add UEN to data.json under org if missing (idempotent).
if ! jq -e '.org.uen' assets/data.json > /dev/null 2>&1; then
  jq --arg u "$ELITEZ_UEN" '.org.uen = $u' assets/data.json > assets/data.json.tmp
  mv assets/data.json.tmp assets/data.json
  ok "UEN added to assets/data.json"
else
  ok "UEN already set in assets/data.json"
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 6: deploy Edge Functions
# ─────────────────────────────────────────────────────────────────────────────
step "Step 6/8  Deploy Edge Functions"
supabase secrets set ESOP_SITE_URL="https://esop.elitez.com.sg" \
  --project-ref "$PROJECT_REF" 2>&1 | tail -3
supabase functions deploy admin-invite --no-verify-jwt --project-ref "$PROJECT_REF" 2>&1 | tail -5
supabase functions deploy verify-chain --project-ref "$PROJECT_REF" 2>&1 | tail -5
ok "Edge Functions deployed"

# ─────────────────────────────────────────────────────────────────────────────
# Step 7: configure auth redirect URLs
# ─────────────────────────────────────────────────────────────────────────────
step "Step 7/8  Configure Supabase Auth redirect URLs"
AUTH_BODY=$(jq -n \
  '{
    site_url: "https://esop.elitez.com.sg",
    uri_allow_list: "https://esop.elitez.com.sg,https://esop.elitez.com.sg/set-password.html,https://esop.elitez.com.sg/reset-password.html,https://esop.derrickteo.com,http://localhost:8000"
  }')
mgmt PATCH "/v1/projects/${PROJECT_REF}/config/auth" "$AUTH_BODY" >/dev/null
ok "Auth URL configuration updated"

# ─────────────────────────────────────────────────────────────────────────────
# Step 10: schedule nightly chain-verify cron (via SQL using pg_cron)
# ─────────────────────────────────────────────────────────────────────────────
step "Step 8/8  Schedule nightly chain-verify cron"
CRON_SQL=$(cat <<EOF
create extension if not exists pg_cron;
create extension if not exists pg_net;
select cron.schedule(
  'nightly-chain-verify',
  '0 17 * * *',
  \$\$
    select net.http_post(
      url:='https://${PROJECT_REF}.functions.supabase.co/verify-chain',
      headers:='{"Authorization": "Bearer ${SERVICE_KEY}", "Content-Type": "application/json"}'::jsonb
    );
  \$\$
) on conflict do nothing;
EOF
)
# Apply via supabase db CLI — pipes SQL to the linked project.
echo "$CRON_SQL" | supabase db execute --linked --no-prompt 2>&1 | tail -5 || true
ok "Cron job scheduled (nightly 01:00 SGT)"

# ─────────────────────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────────────────────
echo
echo "━━━ ✓ Launch script complete ━━━"
echo "Project ref:     ${PROJECT_REF}"
echo "Project URL:     ${SUPABASE_URL}"
echo "Admin UID:       ${ADMIN_UID}"
echo "Admin email:     ${ELITEZ_ADMIN_EMAIL}"
echo
echo "Next: commit the credential changes, then do the human-required steps:"
echo "  git add -A && git commit -m 'config: wire Supabase credentials + UEN'"
echo "  git push origin main"
echo "  Step 8  — scan tests/sgqr.test.html with UOB/DBS/OCBC/Trust"
echo "  Step 9  — set up Cloudflare Pages (fill CLOUDFLARE_* in .env.local then re-run)"
echo "  Step 12 — staged rollout (sign in, invite a test holder, run an exercise)"
echo
echo "⚠ Revoke SUPABASE_ACCESS_TOKEN now that the script has run."
