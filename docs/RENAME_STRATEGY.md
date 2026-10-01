# Chain of Command: Safe Rename Strategy

**Goal**: Rename "Acquit.ai" → "Chain of Command" safely across lvluplabs46219/Chain-of-Command

**Safety Principles**:
- File-by-file, validated approach
- Preserve functionality at each step
- Validate after each phase
- Rollback-friendly (git commits after each phase)

---

## Phase 1: Audit & Backup (5 min)

### 1.1 Current State Snapshot
```bash
# Get baseline counts
echo "=== ACQUIT REFERENCES ==="
git grep -i "acquit" -- '*.ts' '*.tsx' '*.js' '*.py' '*.md' '*.html' '*.json' | wc -l

echo "=== CHAIN OF COMMAND REFERENCES ==="
git grep -i "chain.of.command" -- '*.ts' '*.tsx' '*.js' '*.py' '*.md' '*.html' '*.json' | wc -l

echo "=== File listing ==="
find . -type f \( -name "*acquit*" -o -name "*Acquit*" \) ! -path "./.git/*" | sort
```

### 1.2 Create Safety Commit
```bash
git add -A
git commit -m "Checkpoint: Pre-rename baseline"
git tag v-pre-rename-$(date +%Y%m%d-%H%M%S)
```

---

## Phase 2: Strategic File Renames (10 min)

### 2.1 Rename Files with "acquit" in Path
These are **safe to rename** because they're configuration/metadata files:

```bash
# Database / Schema
mv acquit/acquit.sqlproj chain-of-command/chain-of-command.sqlproj 2>/dev/null || echo "Skip: .sqlproj"

# Python Platform Files
mv acquit_platform.py chain_of_command_platform.py
mv acquit-platform/ chain-of-command-platform/
mv acquit-platform-agentic-system-architecture.py chain-of-command-agentic-system-architecture.py

# Docker / Config
mv acquit-platform/acquit-ai-worker/ chain-of-command-platform/chain-of-command-ai-worker/

# API / Web Directories
# (Keep as-is for now; rename package.json names in Phase 3)
```

### 2.2 Validate File Renames
```bash
git status  # Should show renames, not deletions+additions
git diff --name-status HEAD

# Quick check: no broken imports
find . -type f \( -name "*.ts" -o -name "*.js" \) ! -path "./.git/*" -exec grep -l "acquit_platform\|acquit-platform-agentic" {} \; | head -5
```

### 2.3 Commit Phase 2
```bash
git add -A
git commit -m "Phase 2: Rename files with 'acquit' in path to 'chain-of-command'"
```

---

## Phase 3: String Replacements in Code (20 min)

### 3.1 Replacement Mapping

| Context | Find | Replace | Files | Risk |
|---------|------|---------|-------|------|
| Module imports | `from acquit_platform` | `from chain_of_command_platform` | `.py` | LOW |
| Module imports | `acquit-platform` | `chain-of-command-platform` | `.js`, `.ts`, `.json` | LOW |
| System name (long) | `Acquit.ai` | `Chain of Command` | `.md`, `.ts`, `.tsx`, `.py` | **MEDIUM** |
| System name (short) | `Acquit` | `Chain of Command` | `.md`, `.py`, `strings/docs` | **MEDIUM** |
| Namespace/var name | `acquit` (lowercase) | `chain_of_command` | `.py` files only | LOW |
| API tokens/headers | `X-Acquit-Token` | `X-ChainOfCommand-Token` | `.js`, `.ts` | LOW |
| User-facing strings | `"Acquit Legal OS"` | `"Chain of Command Legal OS"` | `.tsx`, `.ts` | **MEDIUM** |
| Database refs | `acquit` (schema/table names) | `chain_of_command` | `.sql`, `.py` (migrations) | **HIGH** |
| Config keys | `ACQUIT_` | `CHAIN_OF_COMMAND_` | `.env`, `.ts`, `.py` | **MEDIUM** |

### 3.2 Staged Replacements (by file type, low risk first)

#### Stage 3a: Python Files (Safe - Internal)
```bash
# acquit_platform.py → chain_of_command_platform.py (ALREADY DONE)

# Replace imports in Python
find . -type f -name "*.py" ! -path "./.git/*" -exec sed -i \
  -e 's/from acquit_platform import/from chain_of_command_platform import/g' \
  -e 's/import acquit_platform/import chain_of_command_platform/g' \
  -e 's/acquit-platform/chain-of-command-platform/g' \
  {} \;

# Replace string literals in Python
find . -type f -name "*.py" ! -path "./.git/*" -exec sed -i \
  's/"Acquit Platform"/"Chain of Command Platform"/g' \
  {} \;

git add -u
git commit -m "Phase 3a: Update Python imports and literals"
```

#### Stage 3b: JSON/YAML Config Files
```bash
# package.json, tsconfig.json, .env examples
find . -type f \( -name "package.json" -o -name "tsconfig.json" \) ! -path "./.git/*" \
  -exec sed -i \
  -e 's/"acquit"/"chain-of-command"/g' \
  -e 's/"Acquit/"Chain of Command/g' \
  {} \;

git add -u
git commit -m "Phase 3b: Update JSON/YAML config names"
```

#### Stage 3c: Documentation (Comments & Strings)
```bash
# Markdown files
find . -type f -name "*.md" ! -path "./.git/*" \
  -exec sed -i \
  -e 's/Acquit\.ai/Chain of Command/g' \
  -e 's/Acquit/Chain of Command/g' \
  {} \;

# TypeScript/TSX doc comments and strings
find . -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "./.git/*" -exec sed -i \
  -e "s/Acquit\.ai/Chain of Command/g" \
  -e "s/Acquit Legal OS/Chain of Command Legal OS/g" \
  -e "s/Acquit/Chain of Command/g" \
  {} \;

git add -u
git commit -m "Phase 3c: Update documentation and user-facing strings"
```

#### Stage 3d: API/System Headers (Careful)
```bash
# Worker headers, token names
find . -type f \( -name "*.ts" -o -name "*.js" \) ! -path "./.git/*" \
  -exec sed -i \
  -e 's/X-Acquit-Token/X-ChainOfCommand-Token/g' \
  -e 's/"acquit-ai-worker"/"chain-of-command-ai-worker"/g' \
  {} \;

git add -u
git commit -m "Phase 3d: Update API headers and system identifiers"
```

#### Stage 3e: Database/Schema (HIGH RISK - DO LAST)
```bash
# SQL migration files only
find . -type f -name "*.sql" ! -path "./.git/*" \
  -exec sed -i \
  -e 's/acquit_/chain_of_command_/g' \
  {} \;

# Python migration/schema scripts
find . -path "*/migrations/*" -name "*.py" ! -path "./.git/*" \
  -exec sed -i \
  -e 's/acquit_/chain_of_command_/g' \
  {} \;

git add -u
git commit -m "Phase 3e: Update database schema references (HIGH RISK - REVIEW)"
```

---

## Phase 4: Validation Checklist (10 min)

### 4.1 No Broken Imports
```bash
echo "=== Checking for orphaned 'acquit' imports ==="
git grep "from acquit\|import acquit\|require.*acquit" -- '*.ts' '*.js' '*.py' || echo "✓ None found"

echo ""
echo "=== Checking for orphaned 'Acquit' references in code ==="
git grep "Acquit" -- '*.ts' '*.tsx' '*.py' '*.js' | grep -v "node_modules" | grep -v "dist" || echo "✓ None found"
```

### 4.2 Build & Test
```bash
# TypeScript check
npm run typecheck 2>&1 | head -20

# Linting
npm run lint 2>&1 | head -20

# Try starting dev (if applicable)
# npm run dev &
# sleep 5
# kill %1
```

### 4.3 Config/Environment Check
```bash
echo "=== Checking environment variable names ==="
grep -r "ACQUIT_" .env* 2>/dev/null || echo "✓ None found"

grep -r "ACQUIT_" . --include="*.ts" --include="*.js" --include="*.py" 2>/dev/null | head -5 || echo "✓ None found"
```

### 4.4 Final Audit
```bash
echo "=== Final 'acquit' count (should be near zero) ==="
git grep -i "acquit" -- '*.ts' '*.tsx' '*.js' '*.py' '*.md' '*.html' | wc -l

echo ""
echo "=== Files still containing 'acquit' (if any) ==="
git grep -i "acquit" -- '*.ts' '*.tsx' '*.js' '*.py' '*.md' | cut -d: -f1 | sort -u
```

### 4.5 Database Migrations (if applicable)
```bash
# Check migration scripts for correctness
ls -la ./supabase/migrations/*.sql 2>/dev/null | head
# Visually inspect first few lines of each
```

---

## Phase 5: Agent Consolidation (10 min)

### 5.1 Run Consolidation Script
```bash
# (Assumes you've already created scripts/consolidate-agents.py)
python scripts/consolidate-agents.py --dry-run

# Review output, then apply:
python scripts/consolidate-agents.py --apply

# Verify
ls -la agents/
```

### 5.2 Update References to Old Agent Locations
```bash
# Find any hardcoded paths to old agent locations
git grep "\.agents\|\.Agents\|chain-of-command-platform/agents" -- '*.ts' '*.js' '*.py'

# Update to new location
find . -type f \( -name "*.ts" -o -name "*.js" -o -name "*.py" \) ! -path "./.git/*" \
  -exec sed -i \
  -e 's|\.agents/|agents/|g' \
  -e 's|\.Agents/|agents/|g' \
  -e 's|chain-of-command-platform/agents|agents|g' \
  {} \;

git add -A
git commit -m "Phase 5: Consolidate agent files into unified structure"
```

---

## Phase 6: Final Commit & Tag (5 min)

### 6.1 Create Summary
```bash
echo "# Rename Summary: Acquit → Chain of Command" > RENAME_LOG.md
echo "" >> RENAME_LOG.md
echo "Date: $(date)" >> RENAME_LOG.md
echo "Commits:" >> RENAME_LOG.md
git log --oneline | head -10 >> RENAME_LOG.md

git add RENAME_LOG.md
git commit -m "Add: Rename log summary"
```

### 6.2 Tag Release
```bash
git tag -a v2.0.0-chain-of-command -m "Major rename: Acquit.ai → Chain of Command"
git log --oneline -5
```

### 6.3 Safety Check
```bash
echo "=== Git Status ==="
git status

echo ""
echo "=== Last 5 commits ==="
git log --oneline -5

echo ""
echo "=== Tags ==="
git tag -l | tail -5

echo ""
echo "✅ RENAME COMPLETE"
```

---

## Rollback Plan (If Needed)

### Quick Rollback
```bash
# Back to pre-rename state
git reset --hard v-pre-rename-YYYYMMDD-HHMMSS

# Or back one phase at a time
git reset --hard HEAD~1  # Undo last commit
git reset --hard HEAD~2  # Undo last 2 commits
```

### Full Rollback
```bash
git revert HEAD  # Creates inverse commits, safer for pushed branches
```

---

## Validation Checklist (Final)

- [ ] All `git grep "acquit"` results are in `.git/`, comments, or intentional
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] No `ACQUIT_` environment variables remain
- [ ] API headers updated (`X-ChainOfCommand-Token`)
- [ ] Database migrations reviewed (if changed)
- [ ] README.md references updated
- [ ] Agent files consolidated under `agents/`
- [ ] Tags created (`v-pre-rename-*`, `v2.0.0-chain-of-command`)
- [ ] Commits pushed (when ready)

---

## Estimated Timeline

| Phase | Task | Duration | Cumulative |
|-------|------|----------|-----------|
| 1 | Audit & Backup | 5 min | 5 min |
| 2 | File Renames | 10 min | 15 min |
| 3 | String Replacements | 20 min | 35 min |
| 4 | Validation | 10 min | 45 min |
| 5 | Agent Consolidation | 10 min | 55 min |
| 6 | Final Commit & Tag | 5 min | 60 min |

**Total: ~1 hour** (mostly waiting for builds/validation)

---

## Key Safety Reminders

1. **Commit after each phase** — Never do all phases in one commit
2. **Use `sed -i` carefully** — Always test with `--dry-run` first (use `sed` without `-i`)
3. **Database changes are permanent** — Review migrations carefully before applying
4. **Test builds locally** — Ensure TypeScript and linting pass at each stage
5. **Keep git history** — Tags and commits make rollback safe

