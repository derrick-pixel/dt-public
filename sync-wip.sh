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
  "dt-site-creator:dt-site-creator"
)

for entry in "${WIP_REPOS[@]}"; do
  repo="${entry%%:*}"
  folder="${entry##*:}"
  echo "→ derrick-pixel/$repo  →  ./$folder"
  rm -rf ".tmp-sync"
  git clone --quiet --depth=1 "https://github.com/derrick-pixel/$repo.git" ".tmp-sync"
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

# ────────────────────────────────────────────────────────────────────
# Worker auto-deploy (Option A)
# After mirror is updated, also push the same content to the
# cloudflare/workers-autoconfig branch and redeploy via wrangler.
# Otherwise the Cloudflare Worker (which serves derrickteo.com) keeps
# serving its last bundled snapshot.
# Set TC_SKIP_WORKER=1 to skip this step.
# Requires: $CLOUDFLARE_API_TOKEN env var (Workers Scripts: Edit + Cache Purge).
# ────────────────────────────────────────────────────────────────────
if [ "${TC_SKIP_WORKER}" = "1" ]; then
  echo "↷ Skipping Worker deploy (TC_SKIP_WORKER=1 set)."
else
  if [ -z "${CLOUDFLARE_API_TOKEN}" ]; then
    echo "⚠ CLOUDFLARE_API_TOKEN not set — skipping Worker deploy."
    echo "  To deploy: export CLOUDFLARE_API_TOKEN=<token> and re-run."
  else
    echo "→ Syncing cloudflare/workers-autoconfig branch + deploying dt-public Worker"
    WORKER_TMP="$(mktemp -d -t dt-public-worker-XXXX)"
    git clone --quiet "$(git config --get remote.origin.url)" "$WORKER_TMP"
    (
      cd "$WORKER_TMP" || exit 1
      git checkout cloudflare/workers-autoconfig 2>&1 | tail -1
      # Save wrangler config + .assetsignore (these only live in the worker branch)
      cp wrangler.jsonc /tmp/.wrangler_save.jsonc 2>/dev/null || true
      cp .assetsignore /tmp/.assetsignore_save 2>/dev/null || true
      # Replace tree with main
      git rm -rf -q . > /dev/null 2>&1
      git checkout main -- .
      # Restore worker-only config files
      [ -f /tmp/.wrangler_save.jsonc ] && cp /tmp/.wrangler_save.jsonc wrangler.jsonc
      [ -f /tmp/.assetsignore_save ] && cp /tmp/.assetsignore_save .assetsignore
      # Ensure .assetsignore exists (excludes .git etc. from the asset bundle)
      if [ ! -f .assetsignore ]; then
        cat > .assetsignore <<'EOF'
.git/
.gitignore
.assetsignore
node_modules/
sync-wip.sh
wip/
README.md
.tmp-sync/
EOF
      fi
      git add -A
      if git diff --cached --quiet; then
        echo "  No changes to autoconfig branch."
      else
        git commit -q -m "Sync autoconfig branch with main (auto via sync-wip.sh)" || true
        git push -q origin cloudflare/workers-autoconfig 2>&1 | tail -1
      fi
      echo "  Deploying via wrangler…"
      npx --yes wrangler@4 deploy 2>&1 | tail -8
    )
    rm -rf "$WORKER_TMP"
  fi
fi

echo ""
echo "✓ Sync complete."
echo "  Next (mirror commit): git add -A && git commit -m 'weekly WIP sync' && git push"
