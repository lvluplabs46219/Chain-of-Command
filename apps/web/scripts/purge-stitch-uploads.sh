#!/usr/bin/env bash
# =============================================================================
# Acquit.ai — purge Stitch HTML uploads (idempotent)
# Legal OS runtime is React under apps/web/src/components/os/
# =============================================================================
# Usage (from monorepo root):
#   bash apps/web/scripts/purge-stitch-uploads.sh
#
# Dry-run:
#   DRY_RUN=1 bash apps/web/scripts/purge-stitch-uploads.sh
#
# After purge:
#   git add -A apps/web
#   git commit -m "chore: purge Stitch HTML uploads; Legal OS is React"
# =============================================================================
set -euo pipefail

DRY_RUN="${DRY_RUN:-0}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO=""
for candidate in \
  "$SCRIPT_DIR/../.." \
  "$SCRIPT_DIR/../../.." \
  "$PWD" \
  "$PWD/.." \
  "$PWD/../.."
do
  if [[ -d "$candidate/apps/web" && -d "$candidate/.git" ]]; then
    REPO="$(cd "$candidate" && pwd)"
    break
  fi
done

if [[ -z "$REPO" ]]; then
  if [[ -d "$PWD/apps/web" ]]; then
    REPO="$PWD"
  else
    echo "[purge-stitch] ERROR: could not find monorepo root (need apps/web + .git)" >&2
    exit 1
  fi
fi

WEB="$REPO/apps/web"
echo "[purge-stitch] repo=$REPO"
echo "[purge-stitch] web=$WEB"
echo "[purge-stitch] dry_run=$DRY_RUN"

TARGETS=(
  "$WEB/components/mockups/acquit-case-workspace/NEWSTITCH"
  "$WEB/src/assets/stitch"
  "$WEB/public/assets/stitch"
  "$WEB/public/mockups"
)

OPTIONAL=(
  "$REPO/NEWSTITCH"
  "$REPO/stitch_acquit.ai_legal_operating_system"
  "$WEB/public/assets"
)

remove_path() {
  local path="$1"
  if [[ ! -e "$path" ]]; then
    echo "[purge-stitch] skip (missing) $path"
    return 0
  fi
  if [[ "$DRY_RUN" == "1" ]]; then
    if [[ -d "$path" ]]; then
      local count
      count="$(find "$path" -type f 2>/dev/null | wc -l | tr -d ' ')"
      echo "[purge-stitch] DRY_RUN would remove dir ($count files): $path"
    else
      echo "[purge-stitch] DRY_RUN would remove file: $path"
    fi
    return 0
  fi
  echo "[purge-stitch] removing $path"
  rm -rf "$path"
}

for t in "${TARGETS[@]}"; do
  remove_path "$t"
done

for t in "${OPTIONAL[@]}"; do
  if [[ "$t" == "$WEB/public/assets" ]]; then
    if [[ -d "$t" ]] && [[ -z "$(ls -A "$t" 2>/dev/null || true)" ]]; then
      remove_path "$t"
    else
      echo "[purge-stitch] keep non-empty $t"
    fi
  else
    remove_path "$t"
  fi
done

KEEP_HINTS=(
  "$WEB/src/components/os"
  "$WEB/src/components/mockups"
  "$WEB/components/mockups/acquit-case-workspace/StitchGallery.tsx"
)
echo "[purge-stitch] kept (do not delete):"
for k in "${KEEP_HINTS[@]}"; do
  if [[ -e "$k" ]]; then
    echo "  - $k"
  fi
done

if [[ "$DRY_RUN" == "1" ]]; then
  echo "[purge-stitch] dry-run complete — re-run without DRY_RUN=1 to delete"
  exit 0
fi

echo ""
echo "[purge-stitch] done. Stage and commit:"
echo "  cd $REPO"
echo "  git add -A apps/web"
echo "  git status"
echo "  git commit -m \"chore: purge Stitch HTML uploads; Legal OS is React\""
echo "  git push"
