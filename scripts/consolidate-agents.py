#!/usr/bin/env python3
"""
Consolidate and debug all agent files from scattered locations into a unified structure.

Discovers agents from:
  - .github/agents/
  - .agents/
  - .Agents/
  - agent/
  - chain-of-command-platform/agents/
  - packages/agents/

Organizes into: agents/
  ├── core/
  │   ├── orchestrator.md
  │   ├── base-agent.md
  │   └── agent-interface.md
  ├── specialized/
  │   ├── code-reviewer.md
  │   ├── qa-engineer.md
  │   └── ...
  ├── system/
  │   ├── security-auditor.md
  │   └── devops-specialist.md
  └── index.md (manifest)

Usage:
  python scripts/consolidate-agents.py --dry-run
  python scripts/consolidate-agents.py --apply
  python scripts/consolidate-agents.py --validate
"""

import os
import sys
import json
from pathlib import Path
from typing import Dict, List, Tuple
import shutil

ROOT = Path(__file__).resolve().parent.parent
AGENT_DIRS = [
    ".github/agents",
    ".agents",
    ".Agents",
    "agent",
    "chain-of-command-platform/agents",
    "packages/agents",
]

TARGET_DIR = ROOT / "agents"
SUBDIR_MAPPING = {
    "core": ["base", "interface", "orchestrator", "framework"],
    "specialized": ["code", "qa", "test", "architect", "reviewer", "engineer"],
    "system": ["security", "devops", "audit", "ci-cd"],
    "support": ["doc", "refactor", "specialist"],
}

def find_agent_files() -> Dict[str, Path]:
    """Scan all known locations for agent files."""
    agents = {}
    
    for agent_dir_str in AGENT_DIRS:
        agent_dir = ROOT / agent_dir_str
        if not agent_dir.exists():
            continue
        
        for fpath in agent_dir.rglob("*"):
            if fpath.is_file() and fpath.suffix in {".md", ".txt", ".json"}:
                # Use filename as key to avoid duplicates
                key = fpath.stem.lower()
                if key not in agents:
                    agents[key] = fpath
    
    return agents

def categorize_agent(filename: str) -> str:
    """Determine which subdirectory an agent belongs to."""
    name = filename.lower()
    
    for category, keywords in SUBDIR_MAPPING.items():
        if any(kw in name for kw in keywords):
            return category
    
    return "other"

def validate_agent_file(path: Path) -> Tuple[bool, List[str]]:
    """
    Validate agent file contents.
    Returns (is_valid, [warnings])
    """
    warnings = []
    
    if not path.exists():
        return False, ["File does not exist"]
    
    try:
        content = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        return False, ["File is not valid UTF-8"]
    
    if len(content.strip()) < 50:
        warnings.append("File content is suspiciously short")
    
    if path.suffix == ".md":
        if not content.strip().startswith("#"):
            warnings.append("Markdown file doesn't start with heading")
        
        if "TODO" in content or "FIXME" in content:
            warnings.append("File contains TODO/FIXME comments")
    
    # Check for old branding
    if "Acquit" in content:
        warnings.append("File still contains 'Acquit' branding (should be 'Chain of Command')")
    
    return True, warnings

def create_manifest(agents: Dict[str, Path]) -> str:
    """Generate an index/manifest of all agents."""
    categories = {}
    
    for agent_name, agent_path in sorted(agents.items()):
        category = categorize_agent(agent_name)
        if category not in categories:
            categories[category] = []
        categories[category].append(agent_name)
    
    md = "# Agent Directory\n\n"
    md += "Unified agent configuration and role definitions for Chain of Command.\n\n"
    
    for category in sorted(categories.keys()):
        md += f"## {category.capitalize()}\n\n"
        for agent in sorted(categories[category]):
            md += f"- [`{agent}.md`](./{category}/{agent}.md)\n"
        md += "\n"
    
    md += "## Organization\n\n"
    md += "- **core/**: Foundational agents (orchestrator, base interfaces)\n"
    md += "- **specialized/**: Domain-specific agents (code, QA, architecture)\n"
    md += "- **system/**: Infrastructure & compliance agents (security, DevOps)\n"
    md += "- **support/**: Documentation and refactoring support\n"
    
    return md

def consolidate_agents(dry_run: bool = True, validate: bool = True):
    """Main consolidation logic."""
    print("=" * 70)
    print("CHAIN OF COMMAND: AGENT CONSOLIDATION & DEBUG")
    print("=" * 70)
    print()
    
    # Step 1: Discover agents
    print("[1/5] Discovering agent files...")
    agents = find_agent_files()
    print(f"  Found {len(agents)} agent files")
    for name in sorted(agents.keys())[:5]:
        print(f"    - {name} @ {agents[name]}")
    if len(agents) > 5:
        print(f"    ... and {len(agents) - 5} more")
    print()
    
    # Step 2: Validate
    if validate:
        print("[2/5] Validating agent files...")
        valid_count = 0
        for agent_name, agent_path in agents.items():
            is_valid, warnings = validate_agent_file(agent_path)
            if is_valid:
                valid_count += 1
                if warnings:
                    print(f"  ⚠️  {agent_name}:")
                    for w in warnings:
                        print(f"      - {w}")
            else:
                print(f"  ❌ {agent_name}: {warnings}")
        print(f"  {valid_count}/{len(agents)} agents valid")
        print()
    else:
        print("[2/5] Skipping validation")
        print()
    
    # Step 3: Categorize
    print("[3/5] Categorizing agents...")
    categorized = {}
    for agent_name in agents:
        category = categorize_agent(agent_name)
        if category not in categorized:
            categorized[category] = []
        categorized[category].append(agent_name)
    
    for cat in sorted(categorized.keys()):
        print(f"  {cat}: {len(categorized[cat])} agents")
    print()
    
    # Step 4: Generate manifest
    print("[4/5] Generating manifest...")
    manifest = create_manifest(agents)
    manifest_path = TARGET_DIR / "index.md"
    print(f"  Would generate: {manifest_path}")
    print()
    
    # Step 5: Copy/move files
    print("[5/5] Preparing file organization...")
    if not dry_run:
        TARGET_DIR.mkdir(parents=True, exist_ok=True)
        
        # Create subdirectories
        for subdir in SUBDIR_MAPPING.keys():
            (TARGET_DIR / subdir).mkdir(parents=True, exist_ok=True)
        
        # Copy agent files
        for agent_name, agent_path in agents.items():
            category = categorize_agent(agent_name)
            target_path = TARGET_DIR / category / agent_path.name
            
            print(f"  → {agent_path.relative_to(ROOT)} → {target_path.relative_to(ROOT)}")
            shutil.copy2(agent_path, target_path)
        
        # Write manifest
        manifest_path.write_text(manifest, encoding="utf-8")
        print(f"  ✓ Wrote {manifest_path.relative_to(ROOT)}")
    else:
        print("  DRY RUN: No files copied")
        print("  Would copy agents to:")
        for subdir in SUBDIR_MAPPING.keys():
            print(f"    - agents/{subdir}/")
    
    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Found:       {len(agents)} agents")
    print(f"Categories: {len(categorized)}")
    print(f"Target:      {TARGET_DIR.relative_to(ROOT)}")
    print(f"Manifest:    {manifest_path.relative_to(ROOT)}")
    print()
    
    if dry_run:
        print("Mode: DRY RUN (use --apply to make changes)")
    else:
        print("Mode: APPLIED (changes written to disk)")

def main():
    import argparse
    parser = argparse.ArgumentParser(
        description="Consolidate and organize agent files"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview changes without modifying files"
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Apply consolidation and copy files"
    )
    parser.add_argument(
        "--validate",
        action="store_true",
        default=True,
        help="Validate agent files during consolidation"
    )
    parser.add_argument(
        "--skip-validation",
        action="store_true",
        help="Skip validation step"
    )
    
    args = parser.parse_args()
    
    if not args.apply and not args.dry_run:
        args.dry_run = True
    
    consolidate_agents(
        dry_run=not args.apply,
        validate=not args.skip_validation
    )

if __name__ == "__main__":
    main()
