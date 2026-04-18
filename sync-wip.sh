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
  "Passage:passage"
  "elitez-security:elitez-security"
  "elitezaviation:elitezaviation"
  "elix-eor:elix-eor"
  "ElixCraft:elixcraft"
  "the-commons:the-commons"
  "vectorsky:vectorsky"
  "XinceAI:xinceai"
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
done

echo ""
echo "✓ Sync complete."
echo "  Next: git add -A && git commit -m 'weekly WIP sync' && git push"
