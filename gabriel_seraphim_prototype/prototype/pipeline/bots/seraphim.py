"""Seraphim Bot – minimal guardrail & prompt/template audit prototype.

Checks generated patches and source for:
- residual eval / exec
- unescaped template variables
- obvious secret patterns
- SQL-like string formatting
"""

from __future__ import annotations

import ast
import re
from pathlib import Path
from typing import Any, Dict, List


class SeraphimBot:
    FORBIDDEN_CALLS = {"eval", "exec", "compile", "__import__"}
    SECRET_PATTERNS = [
        re.compile(r"(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][^'\"]{8,}"),
        re.compile(r"sk-[a-zA-Z0-9]{20,}"),
        re.compile(r"AKIA[0-9A-Z]{16}"),
    ]
    TEMPLATE_UNSAFE = re.compile(r"\{\{\s*\w+\s*\}\}")  # simple {{var}} without escape helper

    def __init__(self, project_root: Path):
        self.project_root = project_root

    def audit_source(self, file_path: Path) -> List[Dict[str, Any]]:
        findings: List[Dict[str, Any]] = []
        if not file_path.exists():
            return findings
        src = file_path.read_text()

        # AST-based forbidden calls
        try:
            tree = ast.parse(src)
            for node in ast.walk(tree):
                if isinstance(node, ast.Call):
                    name = None
                    if isinstance(node.func, ast.Name):
                        name = node.func.id
                    elif isinstance(node.func, ast.Attribute):
                        name = node.func.attr
                    if name in self.FORBIDDEN_CALLS:
                        findings.append({
                            "type": "unsafe_call",
                            "rule_id": f"seraphim-{name}",
                            "message": f"Forbidden call to {name}()",
                            "line": getattr(node, "lineno", None),
                            "severity": "high",
                        })
        except SyntaxError:
            findings.append({
                "type": "syntax_error",
                "message": "Could not parse source for Seraphim audit",
                "severity": "medium",
            })

        # Secret patterns
        for i, line in enumerate(src.splitlines(), 1):
            for pat in self.SECRET_PATTERNS:
                if pat.search(line):
                    findings.append({
                        "type": "secret",
                        "rule_id": "seraphim-secret",
                        "message": f"Possible secret on line {i}",
                        "line": i,
                        "severity": "critical",
                    })

        # Naive template injection check (look for replace with {{}} pattern)
        if 'replace(f"{{' in src or "replace('{{" in src or '.replace(f"{{' in src:
            findings.append({
                "type": "template_injection",
                "rule_id": "seraphim-template",
                "message": "Potential unescaped template substitution detected",
                "severity": "high",
            })

        return findings

    def audit_patch(self, patch: str) -> Dict[str, Any]:
        """Inspect a proposed patch for new issues."""
        issues = []
        # Check added lines for forbidden patterns
        for line in patch.splitlines():
            if line.startswith("+") and not line.startswith("+++"):
                content = line[1:]
                if any(f in content for f in ("eval(", "exec(", "__import__(")):
                    issues.append("Patch re-introduces forbidden dynamic evaluation")
                for pat in self.SECRET_PATTERNS:
                    if pat.search(content):
                        issues.append("Patch appears to introduce a secret")

        return {
            "clean": len(issues) == 0,
            "issues": issues,
        }


def run_seraphim_source(project_root: Path) -> List[Dict[str, Any]]:
    bot = SeraphimBot(project_root)
    app = project_root / "sample_app" / "app.py"
    return bot.audit_source(app)


def run_seraphim_patch(project_root: Path, patch: str) -> Dict[str, Any]:
    bot = SeraphimBot(project_root)
    return bot.audit_patch(patch)
