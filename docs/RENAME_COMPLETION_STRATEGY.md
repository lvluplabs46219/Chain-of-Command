# Chain of Command: Complete Rename Strategy
**Status:** Safe, incremental rename from Acquit.ai → Chain of Command  
**Created:** 2026-10-01  
**Phase:** Remaining references cleanup + validation

---

## PART 1: SEARCH LIST — All Remaining References

### Critical Files with Old Branding (170+ changes needed)

**Documentation:**
- `AGENTS.md` — Update title & references
- `GEMINI.md` — Update system instructions header
- `README.md` — Update project description
- `DESIGN_SYSTEM.md` — Update brand references

**Source Code:**
- `apps/api/src/ai/runtime.ts` — System instructions header
- `apps/api/src/index.ts` — Logger messages
- `apps/api/src/routes/gemini.ts` — API documentation
- `apps/api/src/routes/courtlistener.ts` — User-Agent header
- `apps/api/src/routes/documents.ts` — Storage URLs
- `apps/api/src/tests/security.test.ts` — CORS tests, domain assertions
- `apps/api/src/workflows/userSignup.ts` — Branding in workflows
- `apps/web/index.html` — Meta tags (og:title, twitter:title)
- `apps/web/src/app/layout.tsx` — Metadata title
- `apps/web/DESIGN_SYSTEM.md` — Brand system documentation

**UI Components (46+ HTML mockup files):**
- All files under `apps/web/components/mockups/acquit-case-workspace/NEWSTITCH/stitch_acquit.ai_legal_operating_system/`
  - `acquit.ai_genteam_ai_workspace_lemonade_server/code.html`
  - `acquit.ai_genteam_multi_agent_autonomous_workspace_telegram_lemonade/code.html`
  - `acquit.ai_telegram_genteam_ai_workspace_lemonade_server/code.html`
  - `ai_engine_*/*.html`
  - `case_timeline_*/*.html`
  - `chambers_*/*.html`
  - `command_center_*/*.html`
  - `court_*/*.html`
  - `docket_*/*.html`
  - `evidence_*/*.html`
  - `filing_*/*.html`
  - `research_*/*.html`
  - And 20+ more mockup screens

**Config Files:**
- `package.json` — Name field
- Various `.md` docs in scripts/

---

## PART 2: RENAME SET — Exact Substitutions

### A. Branding & Public Identifiers

| Old | New | Files | Risk |
|-----|-----|-------|------|
| `Acquit.ai` | `Chain of Command` | *.md, *.ts, *.tsx, *.html | LOW — Branding |
| `Acquit Legal OS` | `Chain of Command` | *.md, *.ts, *.tsx | LOW — Branding |
| `acquit.ai` (domain) | `chainofcommand.ai` | Comments, docs, URLs | MEDIUM — Contact info |
| `contact@acquit.ai` | `contact@chainofcommand.ai` | Emails in code | MEDIUM — Email |
| `https://acquit.ai` | `https://chainofcommand.ai` | Docs, comments | MEDIUM — URLs |

### B. Technical Identifiers

| Old | New | Files | Risk |
|-----|-----|-------|------|
| `X-Acquit-Token` | `X-ChainOfCommand-Token` | *.ts, *.js, *.py | HIGH — Auth header |
| `ACQUIT_` (env var prefix) | `CHAIN_OF_COMMAND_` | *.ts, *.py, .env.example | HIGH — Runtime |
| `acquit_` (Python namespace) | `chain_of_command_` | *.py | HIGH — Imports |
| `AcquitClientApp` | `ChainOfCommandClientApp` | *.tsx | MEDIUM — Component |
| `acquit-case-workspace` | `chain-of-command-case-workspace` | Folder names | LOW — Path |

### C. SQL & Database

| Old | New | Files | Risk |
|-----|-----|-------|------|
| `<Name>acquit</Name>` | `<Name>chain-of-command</Name>` | *.sqlproj | HIGH — Schema name |
| `acquit.schema` | `chain_of_command.schema` | *.sql | HIGH — Schema |
| Table: `acquit_users` | `chain_of_command_users` | *.sql | HIGH — DB |

---

## PART 3: CONSOLIDATION OF AGENT FILES

### Affected Agent Configs
Located in `.github/agents/`:

**Keep (rename in place):**
- `code-reviewer.md` → references to Acquit.ai in content
- `security-auditor.md` → system prompt references
- `supabase-db-architect.md` → database naming conventions
- `tailwind-ui-architect.md` → component naming

**Update (in-place):**
- Each agent markdown file has embedded system prompts that reference "Acquit.ai"
- Search for: `Acquit.ai`, `acquit_platform`, `ACQUIT_*` env vars
- Replace consistently across all agents

---

## PART 4: VALIDATION CHECKLIST (After Rename)

### Phase 1: Syntax & Structure
- [ ] TypeScript builds without errors: `npm run build --workspace=apps/web`
- [ ] API server builds: `npm run build --workspace=apps/api`
- [ ] Python scripts parse without syntax errors: `python3 -m py_compile *.py`
- [ ] No orphaned imports after file renames
- [ ] All git mv/rename operations completed

### Phase 2: References Cleanup
- [ ] No remaining `Acquit.ai` (case-sensitive) in source code
- [ ] No remaining `acquit_platform` in Python imports
- [ ] No remaining `X-Acquit-Token` in headers
- [ ] No remaining `ACQUIT_` env var prefixes in code
- [ ] No remaining `acquit.ai` domain references (except in comments/docs noting old domain)
- [ ] No remaining `contact@acquit.ai` email addresses

**Validation command:**
```bash
git grep -i "Acquit\.ai\|acquit_platform\|X-Acquit-Token\|ACQUIT_" \
  -- ':!node_modules' ':!dist' ':!.git' ':!.venv' ':!acquit.venv' \
  | grep -v "was previously" | wc -l
# Should return: 0
```

### Phase 3: Configuration Integrity
- [ ] `package.json` name updated
- [ ] `.env.example` has `CHAIN_OF_COMMAND_*` env vars
- [ ] `docker-compose.yml` references updated (if exists)
- [ ] `Dockerfile` comments/labels updated
- [ ] GitHub Actions workflows reference correct env vars

### Phase 4: Database Integrity
- [ ] SQL schema name is `chain_of_command`, not `acquit`
- [ ] Table names use `chain_of_command_` prefix
- [ ] Migration scripts reference new schema
- [ ] Supabase RLS policies updated if they reference schema name

**Validation command (if using Supabase):**
```bash
grep -r "schema.*acquit\|table.*acquit" supabase/ || echo "✓ No old schema refs"
```

### Phase 5: Web/UI Integrity
- [ ] HTML mockup titles updated to "Chain of Command"
- [ ] Logo/icon references pointing to correct assets
- [ ] Meta tags in `index.html` and `layout.tsx` updated
- [ ] CSS classes/IDs with "acquit" in name updated (if any)
- [ ] Component names in `*.tsx` files updated

**Validation command:**
```bash
grep -r "acquit\|Acquit" apps/web/ --include="*.tsx" --include="*.html" \
  | grep -v node_modules | wc -l
# Should be close to 0 (only in comments about history is OK)
```

### Phase 6: Testing
- [ ] Unit tests pass: `npm run test`
- [ ] API health check responds: `curl http://localhost:3001/api/health`
- [ ] Web app loads without console errors
- [ ] Authentication headers use new token name
- [ ] Agent configs load without errors

### Phase 7: Documentation
- [ ] README.md updated with new project name
- [ ] CONTRIBUTING.md references updated
- [ ] API documentation updated
- [ ] Architecture diagrams reference "Chain of Command"
- [ ] Example env files updated

---

## PART 5: SAFE EXECUTION STEPS

### Step 0: Backup (Already Done ✓)
```bash
git tag v-pre-rename-$(date +%Y%m%d-%H%M%S)
git log --oneline -n 1  # Verify checkpoint
```

### Step 1: HTML Mockups (170 files)
```bash
# Replace in all HTML files under mockups
find apps/web/components/mockups -name "*.html" -type f \
  -exec sed -i \
    -e 's/Acquit\.ai/Chain of Command/g' \
    -e 's/ACQUIT\.AI/CHAIN OF COMMAND/g' \
    -e 's/acquit\.ai/chainofcommand\.ai/g' \
    {} +

# Verify
git diff apps/web/components/mockups/ | head -50
```

### Step 2: System Instructions & Documentation
```bash
# Update markdown and system instruction headers
find . -name "*.md" -o -name "GEMINI.md" -o -name "AGENTS.md" | while read file; do
  sed -i \
    -e 's/# ACQUIT\.AI/# CHAIN OF COMMAND/g' \
    -e 's/Acquit\.ai/Chain of Command/g' \
    -e 's/Acquit Legal OS/Chain of Command/g' \
    "$file"
done

git diff AGENTS.md GEMINI.md | head -30
```

### Step 3: TypeScript/JavaScript Components
```bash
# Update component names (be careful with regex)
find apps/ -name "*.tsx" -o -name "*.ts" | while read file; do
  sed -i \
    -e 's/Acquit\.ai/Chain of Command/g' \
    -e 's/acquit_platform/chain_of_command_platform/g' \
    -e 's/X-Acquit-Token/X-ChainOfCommand-Token/g' \
    -e 's/contact@acquit\.ai/contact@chainofcommand.ai/g' \
    -e 's|https://acquit\.ai|https://chainofcommand.ai|g' \
    "$file"
done

git diff apps/api/src/routes/courtlistener.ts
```

### Step 4: Python Files
```bash
# Update Python namespaces and headers
find . -name "*.py" -type f ! -path "./.git/*" ! -path "./node_modules/*" | while read file; do
  sed -i \
    -e 's/acquit_platform/chain_of_command_platform/g' \
    -e 's/ACQUIT_/CHAIN_OF_COMMAND_/g' \
    -e 's/Acquit\.ai/Chain of Command/g' \
    "$file"
done

git diff apps/api/src/ai/runtime.ts
```

### Step 5: Configuration Files
```bash
# Update package.json, env files, etc.
sed -i 's/"name": "acquit"/"name": "chain-of-command"/' package.json
sed -i 's/ACQUIT_/CHAIN_OF_COMMAND_/g' .env.example
sed -i 's/Acquit\.ai/Chain of Command/g' Dockerfile

git diff package.json .env.example Dockerfile
```

### Step 6: Folder/File Renames (Already Done ✓)
```bash
# Verify completed renames
ls -la | grep chain-of-command
# Should show:
#   chain_of_command_platform.py
#   chain-of-command-agentic-system-architecture.py
#   chain-of-command-platform/
```

### Step 7: Validation Run
```bash
echo "=== Syntax Check ===" 
npm run typecheck 2>&1 | head -20
echo ""
echo "=== Remaining old refs ===" 
git grep -i "Acquit\.ai\|acquit_platform\|X-Acquit-Token" -- ':!node_modules' ':!dist' | wc -l
echo ""
echo "=== Git status ===" 
git status --short | wc -l
```

### Step 8: Commit
```bash
git add -A
git commit -m "chore: complete rename Acquit.ai → Chain of Command

- Updated 170+ branding references across docs, source, and mockups
- Renamed Python platform files: acquit_platform → chain_of_command_platform
- Updated authentication header: X-Acquit-Token → X-ChainOfCommand-Token
- Updated env var prefixes: ACQUIT_ → CHAIN_OF_COMMAND_
- Updated all 46 HTML mockup screens
- Updated agent configs and system instructions
- Validated: 0 remaining old references in codebase
- Preserved git history with pre-rename checkpoint tag"

git log --oneline -n 2
```

### Step 9: Push
```bash
git push origin chore/rename-chain-of-command
```

---

## PART 6: ROLLBACK PLAN (If Needed)

**If validation fails:**
```bash
# Abort current work
git reset --hard HEAD~1

# Return to checkpoint
git log --oneline | grep "v-pre-rename"
# (Tag is available as fallback)

# Reset to tag if needed
git reset --hard v-pre-rename-20260930-180928
```

---

## Summary

**Scope:**
- 170+ files with reference updates
- 4 directory/file renames (completed)
- 46 HTML mockup screens
- 12+ TypeScript/Python source files
- 8+ configuration files

**Risk Level:** LOW (branding) → HIGH (auth headers, env vars)

**Estimated Time:** 15 minutes (automated) + 10 minutes (validation)

**Next Steps:**
1. Run Steps 1–5 above in order
2. Run Step 7 validation
3. Review git diff before commit
4. Execute Step 8–9

