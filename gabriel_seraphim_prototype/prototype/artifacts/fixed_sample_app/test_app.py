"""Tests for sample_app. Some will fail intentionally."""

import pytest
from app import (
    compute_sum,
    process_user_input,
    render_template,
    reverse_list,
    safe_divide,
)


def test_reverse_list_basic():
    assert reverse_list([1, 2, 3]) == [3, 2, 1]


def test_reverse_list_empty():
    assert reverse_list([]) == []


def test_reverse_list_single():
    assert reverse_list([42]) == [42]


def test_safe_divide_normal():
    assert safe_divide(10, 2) == 5.0


def test_safe_divide_zero():
    # Current buggy code raises ZeroDivisionError.
    # After Gabriel's patch it will raise ValueError instead.
    with pytest.raises(ZeroDivisionError):
        safe_divide(10, 0)


def test_process_user_input_safe():
    # This exercises the eval path (flagged by SAST / Seraphim)
    assert process_user_input("1 + 1") == "2"


def test_render_template():
    out = render_template("Hi {{user}}", {"user": "Alice"})
    assert out == "Hi Alice"


def test_compute_sum():
    assert compute_sum([1, 2, 3]) == 6
