# Backend-Backed App — Past Examples

Three real projects that anchor this archetype. Each one is a recipe reference, not just a portfolio entry — the lessons here shaped the mechanic designs.

---

## 1. sp-wsg-corenet — Full Hosted Production Stack

The most complete backend-backed-app in the portfolio. A WSG-funded project running FastAPI + Postgres + pgvector + Redis + Resend + a Next.js frontend. Local dev runs via docker-compose with MailHog for email capture and a local Postgres instance. Production runs on Fly.io across three separate Fly apps: backend API, cron job runner, and a staging environment that mirrors production with a separate secrets set.

This project anchors **both** `containerized-fastapi-fly` and `magic-link-auth-supabase`. The containerized stack recipe came directly from the multi-service Fly deploy pattern here — the split across backend/cron/staging is codified in that mechanic's `docker-compose.yml` scaffold. The magic-link recipe borrows the Resend integration and the `before-user-created` allowlist pattern that was hardened during sp-wsg-corenet's auth implementation.

**Lesson for future engineers:** split your Fly deploy across services from day one, even when the scope looks small. Single-app Fly setups work until you need background jobs — at that point, you're either retrofitting a second app or cramming a cron process into the API container and fighting port conflicts. The scaffolding cost of a three-app setup is two extra `fly.toml` files at project start.

---

## 2. elitez-ai-tender-creator — The Supabase-OTP Slice

A CF Pages + Supabase + Resend stack. The live site at tender.elitezaviation.com is, intentionally, a gated demo: every visitor hits the magic-link sign-in wall immediately, and the wall IS the recipe demonstration. Allowed domains are `elitez.asia` and `dhc.com.sg` — anyone else gets an error at the Supabase Postgres layer before a user row is ever created.

This project anchors `magic-link-auth-supabase` and is the primary source for pitfalls `bba-supabase-silent-public` and `bba-resend-dns-unverified`. Both failures were real: the app shipped briefly without the `before-user-created` hook (silently public — anyone with a magic link could create an account), and Resend's DNS verification was incomplete on first launch (the dashboard said "sent," users saw nothing). Both are now encoded as non-negotiable steps in the recipe.

**Lesson for future engineers:** the `before-user-created` Postgres trigger is the only part of the auth stack that runs at the database layer. App-layer domain checks (React, FastAPI, Supabase Edge Functions) are guidance — they can be bypassed, misconfigured, or stripped by a future refactor. Database-layer enforcement cannot be bypassed without a schema migration. Build the trigger first, before any app logic assumes the allowlist is working.

---

## 3. Elitez-ESOP — The Migration Story

Started as a static site: vanilla HTML + localStorage for event-sourced state + SHA-256 password auth. Delivered the v1 experience well — PE-annual-report aesthetic, trading windows, PDF doc generation. The static mock auth was intentional: it let the UI ship and be demoed without standing up a backend.

The problem surfaced when multi-device access became a requirement. localStorage state doesn't travel. The `supabase/` folder (config.toml, schema migrations, Edge Functions, tests) now exists in the repo — migration in progress, not yet fully hosted. The migration cost turned out to be higher than expected because every page assumed localStorage for session state. There was no seam in the code between "mock auth" and "real auth."

This project anchors `magic-link-auth-supabase` (planned, not yet live) and is the source for pitfall `bba-mock-auth-stuck`. The lesson is not that mock auth is bad — for v1 demos, it's fast and correct. The lesson is that you need to write the migration spec *at v1 time*, when the cost is visible but not yet painful.

**Lesson for future engineers:** write a `MIGRATION.md` at the same time you build the mock auth. The file should list: target schema, auth flow swap points, every localStorage call that needs a DB equivalent, and the deploy sequence. Future-you will thank past-you for making the exit cost explicit. Without it, mock auth is a tarpit dressed as a shortcut.
