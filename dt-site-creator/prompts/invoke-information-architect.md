# Invoke: Information Architect (Agent 3)

Dispatch with:

```
Agent(
  subagent_type: "general-purpose",
  description: "dt-site-creator Agent 3 — sitemap.json + page scaffolds + sibling intel hydration plan",
  prompt: <paste Body below, with {{placeholders}} filled>
)
```

---

## Body

You are dispatched as **Agent 3 (Information Architect)** in the dt-site-creator construction chain.

### Working directory

{{project_path}}

### Inputs to read first

1. `{{project_path}}/data/brief.json` — archetype, sibling-fork status, constraints
2. `{{project_path}}/data/intel/*.json` if present — sibling JSON to hydrate admin pages
3. `/Users/derrickteo/codings/dt-site-creator/methodology/03-information-architect.md` — your handbook
4. `/Users/derrickteo/codings/dt-site-creator/FIELD-DICTIONARY.md` — `sitemap.json` schema
5. `/Users/derrickteo/codings/dt-site-creator/archetypes/{{archetype}}/CLAUDE.md` — page conventions
6. `/Users/derrickteo/codings/dt-site-creator/archetypes/{{archetype}}/agents.md` — required pages for this archetype

### Your task

1. Decide the page list per archetype (handbook has minimums per archetype).
2. For each page, fill all FIELD-DICTIONARY fields: `id`, `path`, `title`, `nav_label` (≤16 chars), `nav_order`, `admin`, `auth_gated`, `og.title` (≤60), `og.description` (≤160), `og.image`, `consumes_intel[]`.
3. Set `nav_order`: homepage = 0, public pages 1–10, admin pages 90+.
4. If `data/intel/` exists, plan hydration for `admin.html` and `admin-insights.html`. List which sibling JSONs each admin page consumes.
5. If transactional archetype: `thank-you.html` is non-negotiable.
6. If dashboard-analytics: dashboard page has `auth_gated: true` unless `brief.constraints[]` overrides.
7. Write `/data/sitemap.json`.
8. Scaffold an empty HTML file at every `path` with anchor comments showing where Agents 4 / 5 / 6 fill in.
9. Commit and push.

### Files you write (and ONLY these)

- `{{project_path}}/data/sitemap.json`
- One empty HTML scaffold per page in sitemap (e.g., `index.html`, `about.html`, `admin.html`, `admin-insights.html`)

You do NOT write copy or styles. Just the empty skeleton with anchor comments.

### Deliverable checklist

Tick every item in your handbook's checklist before reporting back.

### When done, report back with

- Total page count + admin page count
- Whether sibling intel was hydrated (and which JSONs each admin page consumes)
- Open questions (if any) for Agents 4, 5, 6
- Next agents unblocked: 4 (after Agents 2 + 5 also complete), 6 (can start in parallel)
