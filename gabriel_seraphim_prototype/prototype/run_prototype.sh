#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
echo "Starting Gabriel/Seraphim minimal prototype..."
python3 pipeline/orchestrator.py
echo ""
echo "Artifacts are in ./artifacts/"
ls -la artifacts/
