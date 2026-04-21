#!/usr/bin/env python3
"""Generate dt-site-creator's own favicon set.

Applies the recipe we document in mechanics/favicon/README.md — monogram,
solid-accent color, complete format coverage. Outputs:

  favicon.ico          multi-resolution (16/32/48)
  favicon-16.png       browser tab
  favicon-32.png       retina tab
  apple-touch-icon.png 180×180 iOS home screen
  android-chrome-192.png   192×192 Android
  android-chrome-512.png   512×512 Android splash

favicon.svg and safari-pinned-tab.svg are hand-authored (see the files themselves).
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent

# Palette — matches the site's accent system
BG = (13, 17, 23)         # #0d1117 deep slate (site --bg)
FG = (255, 166, 87)       # #ffa657 warm amber (site --accent)


def get_bold_font(size: int) -> ImageFont.FreeTypeFont:
    """Load the heaviest geometric sans we can find on macOS."""
    candidates = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/Library/Fonts/Arial.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except Exception:
                continue
    return ImageFont.load_default()


def make_favicon_png(size: int, rounded: bool = False) -> Image.Image:
    """Render 'DT' monogram centered on amber circle over slate background."""
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)

    # At iOS sizes, iOS auto-rounds corners — skip doing it ourselves.
    # But we can add a subtle accent circle behind the letters on larger sizes.
    if size >= 128:
        # Amber circle backdrop covering ~75% of the canvas
        margin = size // 10
        draw.ellipse([(margin, margin), (size - margin, size - margin)], fill=FG)
        text_color = BG
    elif size >= 48:
        # Medium: solid amber square with slate text
        text_color = BG
        draw.rectangle([(0, 0), (size, size)], fill=FG)
    else:
        # Small (16/32): amber letters on slate — text dominates
        text_color = FG

    # Center the DT monogram
    font_size = int(size * (0.58 if size >= 48 else 0.72))
    font = get_bold_font(font_size)

    # Bias slightly upward — visual optical center
    text = "DT"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1] - (size // 40)  # tiny nudge up

    draw.text((x, y), text, fill=text_color, font=font)
    return img


def main() -> None:
    outputs = {
        "favicon-16.png": 16,
        "favicon-32.png": 32,
        "apple-touch-icon.png": 180,
        "android-chrome-192.png": 192,
        "android-chrome-512.png": 512,
    }

    for filename, size in outputs.items():
        img = make_favicon_png(size)
        img.save(ROOT / filename, "PNG", optimize=True)
        print(f"  {filename} ({size}x{size})")

    # favicon.ico — multi-resolution (16, 32, 48)
    sizes_ico = [16, 32, 48]
    base = make_favicon_png(48)
    base.save(
        ROOT / "favicon.ico",
        format="ICO",
        sizes=[(s, s) for s in sizes_ico],
    )
    print(f"  favicon.ico ({'/'.join(str(s) for s in sizes_ico)})")


if __name__ == "__main__":
    main()
