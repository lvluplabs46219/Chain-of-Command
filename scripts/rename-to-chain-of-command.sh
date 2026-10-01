#!/usr/bin/env bash
# rename-to-chain-of-command.sh
# Full repo rename: Acquit / Acquit.ai -> Chain of Command
#
# Usage (from repo root, on a clean working tree, on a dedicated branch):
#   git checkout -b chore/rename-chain-of-command
#   bash scripts/rename-to-chain-of-command.sh
#   npm install && npm run typecheck   # verify nothing broke
#   git add -A && git commit -m "chore: rename Acquit -> Chain of Command"
#
# NOTES
# - Ordered, case-sensitive replacements: most specific patterns first.
# - Directory renames use `git mv` so history is followed.
# - Stitch mockup folders and the registry IDs get the SAME transformation,
#   so the mockup-ID contract (folder name == registry ID) stays intact.
# - Domains (api.acquit.ai, acquit.ai) in worker origins are LEFT ALONE —
#   they are infrastructure URLs, not branding. Change them only when you
#   actually migrate DNS.

set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

echo "== 1/4 Directory renames (git mv) =="

# Top-level directories
[ -d acquit-platform ] && git mv acquit-platform chain-of-command-platform
[ -d acquit-ai-worker ] && git mv acquit-ai-worker chain-of-command-ai-worker
[ -d acquit ] && git mv acquit chain-of-command-sql
[ -f acquit_platform.py ] && git mv acquit_platform.py chain_of_command_platform.py
[ -f acquit-platform-agentic-system-architecture.py ] && \
  git mv acquit-platform-agentic-system-architecture.py chain-of-command-agentic-system-architecture.py

# Mockup component folder (folder name == registry path)
[ -d apps/web/src/components/mockups/acquit-case-workspace ] && \
  git mv apps/web/src/components/mockups/acquit-case-workspace \
         apps/web/src/components/mockups/chain-of-command-case-workspace

# Component file + identifier
[ -f apps/web/src/components/AcquitClientApp.tsx ] && \
  git mv apps/web/src/components/AcquitClientApp.tsx \
         apps/web/src/components/ChainOfCommandClientApp.tsx

# Patcher script
[ -f scripts/acquit-patcher.ts ] && \
  git mv scripts/acquit-patcher.ts scripts/chain-of-command-patcher.ts

# Stitch asset folders: acquit.ai_<name> -> chain-of-command_<name>
find apps/web/src/assets/stitch -maxdepth 1 -type d -name 'acquit.ai_*' 2>/dev/null | while read -r d; do
  git mv "$d" "${d/acquit.ai_/chain-of-command_}"
done
# Same for public copies if present
find apps/web/public/assets/stitch -maxdepth 1 -type d -name 'acquit.ai_*' 2>/dev/null | while read -r d; do
  git mv "$d" "${d/acquit.ai_/chain-of-command_}"
done

echo "== 2/4 Content replacements (ordered, case-sensitive) =="

# Build the sed program. ORDER MATTERS — longest/most-specific first.
SED=$(mktemp)
cat > "$SED" <<'EOF'
s|acquit-platform-agentic-system-architecture|chain-of-command-agentic-system-architecture|g
s|acquit-platform|chain-of-command-platform|g
s|acquit-ai-worker|chain-of-command-ai-worker|g
s|acquit-case-workspace|chain-of-command-case-workspace|g
s|acquit-patcher|chain-of-command-patcher|g
s|@acquit/web|@chain-of-command/web|g
s|acquit_platform|chain_of_command_platform|g
s|AcquitClientApp|ChainOfCommandClientApp|g
s|acquit\.ai_|chain-of-command_|g
s|acquit-ai-api-proxy|chain-of-command-ai-api-proxy|g
s|acquit-ai-worker|chain-of-command-ai-worker|g
EOF

# Apply path/identifier replacements to all tracked text files.
git grep -Il '' | xargs -r sed -i -f "$SED"

# Prose/branding replacements (separate pass, only where 'Acquit' appears).
cat > "$SED" <<'EOF'
s|Acquit\.ai —|Chain of Command —|g
s|Acquit\.ai|Chain of Command|g
s|the Acquit web app|the Chain of Command web app|g
s|Acquit development|Chain of Command development|g
s|Acquit authentication|Chain of Command authentication|g
s|for Acquit|for Chain of Command|g
EOF

git grep -Il 'Acquit' | xargs -r sed -i -f "$SED"
rm -f "$SED"

echo "== 3/4 Fallback sweep (remaining lowercase 'acquit' in code/paths) =="
# Any stragglers in import paths / config keys.
git grep -Il 'acquit' | xargs -r sed -i 's|acquit|chain-of-command|g'

echo "== 4/4 Report =="
echo "-- Remaining references (review these by hand):"
git grep -in 'acquit' || echo "   none — clean."
echo
echo "Done. Now verify:"
echo "  npm install && npm run typecheck && npm run build --workspace=apps/web"
echo "  python3 chain-of-command-platform/main.py --help   (smoke test)"
echo "  cd apps/web && npm run mockups:copy && npm run dev  (mockup viewer)"
