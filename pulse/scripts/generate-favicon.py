#!/usr/bin/env python3
"""Generate favicon set for Elitez Pulse. Requires Pillow."""
from PIL import Image, ImageDraw
from pathlib import Path

OUT = Path(__file__).parent.parent / "assets" / "favicon"
OUT.mkdir(parents=True, exist_ok=True)

CREAM = (254, 243, 231, 255)
CORAL = (255, 91, 57, 255)
INK = (26, 26, 26, 255)


def draw_mark(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), CREAM)
    d = ImageDraw.Draw(img)
    pad = max(1, size // 10)
    d.rounded_rectangle(
        (pad, pad, size - pad, size - pad),
        radius=max(2, size // 6),
        fill=INK,
    )
    w = size - 2 * pad
    cx0 = pad + w * 0.18
    cy = size / 2
    pts = [
        (pad + w * 0.08, cy),
        (cx0, cy),
        (cx0 + w * 0.08, cy - w * 0.22),
        (cx0 + w * 0.14, cy + w * 0.28),
        (cx0 + w * 0.20, cy - w * 0.32),
        (cx0 + w * 0.26, cy + w * 0.30),
        (cx0 + w * 0.32, cy),
        (pad + w * 0.92, cy),
    ]
    stroke = max(2, size // 28)
    d.line(pts, fill=CORAL, width=stroke, joint="curve")
    return img


SIZES = [
    ("favicon-16x16.png", 16),
    ("favicon-32x32.png", 32),
    ("favicon-48x48.png", 48),
    ("favicon-64x64.png", 64),
    ("favicon-128x128.png", 128),
    ("favicon-180x180.png", 180),
    ("favicon-192x192.png", 192),
    ("favicon-256x256.png", 256),
    ("favicon-512x512.png", 512),
]
for name, sz in SIZES:
    draw_mark(sz).save(OUT / name, "PNG")

imgs = [draw_mark(s) for s in (16, 32, 48)]
imgs[0].save(
    OUT / "favicon.ico",
    format="ICO",
    sizes=[(16, 16), (32, 32), (48, 48)],
)

print(f"Wrote {len(SIZES) + 1} files to {OUT}")
