"""Minimal sample application with intentional bugs."""
from typing import List, Any
import ast

def process_user_input(raw: str) -> str:
    """Process user input. Intentionally unsafe for Seraphim demo."""
    # Bug: direct eval of untrusted input (SAST / Seraphim should catch)
    result = eval(raw)
    return str(result)

def reverse_list(items: List[int]) -> List[int]:
    """Reverse a list of integers.
    
    Intentional logic bug: off-by-one that drops the last element
    on odd-length lists in some cases, but actually a clear error.
    """
    if not items:
        return []
    # Bug: should be items[::-1] or proper reverse.
    # This creates a wrong result for demonstration.
    reversed_items = []
    for i in range(len(items) - 1, 0, -1):
        reversed_items.append(items[i])
    return reversed_items

def safe_divide(a: float, b: float) -> float:
    """Divide a by b. Missing zero check (runtime failure)."""
    return a / b  # Bug: ZeroDivisionError possible

def render_template(template: str, context: dict) -> str:
    """Naive template renderer. Vulnerable to injection-style issues."""
    # Bug for Seraphim: no escaping of context values
    for key, value in context.items():
        template = template.replace(f"{{{{{key}}}}}", str(value))
    return template

def compute_sum(numbers: List[Any]) -> int:
    total = 0
    for n in numbers:
        total += n
    return total
