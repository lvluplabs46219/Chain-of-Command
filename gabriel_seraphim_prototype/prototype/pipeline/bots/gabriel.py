"""Gabriel-Code Bot – minimal prototype.

Localizes failures from DebugContext, inspects AST, and generates
simple Git-style patches for known bug patterns.
"""

from __future__ import annotations

import ast
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional


class GabrielCodeBot:
    def __init__(self, project_root: Path):
        self.project_root = project_root
        self.app_file = project_root / "sample_app" / "app.py"

    def localize(self, debug_ctx: Dict[str, Any]) -> Dict[str, Any]:
        """Extract file + line + function from a DebugContext payload."""
        traceback = debug_ctx.get("traceback", "")
        file_line = None
        func = None

        for line in traceback.splitlines():
            if "sample_app/app.py" in line or "app.py" in line:
                # e.g. File ".../app.py", line 42, in safe_divide
                parts = line.strip().split(",")
                for p in parts:
                    if "line " in p:
                        try:
                            file_line = int(p.split("line ")[1].strip())
                        except ValueError:
                            pass
                    if "in " in p:
                        func = p.split("in ")[-1].strip()
                break

        return {
            "file": str(self.app_file),
            "line": file_line,
            "function": func,
            "raw_traceback": traceback,
        }

    def pull_ast_snippet(self, file_path: str, line: Optional[int], window: int = 8) -> str:
        """Return surrounding source lines (simple, not full AST dump)."""
        path = Path(file_path)
        if not path.exists():
            return ""
        lines = path.read_text().splitlines()
        if line is None:
            return "\n".join(lines[:20])
        start = max(0, line - window - 1)
        end = min(len(lines), line + window)
        snippet = []
        for i in range(start, end):
            marker = ">>>" if i + 1 == line else "   "
            snippet.append(f"{marker} {i+1:4d} | {lines[i]}")
        return "\n".join(snippet)

    def generate_patch(self, debug_ctx: Dict[str, Any], vuln_matrix: List[Dict]) -> Optional[str]:
        """
        Rule-based patch generator for the known bugs in the sample app.
        Returns a unified diff string or None if no automatic fix known.
        """
        loc = self.localize(debug_ctx)
        func = loc.get("function") or ""
        traceback = debug_ctx.get("traceback", "")
        test_name = debug_ctx.get("test_name", "")

        # --- Fix 1: reverse_list off-by-one ---
        if "reverse_list" in func or "test_reverse_list" in test_name:
            return self._patch_reverse_list()

        # --- Fix 2: safe_divide ZeroDivisionError ---
        if "ZeroDivisionError" in traceback or "safe_divide" in func:
            return self._patch_safe_divide()

        # --- Fix 3: process_user_input eval (from SAST or runtime) ---
        for v in vuln_matrix:
            if v.get("rule_id") in ("B307", "eval-used", "unsafe-eval") or "eval" in str(v).lower():
                return self._patch_remove_eval()

        # Fallback: look at AST for eval
        try:
            src = self.app_file.read_text()
            tree = ast.parse(src)
            for node in ast.walk(tree):
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "eval":
                    return self._patch_remove_eval()
        except Exception:
            pass

        return None

    def _patch_reverse_list(self) -> str:
        """Replace the broken loop with a correct slice reverse."""
        old = '''def reverse_list(items: List[int]) -> List[int]:
    """Reverse a list of integers.
    
    Intentional logic bug: off-by-one that drops the last element
    on odd-length lists in some cases, but actually a clear error.
    """
    if not items:
        return []
    # Bug: should be items[::-1] or proper reverse.
    # This creates a wrong result for demonstration.
    reversed_items = []
    for i in range(len(items) - 1, 0, -1):  # starts from len-1 down to 1, skips index 0
        reversed_items.append(items[i])
    return reversed_items'''

        new = '''def reverse_list(items: List[int]) -> List[int]:
    """Reverse a list of integers."""
    if not items:
        return []
    return items[::-1]'''

        return self._make_unified_diff("sample_app/app.py", old, new)

    def _patch_safe_divide(self) -> str:
        old = '''def safe_divide(a: float, b: float) -> float:
    """Divide a by b. Missing zero check (runtime failure)."""
    return a / b  # Bug: ZeroDivisionError possible'''

        new = '''def safe_divide(a: float, b: float) -> float:
    """Divide a by b. Raises ValueError on zero divisor."""
    if b == 0:
        raise ValueError("Cannot divide by zero")
    return a / b'''

        return self._make_unified_diff("sample_app/app.py", old, new)

    def _patch_remove_eval(self) -> str:
        old = '''def process_user_input(raw: str) -> str:
    """Process user input. Intentionally unsafe for Seraphim demo."""
    # Bug: direct eval of untrusted input (SAST / Seraphim should catch)
    result = eval(raw)
    return str(result)'''

        new = '''def process_user_input(raw: str) -> str:
    """Process user input safely (only simple arithmetic literals)."""
    # Restricted: only allow integer literals via ast
    try:
        tree = ast.parse(raw, mode="eval")
        if not isinstance(tree.body, ast.Constant) or not isinstance(tree.body.value, (int, float)):
            raise ValueError("Only numeric literals allowed")
        return str(tree.body.value)
    except Exception as e:
        raise ValueError(f"Invalid input: {e}")'''

        return self._make_unified_diff("sample_app/app.py", old, new)

    def _make_unified_diff(self, path: str, old: str, new: str) -> str:
        """Produce a minimal unified diff."""
        old_lines = old.splitlines(keepends=True)
        new_lines = new.splitlines(keepends=True)
        # Very simple diff header (not a full difflib for brevity)
        diff = [
            f"--- a/{path}\n",
            f"+++ b/{path}\n",
            f"@@ -1,{len(old_lines)} +1,{len(new_lines)} @@\n",
        ]
        for line in old_lines:
            diff.append("-" + line if line.endswith("\n") else "-" + line + "\n")
        for line in new_lines:
            diff.append("+" + line if line.endswith("\n") else "+" + line + "\n")
        return "".join(diff)


def run_gabriel(debug_ctx_path: Path, vuln_path: Path, project_root: Path) -> Optional[str]:
    bot = GabrielCodeBot(project_root)
    debug_ctx = json.loads(debug_ctx_path.read_text()) if debug_ctx_path.exists() else {}
    vulns = json.loads(vuln_path.read_text()) if vuln_path.exists() else []
    return bot.generate_patch(debug_ctx, vulns)
