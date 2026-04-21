#!/usr/bin/env python3
"""Verify every live_url / repo_url in examples.json is still reachable.

Used by:
  - GitHub Actions workflow `.github/workflows/linkcheck.yml`
  - Local pre-push hook / ad-hoc check: `python3 scripts/linkcheck.py`

Exits 0 on success, 1 if any URL returned 4xx/5xx or failed to connect.
"""
import json
import sys
import urllib.request
import urllib.error
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
EXAMPLES_PATH = ROOT / "dashboard" / "data" / "examples.json"
HEADERS = {"User-Agent": "dt-site-creator-linkcheck/1.0"}
TIMEOUT_S = 15


def check_url(url: str):
    """Return (ok, status) where ok is a bool and status is an int or str.

    Acceptable: 2xx (success), 3xx (redirect — URL resolves), 429 (rate-limited).
    Reject: 4xx (not found/forbidden) and 5xx (server error).
    Streamlit apps in particular can return 303 on their wake-up flow — that
    still means the URL is live.
    """
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
            status = resp.getcode()
            return (status < 400, status)
    except urllib.error.HTTPError as e:
        # 3xx returned here = urllib couldn't auto-follow. URL still reachable.
        if 300 <= e.code < 400 or e.code == 429:
            return (True, e.code)
        return (False, e.code)
    except Exception as e:
        return (False, str(e))


def main() -> int:
    with EXAMPLES_PATH.open() as f:
        data = json.load(f)

    failures = []
    checked = 0

    for ex in data.get("examples", []):
        if not ex.get("id"):
            continue  # skip _schema helper / comment blocks
        for field in ("live_url", "preview_url", "repo_url"):
            url = (ex.get(field) or "").strip()
            if not url:
                continue
            checked += 1
            ok, status = check_url(url)
            marker = "✓" if ok else "✗"
            print(f"  {marker} [{status}] {ex['id']:20s} {field}: {url}")
            if not ok:
                failures.append((ex["id"], field, url, status))

    print(f"\nChecked {checked} URL(s). Failures: {len(failures)}")

    if failures:
        print("\nBroken links:")
        for id_, field, url, status in failures:
            print(f"  - {id_}.{field} → {url} (status: {status})")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
