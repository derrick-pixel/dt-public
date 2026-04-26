#!/usr/bin/env python3
"""Generate 1200x630 OG image for Elitez Pulse."""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

OUT = Path(__file__).parent.parent / "assets" / "og-1200x630.png"
FONT_DIR = Path(__file__).parent.parent / "assets" / "fonts"

CREAM = (254, 243, 231)
CORAL = (255, 91, 57)
INK = (26, 26, 26)
MUSTARD = (255, 215, 0)

W, H = 1200, 630
img = Image.new("RGB", (W, H), CREAM)
d = ImageDraw.Draw(img)


def load_font(name: str, size: int):
    try:
        return ImageFont.truetype(str(FONT_DIR / name), size)
    except Exception:
        return ImageFont.load_default()


f_big = load_font("Inter-Black.woff2", 108)
f_mid = load_font("Inter-SemiBold.woff2", 34)
f_small = load_font("Inter-Regular.woff2", 24)
f_pill = load_font("Inter-Black.woff2", 22)

# Coral blob — top right
blob = Image.new("RGBA", (W, H), (0, 0, 0, 0))
bd = ImageDraw.Draw(blob)
bd.ellipse((W - 460, -180, W + 120, 400), fill=(*CORAL, 120))
img.paste(blob, (0, 0), blob)

# Logo pill
pill_x, pill_y = 80, 70
pill_w, pill_h = 210, 56
d.rounded_rectangle(
    (pill_x, pill_y, pill_x + pill_w, pill_y + pill_h),
    radius=28,
    fill=CORAL,
)
d.text((pill_x + 32, pill_y + 14), "PULSE ★", fill="white", font=f_pill)

# Headline
d.text((80, 190), "Lead gen but", fill=INK, font=f_big)
d.rectangle((80, 320, 650, 420), fill=MUSTARD)
d.text((80, 315), "actually fun.", fill=INK, font=f_big)

# Sub-lines
d.text((80, 470), "Bundled marketing retainers for SMEs.", fill=INK, font=f_mid)
d.text((80, 525), "From SGD 799 / month · Singapore + Malaysia", fill=INK, font=f_small)
d.text((80, 575), "elitez-pulse · part of Elitez Group", fill=INK, font=f_small)

img.save(OUT, "PNG", optimize=True)
print(f"Wrote {OUT}")
