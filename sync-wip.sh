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
  "competitor-intel-template:competitor-intel"
  "Elitez-ESOP:esop"
  "dt-site-creator:dt-site-creator"
  "elitezshelf-frontage:elitezshelf-frontage"
  "elitez-site-supervisor:site-supervisor"
  "Elitez-Events:events"
  "ELIX-resume:elix-resume"
  "Lumana:lumana"
  "market-tracker-research:market-tracker-research"
  "flashcart-research:flashcart-research"
  "elitez-command-center:elitez-command-center"
  "elitez-lms-site:elitez-lms-site"
  "lemon-man:lemon-man"
  "merchandising:merchandising"
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

  # ── Build Next.js apps with output:"export" ───────────────────
  # Pure Next.js repos (no hand-written index.html at the root) need
  # `pnpm build` to produce the static export in ./out/. Without this
  # the mirror would ship raw source (app/, components/, next.config.*)
  # and the deployed site would 404 — exactly what happened to
  # elitezshelf-frontage before this block existed. Detection requires
  # BOTH a next.config and an `output: "export"` directive so we don't
  # try to build hybrid repos that ship plain HTML alongside Next code
  # (discounter, dt-site-creator). Build failures don't abort the
  # sync — they leave the source tree in place so the mistake is
  # visible in the resulting commit.
  next_cfg=""
  for cand in "$folder/next.config.ts" "$folder/next.config.js" "$folder/next.config.mjs"; do
    [ -f "$cand" ] && next_cfg="$cand" && break
  done
  if [ -n "$next_cfg" ] && grep -qE 'output:[[:space:]]*["'\'']export["'\'']' "$next_cfg" \
     && [ ! -f "$folder/index.html" ]; then
    echo "   ↳ Next.js static export detected — building $folder"
    if ( cd "./$folder" && NODE_ENV=production pnpm install --frozen-lockfile --silent \
                        && NODE_ENV=production pnpm build >/dev/null 2>&1 ); then
      if [ -f "$folder/out/index.html" ]; then
        # Preserve the built out/ before nuking the source tree.
        mv "./$folder/out" ".tmp-built"
        rm -rf "./$folder"
        mv ".tmp-built" "./$folder"
        echo "   ↳ ./out/ promoted to ./$folder/ (static export)"
      else
        echo "   ⚠ build succeeded but ./out/index.html missing — leaving source in place"
      fi
    else
      echo "   ⚠ pnpm build failed for $folder — leaving source in place (site will 404)"
    fi
  fi

  # ── Strip internal-only files from the public mirror ──────────
  # dt-public is a PUBLIC repo. Planning docs, agent configs, specs
  # and legal briefs must never be published. Admin/intel pages ARE
  # kept — they are gated by the Supabase OTP overlay
  # (assets/js/auth-gate.js). Without this step the sync copied every
  # private repo's docs/, .claude/ and CLAUDE.md straight to the
  # public site. To add an exclusion, extend the lists below.
  #
  # The strip pass runs in THREE layers (defense in depth — the CSO
  # 2026-05-30 orchestra showed a pure named-denylist is allow-by-default
  # at the folder level, which is how `esop/initial bundle doc/` leaked
  # the KPMG PDF + Tok Mei Ting ESOP Agreement to derrickteo.com):
  #
  #   1. Named-denylist (legacy) — strips folders/files we know about.
  #   2. Pattern-denylist — strips root-level folders matching
  #      "initial*", "private*", "internal*", "* prompt *", "legal*",
  #      "briefs", "specs", "pitch", "dd", "1. *" (numbered planning
  #      dirs). Recurrence-fix for DT-C1/C2/C3 + DT-H2.
  #   3. Extension-denylist — strips raw office docs anywhere in the
  #      tree (*.docx, *.xlsx, *.pptx) plus any *.pdf whose filename
  #      matches "legal" / "due diligence" / "duediligence" /
  #      "strategic" / "capital" / "ESOP". HTML/CSS/JS/JSON/MD/PNG/JPG
  #      content is left intact — those drive the actual mirror.
  #
  # Add to (2) or (3) when a new leak surfaces. Do NOT remove layers
  # without re-reading orchestras/cso/reports/2026-05-30-dt-public.md.
  (
    cd "./$folder" || exit 0

    # Layer 1: legacy named-denylist
    # internal directories, anywhere in the tree
    find . -type d \( -name docs -o -name .claude -o -name .gstack -o -name superpowers \) \
      -prune -exec rm -rf {} + 2>/dev/null
    # internal files at the repo root (root-only, so nested template
    # content such as dt-site-creator archetype files is left intact)
    rm -f CLAUDE.md CLAUDE.local.md AGENTS.md AGENT.md GEMINI.md \
          SESSION-PROMPTS.md .gitleaksignore .env .env.* 2>/dev/null
    # explicitly-private files, anywhere
    find . -type f -name '*.private.*' -delete 2>/dev/null

    # Layer 2: pattern-denylist for root-level planning/legal/spec dirs
    # (root-only so nested data/ and assets/ aren't disturbed)
    find . -maxdepth 1 -type d \( \
        -iname 'initial*' \
        -o -iname 'private*' \
        -o -iname 'internal*' \
        -o -iname '* prompt *' \
        -o -iname 'briefs' \
        -o -iname 'specs' \
        -o -iname 'pitch' \
        -o -iname 'dd' \
        -o -iname 'legal*' \
        -o -iname '1. *' \
        -o -iname '2. *' \
        -o -iname '3. *' \
      \) -prune -exec rm -rf {} + 2>/dev/null

    # Layer 3: extension-denylist for raw office docs + sensitive PDFs
    find . -type f \( \
        -iname '*.docx' \
        -o -iname '*.xlsx' \
        -o -iname '*.pptx' \
        -o -iname '*.doc' \
        -o -iname '*.xls' \
        -o -iname '*.ppt' \
      \) -delete 2>/dev/null
    find . -type f -iname '*.pdf' \
      \( \
        -iname '*legal*' \
        -o -iname '*due*diligence*' \
        -o -iname '*duediligence*' \
        -o -iname '*strategic*' \
        -o -iname '*capital*' \
        -o -iname '*ESOP*' \
        -o -iname '*kpmg*' \
        -o -iname '*confidential*' \
        -o -iname '*proposal*' \
      \) -delete 2>/dev/null
  ) || true

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
              s|<script src="https://cdn\.jsdelivr\.net/npm/html2canvas\@1\.4\.1/dist/html2canvas\.min\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/html2canvas\@1.4.1/dist/html2canvas.min.js" integrity="sha384-ZZ1pncU3bQe8y31yfZdMFdSpttDoPmOZg2wguVK9almUodir1PghgT0eY7Mrty8H" crossorigin="anonymous"></script>|g;
              s|<script src="https://cdn\.jsdelivr\.net/npm/\@supabase/supabase-js\@2/dist/umd/supabase\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/\@supabase/supabase-js\@2.106.1/dist/umd/supabase.js" integrity="sha384-8A8NbbMug1jd/CYs7b0nSc6FPM4L9GKg/VzKxg6hst+UgTcWTQr0ry7knxGrSOtT" crossorigin="anonymous"></script>|g' "$f"
  done < <(find "./$folder" -name "*.html" -type f)

  # The supabase-js <script> tag also lives inside auth-gate.js as a wiring
  # comment; pin + SRI it there too so future copy-paste of the gate uses
  # the hardened version. (CSO 2026-05-30 finding DT-H3.)
  while IFS= read -r f; do
    perl -i -pe 's|<script src="https://cdn\.jsdelivr\.net/npm/\@supabase/supabase-js\@2/dist/umd/supabase\.js"></script>|<script src="https://cdn.jsdelivr.net/npm/\@supabase/supabase-js\@2.106.1/dist/umd/supabase.js" integrity="sha384-8A8NbbMug1jd/CYs7b0nSc6FPM4L9GKg/VzKxg6hst+UgTcWTQr0ry7knxGrSOtT" crossorigin="anonymous"></script>|g' "$f"
  done < <(find "./$folder" -name "auth-gate.js" -type f)

done

# NOTE on admin/intel pages: every admin/ and intel/ page across the
# mirrored repos is now gated by a Supabase email-OTP overlay
# (assets/js/auth-gate.js), restricted to elitez.asia / dhc.com.sg.
# The gate controls UI access; data baked into static pages is still
# readable via page source — moving that data into RLS-gated Supabase
# tables is a separate, planned effort.

echo ""
echo "✓ Source sync complete."
echo ""
echo "  Next: git add -A && git commit -m 'weekly WIP sync' && git push"
echo ""
echo "  Deploy is automatic — Cloudflare's GitHub integration on the"
echo "  dt-public Worker auto-builds + deploys on every push to main."
echo "  derrickteo.com updates within ~30s of push completing."
