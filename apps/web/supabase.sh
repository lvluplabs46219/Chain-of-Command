
#!/usr/bin/env bash
set -euo pipefail

PROJECT_REF="othxichdhzdxgtatautb"
MODE="${1:-dry-run}"

if [[ "$MODE" != "dry-run" && "$MODE" != "--apply" ]]; then
  echo "Usage: $0 [--apply]"
  exit 1
fi

command -v supabase >/dev/null || {
  echo "Error: Supabase CLI is not installed."
  exit 1
}

command -v jq >/dev/null || {
  echo "Error: jq is required. Install it first."
  exit 1
}

# Always target the intended project explicitly.
JSON="$(supabase secrets list --project-ref "$PROJECT_REF")"

# Validate the response before doing anything destructive.
if ! jq -e '.secrets | type == "array"' >/dev/null <<< "$JSON"; then
  echo "Error: Unexpected response from Supabase. Nothing was deleted."
  exit 1
fi

mapfile -t SECRETS < <(jq -r '.secrets[].name' <<< "$JSON")

if (( ${#SECRETS[@]} == 0 )); then
  echo "No secrets found."
  exit 0
fi

echo "Project: $PROJECT_REF"
echo "Secrets found: ${#SECRETS[@]}"
printf '  %s\n' "${SECRETS[@]}"

if [[ "$MODE" != "--apply" ]]; then
  echo
  echo "DRY RUN — nothing deleted."
  echo "Review the names above, then run:"
  echo "  $0 --apply"
  exit 0
fi

echo
echo "Deleting ${#SECRETS[@]} secrets..."

supabase secrets unset "${SECRETS[@]}" \
  --project-ref "$PROJECT_REF" \
  --yes

echo "Deletion command completed."

# Verify the result.
REMAINING="$(supabase secrets list --project-ref "$PROJECT_REF")"
COUNT="$(jq '.secrets | length' <<< "$REMAINING")"

echo "Secrets remaining: $COUNT"
