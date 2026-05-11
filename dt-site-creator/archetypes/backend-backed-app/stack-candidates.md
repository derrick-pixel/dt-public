# Backend-Backed App — Stack Candidates

Tools evaluated for this archetype but not yet shipped in any production project under derrick-pixel.

> **Why this file exists:** to keep the "evaluated, not yet adopted" judgment honest. Future-you reads this before reaching for a tool listed here and decides if the trigger condition has finally arrived.
> **Not consumed by the Assembly engine.** This is a repo-only reference page.

## Neon.tech

- **What it is:** Serverless Postgres with branching and instant compute scale-down.
- **Closest shipped:** Supabase Postgres (in elitez-ai-tender-creator, Elitez-ESOP migration).
- **Trigger for adoption:** First project that needs Postgres without Supabase's auth/storage bundle, and that benefits from per-PR branch databases (e.g., a heavy data-migration workflow).

## Upstash

- **What it is:** Serverless Redis with an HTTP API (no long-lived connection).
- **Closest shipped:** docker-compose Redis (sp-wsg-corenet local stack).
- **Trigger for adoption:** First project on a serverless platform (Vercel functions, CF Workers) that needs Redis but can't hold a long connection.

## Sentry.io

- **What it is:** Error monitoring and performance tracing.
- **Closest shipped:** browser console + Fly logs (sp-wsg-corenet).
- **Trigger for adoption:** First production outage I can't diagnose from logs alone — that's when the cost of Sentry pays itself back.

## Railway

- **What it is:** Container deploy platform (Heroku-shaped successor).
- **Closest shipped:** Fly.io (sp-wsg-corenet).
- **Trigger for adoption:** If Fly's pricing or region story changes. Same conceptual shape, so migration is feasible.

## Vercel

- **What it is:** Frontend-first deploy platform with edge functions and ISR.
- **Closest shipped:** CF Pages (for static sites — derrickteo.com fleet).
- **Trigger for adoption:** First Next.js project that needs serverless functions + edge runtime + ISR. CF Pages is fine for static; Vercel earns its keep when SSR + functions matter.
