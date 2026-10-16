#!/usr/bin/env bash
# Absolute path to working directory
cd "$(dirname "$0")"

echo "=== Starting Chain of Command Backend & Lemonade/Agent UI ==="

# 1. Free port 8787
lsof -ti:8787 | xargs -r kill 2>/dev/null || true

# 2. Ensure OLLAMA_API_KEY is present
if [ -f .env ]; then
  grep -q "OLLAMA_API_KEY" .env || echo "OLLAMA_API_KEY=ollama" >> .env
else
  echo "OLLAMA_API_KEY=ollama" > .env
fi

# 3. Build application
npm run build

# 4. Start API Gateway & Michael Agent in background
npm run gateway &
npm start &

# 5. Wait for services to bind
sleep 3

# 6. Open browser to the correct local endpoint (Lemonade / API Gateway / Agent interface)
# Change URL if your Lemonade server runs on a specific port like 13305 or 8787
TARGET_URL="http://127.0.0.1:8787"

if command -v xdg-open &>/dev/null; then
  xdg-open "$TARGET_URL"
elif command -v open &>/dev/null; then
  open "$TARGET_URL"
else
  echo "Please open your browser at: $TARGET_URL"
fi

echo "=== Services running. Press Ctrl+C to stop. ==="
wait