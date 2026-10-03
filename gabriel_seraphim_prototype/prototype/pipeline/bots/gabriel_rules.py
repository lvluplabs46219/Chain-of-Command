"""Rule-based patch generators (fallback when Ollama is unavailable)."""
from __future__ import annotations

def _diff(path: str, old: str, new: str) -> str:
    ol = old.splitlines(keepends=True)
    nl = new.splitlines(keepends=True)
    d = [f"--- a/{path}\n", f"+++ b/{path}\n", f"@@ -1,{len(ol)} +1,{len(nl)} @@\n"]
    for l in ol:
        d.append("-" + (l if l.endswith("\n") else l + "\n"))
    for l in nl:
        d.append("+" + (l if l.endswith("\n") else l + "\n"))
    return "".join(d)

def patch_reverse_list() -> str:
    old = (
        "def reverse_list(items: List[int]) -> List[int]:\n"
        "    \"""Reverse a list of integers.\n"
        "    \n"
        "    Intentional logic bug: off-by-one that drops the last element\n"
        "    on odd-length lists in some cases, but actually a clear error.\n"
        "    \"""\n"
        "    if not items:\n"
        "        return []\n"
        "    # Bug: should be items[::-1] or proper reverse.\n"
        "    # This creates a wrong result for demonstration.\n"
        "    reversed_items = []\n"
        "    for i in range(len(items) - 1, 0, -1):  # starts from len-1 down to 1, skips index 0\n"
        "        reversed_items.append(items[i])\n"
        "    return reversed_items"
    )
    new = (
        "def reverse_list(items: List[int]) -> List[int]:\n"
        "    \"""Reverse a list of integers.\"""\n"
        "    if not items:\n"
        "        return []\n"
        "    return items[::-1]"
    )
    return _diff("sample_app/app.py", old, new)

def patch_safe_divide() -> str:
    old = (
        "def safe_divide(a: float, b: float) -> float:\n"
        "    \"""Divide a by b. Missing zero check (runtime failure).\"""\n"
        "    return a / b  # Bug: ZeroDivisionError possible"
    )
    new = (
        "def safe_divide(a: float, b: float) -> float:\n"
        "    \"""Divide a by b. Raises ValueError on zero divisor.\"""\n"
        "    if b == 0:\n"
        "        raise ValueError(\"Cannot divide by zero\")\n"
        "    return a / b"
    )
    return _diff("sample_app/app.py", old, new)

def patch_remove_eval() -> str:
    old = (
        "def process_user_input(raw: str) -> str:\n"
        "    \"""Process user input. Intentionally unsafe for Seraphim demo.\"""\n"
        "    # Bug: direct eval of untrusted input (SAST / Seraphim should catch)\n"
        "    result = eval(raw)\n"
        "    return str(result)"
    )
    new = (
        "def process_user_input(raw: str) -> str:\n"
        "    \"""Process user input safely (only numeric literals).\"""\n"
        "    try:\n"
        "        tree = ast.parse(raw, mode=\"eval\")\n"
        "        if not isinstance(tree.body, ast.Constant) or not isinstance(tree.body.value, (int, float)):\n"
        "            raise ValueError(\"Only numeric literals allowed\")\n"
        "        return str(tree.body.value)\n"
        "    except Exception as e:\n"
        "        raise ValueError(f\"Invalid input: {e}\")"
    )
    return _diff("sample_app/app.py", old, new)

def patch_template() -> str:
    old = (
        "def render_template(template: str, context: dict) -> str:\n"
        "    \"""Naive template renderer. Vulnerable to injection-style issues.\"""\n"
        "    # Bug for Seraphim: no escaping of context values\n"
        "    for key, value in context.items():\n"
        "        template = template.replace(f\"{{{{{key}}}}}\", str(value))\n"
        "    return template"
    )
    new = (
        "def render_template(template: str, context: dict) -> str:\n"
        "    \"""Safe template renderer - escapes context values.\"""\n"
        "    import html\n"
        "    for key, value in context.items():\n"
        "        safe = html.escape(str(value))\n"
        "        template = template.replace(f\"{{{{{key}}}}}\", safe)\n"
        "    return template"
    )
    return _diff("sample_app/app.py", old, new)

RULE_PATCHES = {
    "reverse_list": patch_reverse_list,
    "safe_divide": patch_safe_divide,
    "eval": patch_remove_eval,
    "template": patch_template,
}
