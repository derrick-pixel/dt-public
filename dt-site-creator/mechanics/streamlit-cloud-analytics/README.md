# Streamlit Cloud (Rapid Analytics)

Data-heavy Python dashboards with one-click deploy. You write `app.py`; Streamlit Cloud takes a GitHub URL and serves it. No Dockerfile, no Vercel build config, no nginx. Trade-off: you give up real backend logic and REST APIs in exchange for dashboard-shaped UI in 200 lines of Python.

## What you get

- A Python data app live on the internet in minutes.
- Secrets via Streamlit Cloud's UI (mapped to `st.secrets` in code).
- Optional SFA-restricted apps (gated by Streamlit's own auth — "specific Streamlit accounts").
- A guest rate-limiter pattern in `st.session_state` (for public apps that need throttling).

## When to use

- Data-heavy dashboards (charts, tables, filters).
- One developer; Python-first; you'd rather not write React.
- Internal team tools where a `streamlit.app` subdomain is fine.
- Quick pitch apps with rate-limited public access.

## When to skip

- Need <100ms interactivity — Streamlit re-runs the whole script on every interaction.
- Multi-tenant accounts with per-user database rows (Streamlit's auth is per-app, not per-user-row).
- Pixel-perfect design control (Streamlit theming is limited).
- Heavy backend work (websockets, jobs, queues) — use `containerized-fastapi-fly` instead.

## Wire-up steps

1. `pip install streamlit pandas altair`.
2. Write `app.py` (see snippet).
3. Run locally: `streamlit run app.py`.
4. Push to GitHub.
5. Connect repo at `share.streamlit.io`.
6. Paste real secrets into Streamlit Cloud's Secrets UI (different mechanism from local `.streamlit/secrets.toml` — see pitfall `bba-streamlit-secrets-mismatch`).
7. (Optional) Enable SFA restriction in app settings to gate by Streamlit account.

## Common pitfalls

See `bba-streamlit-secrets-mismatch` on the Pitfalls wall.

## Past uses

- **market-tracker** (Streamlit Cloud, ChicagoBooth analysis, light theme, guest rate-limiter).
- **yishun-dorm-pitch** (Streamlit Cloud, SFA-restricted to Elitez HQ employees).
