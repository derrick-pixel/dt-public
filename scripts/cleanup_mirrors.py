#!/usr/bin/env python3
"""
Option B mirror cleanup for dt-public:
1. Update card hrefs in index.html → canonical live URLs
2. Replace each mirror's <slug>/index.html with redirect stub
3. Prune each mirror folder:
   - If card has LOCAL data-intel-url pointing into this slug → KEEP admin/intel folder + auth-gate deps
   - Else → DELETE entire folder
4. Ensure auth-gate.js loads on every remaining admin/intel HTML
"""
import os
import re
import shutil
import sys
from pathlib import Path

REPO = Path('/Users/derrickteo/codings/dt-public')
CANONICAL_AUTH_GATE = REPO / 'admin/assets/js/auth-gate.js'

# ─── Card name → canonical URL (per the audit) ──────────────────────────
HREF_UPDATES = {
    "DT Site Creator":              "https://derrick-pixel.github.io/dt-site-creator/",
    "Elitez ESOP":                  "https://esop.elitez.com.sg/",
    "Elitez LMS Marketing":         "https://derrick-pixel.github.io/elitez-lms-site/",
    "Elitez Site Supervisor":       "https://derrick-pixel.github.io/elitez-site-supervisor/",
    "XinceAI":                      "https://derrick-pixel.github.io/XinceAI/",
    "Discounter":                   "https://derrick-pixel.github.io/discounter/",
    "Elitez Pulse":                 "https://derrick-pixel.github.io/elitez-pulse/",
    "Elitez Security":              "https://derrick-pixel.github.io/elitez-security/",
    "Elitez Vantage":               "https://derrick-pixel.github.io/competitor-intel-template/showcase/",
    "Lemon Man":                    "https://derrick-pixel.github.io/lemon-man/",
    "Vector Sky Defense":           "https://derrick-pixel.github.io/vectorsky/",
    "AEVUM MRI":                    "https://derrick-pixel.github.io/Elitez_MRI/",
    "Elitez AI Booth Assignment":   "https://derrick-pixel.github.io/elitezai-website/",
    "Elitez Events (prototype)":    "https://derrick-pixel.github.io/Elitez-Events/",
    "ELIX Resume":                  "https://derrick-pixel.github.io/ELIX-resume/",
    "ElixCraft":                    "https://derrick-pixel.github.io/ElixCraft/",
    "The Commons":                  "https://derrick-pixel.github.io/the-commons/",
}

# ─── Mirrors to KEEP intel/admin (because the intel popup points at them) ──
# slug → list of subpaths to preserve (relative to slug root)
KEEP_PATHS = {
    "market-tracker-research":  ["template/admin"],
    "elitez-command-center":    ["admin.html"],       # single file, not folder
    "elix-eor":                 ["admin"],
    "passage":                  ["admin"],
    "esop":                     ["intel"],
    "site-supervisor":          ["admin"],
    "xinceai":                  ["admin"],
    "discounter":               ["admin"],
    "pulse":                    ["admin"],
    "elitez-security":          ["admin"],
    "competitor-intel":         ["template/admin"],
    "flashcart-research":       ["template/admin"],
    "aevum":                    ["admin"],
    "events":                   ["admin"],
    "lumana":                   ["admin"],
    "the-commons":              ["admin"],
}

# ─── Mirror folders to FULLY DELETE (no intel popup, no card refs) ─────
FULLY_DELETE = [
    "altru",          # card → altru.asia, no intel popup
    "merchandising",  # card → mr.elitez.ai, no intel popup
    "elitezshelf-frontage",   # card → shelf.elitez.ai
    "dt-site-creator",        # card → derrick-pixel.github.io/dt-site-creator/
    "elitez-lms-site",        # card → github.io
    "lemon-man",              # card → github.io
    "vectorsky",              # card → github.io
    "elitezai",               # card → github.io
    "elix-resume",            # card → github.io
    "elixcraft",              # card → github.io
]

# ─── Slugs to leave entirely alone (not mirrors, system folders) ───────
KEEP_AS_IS = {"admin", "docs", "img", "wip"}


def redirect_stub_html(canonical_url, brand_name):
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Moved to {brand_name}</title>
  <link rel="canonical" href="{canonical_url}" />
  <meta name="robots" content="noindex" />
  <meta http-equiv="refresh" content="0; url={canonical_url}" />
  <script>location.replace("{canonical_url}")</script>
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 480px; margin: 80px auto; padding: 0 24px; color: #1a1a1a; }}
    a {{ color: #0066cc; }}
  </style>
</head>
<body>
  <h1>This page has moved</h1>
  <p>This site is now at <a href="{canonical_url}">{canonical_url}</a>.</p>
  <p>Redirecting…</p>
</body>
</html>
"""


def update_card_hrefs(html):
    """Update href + add target=_blank for cards in HREF_UPDATES; leave data-intel-url alone."""
    changed = 0
    for name, new_url in HREF_UPDATES.items():
        # Match the card: <a ... > <div class="pc-top">...<span class="pc-name">NAME</span>
        # The href is in the opening <a> tag.
        pattern = re.compile(
            r'(<a\s+)(href="[^"]*")([^>]*?)(>\s*<div class="pc-top">[^\n]*?<span class="pc-name">'
            + re.escape(name) + r'</span>)',
            re.DOTALL
        )
        def replacer(m):
            nonlocal changed
            attrs_after_href = m.group(3)
            # Ensure target="_blank" present somewhere in the tag
            if 'target="_blank"' not in (m.group(0)):
                attrs_after_href = ' target="_blank"' + attrs_after_href
            changed += 1
            return f'{m.group(1)}href="{new_url}"{attrs_after_href}{m.group(4)}'
        html = pattern.sub(replacer, html, count=1)
    return html, changed


def prune_mirror(slug, keep_paths, canonical_url, brand_name):
    """Replace slug/index.html with redirect stub; keep only paths listed in keep_paths."""
    folder = REPO / slug
    if not folder.exists():
        return f"  ⏭️  {slug}: folder missing"

    # 1. Build set of paths to keep (relative to folder)
    keep_resolved = set()
    for kp in keep_paths:
        p = folder / kp
        if p.exists():
            # Add the path itself + all parent dirs
            keep_resolved.add(p)
            if p.is_dir():
                for sub in p.rglob('*'):
                    keep_resolved.add(sub)
    # Also keep index.html (will be overwritten with stub below)
    keep_resolved.add(folder / 'index.html')

    # 2. Walk + delete anything not in keep_resolved
    removed_files = 0
    removed_dirs = 0
    for root, dirs, files in os.walk(folder, topdown=False):
        root_p = Path(root)
        if root_p == folder:
            # Top level: handle files separately
            for f in files:
                fp = root_p / f
                if fp not in keep_resolved and fp.name != 'index.html':
                    fp.unlink(missing_ok=True)
                    removed_files += 1
            # Delete top-level dirs not in keep_resolved
            for d in dirs:
                dp = root_p / d
                if dp not in keep_resolved:
                    shutil.rmtree(dp, ignore_errors=True)
                    removed_dirs += 1
            continue
        # Sub-levels: skip if inside a kept path
        is_inside_kept = any(str(root_p).startswith(str(kp)) for kp in keep_resolved if kp.is_dir())
        if is_inside_kept:
            continue
        for f in files:
            fp = root_p / f
            if fp not in keep_resolved:
                fp.unlink(missing_ok=True)
                removed_files += 1

    # 3. Write the redirect stub
    (folder / 'index.html').write_text(redirect_stub_html(canonical_url, brand_name))

    return f"  ✂️  {slug}: pruned ({removed_files} files, {removed_dirs} dirs), stub written"


def fully_delete(slug):
    folder = REPO / slug
    if not folder.exists():
        return f"  ⏭️  {slug}: already gone"
    n_files = sum(1 for _ in folder.rglob('*') if _.is_file())
    shutil.rmtree(folder)
    return f"  🗑️  {slug}: fully deleted ({n_files} files)"


def ensure_auth_gate(html_path):
    """If admin/intel HTML doesn't reference auth-gate.js, inject the script tag + ensure JS file exists."""
    content = html_path.read_text()
    if 'auth-gate' in content:
        return None  # already gated

    # Inject before </body>
    supabase_cdn = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>'
    auth_gate_tag = '<script src="' + relative_path_to_auth_gate(html_path) + '"></script>'

    inject = f'\n  {supabase_cdn}\n  {auth_gate_tag}\n'
    new_content = content.replace('</body>', inject + '</body>', 1)
    if new_content == content:
        # No </body> tag — append at end
        new_content = content + inject
    html_path.write_text(new_content)

    # Ensure auth-gate.js exists at the resolved path
    js_target = (html_path.parent / relative_path_to_auth_gate(html_path)).resolve()
    js_target.parent.mkdir(parents=True, exist_ok=True)
    if not js_target.exists():
        shutil.copy(CANONICAL_AUTH_GATE, js_target)
    return f"  🔒  {html_path.relative_to(REPO)}: gated"


def relative_path_to_auth_gate(html_path):
    """Compute the relative path from html_path to its sibling assets/js/auth-gate.js."""
    return 'assets/js/auth-gate.js'


def update_outdated_auth_gates():
    """Replace the older (sha 69bfd7ba) auth-gate.js copies with the canonical one."""
    canonical = CANONICAL_AUTH_GATE.read_bytes()
    updated = []
    for path in REPO.rglob('auth-gate.js'):
        if '.git' in path.parts:
            continue
        if path.read_bytes() != canonical:
            path.write_bytes(canonical)
            updated.append(path.relative_to(REPO))
    return updated


def main():
    # ── 1. Update card hrefs in index.html ──
    index_path = REPO / 'index.html'
    html = index_path.read_text()
    html, changed = update_card_hrefs(html)
    index_path.write_text(html)
    print(f"  ✏️  index.html: updated {changed} card hrefs")

    # ── 2. Prune each KEEP_PATHS mirror ──
    print("\n=== prune & stub mirrors with kept intel/admin ===")
    for slug, paths in KEEP_PATHS.items():
        canonical = "https://command.elitez.ai/" if slug == "elitez-command-center" else (
                    "https://eor.elitez.ai/" if slug == "elix-eor" else (
                    "https://mr.elitez.ai/" if slug == "merchandising" else (
                    "https://esop.elitez.com.sg/" if slug == "esop" else
                    f"https://derrick-pixel.github.io/{slug}/"
                    )))
        # Special-case canonicals
        canonical_map = {
            "market-tracker-research": "https://elitez-market.streamlit.app/",
            "competitor-intel": "https://derrick-pixel.github.io/competitor-intel-template/showcase/",
            "flashcart-research": "https://flashcart-elitez.vercel.app/",
            "site-supervisor": "https://derrick-pixel.github.io/elitez-site-supervisor/",
            "events": "https://derrick-pixel.github.io/Elitez-Events/",
            "aevum": "https://derrick-pixel.github.io/Elitez_MRI/",
            "lumana": "https://lumanasolutions.com/",
            "the-commons": "https://derrick-pixel.github.io/the-commons/",
            "passage": "https://passage.sg/",
            "pulse": "https://derrick-pixel.github.io/elitez-pulse/",
            "discounter": "https://derrick-pixel.github.io/discounter/",
            "xinceai": "https://derrick-pixel.github.io/XinceAI/",
            "elitez-security": "https://derrick-pixel.github.io/elitez-security/",
        }
        canonical = canonical_map.get(slug, canonical)
        brand = slug.replace('-', ' ').title()
        print(prune_mirror(slug, paths, canonical, brand))

    # ── 3. Fully delete other mirrors ──
    print("\n=== fully delete mirrors with no intel popup ===")
    for slug in FULLY_DELETE:
        if slug in KEEP_PATHS or slug in KEEP_AS_IS:
            print(f"  ⚠️  skipping {slug} (also in KEEP list)")
            continue
        print(fully_delete(slug))

    # ── 4. Update outdated auth-gate copies ──
    print("\n=== update outdated auth-gate.js copies to canonical ===")
    updated = update_outdated_auth_gates()
    for p in updated:
        print(f"  🔄 {p}")

    # ── 5. Ensure auth-gate on every remaining admin/intel HTML ──
    print("\n=== inject auth-gate on ungated admin/intel pages ===")
    gated_count = 0
    for root, dirs, files in os.walk(REPO):
        root_p = Path(root)
        if '.git' in root_p.parts:
            continue
        # Only admin/ or intel/ paths
        if 'admin' not in root_p.parts and 'intel' not in root_p.parts:
            continue
        for f in files:
            if not f.endswith('.html'):
                continue
            fp = root_p / f
            res = ensure_auth_gate(fp)
            if res:
                print(res)
                gated_count += 1
    print(f"\n  Total newly gated: {gated_count}")


if __name__ == '__main__':
    main()
