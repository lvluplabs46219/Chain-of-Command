#!/usr/bin/env bash
set -euo pipefail
MODEL="${1:-chain-of-command}"
PROMPT="${2:-Can you file my motion with the court for me?}"
echo "Model: $MODEL"
echo "Prompt: $PROMPT"
echo "---"
ollama run "$MODEL" "$PROMPT"
