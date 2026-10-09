"""Seraphim Bot - Ollama-powered security audit + rule-based checks."""
from __future__ import annotations
import os

import ast
import re
from pathlib import Path
from typing import Any, Dict, List

try:
    from .ollama_client import chat_json, SERAPHIM_MODEL
except ImportError:
    from ollama_client import chat_json, SERAPHIM_MODEL


class SeraphimBot:
    FORBIDDEN_CALLS = {"eval", "exec", "compile", "__import__"}
    SECRET_PATTERNS = [
        re.compile(r"(?i)(api[_-]?key|secret|password|token)\s*[:=]\s*[\"\'][^\"\']{8,}"),
        re.compile(r"sk-[a-zA-Z0-9]{20,}"),
        re.compile(r"AKIA[0-9A-Z]{16}"),
    ]

    def __init__(self, project_root: Path, use_ollama: bool = None):
        self.project_root = project_root
        self.use_ollama = (os.environ.get("USE_OLLAMA", "1") != "0") if use_ollama is None else use_ollama

    def audit_source(self, file_path: Path) -> List[Dict[str, Any]]:
        findings: List[Dict[str, Any]] = []
        if not file_path.exists():
            return findings
        src = file_path.read_text()

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

        marker = "{{" + "{{"
        has_replace = marker in src and "replace" in src
        has_escape = "html.escape" in src
        if has_replace and not has_escape:
            findings.append({
                "type": "template_injection",
                "rule_id": "seraphim-template",
                "message": "Potential unescaped template substitution detected",
                "severity": "high",
            })

        return findings

    def audit_patch(self, patch: str) -> Dict[str, Any]:
        issues = []
        for line in patch.splitlines():
            if line.startswith("+") and not line.startswith("+++"):
                content = line[1:]
                if any(f in content for f in ("eval(", "exec(", "__import__(")):
                    issues.append("Patch re-introduces forbidden dynamic evaluation")
                for pat in self.SECRET_PATTERNS:
                    if pat.search(content):
                        issues.append("Patch appears to introduce a secret")

        if self.use_ollama and not issues:
            try:
                print(f"  [Seraphim] Calling Ollama model={SERAPHIM_MODEL} for patch review...")
                system = (
                    "You are Seraphim, a strict application-security auditor. "
                    "Review the proposed unified diff. Respond ONLY with JSON: "
                    '{"clean": true/false, "issues": ["list of problems"]}. '
                    "Reject patches that re-introduce eval/exec, hardcode secrets, "
                    "disable auth, or create injection vectors."
                )
                user = (
                    "## Proposed patch\n```diff\n"
                    + patch[:3000]
                    + "\n```\nIs this patch safe to apply?"
                )
                result = chat_json(SERAPHIM_MODEL, system, user, temperature=0.0, timeout=15)
                if "_parse_error" not in result:
                    if result.get("clean") is False:
                        issues.extend(result.get("issues") or ["Ollama flagged patch as unsafe"])
                    print(f"  [Seraphim/Ollama] clean={result.get('clean')}")
                else:
                    print("  [Seraphim/Ollama] could not parse response - relying on rules")
            except Exception as e:
                print(f"  [Seraphim/Ollama] failed: {e} - relying on rules")

        return {"clean": len(issues) == 0, "issues": issues}


def run_seraphim_source(project_root: Path) -> List[Dict[str, Any]]:
    bot = SeraphimBot(project_root)
    return bot.audit_source(project_root / "sample_app" / "app.py")


def run_seraphim_patch(project_root: Path, patch: str) -> Dict[str, Any]:
    bot = SeraphimBot(project_root)
    return bot.audit_patch(patch)
