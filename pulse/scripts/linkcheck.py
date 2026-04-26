#!/usr/bin/env python3
"""Crawl the local site, verify all internal <a href> and <link href> resolve.

Exit 1 on any broken internal link; exit 0 with a summary otherwise.
External links (http/https/mailto:/#) are skipped.
"""
import sys
import re
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).parent.parent
HTML_FILES = sorted(
    list(ROOT.glob("*.html")) +
    list((ROOT / "admin").glob("*.html"))
)
# Match href="..." and href='...'
HREF_RE = re.compile(r"""href=["']([^"']+)["']""")

errors = []
for html in HTML_FILES:
    text = html.read_text(encoding="utf-8")
    for m in HREF_RE.finditer(text):
        href = m.group(1)
        parsed = urlparse(href)
        if parsed.scheme or parsed.netloc:
            continue
        if href.startswith("#") or href.startswith("mailto:") or href.startswith("tel:"):
            continue

        target_path = href.split("?")[0].split("#")[0]
        if not target_path:
            continue
        target = (html.parent / target_path).resolve()
        if target.is_dir():
            target = target / "index.html"
        if not target.exists():
            errors.append(
                f"{html.relative_to(ROOT)} → {href} (resolved: {target.relative_to(ROOT) if str(target).startswith(str(ROOT)) else target})"
            )

if errors:
    print("Broken internal links:")
    for e in errors:
        print("  " + e)
    sys.exit(1)

print(f"OK — {len(HTML_FILES)} HTML files checked, no broken internal links")
