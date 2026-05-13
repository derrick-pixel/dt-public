# Auth Setup Runbook (Supabase + Resend)

dt-site-creator uses Supabase OTP + Resend SMTP to gate full prompts.
This file documents the one-time dashboard setup that lives OUTSIDE the repo.

## 1. Create the Supabase project

1. Go to https://supabase.com/dashboard.
2. New project. Name: `dt-site-creator-soft-gate`. Region: closest to your users.
3. Wait for provisioning (~2 min).
4. Project Settings → API → copy the Project URL and anon (public) key.
5. Paste both into `/Users/derrickteo/codings/dt-site-creator/dashboard/js/auth-config.js`:
   - Replace `https://REPLACE_ME.supabase.co` with the real URL.
   - Replace `REPLACE_ME_ANON_KEY` with the real anon key.
6. Commit + push the updated auth-config.js. (Anon keys are public-safe per Supabase docs.)

## 2. Configure Supabase Auth

1. Authentication → Providers → Email — enable. Disable password sign-in (we're OTP-only).
2. Authentication → URL Configuration — add these to "Redirect URLs":
   - https://derrickteo.com/dt-site-creator/**
   - https://derrick-pixel.github.io/dt-site-creator/**
   - http://localhost:8000/**

## 3. Connect Resend SMTP

1. In Resend (https://resend.com), verify the sender domain `elitezaviation.com` if not already verified.
2. Create or confirm an API key with "Send emails" permission.
3. In Supabase → Authentication → SMTP Settings:
   - Host: smtp.resend.com
   - Port: 587
   - Username: resend
   - Password: <your Resend API key>
   - Sender email: prompts@elitezaviation.com
   - Sender name: DT Site Creator
4. Save. Send a test email to your own inbox to verify delivery.

## 4. (Optional) Verify locally

```
cd /Users/derrickteo/codings/dt-site-creator
python3 -m http.server 8000
```

Open http://localhost:8000/mechanics.html in an incognito window. Click a mechanic card's "View snippet" button. Expected:

- The auth modal opens.
- Enter your email, click "Send code".
- A 6-digit code arrives in your inbox (from prompts@elitezaviation.com).
- Enter the code, click "Verify".
- Modal closes; the snippet renders.
- Header shows "signed in as you@email · sign out".

## 5. Pull the lead list

In Supabase SQL Editor:

```
select email, created_at, last_sign_in_at
from auth.users
order by created_at desc;
```

Export to CSV from the dashboard.

## Future iterations (not yet wired)

- Webhook to Slack / Google Sheet on new sign-up.
- Re-engagement email when new mechanics ship.
- CF Access path-scoped on derrickteo.com (edge-level lockdown — separate work).
