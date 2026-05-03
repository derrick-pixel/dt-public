#!/bin/bash
# Weekly sync of WIP project sites into dt-public for public mirroring.
#
# Usage:
#   ./sync-wip.sh
#
# After running:
#   git status                                  # review changes
#   git add -A && git commit -m "weekly WIP sync" && git push

set -e
cd "$(dirname "$0")"

# Format: <github-repo-name>:<local-folder-name>
WIP_REPOS=(
  "Elitez_MRI:aevum"
  "discounter:discounter"
  "Passage:passage"
  "elitez-security:elitez-security"
  "elitezai-website:elitezai"
  "elix-eor:elix-eor"
  "ElixCraft:elixcraft"
  "the-commons:the-commons"
  "vectorsky:vectorsky"
  "XinceAI:xinceai"
  "altru:altru"
  "elitez-pulse:pulse"
  "competitor-intel-self:competitor-intel"
  "Elitez-ESOP:esop"
  "dt-site-creator:dt-site-creator"
)

for entry in "${WIP_REPOS[@]}"; do
  repo="${entry%%:*}"
  folder="${entry##*:}"
  echo "→ derrick-pixel/$repo  →  ./$folder"
  rm -rf ".tmp-sync"
  # Clone without populating working tree (-n) to avoid macOS Finder
  # racing to create .DS_Store before git's own checkout runs.
  git clone --quiet --depth=1 -n "https://github.com/derrick-pixel/$repo.git" ".tmp-sync"
  # Now populate the working tree with -f to ignore any .DS_Store Finder
  # may have created in the empty clone directory.
  git -C ".tmp-sync" checkout -f HEAD -- . 2>/dev/null || git -C ".tmp-sync" checkout -f HEAD
  rm -rf ".tmp-sync/.git" ".tmp-sync/.github"
  find ".tmp-sync" -name '.DS_Store' -delete
  rm -rf "./$folder"
  mv ".tmp-sync" "./$folder"

  # SEO: mark every HTML page in the mirror as noindex,nofollow
  # so Google doesn't treat these snapshots as duplicate content of the live sites.
  while IFS= read -r f; do
    if ! grep -q 'name="robots"' "$f"; then
      perl -i -CSD -0777 -pe 's|</head>|  <meta name="robots" content="noindex, nofollow">\n</head>|' "$f"
    fi
  done < <(find "./$folder" -name "*.html" -type f)

  # Security hardening: add SRI hashes to CDN script tags so a jsdelivr
  # compromise cannot silently inject code. Each transform pins the script
  # URL to an exact version and adds integrity + crossorigin attributes.
  # Regenerate hashes with:  curl -sL <URL> | openssl dgst -sha384 -binary | openssl base64 -A
  while IFS= read -r f; do
    perl -i -pe 's|<script src="https://cdn\.jsdelivr\.net/npm/chart\.js\@4\.4\.0/dist/chart\.umd\.min\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/chart.js\@4.4.0/dist/chart.umd.min.js" integrity="sha384-e6nUZLBkQ86NJ6TVVKAeSaK8jWa3NhkYWZFomE39AvDbQWeie9PlQqM3pmYW5d1g" crossorigin="anonymous"></script>|g;
              s|<script src="https://cdn\.jsdelivr\.net/npm/chart\.js\@4\.4\.7/dist/chart\.umd\.min\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/chart.js\@4.4.7/dist/chart.umd.min.js" integrity="sha384-vsrfeLOOY6KuIYKDlmVH5UiBmgIdB1oEf7p01YgWHuqmOHfZr374+odEv96n9tNC" crossorigin="anonymous"></script>|g;
              s|<script src="https://cdn\.jsdelivr\.net/npm/chart\.js\@4"></script>|<script src="https://cdn.jsdelivr.net/npm/chart.js\@4.4.7/dist/chart.umd.min.js" integrity="sha384-vsrfeLOOY6KuIYKDlmVH5UiBmgIdB1oEf7p01YgWHuqmOHfZr374+odEv96n9tNC" crossorigin="anonymous"></script>|g;
              s|<script src="https://cdn\.jsdelivr\.net/npm/marked\@12/marked\.min\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/marked\@12.0.2/marked.min.js" integrity="sha384-/TQbtLCAerC3jgaim+N78RZSDYV7ryeoBCVqTuzRrFec2akfBkHS7ACQ3PQhvMVi" crossorigin="anonymous"></script>|g;
              s|<script src="https://cdn\.jsdelivr\.net/npm/dompurify\@3/dist/purify\.min\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/dompurify\@3.1.7/dist/purify.min.js" integrity="sha384-XQqX/4yiUGu+oyr87jvWzRuqBUK/adrY0DunhL+tID9m/9dwSpV8h9Fk/Sg6ifVQ" crossorigin="anonymous"></script>|g;
              s|<script src="https://cdn\.jsdelivr\.net/npm/qrcode\@1\.5\.1/build/qrcode\.min\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/qrcode\@1.5.1/build/qrcode.min.js" integrity="sha384-HGmnkDZJy7mRkoARekrrj0VjEFSh9a0Z8qxGri/kTTAJkgR8hqD1lHsYSh3JdzRi" crossorigin="anonymous"></script>|g;
              s|<script src="https://cdn\.jsdelivr\.net/npm/qrcode\@1\.5\.3/build/qrcode\.min\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/qrcode\@1.5.3/build/qrcode.min.js" integrity="sha384-Izc791esqyEy3BEIC42q7jbE0AaOkACziN+dyyXgYeDmpeMCLz0xA+xYN3aCd5zz" crossorigin="anonymous"></script>|g;
              s|<script src="https://cdn\.jsdelivr\.net/npm/jspdf\@2\.5\.1/dist/jspdf\.umd\.min\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/jspdf\@2.5.1/dist/jspdf.umd.min.js" integrity="sha384-JcnsjUPPylna1s1fvi1u12X5qjY5OL56iySh75FdtrwhO/SWXgMjoVqcKyIIWOLk" crossorigin="anonymous"></script>|g;
              s|<script src="https://cdn\.jsdelivr\.net/npm/html2canvas\@1\.4\.1/dist/html2canvas\.min\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/html2canvas\@1.4.1/dist/html2canvas.min.js" integrity="sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H" crossorigin="anonymous"></script>|g' "$f"
  done < <(find "./$folder" -name "*.html" -type f)

done

# NOTE on Passage admin: the upstream Passage repo ships admin.html with a
# SHA-256 gate followed by "// Auth removed" code that bypasses it. Fix
# upstream (derrick-pixel/Passage) — don't rely on this sync script to patch it.

echo ""
echo "✓ Source sync complete."
echo ""
echo "  Next: git add -A && git commit -m 'weekly WIP sync' && git push"
echo ""
echo "  Deploy is automatic — Cloudflare's GitHub integration on the"
echo "  dt-public Worker auto-builds + deploys on every push to main."
echo "  derrickteo.com updates within ~30s of push completing."
