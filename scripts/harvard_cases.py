#!/usr/bin/env python3
"""
Acquit.ai - Harvard LIL Caselaw Access Project Ingestion Forwarder
Redirects to scripts/python/harvard_cases.py
"""
import os
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
TARGET = os.path.join(SCRIPT_DIR, "python", "harvard_cases.py")

if not os.path.exists(TARGET):
    print(f"[-] Error: Could not locate {TARGET}")
    sys.exit(1)

# Execute target script preserving environment and arguments
sys.argv[0] = TARGET
with open(TARGET, "r", encoding="utf-8") as f:
    code = f.read()

exec(compile(code, TARGET, "exec"), {"__name__": "__main__", "__file__": TARGET})
