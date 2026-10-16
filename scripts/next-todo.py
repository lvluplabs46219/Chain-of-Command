#!/usr/bin/env python3
"""Return the next Not started task from the Chain of Command Todo Tracker."""
import csv
import sys
from pathlib import Path

TRACKER = Path(__file__).resolve().parents[1] / "docs" / "Chain_of_Command_Todo_Tracker.csv"

def main():
    phase_filter = sys.argv[1] if len(sys.argv) > 1 else None
    owner_filter = sys.argv[2] if len(sys.argv) > 2 else None

    with open(TRACKER, newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))

    for r in rows:
        if r.get("Status", "").strip() != "Not started":
            continue
        if phase_filter and r.get("Phase", "") != phase_filter:
            continue
        if owner_filter and owner_filter not in r.get("Owner", ""):
            continue
        print(f"ID:      {r['ID']}")
        print(f"Phase:   {r['Phase']}")
        print(f"Section: {r['Section']}")
        print(f"Owner:   {r['Owner']}")
        print(f"Task:    {r['Task']}")
        if r.get("Notes"):
            print(f"Notes:   {r['Notes']}")
        return

    print("No matching Not started tasks found.")

if __name__ == "__main__":
    main()
