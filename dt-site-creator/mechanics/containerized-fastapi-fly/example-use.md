# Example use — sp-wsg-corenet

The WSG/SP/BCA AI Job Redesign CORENET X Toolkit runs the full stack:

- **Backend:** FastAPI + SQLAlchemy 2 (async) + Postgres + pgvector + Redis + Resend (production); MinIO + MailHog (local mocks).
- **Frontend:** Next.js 14 + TypeScript + Tailwind.
- **Deploy:** Three Fly apps — backend, cron, staging.

## Local dev flow

```bash
./scripts/dev-up.sh                 # brings up postgres+redis+minio+mailhog
cd backend && uvicorn app.main:app --reload
cd frontend && npm run dev
```

Magic-link emails caught by MailHog UI at <http://localhost:8025> during local dev — never hits Resend until prod.

## Why three Fly apps

- `fly.backend.toml` — the HTTP app.
- `fly.cron.toml` — a separate app that runs scheduled jobs without competing with HTTP workers.
- `fly.staging.toml` — full staging environment with its own DB.

Separating services lets you scale, restart, and deploy them independently.
