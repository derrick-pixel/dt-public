# Elitez ESOP — Launch Runbook

This is everything Derrick needs to do by hand to take the `feat/internal-launch` branch from "code complete" to "production at esop.derrickteo.com". The branch is on GitHub at `derrick-pixel/Elitez-ESOP`.

**Estimated time: 45–60 minutes if nothing goes wrong.** Steps that need a browser session or MFA are flagged with 🧑‍💻.

---

## Step 1 — 🧑‍💻 Create the Supabase project (5 min)

1. Log in to supabase.com.
2. New project. Name: `elitez-esop`. Region: `Southeast Asia (Singapore)`. Use a strong DB password and save it in your password manager.
3. While the project provisions, note the **Project URL** and **anon key** from Settings → API. You'll paste both into HTML pages in step 5.
4. Also note the **service-role key** — never paste this into a browser; you'll set it as an Edge Function secret in step 6.

---

## Step 2 — Link the local CLI (2 min)

```bash
cd /Users/derrickteo/codings/Elitez-ESOP
supabase link --project-ref <project-ref>
```

(`<project-ref>` is the subdomain in your project URL, e.g. `abcdwxyz`.)

---

## Step 3 — Apply migrations (5 min)

```bash
supabase db push
```

This applies migrations 0001 → 0011 in order. Expected output: each migration "applied".

If `0011_seed_bootstrap.sql` errors out (e.g. data.json changed), regenerate it first:

```bash
node scripts/build-seed-migration.mjs
supabase db push
```

Verify seed count:

```bash
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2- | tr -d '\"')" -c "select count(*) from public.events where actor_role = 'system';"
```

Expected: 51 events (or whatever the script printed — both must match).

---

## Step 4 — 🧑‍💻 Bootstrap yourself as admin (3 min)

1. Supabase dashboard → Authentication → Add user.
   - Email: `derrick@elitez.asia`
   - Set a temporary password (you'll change it on first login).
   - Confirm the user immediately (no email verification needed since you control the account).
2. Note the user UUID from the row that appears.
3. Edit `supabase/migrations/0012_bootstrap_admin.sql`, replace `PASTE_UUID_HERE` with that UUID.
4. Apply it:

```bash
supabase db push
```

5. Verify:

```sql
-- Supabase dashboard → SQL Editor
select * from public.profiles where email = 'derrick@elitez.asia';
-- expect role=admin
```

---

## Step 5 — Wire your Supabase credentials into the HTML (3 min)

Find/replace across all HTML pages (`index.html`, `portal.html`, `admin.html`, `committee.html`, `trading.html`, `scheme.html`, `set-password.html`, `reset-password.html`):

```bash
cd /Users/derrickteo/codings/Elitez-ESOP
sed -i '' "s|https://<project-ref>.supabase.co|https://<your-project-ref>.supabase.co|g" *.html
sed -i '' "s|<anon-key>|<your-anon-key>|g" *.html
```

Sanity check:

```bash
grep -c "supabase.co" *.html
# every page should show 1
grep -c "<anon-key>" *.html
# every page should show 0 — if not, the placeholder didn't get replaced
```

Commit:

```bash
git add *.html
git commit -m "config: wire Supabase project credentials"
```

Note: the anon key is browser-safe by Supabase design — RLS gates everything. Service-role key never goes here.

---

## Step 6 — 🧑‍💻 Deploy Edge Functions (5 min)

```bash
supabase secrets set ESOP_SITE_URL=https://esop.derrickteo.com
supabase functions deploy admin-invite --no-verify-jwt
supabase functions deploy verify-chain
```

`--no-verify-jwt` on admin-invite is intentional: the function checks the JWT itself (so it can give a 401 instead of 500) and verifies the caller is admin via the profiles table.

Test admin-invite (replace tokens):

```bash
# Get an access token by logging in as Derrick — easiest way: open
# https://supabase.com/dashboard/project/<ref>/auth/users → click your user
# → "Send magic link", or use the JS client in DevTools to sign in.
# Then in DevTools:
#   const t = (await window.ESOPSupa.client.auth.getSession()).data.session.access_token
#   console.log(t)
curl -X POST "https://<ref>.supabase.co/functions/v1/admin-invite" \
  -H "Authorization: Bearer <access-token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@elitez.asia","full_name":"Test User","role":"holder","holder_id":"99"}'
```

Expected: 200 with `{"ok":true,"user_id":"..."}` and an email arrives.

If you don't get the email, check Supabase Settings → Auth → Email and configure Resend SMTP (same pattern as elitez-tender). Sender: `esop@elitez.asia`. See `project_elitez_tender` memory for the configuration template.

---

## Step 7 — 🧑‍💻 Configure Supabase Auth redirect URLs (1 min)

Dashboard → Authentication → URL Configuration:

- Site URL: `https://esop.derrickteo.com`
- Additional Redirect URLs (one per line):
  - `https://esop.elitez.com.sg`
  - `https://esop.derrickteo.com/set-password.html`
  - `https://esop.derrickteo.com/reset-password.html`
  - `http://localhost:8000` (for local dev)

---

## Step 8 — Smoke-test SGQR against real banking apps (10 min)

```bash
python3 -m http.server 8000
open "http://localhost:8000/tests/sgqr.test.html"
```

The page renders a QR for UEN `201912345A`, amount S$250.00, reference `EXR-2026-00001`. Scan it with **UOB / DBS / OCBC / Trust** mobile banking. Expected: amount and reference pre-fill, recipient shows `ELITEZ GROUP PTE LTD`.

If any bank rejects the QR, file a bug — the CRC or TLV ordering needs adjusting before going live. Don't ship without confirming at least UOB + DBS work.

After validation, set Elitez's actual UEN in `assets/data.json` under `org.uen` (add the field if absent), so the live exercise flow uses the real UEN.

---

## Step 9 — 🧑‍💻 Cloudflare Pages deploy (10 min)

1. Cloudflare dashboard → Pages → Create project → Connect to GitHub `derrick-pixel/Elitez-ESOP`.
2. Build settings: build command = `(none)`, output directory = `/`, root directory = `/`.
3. Production branch: `main` (you'll merge `feat/internal-launch` into `main` first; see Step 11).
4. Custom domains: add `esop.derrickteo.com`. Cloudflare creates the DNS automatically since you own `derrickteo.com` on CF.
5. Add `esop.elitez.com.sg` too — it stays inert until DNS is configured later but the binding waits.

Verify:

```bash
curl -sI https://esop.derrickteo.com | head -1
# HTTP/2 200
```

---

## Step 10 — 🧑‍💻 Verify nightly chain-verify cron (3 min)

Supabase dashboard → Database → Cron Jobs → New scheduled job:

- Name: `nightly-chain-verify`
- Schedule: `0 17 * * *` (01:00 SGT)
- SQL command:

```sql
select net.http_post(
  url:='https://<ref>.functions.supabase.co/verify-chain',
  headers:='{"Authorization":"Bearer <service-role-key>"}'::jsonb
);
```

Trigger once manually to verify:

```bash
curl -X POST "https://<ref>.functions.supabase.co/verify-chain" \
  -H "Authorization: Bearer <service-role>"
```

Expected: `{"ok":true,"broken":null,"count":<N>}`. Check `audit_log` for a fresh `chain_verified` row.

---

## Step 11 — Land the branch (2 min)

```bash
git checkout main
git merge feat/internal-launch --no-ff -m "merge: internal launch (Supabase + e-signing + PayNow QR + audit)"
git push origin main
```

Cloudflare Pages auto-rebuilds. Verify the production site loads.

---

## Step 12 — 🧑‍💻 Staged rollout (15–30 min)

1. Sign in to `esop.derrickteo.com` as Derrick. Verify you land on the admin page and Activity Log shows your `login_success` row with your IP.
2. Use Roster → "Invite holder / member" to invite a test account (e.g. your personal Gmail) as role=holder with a synthetic holder_id like `99`.
3. Open the magic link in an incognito window. Set a 12-character password. Verify you land on `portal.html` and see seed data.
4. Sign back in as admin in your main browser. Approve a draft grant for that test holder (admin → Holders & Grants).
5. As the test holder: scroll the portal page, find the exercise CTA for FY2022 (oldest grant — vested portion is exercisable). Click "Submit notice of exercise". Verify the QR card appears with reference like `EXR-2026-00001`.
6. Scan the QR with your bank app — expected: amount + reference pre-filled, recipient ELITEZ GROUP PTE LTD.
7. As admin: Pending Payments tab → see the row → "Mark paid" with a fake bank ref → verify Activity Log shows `exercise_settled` and the test holder's portal updates.
8. Sign out, attempt a wrong password 3 times. Verify the topbar failed-login badge shows "3" on admin.
9. Open Activity Log on admin → confirm rows include: `magic_link_sent`, `password_set`, `login_success`, `login_failed` (3×), `grant_approved`, `exercise_submitted`, `exercise_settled`, `audit_export_downloaded` (after a CSV export). Every row has an IP.

If anything fails, fix it on `main` directly (small fixes) or branch off again if structural.

After this passes, invite the most-tolerant real holder. Stay on Slack/WhatsApp standby for first-day issues.

---

## Step 13 — Future: migrate to `esop.elitez.com.sg`

1. Set up the CNAME on `elitez.com.sg` DNS pointing to the Cloudflare Pages target.
2. Update Resend SMTP sender domain verification.
3. Verify Supabase Auth → URL Configuration already has `esop.elitez.com.sg` (added in Step 7).
4. Communicate the new URL to holders.
5. Keep the `esop.derrickteo.com` CF Pages domain for one quarter as a redirect.

---

## Troubleshooting cheatsheet

| Symptom | Likely cause | Fix |
|---|---|---|
| Login fails with "Email or password incorrect" but creds are right | User exists in `auth.users` but not in `profiles`; the trigger that copies on sign-up didn't fire | Manually insert into profiles via SQL editor |
| Magic-link email never arrives | Resend SMTP not configured | Settings → Auth → Email → configure with Resend; sender `esop@elitez.asia` |
| Portal shows blank vested calc | `state()` ran before `ESOPStore.init()` resolved | Wrap the page's init in `(async () => { await ESOPStore.init(); ... })()` |
| Activity Log returns no rows for an admin | RLS denied because `profiles.role` is not 'admin' or 'committee' | `select * from profiles where email='you@elitez.asia'` — check role; fix with `update profiles set role='admin' where ...` |
| SGQR rejected by banking app | CRC mismatch or wrong TLV ordering | Re-test with `tests/sgqr.test.html`; compare bytes against a known-good UOB-generated QR |
| Hash chain "broken" alert | Either someone edited an event row directly OR the chain genesis broke | Don't try to "fix" by editing rows — file an incident, audit the rows around the broken one with `select * from events order by at, id` |

---

## What's deferred to v1.1

- Drawn-on-canvas signatures (typed name only for v1)
- Bank webhook → automated payment reconciliation (admin marks paid manually)
- Offline mutation queue (writes require connectivity)
- IP geolocation / anomaly detection / "unusual activity" flags
- 2FA / TOTP (Supabase makes this a one-line add later)
- Per-holder activity drill-down on the holder detail card (use Activity Log filter-by-actor for now)
- LoO-as-document flow: admin pre-creates a `documents` row, holder signs via the unified `sign_document` RPC (existing inline acceptance flow keeps working; this is just a tidier path)
- **Signed PDF persistence to Supabase Storage.** The `documents` table, `esop-documents` bucket, `finalize_signed_document` RPC, and `get_document_url` RPC all exist in the schema but no v1 client UI uploads PDFs. PDFs are generated client-side on demand. Wiring the upload + signed-URL download is straightforward in v1.1 — the schema is ready.

---

## Definition of done

- A net-new holder receives an invite, sets a password, signs into the portal, and the audit log captures every step with their IP.
- An exercise produces a PayNow QR that scans correctly in UOB / DBS / OCBC / Trust.
- Admin marks paid; holder's beneficial-ownership register updates.
- Failed login attempts show in the topbar badge and Activity Log.
- The hash chain verifies clean on the nightly run.
