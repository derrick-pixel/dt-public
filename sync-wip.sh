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
  "dt-site-creator:dt-site-creator"
)

for entry in "${WIP_REPOS[@]}"; do
  repo="${entry%%:*}"
  folder="${entry##*:}"
  echo "→ derrick-pixel/$repo  →  ./$folder"
  rm -rf ".tmp-sync"
  git clone --quiet --depth=1 "https://github.com/derrick-pixel/$repo.git" ".tmp-sync"
  rm -rf ".tmp-sync/.git" ".tmp-sync/.github"
  rm -rf "./$folder"
  mv ".tmp-sync" "./$folder"

  # SEO: mark every HTML page in the mirror as noindex,nofollow
  # so Google doesn't treat these snapshots as duplicate content of the live sites.
  while IFS= read -r f; do
    if ! grep -q 'name="robots"' "$f"; then
      perl -i -CSD -0777 -pe 's|</head>|  <meta name="robots" content="noindex, nofollow">\n</head>|' "$f"
    fi
  done < <(find "./$folder" -name "*.html" -type f)
done

echo ""
echo "✓ Sync complete."
echo "  Next: git add -A && git commit -m 'weekly WIP sync' && git push"
