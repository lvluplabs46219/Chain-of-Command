"""Gabriel-Code Agent - Ollama-powered patch generation + rule-based fallback."""
from __future__ import annotations
import os

import ast
import json
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

try:
    from .ollama_client import chat_json, GABRIEL_MODEL
    from .gabriel_rules import RULE_PATCHES
except ImportError:
    from ollama_client import chat_json, GABRIEL_MODEL
    from gabriel_rules import RULE_PATCHES


class GabrielCodeBot:
    def __init__(self, project_root: Path, use_ollama: bool = None):
        self.project_root = project_root
        self.app_file = project_root / "sample_app" / "app.py"
        self.use_ollama = (os.environ.get("USE_OLLAMA", "1") != "0") if use_ollama is None else use_ollama

    def localize(self, debug_ctx: Dict[str, Any]) -> Dict[str, Any]:
        tb = debug_ctx.get("traceback", "")
        file_line = func = None
        for line in tb.splitlines():
            if "app.py" in line:
                for p in line.strip().split(","):
                    if "line " in p:
                        try:
                            file_line = int(p.split("line ")[1].strip())
                        except ValueError:
                            pass
                    if "in " in p:
                        func = p.split("in ")[-1].strip()
                break
        return {"file": str(self.app_file), "line": file_line, "function": func, "raw_traceback": tb}

    def diagnose(self, debug_ctx: Dict[str, Any], vuln_matrix: List[Dict]) -> List[str]:
        issues: List[str] = []
        loc = self.localize(debug_ctx)
        func = (loc.get("function") or "").lower()
        tb = debug_ctx.get("traceback", "")
        test_name = debug_ctx.get("test_name", "")
        if "reverse_list" in func or "test_reverse_list" in test_name:
            issues.append("reverse_list")
        if "ZeroDivisionError" in tb or "safe_divide" in func:
            issues.append("safe_divide")
        for v in vuln_matrix:
            rid = str(v.get("rule_id", "")).lower()
            msg = str(v.get("message", "")).lower()
            if any(x in rid or x in msg for x in ("b307", "eval", "unsafe")):
                if "eval" not in issues:
                    issues.append("eval")
            if "template" in rid or "template" in msg:
                if "template" not in issues:
                    issues.append("template")
        try:
            src = self.app_file.read_text()
            tree = ast.parse(src)
            for node in ast.walk(tree):
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
                    if node.func.id == "eval" and "eval" not in issues:
                        issues.append("eval")
        except Exception:
            pass
        return issues

    def _ollama_generate_patches(self, debug_ctx, vuln_matrix) -> List[Tuple[str, str]]:
        src = self.app_file.read_text() if self.app_file.exists() else ""
        system = (
            """You are Gabriel-Code, an expert automated code-repair agent. """
            """Respond ONLY with a JSON object of the form: """
            """{"patches": [{"issue": "short_key", "diff": "unified diff string"}]}. """
            """Each diff must be a valid unified diff. Make the smallest correct change."""
        )
        user = (
            f"## DebugContext\n```json\n"
            f"{json.dumps(debug_ctx, indent=2)[:1500]}"
            f"\n```\n\n## Vulnerability Matrix\n```json\n"
            f"{json.dumps(vuln_matrix, indent=2)[:1500]}"
            f"\n```\n\n## Source (sample_app/app.py)\n```python\n"
            f"{src}"
            f"\n```\n\nProduce minimal unified-diff patches."
        )
        try:
            result = chat_json(GABRIEL_MODEL, system, user, temperature=0.1, timeout=20)
            if "_parse_error" in result:
                print("  [Gabriel/Ollama] JSON parse issue:", result.get("_parse_error"))
                return []
            patches = []
            for item in result.get("patches", []):
                key = item.get("issue") or item.get("key") or "ollama_fix"
                diff = item.get("diff") or item.get("patch") or ""
                if diff.strip():
                    patches.append((str(key), diff))
            return patches
        except Exception as e:
            print("  [Gabriel/Ollama] call failed:", e)
            return []

    def generate_patches(self, debug_ctx, vuln_matrix) -> List[Tuple[str, str]]:
        if self.use_ollama:
            print(f"  [Gabriel] Calling Ollama model={GABRIEL_MODEL} ...")
            patches = self._ollama_generate_patches(debug_ctx, vuln_matrix)
            if patches:
                print(f"  [Gabriel/Ollama] produced {len(patches)} patch(es)")
                return patches
            print("  [Gabriel] Ollama returned nothing - using rule-based fallback")
        issues = self.diagnose(debug_ctx, vuln_matrix)
        out = []
        for key in issues:
            if key in RULE_PATCHES:
                out.append((key, RULE_PATCHES[key]()))
        return out

    def generate_patch(self, debug_ctx, vuln_matrix) -> Optional[str]:
        patches = self.generate_patches(debug_ctx, vuln_matrix)
        return patches[0][1] if patches else None


def run_gabriel(debug_ctx_path: Path, vuln_path: Path, project_root: Path) -> Optional[str]:
    bot = GabrielCodeBot(project_root)
    debug_ctx = json.loads(debug_ctx_path.read_text()) if debug_ctx_path.exists() else {}
    vulns = json.loads(vuln_path.read_text()) if vuln_path.exists() else []
    return bot.generate_patch(debug_ctx, vulns)
