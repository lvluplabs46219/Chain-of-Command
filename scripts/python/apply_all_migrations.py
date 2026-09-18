#!/usr/bin/env python3
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_TARGET = os.path.join(SCRIPT_DIR, "..", "apply_all_migrations.py")

if os.path.exists(PARENT_TARGET):
    sys.argv[0] = PARENT_TARGET
    with open(PARENT_TARGET, "r", encoding="utf-8") as f:
        code = f.read()
    exec(compile(code, PARENT_TARGET, "exec"), {"__name__": "__main__", "__file__": PARENT_TARGET})
else:
    print(f"[-] Could not find {PARENT_TARGET}")
    sys.exit(1)
