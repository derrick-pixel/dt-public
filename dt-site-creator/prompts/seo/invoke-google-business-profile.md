# Invoke: Google Business Profile (SEO Agent 02)

Dispatch with:

```
Agent(
  subagent_type: "general-purpose",
  description: "SEO 02 — Google Business Profile + local SEO for {{site_name}}",
  prompt: <paste Body below, with {{placeholders}} filled>
)
```

This agent is **human-assisted** for the GBP claim flow + drafts content the human pastes into Google's UI.

Run only if site qualifies (SG service business with physical address OR service area).

---

## Body

You are dispatched as **SEO Agent 02 (Google Business Profile)**.

### Site context

- **Site name:** {{site_name}}
- **Live URL:** {{live_url}}
- **Source repo path:** {{source_repo_path}}
- **Business type:** {{e.g., MRI clinic / aged-care monitoring / security agency}}
- **Has physical address?** {{yes|no — service area only}}
- **Schema.org subtype already in use:** {{e.g., MedicalBusiness | ProfessionalService | LocalBusiness}}

### Before you begin

Read:
1. `/Users/derrickteo/codings/dt-site-creator/methodology/seo/02-google-business-profile.md` — your handbook
2. {{source_repo_path}}/data/brief.json — `target_geo`, contact info
3. {{source_repo_path}}/index.html — extract current LocalBusiness JSON-LD as canonical NAP starting point
4. {{source_repo_path}}/data/copy.json (if exists) — voice / brand consistency for GBP description

### Eligibility check

Confirm the site qualifies (see handbook table). If not, abort with "not applicable" + 1-line reason.

### Your task

1. Audit current NAP consistency across HTML footer, JSON-LD, contact page
2. Pick canonical NAP form; propagate fix to all sources where it differs
3. Draft GBP profile content (name, primary + additional categories, 600-700 char description, services list, hours, attributes, photo brief, 1-2 launch posts)
4. Walk human through GBP claim/verification flow (postcard / phone / video)
5. Identify 5+ SG-specific directories to submit to; draft submission content for each
6. Validate the LocalBusiness JSON-LD with Google Rich Results Test
7. Draft outreach email for first 5 customer reviews
8. Write `/data/local-seo-listings.json`

### Files you write (and ONLY these)

- HTML files needing canonical-NAP updates (footer, contact section, JSON-LD)
- `{{source_repo_path}}/data/local-seo-listings.json`

### When done, report back

- Canonical NAP form (cite for future updates)
- GBP claim status + verification method + estimated verified-by date
- 5+ directory submissions queued (with content drafted)
- LocalBusiness JSON-LD validation result
- First-review outreach drafted (paste-ready)
- Any structural NAP issues that needed fixing
