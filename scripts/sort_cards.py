#!/usr/bin/env python3
"""
Reorganize portfolio cards in dt-public/index.html and dtws_works/index.html.

Operations:
1. Move named cards between sections (e.g. → Live, → Archived Products)
2. Rename card by display name
3. Update card hrefs (per-file)
4. Sort every section alphabetically by card name (case-insensitive)

v2 (2026-05-30): fix wrapper-strip bug
  Earlier rfind('<div class="main-header') accidentally matched the inner
  '<div class="main-header-left">' element, chopping the outer
  '<div class="main-header main-header-next">' wrapper for sections after Live.
  Now we use a regex that matches ONLY the outer wrapper (no -left).
"""
import re
import sys
from pathlib import Path

# ─── Cards to MOVE to specific sections (latest run targets) ────────────
MOVE_TO_LIVE = {
    "Elitez Command Center",
    "Elitez EOR",
    "Elitez Merchandising",
    "ElitezShelf",
    "Passage",
    "WSG CORENET X",
}
MOVE_TO_ARCHIVED = {
    "Elitez Tender",
    "Elitez Events",          # match BEFORE rename
    "Elitez Events (prototype)",  # also match AFTER rename (idempotent re-runs)
}

# ─── Rename cards by display name ────────────────────────────────────────
RENAMES = {
    "Elitez Events": "Elitez Events (prototype)",
}

# ─── Per-card href updates ──────────────────────────────────────────────
URL_UPDATES = {
    "Passage": "https://passage.sg/",
}
DTWS_URL_UPDATES = {
    "Elitez Command Center": "https://command.elitez.ai/",
    "Elitez EOR": "https://eor.elitez.ai/",
    "Elitez Merchandising": "https://mr.elitez.ai/",
    "ElitezShelf": "https://shelf.elitez.ai/",
    "Passage": "https://passage.sg/",
}

# ─── Regex for ONLY the outer main-header wrapper (not main-header-left) ─
OUTER_HEADER_RE = re.compile(r'<div class="main-header(?: main-header-next)?">')


def normalize_card_text(card):
    """Normalize a card's leading whitespace to 6 spaces (matching siblings)."""
    lines = card.split('\n')
    out = []
    for i, line in enumerate(lines):
        stripped = line.lstrip()
        if not stripped:
            out.append('')
            continue
        if i == 0:
            out.append('      ' + stripped)
        elif stripped.startswith('</a>'):
            out.append('      ' + stripped)
        else:
            out.append('        ' + stripped)
    return '\n'.join(out)


def extract_name(card):
    m = re.search(r'<span class="pc-name">([^<]+)</span>', card)
    return m.group(1).strip() if m else "?"


def rename_card(card, new_name):
    """Update the pc-name span and the page <title> remains untouched."""
    return re.sub(
        r'(<span class="pc-name">)[^<]+(</span>)',
        rf'\1{new_name}\2',
        card,
        count=1,
    )


def update_href(card, new_url, ensure_target_blank=True):
    """Replace the href in the opening <a> tag and ensure target=_blank."""
    lines = card.split('\n')
    for i, line in enumerate(lines):
        if 'class="project-card"' in line and '<a ' in line:
            line = re.sub(r'href="[^"]*"', f'href="{new_url}"', line)
            if ensure_target_blank and 'target="_blank"' not in line:
                line = re.sub(
                    r'(href="[^"]*")',
                    r'\1 target="_blank"',
                    line, count=1
                )
            lines[i] = line
            break
    return '\n'.join(lines)


def parse_sections(html, title_header_re):
    matches = list(title_header_re.finditer(html))
    if not matches:
        return html, [], ''

    sections = []
    for i, m in enumerate(matches):
        title = m.group(1)
        search_start = matches[i-1].end() if i > 0 else 0

        # Find ONLY the outer wrapper, NOT main-header-left
        outer_matches = list(OUTER_HEADER_RE.finditer(html, search_start, m.start()))
        if not outer_matches:
            print(f"  ⚠️  Could not find outer main-header for '{title}'")
            continue
        header_start = outer_matches[-1].start()

        grid_start = html.find('<div class="project-grid">', m.end())
        if grid_start < 0:
            continue

        # End of grid: find next outer main-header OR main-footer
        if i + 1 < len(matches):
            next_outer = list(OUTER_HEADER_RE.finditer(html, m.end(), matches[i+1].start()))
            if next_outer:
                next_section = next_outer[-1].start()
            else:
                next_section = matches[i+1].start()
        else:
            footer_pos = html.find('<div class="main-footer">', m.end())
            next_section = footer_pos if footer_pos >= 0 else len(html)

        grid_end_marker = html.rfind('</div>', grid_start, next_section)
        if grid_end_marker < 0:
            continue

        grid_content = html[grid_start + len('<div class="project-grid">'):grid_end_marker]
        cards = re.findall(
            r'(<a[^>]*class="[^"]*project-card[^"]*"[^>]*>.*?</a>)',
            grid_content,
            re.DOTALL,
        )
        header_block = html[header_start:grid_start + len('<div class="project-grid">')]
        section_end = grid_end_marker + len('</div>')
        sections.append({
            'title': title,
            'header_block': header_block,
            'cards': cards,
            'section_start': header_start,
            'section_end': section_end,
        })

    if not sections:
        return html, [], ''

    preamble = html[:sections[0]['section_start']]
    postamble = html[sections[-1]['section_end']:]
    return preamble, sections, postamble


def transform(html, title_header_pattern, url_updates):
    title_re = re.compile(title_header_pattern)
    preamble, sections, postamble = parse_sections(html, title_re)
    if not sections:
        print("  ❌ Could not parse sections")
        return html

    print(f"  parsed {len(sections)} sections:")
    for s in sections:
        print(f"    {s['title']}: {len(s['cards'])} cards")

    all_cards = []
    for s in sections:
        for c in s['cards']:
            all_cards.append((s['title'], c))

    # 1. URL updates
    updated = []
    for sec_title, card in all_cards:
        name = extract_name(card)
        if name in url_updates:
            card = update_href(card, url_updates[name], ensure_target_blank=True)
            print(f"    🔗 href: {name} → {url_updates[name]}")
        updated.append((sec_title, card))
    all_cards = updated

    # 2. Renames (must happen BEFORE moves so MOVE_TO_X matches the new name if needed)
    renamed = []
    for sec_title, card in all_cards:
        name = extract_name(card)
        if name in RENAMES:
            new_name = RENAMES[name]
            card = rename_card(card, new_name)
            print(f"    ✏️  rename: '{name}' → '{new_name}'")
        renamed.append((sec_title, card))
    all_cards = renamed

    # 3. Moves
    moved = []
    for sec_title, card in all_cards:
        name = extract_name(card)
        if name in MOVE_TO_LIVE and sec_title != "Live":
            print(f"    ➡️  move '{name}' from '{sec_title}' to Live")
            moved.append(("Live", card))
        elif name in MOVE_TO_ARCHIVED and sec_title != "Archived Products":
            print(f"    📦 move '{name}' from '{sec_title}' to Archived Products")
            moved.append(("Archived Products", card))
        else:
            moved.append((sec_title, card))
    all_cards = moved

    # 4. Group + sort each section alphabetically
    section_cards = {s['title']: [] for s in sections}
    for sec_title, card in all_cards:
        if sec_title in section_cards:
            section_cards[sec_title].append(card)
    for sec_title in section_cards:
        section_cards[sec_title].sort(key=lambda c: extract_name(c).lower())

    out = [preamble]
    for s in sections:
        out.append(s['header_block'])
        out.append('\n\n')
        for card in section_cards[s['title']]:
            out.append(normalize_card_text(card))
            out.append('\n\n')
        if out[-1] == '\n\n':
            out[-1] = '\n'
        out.append('    </div>\n\n')
    out.append(postamble)
    return ''.join(out)


def main():
    if len(sys.argv) < 3:
        print("Usage: sort_cards.py <input.html> <variant: dt-public|dtws_works>")
        sys.exit(1)
    path = Path(sys.argv[1])
    variant = sys.argv[2]
    print(f"Processing: {path} (variant={variant})")
    html = path.read_text()

    if variant == 'dt-public':
        title_header_pattern = r'<h2 class="main-title">([^<]*)</h2>'
        url_updates = URL_UPDATES
    elif variant == 'dtws_works':
        title_header_pattern = r'<span class="main-title">([^<]*)</span>'
        url_updates = DTWS_URL_UPDATES
    else:
        print(f"Unknown variant: {variant}")
        sys.exit(1)

    new_html = transform(html, title_header_pattern, url_updates)
    out_path = Path(str(path) + '.new')
    out_path.write_text(new_html)
    print(f"  ✓ wrote {out_path}")
    print(f"    diff size: {len(new_html) - len(html):+d} chars")


if __name__ == '__main__':
    main()
