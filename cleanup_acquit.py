import os
import shutil
import argparse
import json
from pathlib import Path

# ---------------------------------------------------------------------------
# DEFINITIONS
# ---------------------------------------------------------------------------
DIR_MAPPINGS = {
    "artifacts/mockup-sandbox": "apps/web",
    "artifacts/api-server": "apps/api",
    "lib/connectors": "packages/connectors",
    "lib/rag-engine": "packages/rag-engine",
    "lib/workflow": "packages/workflow",
    "lib/db": "packages/db",
}

DEAD_SCRIPTS = [
    "check_deps.cjs",
    "check_versions.cjs",
    "fix_filing_center.cjs",
    "fix_imports.js",
    "fix_root_pkg.cjs",
    "fix_workspace_deps.cjs",
    "update_google_workspace.cjs",
]

ARCHIVE_DIR = "scripts/archive"
PYTHON_SCRIPTS_DIR = "scripts/python"
TS_SCRIPTS_DIR = "scripts/ts"

def print_action(dry_run, msg):
    prefix = "[DRY-RUN] " if dry_run else "[EXECUTE] "
    print(f"{prefix}{msg}")

def run_cleanup(dry_run=True):
    print(f"=== Starting Repository Cleanup (Dry Run: {dry_run}) ===")

    # 1. Ensure target directories exist
    targets = ["apps", "packages", ARCHIVE_DIR, PYTHON_SCRIPTS_DIR, TS_SCRIPTS_DIR]
    for t in targets:
        if not os.path.exists(t):
            print_action(dry_run, f"Create directory: {t}")
            if not dry_run:
                os.makedirs(t, exist_ok=True)

    # 2. Move main workspace directories
    for src, dst in DIR_MAPPINGS.items():
        if os.path.exists(src):
            print_action(dry_run, f"Move {src} -> {dst}")
            if not dry_run:
                shutil.move(src, dst)
        else:
            print(f"[SKIP] Directory {src} not found.")

    # 3. Archive dead scripts
    for script in DEAD_SCRIPTS:
        if os.path.exists(script):
            dst = os.path.join(ARCHIVE_DIR, script)
            print_action(dry_run, f"Archive dead script: {script} -> {dst}")
            if not dry_run:
                shutil.move(script, dst)

    # 4. Organize remaining scripts
    if os.path.exists("scripts"):
        for item in os.listdir("scripts"):
            path = os.path.join("scripts", item)
            if os.path.isfile(path):
                if path.endswith(".py"):
                    dst = os.path.join(PYTHON_SCRIPTS_DIR, item)
                    print_action(dry_run, f"Move Python script: {path} -> {dst}")
                    if not dry_run:
                        shutil.move(path, dst)
                elif path.endswith(".ts") or path.endswith(".mjs"):
                    dst = os.path.join(TS_SCRIPTS_DIR, item)
                    print_action(dry_run, f"Move JS/TS script: {path} -> {dst}")
                    if not dry_run:
                        shutil.move(path, dst)

    # 5. Handle Database duplication (lib/db vs packages/database)
    if os.path.exists("packages/database") and (os.path.exists("packages/db") or os.path.exists("lib/db")):
        print("\n⚠️  WARNING: Duplicate Database Packages Detected!")
        print("Both 'packages/database' and 'packages/db' (formerly lib/db) exist.")
        print("Manual intervention is required to merge Drizzle schemas.")

    # 6. Update root package.json workspaces
    pkg_json_path = "package.json"
    if os.path.exists(pkg_json_path):
        print_action(dry_run, f"Update workspaces in {pkg_json_path}")
        if not dry_run:
            with open(pkg_json_path, "r") as f:
                pkg_data = json.load(f)
            
            pkg_data["workspaces"] = [
                "apps/*",
                "packages/*",
                "scripts"
            ]
            
            # Update start script if present
            if "scripts" in pkg_data:
                if "dev" in pkg_data["scripts"]:
                    pkg_data["scripts"]["dev"] = pkg_data["scripts"]["dev"].replace("artifacts/mockup-sandbox", "apps/web")
                if "start" in pkg_data["scripts"]:
                    pkg_data["scripts"]["start"] = pkg_data["scripts"]["start"].replace("artifacts/api-server", "apps/api")
            
            with open(pkg_json_path, "w") as f:
                json.dump(pkg_data, f, indent=2)

    print("=== Cleanup Complete ===")
    if dry_run:
        print("Note: This was a dry run. Run with --execute to apply changes.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Clean up Acquit.ai Repository")
    parser.add_argument("--execute", action="store_true", help="Execute the cleanup (default is dry-run)")
    args = parser.parse_args()
    
    run_cleanup(dry_run=not args.execute)
