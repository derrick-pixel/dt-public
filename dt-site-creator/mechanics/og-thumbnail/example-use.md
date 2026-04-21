# OG / WhatsApp Thumbnail — Past Use

## dt-site-creator (this site)
- **Recipe:** Dark-slate bg + amber/violet dual-glow + Manrope Extra Bold headline
- **Generator:** `scripts/generate-placeholders.py::make_og_image()` — Python + PIL, reproducible
- **Result:** When pasted into WhatsApp, renders a branded "DT Site Creator — Methodology Archive" card with subtitle + 3-bullet summary

## Altru (altru.asia)
- **Recipe:** Warm cream bg + red packet emoji · "Digital hongbao · Asia-wide"
- **Result:** Playful, immediately signals consumer/cultural product

## Passage (derrickteo.com/passage)
- **Recipe:** Serif headline "Because grief is burden enough." + dignified palette + no visual anchor (text is the entire design)
- **Result:** Tone-perfect for sensitive topic — the OG itself honors the subject

## Lumana
- **Recipe:** Warm teal + cream + headline "Ambient monitoring for safer aged care"
- **Result:** Healthcare-appropriate — calm colors, clinical typography

## What to avoid (seen in past projects)

- **Using a page screenshot as OG** — screenshots of full pages don't read at 600px preview size. Always design a dedicated thumbnail.
- **Tiny text** — anything below 24pt becomes illegible at WhatsApp preview size. Design for mobile preview first.
- **Updating the image without cache-busting** — the thumbnail stays stale on WhatsApp for up to 7 days unless you force-refresh via Facebook Debugger or rename the file.
- **Forgetting the file entirely** — then WhatsApp shows a blank card with just the URL and page title. Looks broken, trust drops.
