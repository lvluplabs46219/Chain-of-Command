#!/usr/bin/env python3
"""
Rename branding strings from "Chain of Command" / "Chain of Command" to "Chain of Command".
Usage:
  python rename_brand.py --dry-run
  python rename_brand.py --apply
"""

import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
TEXT_EXTS = {
    ".md", ".mdx", ".txt", ".json", ".js", ".jsx", ".ts", ".tsx",
    ".html", ".css", ".py", ".sql", ".yml", ".yaml", ".env",
    ".dockerfile", ".toml", ".xml", ".svg"
}

# Strings to replace in content
REPLACEMENTS = [
    ("Chain of Command", "Chain of Command"),
    ("Chain of Command —", "Chain of Command —"),
    ("Chain of Command API", "Chain of Command API"),
    ("Chain of Command — Legal", "Chain of Command — Legal"),
    ("Chain of Command", "Chain of Command"),
    ("Chain of Command", "Chain of Command"),
    ("CHAIN OF COMMAND", "CHAIN OF COMMAND"),
    ("CHAIN OF COMMAND", "CHAIN OF COMMAND"),
]

def is_text_file(path: Path) -> bool:
    return path.suffix.lower() in TEXT_EXTS or path.name.lower() in {"dockerfile", "makefile"}

def is_binary_file(path: Path) -> bool:
    try:
        with path.open("rb") as f:
            chunk = f.read(1024)
        if b"\0" in chunk:
            return True
    except Exception:
        return True
    return False

def replace_in_text(text: str) -> str:
    out = text
    for old, new in REPLACEMENTS:
        out = out.replace(old, new)
    return out

def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if ".git" in parts:
        return True
    if "node_modules" in parts:
        return True
    if ".venv" in parts or "venv" in parts:
        return True
    if "dist" in parts or "build" in parts:
        return True
    if ".next" in parts:
        return True
    return False

def process_file(path: Path, apply: bool) -> bool:
    if not path.is_file():
        return False
    if should_skip(path):
        return False
    if not is_text_file(path):
        return False
    if is_binary_file(path):
        return False

    try:
        original = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        try:
            original = path.read_text(encoding="latin-1")
        except Exception:
            return False

    updated = replace_in_text(original)
    if updated == original:
        return False

    if apply:
        path.write_text(updated, encoding="utf-8")
        print(f"UPDATED {path}")
    else:
        print(f"WOULD UPDATE {path}")
    return True

def main():
    apply = "--apply" in sys.argv
    dry_run = "--dry-run" in sys.argv or not apply

    changed = 0

    for path in ROOT.rglob("*"):
        if path.is_dir():
            continue
        if process_file(path, apply):
            changed += 1

    print(f"\nDone. {'Applied changes to' if apply else 'Would update'} {changed} files.")

if __name__ == "__main__":
    main()
