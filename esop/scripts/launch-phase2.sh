#!/usr/bin/env bash
# Elitez ESOP — Phase 2: switch to elitez.com.sg.
# Configures Supabase Auth → Resend SMTP, deploys to Cloudflare Pages,
# attaches esop.elitez.com.sg custom domain, updates Supabase Auth URLs.
# Idempotent — safe to re-run.
#
# Usage:  ./scripts/launch-phase2.sh

set -euo pipefail

cd "$(dirname "$0")/.."

# ----- Load env -----
if [[ ! -f .env.local ]]; then echo "❌ .env.local missing"; exit 1; fi
# shellcheck disable=SC1091
set -a; source .env.local; set +a

for v in SUPABASE_ACCESS_TOKEN RESEND_API_KEY CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID; do
  if [[ -z "${!v:-}" ]]; then echo "❌ $v not set in .env.local"; exit 1; fi
done

PROJECT_REF="suehogmzjspagcsrqvsw"
PAGES_PROJECT="elitez-esop"
PROD_HOST="esop.elitez.com.sg"

step() { echo; echo "━━━ $* ━━━"; }
ok()   { echo "✓ $*"; }
note() { echo "  $*"; }

# ─────────────────────────────────────────────────────────────────────────────
# Step 1: configure Supabase Auth → Resend SMTP
# ─────────────────────────────────────────────────────────────────────────────
step "1/5  Configure Supabase Auth → Resend SMTP"
SMTP_BODY=$(jq -n \
  --arg pass "$RESEND_API_KEY" \
  '{
    smtp_admin_email: "noreply@elitez.com.sg",
    smtp_host: "smtp.resend.com",
    smtp_port: "465",
    smtp_user: "resend",
    smtp_pass: $pass,
    smtp_sender_name: "Elitez ESOP",
    smtp_max_frequency: 60,
    mailer_autoconfirm: false,
    external_email_enabled: true,
    rate_limit_email_sent: 30
  }')
RESP=$(curl -sS -X PATCH \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$SMTP_BODY" \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth")
if echo "$RESP" | jq -e '.smtp_host == "smtp.resend.com"' >/dev/null; then
  ok "SMTP set: smtp.resend.com / noreply@elitez.com.sg"
else
  echo "❌ SMTP config failed. Response:"; echo "$RESP" | jq . ; exit 1
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 2: stage deploy directory (exclude supabase/, scripts/, docs/, secrets)
# ─────────────────────────────────────────────────────────────────────────────
step "2/5  Stage deploy directory (./dist)"
rm -rf dist
mkdir -p dist
# Copy public-facing top-level files + asset/intel/tests dirs.
rsync -a \
  --include='*.html' \
  --include='*.pdf' \
  --include='*.png' \
  --include='*.svg' \
  --include='*.ico' \
  --include='*.webmanifest' \
  --include='_headers' \
  --include='_redirects' \
  --include='og-image.*' \
  --include='favicon*' \
  --include='android-chrome-*' \
  --include='apple-touch-icon.*' \
  --include='assets/***' \
  --include='intel/***' \
  --include='tests/***' \
  --include='design/***' \
  --exclude='*' \
  ./ dist/
COUNT=$(find dist -type f | wc -l | tr -d ' ')
ok "Staged ${COUNT} files for deploy"

# ─────────────────────────────────────────────────────────────────────────────
# Step 3: create CF Pages project (idempotent)
# ─────────────────────────────────────────────────────────────────────────────
step "3/5  Create or reuse Cloudflare Pages project '${PAGES_PROJECT}'"
EXISTING=$(curl -sS \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${PAGES_PROJECT}" \
  | jq -r '.success // false')

if [[ "$EXISTING" == "true" ]]; then
  ok "Pages project already exists"
else
  CREATE_BODY=$(jq -n --arg name "$PAGES_PROJECT" \
    '{name: $name, production_branch: "main"}')
  CR=$(curl -sS -X POST \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "$CREATE_BODY" \
    "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects")
  if echo "$CR" | jq -e '.success' >/dev/null; then
    ok "Pages project created"
  else
    echo "❌ Could not create Pages project. Response:"; echo "$CR" | jq . ; exit 1
  fi
fi

# ─────────────────────────────────────────────────────────────────────────────
# Step 4: deploy ./dist via wrangler
# ─────────────────────────────────────────────────────────────────────────────
step "4/5  Deploy ./dist via wrangler"
DEPLOY_OUT=$(CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" \
  CLOUDFLARE_ACCOUNT_ID="$CLOUDFLARE_ACCOUNT_ID" \
  wrangler pages deploy dist \
    --project-name "$PAGES_PROJECT" \
    --branch main \
    --commit-dirty=true 2>&1)
echo "$DEPLOY_OUT" | tail -10
DEPLOY_URL=$(echo "$DEPLOY_OUT" | grep -oE "https://[a-z0-9-]+\.elitez-esop\.pages\.dev" | head -1)
if [[ -n "$DEPLOY_URL" ]]; then
  ok "Deployed: $DEPLOY_URL"
else
  ok "Deploy completed (no preview URL captured)"
fi

# Attach the custom domain (Pages side)
step "5/5  Attach custom domain ${PROD_HOST}"
DOMAIN_BODY=$(jq -n --arg n "$PROD_HOST" '{name: $n}')
DR=$(curl -sS -X POST \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$DOMAIN_BODY" \
  "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/pages/projects/${PAGES_PROJECT}/domains")
if echo "$DR" | jq -e '.success or (.errors[0].code == 8000000)' >/dev/null; then
  ok "Custom domain attached (or already attached)"
else
  echo "⚠ Custom domain attach response (check manually if needed):"
  echo "$DR" | jq .
fi

# Create the matching CNAME in the parent zone — CF Pages does NOT do this
# automatically even when the zone is on the same account.
step "5b/5  Create CNAME ${PROD_HOST} → ${PAGES_PROJECT}.pages.dev"
ZONE_NAME=$(echo "$PROD_HOST" | awk -F. '{$1=""; OFS="."; sub(/^\./,""); print}')
ZONE_ID=$(curl -sS \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  "https://api.cloudflare.com/client/v4/zones?name=${ZONE_NAME}" \
  | jq -r '.result[0].id // empty')
if [[ -z "$ZONE_ID" ]]; then
  echo "⚠ Could not find zone for '${ZONE_NAME}'. Add the CNAME manually:"
  echo "  Name:    $(echo "$PROD_HOST" | cut -d. -f1)"
  echo "  Type:    CNAME"
  echo "  Target:  ${PAGES_PROJECT}.pages.dev"
  echo "  Proxied: yes"
else
  SUBNAME=$(echo "$PROD_HOST" | cut -d. -f1)
  # Idempotent: if record already exists, skip.
  EXISTING_DNS=$(curl -sS \
    -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
    "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?name=${PROD_HOST}&type=CNAME" \
    | jq -r '.result[0].id // empty')
  if [[ -n "$EXISTING_DNS" ]]; then
    ok "CNAME already exists for ${PROD_HOST}"
  else
    DNS_BODY=$(jq -n \
      --arg name "$SUBNAME" \
      --arg target "${PAGES_PROJECT}.pages.dev" \
      '{type: "CNAME", name: $name, content: $target, proxied: true, ttl: 1, comment: "Elitez ESOP — CF Pages prod"}')
    DNS_RESP=$(curl -sS -X POST \
      -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      -H "Content-Type: application/json" \
      -d "$DNS_BODY" \
      "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records")
    if echo "$DNS_RESP" | jq -e '.success' >/dev/null; then
      ok "CNAME created: ${PROD_HOST} → ${PAGES_PROJECT}.pages.dev (proxied)"
    else
      echo "❌ CNAME creation failed:"; echo "$DNS_RESP" | jq . ; exit 1
    fi
  fi
fi

# Update Supabase Auth Site URL to the production host
step "Bonus  Update Supabase Auth Site URL to https://${PROD_HOST}"
AUTH_BODY=$(jq -n --arg host "$PROD_HOST" \
  '{
    site_url: ("https://" + $host),
    uri_allow_list: ("https://" + $host + ",https://esop.derrickteo.com,https://" + $host + "/set-password.html,https://" + $host + "/reset-password.html,http://localhost:8000")
  }')
curl -sS -X PATCH \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "$AUTH_BODY" \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth" >/dev/null
ok "Site URL: https://${PROD_HOST}"

echo
echo "━━━ ✓ Phase 2 complete ━━━"
echo "Deploy:       ${DEPLOY_URL:-pages.dev URL above}"
echo "Production:   https://${PROD_HOST} (DNS propagating, allow ~1 min)"
echo
echo "Next:"
echo "  • curl -sI https://${PROD_HOST}    # verify after DNS propagates"
echo "  • Open https://${PROD_HOST}/index.html and sign in as Derrick"
echo "  • Schedule the nightly cron in the Supabase dashboard (Step 10)"
echo "  • Optional: keep esop.derrickteo.com as redirect or delete it"
