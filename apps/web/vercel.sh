
#!/usr/bin/env bash
set -Eeuo pipefail

MODE="${1:-dry-run}"

for cmd in vercel jq; do
  command -v "$cmd" >/dev/null || {
    echo "Missing dependency: $cmd"
    exit 1
  }
done

echo "Fetching Vercel environment variables..."

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

if ! vercel env ls --format json > "$TMP"; then
  echo "Failed to retrieve environment variables."
  echo "Check vercel login and project linking."
  exit 1
fi

# Extract variable names from JSON records.
mapfile -t VARS < <(
  jq -r '
    [.. | objects |
      (.key? // .name? // empty) |
      select(type == "string" and length > 0)
    ] | unique[]
  ' "$TMP"
)

if [[ ${#VARS[@]} -eq 0 ]]; then
  echo "No environment variables detected."
  echo "Raw CLI output:"
  cat "$TMP"
  exit 1
fi

echo ""
echo "Project: $(pwd)"
echo "Found ${#VARS[@]} unique environment variables."
echo ""

printf '%s\n' "${VARS[@]}"

if [[ "$MODE" != "--apply" ]]; then
  echo ""
  echo "DRY RUN: Nothing deleted."
  echo "Run: $0 --apply"
  exit 0
fi

echo ""
echo "WARNING: This permanently removes project environment variables."
read -r -p 'Type DELETE to continue: ' CONFIRM

[[ "$CONFIRM" == "DELETE" ]] || {
  echo "Cancelled."
  exit 0
}

SUCCESS=0
FAILED=0

for VAR in "${VARS[@]}"; do
  echo "Removing $VAR..."

  if vercel env rm "$VAR" --yes; then
    ((SUCCESS+=1))
  else
    echo "FAILED: $VAR"
    ((FAILED+=1))
  fi
done

echo ""
echo "Cleanup finished."
echo "Successful: $SUCCESS"
echo "Failed: $FAILED"

echo ""
echo "Remaining variables:"
vercel env ls
