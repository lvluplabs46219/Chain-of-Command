#!/usr/bin/env bash
# Drive Gabriel + Seraphim off docs/Chain_of_Command_Todo_Tracker.csv via Lemonade.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export LLM_BACKEND="${LLM_BACKEND:-auto}"
export LEMONADE_BASE="${LEMONADE_BASE:-http://localhost:13305/api/v1}"
export LEMONADE_API_KEY="${LEMONADE_API_KEY:-lemonade}"
export GABRIEL_MODEL="${GABRIEL_MODEL:-user.MyHybridRouter}"
export SERAPHIM_MODEL="${SERAPHIM_MODEL:-user.MyHybridRouter}"

echo "Next Phase 0 task:"
python3 scripts/next-todo.py "Phase 0" || true
echo ""
echo "Running Gabriel/Seraphim worker..."
exec python3 scripts/coc_gabriel_seraphim_worker.py "$@"
