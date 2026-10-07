# Stitch upload purge

After MUST Legal OS screens are React (`apps/web/src/components/os/`), static Stitch HTML is **unneeded for runtime**.

## What to delete

| Path | Why |
|------|-----|
| `apps/web/components/mockups/.../NEWSTITCH/` | Source Stitch export (largest) |
| `apps/web/src/assets/stitch/` | Duplicated HTML + screen.png per mockup |
| `apps/web/public/mockups/` | Build-time copies |
| `apps/web/public/assets/stitch/` | Build-time copies |

## Keep

| Path | Why |
|------|-----|
| `apps/web/src/components/os/*` | Runtime Legal OS |
| `apps/web/src/components/mockups/**/*.tsx` | React components (EvidenceCarousel, etc.) |
| `DESIGN_SYSTEM.md` | Tokens |

## Run (owner machine)

```bash
cd ~/Development/Repos/Aquit-Platform
git fetch origin && git checkout chore/purge-stitch-uploads
bash apps/web/scripts/purge-stitch-uploads.sh
git add -A apps/web
git status   # should show many deletions under NEWSTITCH / assets/stitch
git commit -m "chore: purge Stitch HTML uploads; Legal OS is React"
git push origin chore/purge-stitch-uploads
```

`predev` / `prebuild` no longer copy Stitch assets.

Gallery routes (`/gallery`, `/stitch/*`) will 404 or empty until removed from App.tsx — wire OS routes first (PR #47), then purge.
