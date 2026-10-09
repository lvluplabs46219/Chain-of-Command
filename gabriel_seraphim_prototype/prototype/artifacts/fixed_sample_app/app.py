"""Minimal sample application with intentional bugs."""
from typing import List, Any
import ast

def process_user_input(raw: str) -> str:
    """Process user input safely (only numeric literals)."""
    try:
        tree = ast.parse(raw, mode="eval")
        if not isinstance(tree.body, ast.Constant) or not isinstance(tree.body.value, (int, float)):
            raise ValueError("Only numeric literals allowed")
        return str(tree.body.value)
    except Exception as e:
        raise ValueError(f"Invalid input: {e}")

def reverse_list(items: List[int]) -> List[int]:
    """Reverse a list of integers."""
    if not items:
        return []
    return items[::-1]

def safe_divide(a: float, b: float) -> float:
    """Divide a by b. Missing zero check (runtime failure)."""
    return a / b  # Bug: ZeroDivisionError possible

def render_template(template: str, context: dict) -> str:
    """Safe template renderer – escapes context values."""
    import html
    for key, value in context.items():
        safe = html.escape(str(value))
        template = template.replace(f"{{{{{key}}}}}", safe)
    return template

def compute_sum(numbers: List[Any]) -> int:
    """Sum numbers."""
    total = 0
    for n in numbers:
        total += n
    return total
