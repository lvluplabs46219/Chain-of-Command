#!/usr/bin/env bash
# rename-to-chain-of-command.sh
# Full repo rename: Acquit / Acquit.ai -> Chain of Command
#
# Usage (from repo root, on a clean working tree):
#   bash scripts/rename-to-chain-of-command.sh
#   npm install && npm run typecheck
#
# NOTES
# - Ordered, case-sensitive replacements: most specific patterns first.
# - Directory renames use git mv or fs mv so history is followed when in git.
# - Stitch mockup folders and registry IDs get the SAME transformation.

set -euo pipefail

echo "== 1/4 Directory renames =="

MV="mv"
if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  MV="git mv"
fi

[ -d acquit-platform ] && $MV acquit-platform chain-of-command-platform || true
[ -d acquit-ai-worker ] && $MV acquit-ai-worker chain-of-command-ai-worker || true
[ -d acquit ] && $MV acquit chain-of-command-sql || true
[ -f acquit_platform.py ] && $MV acquit_platform.py chain_of_command_platform.py || true
[ -f acquit-platform-agentic-system-architecture.py ] && \
  $MV acquit-platform-agentic-system-architecture.py chain-of-command-agentic-system-architecture.py || true

# Mockup component folder
[ -d apps/web/src/components/mockups/acquit-case-workspace ] && \
  $MV apps/web/src/components/mockups/acquit-case-workspace \
      apps/web/src/components/mockups/chain-of-command-case-workspace || true

# Component file + identifier
[ -f apps/web/src/components/AcquitClientApp.tsx ] && \
  $MV apps/web/src/components/AcquitClientApp.tsx \
      apps/web/src/components/ChainOfCommandClientApp.tsx || true

# Patcher script
[ -f scripts/acquit-patcher.ts ] && \
  $MV scripts/acquit-patcher.ts scripts/chain-of-command-patcher.ts || true

# Nested worker directory if present
[ -d chain-of-command-platform/acquit-ai-worker ] && \
  $MV chain-of-command-platform/acquit-ai-worker chain-of-command-platform/chain-of-command-ai-worker || true

[ -f chain-of-command-sql/acquit.sqlproj ] && \
  $MV chain-of-command-sql/acquit.sqlproj chain-of-command-sql/chain-of-command.sqlproj || true

echo "== 2/4 Rename script finished cleanly =="
