#!/usr/bin/env bash
# Create / refresh the local Chain of Command Ollama model from Modelfile.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
MODEL_NAME="${MODEL_NAME:-chain-of-command}"
MODELFILE="${MODELFILE:-$ROOT/modelfiles/chain-of-command/Modelfile}"

if ! command -v ollama >/dev/null 2>&1; then
  echo "ollama not found in PATH" >&2
  exit 1
fi

if [[ ! -f "$MODELFILE" ]]; then
  echo "Missing Modelfile: $MODELFILE" >&2
  exit 1
fi

echo "Creating Ollama model: $MODEL_NAME"
echo "  from: $MODELFILE"
ollama create "$MODEL_NAME" -f "$MODELFILE"
echo "Done. Try: ollama run $MODEL_NAME"
