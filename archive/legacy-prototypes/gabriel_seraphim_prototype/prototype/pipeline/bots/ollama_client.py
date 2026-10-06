"""Shared Ollama client for Gabriel & Seraphim agents."""
from __future__ import annotations
import json, socket, urllib.request, urllib.error
from typing import Any, Dict

OLLAMA_BASE = "http://localhost:11434"
GABRIEL_MODEL = "llama3.2:latest"
SERAPHIM_MODEL = "llama3.2:latest"

def chat(model: str, system: str, user: str, temperature: float = 0.1, timeout: int = 30) -> str:
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "stream": False,
        "options": {"temperature": temperature, "num_predict": 1024},
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{OLLAMA_BASE}/api/chat",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    old_timeout = socket.getdefaulttimeout()
    socket.setdefaulttimeout(timeout)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            body = json.loads(resp.read().decode("utf-8"))
            return body.get("message", {}).get("content", "")
    except Exception as e:
        raise RuntimeError(f"Ollama call failed: {e}") from e
    finally:
        socket.setdefaulttimeout(old_timeout)

def chat_json(model: str, system: str, user: str, temperature: float = 0.1, timeout: int = 30) -> Dict[str, Any]:
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
        return json.loads(text[start:end+1])
    except json.JSONDecodeError:
        return {"_raw": raw, "_parse_error": "invalid JSON"}
