"""Shared LLM client for Gabriel & Seraphim agents.

Backends (pick with LLM_BACKEND or auto):
  - lemonade  → OpenAI-compatible http://localhost:13305/api/v1/chat/completions
  - ollama    → native http://localhost:11434/api/chat

Env overrides:
  LLM_BACKEND          lemonade | ollama | auto (default: auto → lemonade if up)
  LEMONADE_BASE        default http://localhost:13305/api/v1
  LEMONADE_API_KEY     default lemonade
  GABRIEL_MODEL        Lemonade/Ollama model id for Gabriel
  SERAPHIM_MODEL       Lemonade/Ollama model id for Seraphim
  OLLAMA_BASE          default http://localhost:11434
"""
from __future__ import annotations

import json
import os
import socket
import urllib.error
import urllib.request
from typing import Any, Dict

OLLAMA_BASE = os.environ.get("OLLAMA_BASE", "http://localhost:11434").rstrip("/")
LEMONADE_BASE = os.environ.get("LEMONADE_BASE", "http://localhost:13305/api/v1").rstrip("/")
LEMONADE_API_KEY = os.environ.get("LEMONADE_API_KEY", "lemonade")

# Prefer hybrid router / solid chat models already on your Lemonade server
GABRIEL_MODEL = os.environ.get("GABRIEL_MODEL", "user.MyHybridRouter")
SERAPHIM_MODEL = os.environ.get("SERAPHIM_MODEL", "user.MyHybridRouter")

# Native Ollama fallbacks if backend=ollama
GABRIEL_OLLAMA_MODEL = os.environ.get("GABRIEL_OLLAMA_MODEL", "llama3.2:latest")
SERAPHIM_OLLAMA_MODEL = os.environ.get("SERAPHIM_OLLAMA_MODEL", "llama3.2:latest")


def _probe(url: str, timeout: float = 1.5) -> bool:
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return 200 <= r.status < 500
    except Exception:
        return False


def resolve_backend() -> str:
    choice = (os.environ.get("LLM_BACKEND") or "auto").strip().lower()
    if choice in ("lemonade", "ollama"):
        return choice
    # auto: prefer Lemonade if models endpoint answers
    if _probe(f"{LEMONADE_BASE}/models") or _probe("http://localhost:13305/api/v1/models"):
        return "lemonade"
    if _probe(f"{OLLAMA_BASE}/api/tags"):
        return "ollama"
    return "lemonade"  # still try lemonade; callers get a clear error


def _post_json(url: str, payload: dict, headers: dict | None = None, timeout: int = 60) -> dict:
    data = json.dumps(payload).encode("utf-8")
    hdrs = {"Content-Type": "application/json"}
    if headers:
        hdrs.update(headers)
    req = urllib.request.Request(url, data=data, headers=hdrs, method="POST")
    old = socket.getdefaulttimeout()
    socket.setdefaulttimeout(timeout)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")[:500]
        raise RuntimeError(f"HTTP {e.code} from {url}: {body}") from e
    except Exception as e:
        raise RuntimeError(f"Request failed ({url}): {e}") from e
    finally:
        socket.setdefaulttimeout(old)


def chat(model: str, system: str, user: str, temperature: float = 0.1, timeout: int = 60) -> str:
    backend = resolve_backend()
    if backend == "lemonade":
        # Map bare ollama names if someone left defaults from old scripts
        mid = model
        if mid in ("llama3.2:latest", "llama3.2") and GABRIEL_MODEL.startswith("user."):
            mid = GABRIEL_MODEL
        body = _post_json(
            f"{LEMONADE_BASE}/chat/completions",
            {
                "model": mid,
                "messages": [
                    {"role": "system", "content": system},
                    {"role": "user", "content": user},
                ],
                "temperature": temperature,
                "stream": False,
            },
            headers={"Authorization": f"Bearer {LEMONADE_API_KEY}"},
            timeout=timeout,
        )
        choices = body.get("choices") or []
        if not choices:
            raise RuntimeError(f"Lemonade returned no choices: {body!r}"[:400])
        return (choices[0].get("message") or {}).get("content") or ""

    # ollama native
    ollama_model = model
    if model.startswith("user.") or model.startswith("ollama."):
        ollama_model = GABRIEL_OLLAMA_MODEL
    body = _post_json(
        f"{OLLAMA_BASE}/api/chat",
        {
            "model": ollama_model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "stream": False,
            "options": {"temperature": temperature, "num_predict": 1024},
        },
        timeout=timeout,
    )
    return body.get("message", {}).get("content", "")


def chat_json(
    model: str, system: str, user: str, temperature: float = 0.1, timeout: int = 60
) -> Dict[str, Any]:
    raw = chat(model, system, user, temperature=temperature, timeout=timeout)
    text = raw.strip()
    if "```" in text:
        parts = text.split("```")
        for i, part in enumerate(parts):
            if part.strip().startswith("json"):
                text = part.strip()[4:].strip()
                break
            elif i > 0 and part.strip().startswith("{"):
                text = part.strip()
                break
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        return {"_raw": raw, "_parse_error": "no JSON object found"}
    try:
        return json.loads(text[start : end + 1])
    except json.JSONDecodeError:
        return {"_raw": raw, "_parse_error": "invalid JSON"}
