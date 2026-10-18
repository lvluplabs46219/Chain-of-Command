#!/usr/bin/env python3
"""One control plane for Chain of Command agents.

  • Todo tracker (CSV)
  • Gabriel + Seraphim (host worker via Lemonade)
  • Cua Spaces agent runs (status / send)
  • Lemonade models (incl. user.MyHybridRouter)

Run:
  python3 scripts/coc_control.py              # web UI  http://127.0.0.1:8787
  python3 scripts/coc_control.py --cli status
  python3 scripts/coc_control.py --cli claim
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import subprocess
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TRACKER = ROOT / "docs" / "Chain_of_Command_Todo_Tracker.csv"
RUNS = ROOT / "docs" / "agent_runs"
HOST = os.environ.get("COC_CTRL_HOST", "127.0.0.1")
PORT = int(os.environ.get("COC_CTRL_PORT", "8787"))
LEMONADE = os.environ.get("LEMONADE_BASE", "http://127.0.0.1:13305/api/v1")
DEFAULT_MODEL = os.environ.get("GABRIEL_MODEL", "user.MyHybridRouter")
SPACE = os.environ.get("CUA_SPACE", "local:space-175eaba410")

_job_lock = threading.Lock()
_job = {"running": False, "kind": None, "log": [], "exit_code": None, "started_at": None}


def sh(cmd: list[str], timeout: int = 30) -> tuple[int, str]:
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout, cwd=str(ROOT))
        out = (p.stdout or "") + (p.stderr or "")
        return p.returncode, out.strip()
    except Exception as e:
        return 1, str(e)


def load_tasks() -> list[dict]:
    if not TRACKER.exists():
        return []
    with open(TRACKER, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def counts(tasks: list[dict]) -> dict:
    c = {"total": 0, "Not started": 0, "In progress": 0, "Done": 0, "Blocked": 0}
    for t in tasks:
        c["total"] += 1
        s = (t.get("Status") or "").strip()
        if s in c:
            c[s] += 1
    return c


def lemonade_models() -> list[str]:
    import urllib.request

    try:
        with urllib.request.urlopen(f"{LEMONADE}/models?show_all=true", timeout=5) as r:
            d = json.loads(r.read().decode())
        ms = d if isinstance(d, list) else d.get("data", [])
        return [m.get("id") for m in ms if m.get("id")]
    except Exception as e:
        return [f"(error: {e})"]


def cua_runs() -> str:
    code, out = sh(["cua", "agent", "ls", SPACE], timeout=15)
    return out or f"(exit {code})"


def list_agent_runs() -> list[dict]:
    if not RUNS.exists():
        return []
    out = []
    for d in sorted(RUNS.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        if not d.is_dir():
            continue
        entry = {"id": d.name}
        for name in ("task.json", "seraphim.json", "plan.json"):
            p = d / name
            if p.exists():
                try:
                    entry[name.replace(".json", "")] = json.loads(p.read_text())
                except Exception:
                    pass
        out.append(entry)
    return out


def start_claim(task_id: str | None = None, phase: str | None = "Phase 0") -> dict:
    with _job_lock:
        if _job["running"]:
            return {"ok": False, "error": "job already running"}
        cmd = [sys.executable, "-u", str(ROOT / "scripts" / "coc_gabriel_seraphim_worker.py")]
        if task_id:
            cmd += ["--id", task_id]
        elif phase:
            cmd += ["--phase", phase]
        env = os.environ.copy()
        env["LLM_BACKEND"] = "lemonade"
        env["LEMONADE_BASE"] = LEMONADE
        env["GABRIEL_MODEL"] = DEFAULT_MODEL
        env["SERAPHIM_MODEL"] = DEFAULT_MODEL
        env["PYTHONUNBUFFERED"] = "1"
        _job.update({"running": True, "kind": "gabriel-seraphim", "log": [], "exit_code": None, "started_at": time.time()})

    def run():
        try:
            proc = subprocess.Popen(cmd, cwd=str(ROOT), env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
            assert proc.stdout
            for line in proc.stdout:
                with _job_lock:
                    _job["log"].append(line.rstrip("\n"))
                    if len(_job["log"]) > 400:
                        _job["log"] = _job["log"][-300:]
            code = proc.wait()
            with _job_lock:
                _job["exit_code"] = code
                _job["running"] = False
                _job["log"].append(f"--- exit {code} ---")
        except Exception as e:
            with _job_lock:
                _job["running"] = False
                _job["exit_code"] = -1
                _job["log"].append(str(e))

    threading.Thread(target=run, daemon=True).start()
    return {"ok": True}


HTML = r"""<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>CoC Control</title>
<style>
:root{--bg:#0b0e13;--p:#141a22;--b:#2a3344;--t:#e8eef7;--m:#8b9bb4;--a:#5b9fd4;--ok:#3ecf8e;--bad:#e85d5d;--w:#e6b84d}
*{box-sizing:border-box}body{margin:0;font-family:system-ui,sans-serif;background:var(--bg);color:var(--t)}
header{display:flex;justify-content:space-between;align-items:center;padding:1rem 1.25rem;border-bottom:1px solid var(--b);background:#090c10}
h1{margin:0;font-size:1.1rem} .sub{color:var(--m);font-size:.85rem}
main{display:grid;grid-template-columns:1fr 1fr;gap:1rem;padding:1rem 1.25rem 2rem}
@media(max-width:900px){main{grid-template-columns:1fr}}
.card{background:var(--p);border:1px solid var(--b);border-radius:12px;padding:1rem}
.card h2{margin:0 0 .6rem;font-size:.8rem;color:var(--m);text-transform:uppercase;letter-spacing:.04em}
.span2{grid-column:1/-1}
.stats{display:flex;gap:.6rem;flex-wrap:wrap}
.stat{flex:1 1 90px;background:#0e131a;border:1px solid var(--b);border-radius:10px;padding:.6rem}
.stat .n{font-size:1.4rem;font-weight:700}.stat .l{font-size:.72rem;color:var(--m)}
button{background:var(--a);color:#061018;border:0;border-radius:8px;padding:.5rem .85rem;font-weight:600;cursor:pointer;margin:.2rem}
button.sec{background:var(--p);color:var(--t);border:1px solid var(--b)}
button:disabled{opacity:.45}
#log,pre{font-family:ui-monospace,monospace;font-size:.75rem;background:#0a0d12;border:1px solid var(--b);border-radius:8px;padding:.7rem;max-height:280px;overflow:auto;white-space:pre-wrap}
table{width:100%;border-collapse:collapse;font-size:.82rem}td,th{padding:.35rem;border-bottom:1px solid var(--b);text-align:left}
.badge{display:inline-block;padding:.1rem .4rem;border-radius:999px;font-size:.7rem;font-weight:600;background:#243044}
.badge.ip{background:#2a2450;color:#c4b8ff}.badge.done{background:#163528;color:#7dffb3}.badge.blocked{background:#3a1a1a;color:#ff9b9b}
.note{color:var(--m);font-size:.85rem;line-height:1.45}
code{background:#0e131a;padding:.1rem .35rem;border-radius:4px;font-size:.8rem}
</style></head><body>
<header>
  <div><h1>Chain of Command — Control</h1>
  <div class="sub">One place: tracker · Gabriel/Seraphim · Lemonade · Cua Spaces</div></div>
  <div>
    <button onclick="claim()">Claim next (Gabriel/Seraphim)</button>
    <button class="sec" onclick="refresh()">Refresh</button>
  </div>
</header>
<main>
  <div class="card span2 note">
    <strong>Models ≠ agents.</strong>
    <code>user.MyHybridRouter</code> is a <em>Lemonade model policy</em> that picks among Ollama cloud models.
    Your <em>agents</em> are Gabriel + Seraphim (tracker worker) and optional Hermes runs in Cua Spaces — they <em>call</em> HybridRouter (or a single model) for reasoning.
  </div>
  <div class="card span2"><h2>Tracker</h2><div class="stats" id="stats"></div></div>
  <div class="card"><h2>Tasks</h2><div style="max-height:320px;overflow:auto"><table><thead><tr><th>ID</th><th>Status</th><th>Task</th></tr></thead><tbody id="tasks"></tbody></table></div></div>
  <div class="card"><h2>Gabriel/Seraphim runs</h2><div id="runs"></div></div>
  <div class="card"><h2>Lemonade models</h2><pre id="models">…</pre></div>
  <div class="card"><h2>Cua Spaces agents</h2><pre id="cua">…</pre></div>
  <div class="card span2"><h2>Worker log</h2><div id="log">Idle.</div></div>
</main>
<script>
const badge=s=>{let c='';if((s||'').includes('progress'))c='ip';else if(s==='Done')c='done';else if(s==='Blocked')c='blocked';return `<span class="badge ${c}">${s||'?'}</span>`};
async function api(p,o){const r=await fetch(p,o);return r.json()}
async function refresh(){
  const st=await api('/api/status');
  const c=st.counts||{};
  document.getElementById('stats').innerHTML=`
    <div class="stat"><div class="n">${c.total||0}</div><div class="l">Total</div></div>
    <div class="stat"><div class="n">${c['Not started']||0}</div><div class="l">Not started</div></div>
    <div class="stat"><div class="n">${c['In progress']||0}</div><div class="l">In progress</div></div>
    <div class="stat"><div class="n">${c.Done||0}</div><div class="l">Done</div></div>
    <div class="stat"><div class="n">${c.Blocked||0}</div><div class="l">Blocked</div></div>`;
  document.getElementById('models').textContent=(st.models||[]).join('\n');
  document.getElementById('cua').textContent=st.cua||'';
  if(st.job&&st.job.log){document.getElementById('log').textContent=st.job.log.join('\n')||'Idle.';}
  const tasks=await api('/api/tasks');
  const ord={'In progress':0,'Not started':1,'Blocked':2,'Done':3};
  tasks.sort((a,b)=>(ord[a.Status]??9)-(ord[b.Status]??9));
  document.getElementById('tasks').innerHTML=tasks.slice(0,60).map(t=>`<tr><td>${t.ID}</td><td>${badge(t.Status)}</td><td>${(t.Task||'').slice(0,90)}</td></tr>`).join('');
  const runs=await api('/api/runs');
  document.getElementById('runs').innerHTML=runs.length?runs.map(r=>`<div style="margin-bottom:.4rem"><strong>${r.id}</strong> · Seraphim ${r.seraphim&&r.seraphim.clean===true?'✓':'?'}</div>`).join(''):'<span style="color:var(--m)">No host agent runs yet.</span>';
}
async function claim(){document.getElementById('log').textContent='Starting Gabriel/Seraphim…';await api('/api/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});refresh()}
refresh();setInterval(refresh,2500);
</script></body></html>
"""


class H(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        sys.stderr.write("[coc-control] " + (fmt % args) + "\n")

    def _json(self, code, obj):
        b = json.dumps(obj, default=str).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)

    def do_GET(self):
        path = self.path.split("?", 1)[0]
        if path in ("/", "/index.html"):
            body = HTML.encode()
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        if path == "/api/status":
            with _job_lock:
                job = {"running": _job["running"], "kind": _job["kind"], "exit_code": _job["exit_code"], "log": list(_job["log"][-100:])}
            return self._json(200, {"counts": counts(load_tasks()), "models": lemonade_models(), "cua": cua_runs(), "job": job, "default_model": DEFAULT_MODEL, "space": SPACE})
        if path == "/api/tasks":
            return self._json(200, load_tasks())
        if path == "/api/runs":
            return self._json(200, list_agent_runs())
        return self._json(404, {"error": "not found"})

    def do_POST(self):
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b"{}"
        try:
            body = json.loads(raw.decode() or "{}")
        except json.JSONDecodeError:
            return self._json(400, {"error": "bad json"})
        if self.path == "/api/claim":
            return self._json(200, start_claim(body.get("id"), body.get("phase", "Phase 0")))
        return self._json(404, {"error": "not found"})


def cli_status():
    c = counts(load_tasks())
    print("Tracker:", c)
    print("Default model (agents call this):", DEFAULT_MODEL)
    print("Lemonade models:")
    for m in lemonade_models():
        print(" ", m)
    print("Cua Space", SPACE)
    print(cua_runs())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--cli", choices=["status", "claim"], default=None)
    args = ap.parse_args()
    if args.cli == "status":
        return cli_status()
    if args.cli == "claim":
        print(start_claim())
        return
    RUNS.mkdir(parents=True, exist_ok=True)
    print(f"CoC Control → http://{HOST}:{PORT}")
    print(f"Agents use model: {DEFAULT_MODEL} via {LEMONADE}")
    print(f"Cua Space: {SPACE}")
    ThreadingHTTPServer((HOST, PORT), H).serve_forever()


if __name__ == "__main__":
    main()
