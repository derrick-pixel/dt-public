#!/usr/bin/env python3
"""
Generate branded placeholder thumbnails for dt-site-creator.

Output:
  - 14 project thumbnails at 1200x800 → dashboard/samples/<archetype>/<slug>.jpg
  - og-image.jpg at 1200x630
  - 9 mechanic previews at 400x300 → mechanics/<id>/preview.jpg

Until real screenshots replace these, they give the dashboard visually
distinguishable cards instead of 1x1 stubs.
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# ── Archetype palettes ──────────────────────────────────────
ARCHETYPE_COLOR = {
    "static-informational": ("#0d1117", "#38bdf8", "#79c0ff"),   # bg, accent1, accent2
    "transactional":        ("#1a0f08", "#f59e0b", "#ffa657"),
    "simulator-educational":("#0a1a14", "#34d399", "#6ee7b7"),
    "game":                 ("#1a0a14", "#f87171", "#fb923c"),
    "dashboard-analytics":  ("#0f0f1a", "#818cf8", "#d2a8ff"),
}

# ── Past projects ───────────────────────────────────────────
PROJECTS = [
    ("static-informational", "dt-site-creator", "DT Site Creator · Methodology Archive"),
    ("static-informational", "casket", "Passage · Dignified Caskets"),
    ("static-informational", "lumana", "Lumana · Ambient Care"),
    ("static-informational", "vectorsky", "VectorSky · Defence Ops"),
    ("static-informational", "xinceai", "XinceAI · AI Workflows"),
    ("static-informational", "aevum", "AEVUM · Concierge MRI"),
    ("static-informational", "elitez-security", "Elitez Security"),
    ("static-informational", "elitezaviation", "Elitez Aviation"),
    ("static-informational", "elitezai", "ElitezAI · Agentic Flows"),
    ("transactional",        "altru",       "Altru · Hongbao Tracker"),
    ("transactional",        "discounter",  "Discounter · FMCG Cart"),
    ("transactional",        "the-commons", "The Commons · Escrow Events"),
    ("transactional",        "quotation-preparer", "Quotation · PDF→Excel"),
    ("transactional",        "elix-eor",    "ELIX EOR · $30/mo"),
    ("simulator-educational","market-tracker","Market Tracker · Streamlit"),
    ("simulator-educational","booth-axp",   "Booth ISM · AXP-25"),
    ("simulator-educational","elitez-market","Booth × Elitez Market"),
    ("simulator-educational","dtws",        "DTWS Works · Quiz"),
    ("simulator-educational","elix-resume", "ELIX Resume · WYSIWYG"),
    ("game",                 "elixcraft",   "ElixCraft · HR Game"),
    ("dashboard-analytics",  "wsg-jrplus",  "JR+ · WSG WDG"),
    ("dashboard-analytics",  "eco-dashboard","Eco Dashboard · KPIs"),
    ("dashboard-analytics",  "csuite",      "C-Suite · Gmail Aggregator"),
]

# ── Mechanics (for preview thumbnails) ──────────────────────
MECHANICS = [
    ("paynow-qr",           "PayNow QR",         "#f59e0b"),
    ("localstorage-state",  "LocalStorage",      "#3fb950"),
    ("admin-auth-gate",     "Admin Gate",        "#d2a8ff"),
    ("canvas-hero",         "Canvas Hero",       "#79c0ff"),
    ("chartjs-dashboard",   "Chart.js",          "#818cf8"),
    ("pdf-pipeline",        "PDF Pipeline",      "#f85149"),
    ("wizard-form",         "Wizard",            "#34d399"),
    ("multi-page-scaffold", "Multi-Page",        "#ffa657"),
    ("og-social-meta",      "OG Meta",           "#79c0ff"),
    ("og-thumbnail",        "OG Thumbnail",      "#ffa657"),
    ("favicon",             "Favicon Set",       "#d2a8ff"),
]

# ── Font loading (macOS fallbacks) ──────────────────────────
def get_font(size: int, weight: str = "bold") -> ImageFont.FreeTypeFont:
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except Exception:
                continue
    return ImageFont.load_default()


def draw_gradient_bg(img: Image.Image, bg_hex: str, accent_hex: str) -> None:
    """Radial-ish gradient from bottom-right (accent glow) to top-left (bg)."""
    bg = hex_to_rgb(bg_hex)
    accent = hex_to_rgb(accent_hex)
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            # Distance from bottom-right as 0..1
            dx = (w - x) / w
            dy = (h - y) / h
            d = (dx * dx + dy * dy) ** 0.5
            d = min(d, 1.0)
            t = 1.0 - d
            t = t * 0.35  # keep gradient subtle
            r = int(bg[0] * (1 - t) + accent[0] * t)
            g = int(bg[1] * (1 - t) + accent[1] * t)
            b = int(bg[2] * (1 - t) + accent[2] * t)
            pixels[x, y] = (r, g, b)


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def make_project_thumb(archetype: str, slug: str, title: str) -> None:
    bg, accent1, accent2 = ARCHETYPE_COLOR[archetype]
    W, H = 1200, 800
    img = Image.new("RGB", (W, H), hex_to_rgb(bg))
    # Subtle gradient (disabled — too slow for per-pixel; use layered rects)
    draw = ImageDraw.Draw(img)

    # Layered rectangles give a gradient impression
    for i in range(60):
        alpha = 60 - i
        shade = tuple(
            int(hex_to_rgb(bg)[j] * (1 - alpha / 300) + hex_to_rgb(accent1)[j] * (alpha / 300))
            for j in range(3)
        )
        x0 = min(W - 600 + i * 10, W - 1)
        y0 = min(H - 400 + i * 7, H - 1)
        draw.rectangle([(x0, y0), (W, H)], fill=shade)

    # Archetype label
    label_font = get_font(28)
    archetype_label = archetype.upper().replace("-", " ")
    draw.text((60, 60), archetype_label, fill=accent1, font=label_font)

    # Title
    title_font = get_font(80)
    draw.text((60, 140), title, fill="#f0f6fc", font=title_font)

    # Accent line
    draw.rectangle([(60, 280), (300, 286)], fill=accent1)

    # Footer brand
    foot_font = get_font(24)
    draw.text((60, H - 80), f"dt-site-creator · {slug}", fill="#8b949e", font=foot_font)

    out = ROOT / "dashboard" / "samples" / archetype / f"{slug}.jpg"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "JPEG", quality=85)
    print(f"  {out.relative_to(ROOT)}")


def make_og_image() -> None:
    W, H = 1200, 630
    bg = hex_to_rgb("#0d1117")
    img = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(img)

    # Gradient layers (warm amber glow bottom-right)
    for i in range(100):
        alpha = 100 - i
        shade = tuple(
            int(bg[j] * (1 - alpha / 450) + hex_to_rgb("#ffa657")[j] * (alpha / 450))
            for j in range(3)
        )
        x0 = min(W - 700 + i * 7, W - 1)
        y0 = min(H - 400 + i * 4, H - 1)
        draw.rectangle([(x0, y0), (W, H)], fill=shade)

    # Violet glow top-left
    for i in range(80):
        alpha = 80 - i
        shade = tuple(
            int(bg[j] * (1 - alpha / 600) + hex_to_rgb("#d2a8ff")[j] * (alpha / 600))
            for j in range(3)
        )
        x1 = min(i * 8 + 200, W)
        y1 = min(i * 5 + 150, H)
        draw.rectangle([(0, 0), (x1, y1)], fill=shade)

    title_font = get_font(96)
    draw.text((72, 140), "DT Site Creator", fill="#f0f6fc", font=title_font)

    sub_font = get_font(40)
    draw.text((72, 260), "Methodology Archive", fill="#ffa657", font=sub_font)

    bullets_font = get_font(28)
    bullets = "5 archetypes  ·  9 mechanics  ·  40+ pitfalls"
    draw.text((72, 340), bullets, fill="#adbac7", font=bullets_font)

    # Accent line
    draw.rectangle([(72, 410), (240, 418)], fill="#ffa657")

    foot_font = get_font(22)
    draw.text((72, H - 60), "derrick-pixel.github.io/dt-site-creator", fill="#8b949e", font=foot_font)

    out = ROOT / "og-image.jpg"
    img.save(out, "JPEG", quality=88)
    print(f"  {out.relative_to(ROOT)}")


def make_mechanic_preview(mech_id: str, name: str, accent_hex: str) -> None:
    W, H = 400, 300
    bg = hex_to_rgb("#1c2128")
    img = Image.new("RGB", (W, H), bg)
    draw = ImageDraw.Draw(img)

    # Accent side-bar
    draw.rectangle([(0, 0), (6, H)], fill=accent_hex)

    # Title
    title_font = get_font(36)
    draw.text((32, H // 2 - 24), name, fill="#f0f6fc", font=title_font)

    # Subtitle
    sub_font = get_font(18)
    draw.text((32, H // 2 + 24), f"dt-site-creator · {mech_id}", fill="#8b949e", font=sub_font)

    out = ROOT / "mechanics" / mech_id / "preview.jpg"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "JPEG", quality=85)
    print(f"  {out.relative_to(ROOT)}")


def main() -> None:
    print("Generating project thumbnails...")
    for archetype, slug, title in PROJECTS:
        make_project_thumb(archetype, slug, title)

    print("\nGenerating OG image...")
    make_og_image()

    print("\nGenerating mechanic previews...")
    for mech_id, name, accent in MECHANICS:
        make_mechanic_preview(mech_id, name, accent)

    print("\nDone.")


if __name__ == "__main__":
    main()
