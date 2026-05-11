# Containerized FastAPI on Fly.io

Backend stack you can run on your laptop with `docker-compose up` and deploy to Fly.io with a one-line `fly deploy`. Local services (Postgres+pgvector, Redis, MinIO, MailHog) mirror the production managed equivalents, so the same code runs everywhere.

## What you get

- **Local dev** that mirrors prod: Postgres+pgvector for data + embeddings, Redis for cache/queues, MinIO for S3-compatible blob storage, MailHog for SMTP capture.
- **Production deploy** as three separate Fly apps: backend (HTTP), cron (scheduled jobs), staging (full second environment).
- **Reproducible**: a fresh developer checks out the repo, runs `docker-compose up`, has a working backend in 60 seconds.

## When to use

- Real backend needed: jobs, queues, multi-tenant data, embeddings.
- pgvector or other Postgres extensions required.
- You can swallow the Docker overhead (laptop with 16+ GB RAM).
- You're shipping something with users; this is not a weekend project stack.

## When to skip

- Marketing site or content-only — no server logic needed (use static-informational).
- One developer who'd be faster shipping Streamlit (use `streamlit-cloud-analytics`).
- You want zero-ops — no docker, no fly.toml, no Postgres connection strings.
- You're not actually going to deploy this (Docker overhead isn't worth it for prototypes).

## Wire-up steps

1. Install Docker Desktop + `flyctl` (`brew install flyctl`).
2. Copy `docker-compose.yml`, `Dockerfile`, and the 3 `fly.*.toml` files into your repo (matching the directory structure in snippet.html).
3. `docker-compose up` — verify Postgres on :5432, Redis on :6379, MinIO console at :9001, MailHog UI at :8025.
4. `fly launch --copy-config -c infra/fly/fly.backend.toml` (one for each Fly app).
5. `fly secrets set DATABASE_URL=... REDIS_URL=... RESEND_API_KEY=...` for each app.
6. `fly deploy -c infra/fly/fly.backend.toml`.

## Common pitfalls

See `bba-docker-port-collision` on the Pitfalls wall. Additional gotchas baked into the snippet comments:

- **Port collisions:** Running two compose stacks on the same host fights for 5432, 6379, etc.
- **MinIO vs S3 config drift:** different endpoints, different signature versions.
- **MailHog port confusion:** UI at :8025, SMTP at :1025 — point the app at :1025.

## Past uses

- **sp-wsg-corenet** (WSG/SP/BCA AI Job Redesign Toolkit) — currently the only project running the full stack.
