# stitch-bridge — Example usage

## Pattern: full Stitch flow in design-system.json

```json
{
  "stitch_project_id": "stitch-prj-abc123",
  "stitch_design_system_id": "stitch-ds-xyz789",
  "components": [
    {
      "id": "nav",
      "type": "nav",
      "stitch_screen_id": "nav-1",
      "html_path": null,
      "css_classes": [".nav", ".nav-fixed"]
    },
    {
      "id": "home-hero",
      "type": "hero",
      "stitch_screen_id": "home-hero-1",
      "html_path": null,
      "css_classes": [".hero", ".hero-band"]
    },
    {
      "id": "feature-card",
      "type": "card",
      "stitch_screen_id": "feature-grid-1",
      "html_path": null,
      "css_classes": [".card", ".feature-card"]
    }
  ],
  "font_pairing": {
    "headline": "Inter",
    "body": "Inter",
    "mono": null
  }
}
```

## Pattern: Stitch fallback (no Stitch available)

```json
{
  "stitch_project_id": null,
  "stitch_design_system_id": null,
  "fallback_reason": "Stitch plugin not enabled in this environment; hand-composed from palette.json + sitemap.json + copy.json",
  "components": [...],
  "font_pairing": {...}
}
```

## Pattern: documented Stitch divergence

```json
{
  "components": [
    {
      "id": "home-hero",
      "type": "hero",
      "stitch_screen_id": "home-hero-1",
      "notes": "Stitch generated 2-column hero; hand-edited to single-column for narrower viewports. Re-run Stitch with explicit single-column instruction to re-sync."
    }
  ]
}
```

This makes the divergence auditable so future Stitch re-runs don't silently overwrite the fix.

## Sourced from

Standard pattern across all Stitch-enabled dt-site-creator projects since the plugin became available.
