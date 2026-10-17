#!/usr/bin/env bash
# Run Gabriel / Seraphim via Lemonade (preferred) or Ollama.
set -euo pipefail
cd "$(dirname "$0")"

export LLM_BACKEND="${LLM_BACKEND:-auto}"
export LEMONADE_BASE="${LEMONADE_BASE:-http://localhost:13305/api/v1}"
export LEMONADE_API_KEY="${LEMONADE_API_KEY:-lemonade}"
# Hybrid router on Lemonade (Ollama cloud free models + local judge)
export GABRIEL_MODEL="${GABRIEL_MODEL:-user.MyHybridRouter}"
export SERAPHIM_MODEL="${SERAPHIM_MODEL:-user.MyHybridRouter}"
export USE_OLLAMA="${USE_OLLAMA:-1}"   # enables LLM path in bots; name is historical

echo "LLM_BACKEND=$LLM_BACKEND"
echo "LEMONADE_BASE=$LEMONADE_BASE"
echo "GABRIEL_MODEL=$GABRIEL_MODEL"
echo "SERAPHIM_MODEL=$SERAPHIM_MODEL"

if curl -sf "$LEMONADE_BASE/models" >/dev/null 2>&1; then
  echo "✓ Lemonade reachable"
else
  echo "⚠ Lemonade not reachable at $LEMONADE_BASE — will fall back if Ollama is up"
fi

MODE="${1:-agentic}"
case "$MODE" in
  agentic|agents)
    echo "Starting agentic orchestrator (Gabriel + Seraphim loop)..."
    python3 pipeline/agentic_orchestrator.py
    ;;
  prototype|stages)
    echo "Starting stage pipeline..."
    python3 pipeline/orchestrator.py
    ;;
  *)
    echo "Usage: $0 [agentic|prototype]"
    exit 1
    ;;
esac

echo ""
echo "Artifacts:"
ls -la artifacts/ | head -30
