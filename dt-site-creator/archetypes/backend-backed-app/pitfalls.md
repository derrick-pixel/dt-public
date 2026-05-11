# Backend-Backed App — Pitfalls

Scar tissue from production-stack work. Dashboard parses this file's YAML block.

```yaml
- id: bba-cf-access-otp-unreliable
  title: "My CF Access OTP emails aren't arriving"
  severity: high
  phase: deploy
  story: "Set up Cloudflare Access on /xinceai, /aevum, /elix-eor admin paths with the default OTP option. Several invited admins on SG email providers never received the codes. Spent days debugging — turned out OTP delivery via CF Access has unreliable inbox placement for some SG providers."
  source: "derrickteo.com admin paths, Apr 2026"
  fix: |
    Use Google OAuth IdP from day one, not OTP.
    In Zero Trust → Settings → Authentication → Login methods,
    configure Google as an IdP first; attach it to your application.
    Free tier supports it.
  lesson: "OTP looks free and zero-config, but email deliverability is not your friend. Federated identity (Google) skips the email round-trip entirely."
  mechanic: cf-zero-trust-static-admin

- id: bba-supabase-silent-public
  title: "My Supabase magic-link 'works' but anyone can sign up"
  severity: critical
  phase: auth-config
  story: "Built a tool gated by magic-link sign-in. App-layer code checked email domain before showing the dashboard. Discovered later that anyone could complete signup — the user row was created the moment they clicked the link, regardless of domain. The 'allowlist' was a UI suggestion."
  source: "elitez-ai-tender-creator setup, 2026"
  fix: |
    Wire a `before-user-created` Postgres trigger that raises an exception
    when the email domain is not in your allowlist. App-layer checks are
    guidance; database-layer triggers are enforcement.
  lesson: "If your allowlist runs in the client or app server, it is not an allowlist — it is a comment. Real allowlisting runs in the DB layer."
  mechanic: magic-link-auth-supabase

- id: bba-resend-dns-unverified
  title: "Resend says 'sent' but emails don't arrive"
  severity: high
  phase: pre-launch
  story: "Configured Resend with a custom sender domain. Dashboard showed 'sent' for every magic-link. Users never received them. DNS verification for SPF + DKIM was incomplete — provider silently spam-foldered everything."
  source: "elitez-ai-tender-creator pre-launch, 2026"
  fix: |
    Verify the sender domain in Resend BEFORE first user-facing send.
    Wait for both SPF and DKIM to show 'verified' in the Resend dashboard.
    Test with an internal address from outside the org first.
  lesson: "Email is the only part of the stack where 'sent' doesn't mean 'delivered.' Always verify with a real external inbox before trusting the dashboard."
  mechanic: magic-link-auth-supabase

- id: bba-docker-port-collision
  title: "My docker-compose hangs because port 5432 is taken"
  severity: medium
  phase: local-dev
  story: "Running two projects with Postgres in docker-compose. Second project's `docker-compose up` hung silently — port 5432 was already claimed by the first stack. No clear error in the log."
  source: "Working on sp-wsg-corenet and elitez-esop migration in parallel"
  fix: |
    In docker-compose.yml, change the host-port mapping:
      ports: ["5433:5432"]  # rather than 5432:5432
    Update the project's .env to reflect the host port.
    Or stop the other compose stack first: docker-compose -p other-project down
  lesson: "Container ports are private; host ports are shared. Coordinate host-side ports across projects you run together."
  mechanic: containerized-fastapi-fly

- id: bba-cf-pages-no-autodeploy
  title: "CF Pages didn't auto-deploy my new commit"
  severity: medium
  phase: deploy
  story: "Pushed a commit to fix a bug. Refreshed the live site — same broken state. CF Pages project had no Git provider connected. Every deploy is manual via `wrangler pages deploy`."
  source: "elitez-ai-tender-creator (CF Pages 'elitez-tender'), 2026"
  fix: |
    Either connect a Git provider in CF Pages → Settings → Builds & deployments,
    OR document the manual step explicitly in the project's README:
      'Deploy: wrangler pages deploy dist --project-name=<name>'
    so future-you doesn't waste 20 minutes wondering.
  lesson: "When you skip a default convention (Git auto-deploy), document the alternative loudly. CI workflows are the kind of thing future-you will assume is in place."
  mechanic: null

- id: bba-mock-auth-stuck
  title: "My static demo with mock auth got stuck in 'mock' forever"
  severity: medium
  phase: planning
  story: "Built elitez-lms as a static demo with mock auth (pick an account, no password) and localStorage for per-user progress. Worked beautifully in v1. When time came to graduate to real Supabase auth, the migration looked expensive — every page assumed localStorage. Project stayed at v1 mock forever."
  source: "elitez-lms, 2026"
  fix: |
    When you build the mock, pre-write the migration spec to a MIGRATION.md
    in the same repo so the cost of moving to real auth is visible from day one.
    The MIGRATION.md should list: schema, auth flow swap, localStorage→DB calls, deploy.
  lesson: "Mock auth has a gravitational pull — by the time you want to leave it, you've built around it. Make the exit cost visible up front."
  mechanic: null

- id: bba-streamlit-secrets-mismatch
  title: "Streamlit Cloud secrets vs local .env"
  severity: medium
  phase: deploy
  story: "Local Streamlit app read secrets from .env via python-dotenv. Pushed to Streamlit Cloud. App crashed: .env doesn't exist in the Cloud sandbox; Streamlit Cloud uses its own secrets UI populated into st.secrets."
  source: "market-tracker and yishun-dorm-pitch deploys, 2026"
  fix: |
    Keep both:
    - .streamlit/secrets.toml.example committed (shows the shape).
    - Real local .streamlit/secrets.toml gitignored.
    - Paste the same TOML into Streamlit Cloud's Secrets UI before first deploy.
    In code, always read via st.secrets — never directly from .env or os.environ.
  lesson: "Streamlit Cloud is a sandbox, not a server you SSH into. Secrets live in the UI, accessed via st.secrets. Match local mechanism to prod from day one."
  mechanic: streamlit-cloud-analytics
```
