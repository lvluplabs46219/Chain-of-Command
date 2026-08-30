# How to Start CUA (Computer Use Agent) - No Sandbox Mode

## Quick Start (3 commands):

# 1. Navigate to CUA directory
```bash
cd /home/andrew/Development/Tools/AI/Engines/computer-use-agent/cua2-core
```

# 2. Install dependencies (no sandbox)
```bash
pip install -r requirements_no_sandbox.txt
```

# 3. Start CUA
```bash
./run_no_sandbox.sh
```

### Expected Output:
```
==========================================
Computer Use Agent 2 - No Sandbox Mode
==========================================

Current directory: /home/andrew/Development/Tools/AI/Engines/computer-use-agent/cua2-core

Checking Python...
Using Python: python3

Checking uv...
uv found

Installing dependencies...

Environment Variables:
  SANDBOX_ENABLED=false
  MAX_SANDBOXES=1
  LOG_LEVEL=DEBUG
  HOST=0.0.0.0
  PORT=8001

HF_TOKEN: hf_RkYXbqh...

Starting CUA with no sandbox...
Press Ctrl+C to stop

Initializing services...
Sandbox feature: DISABLED    <-- ✅ THIS CONFIRMS NO SANDBOX
Services initialized successfully
INFO:     Started server process [12345]
INFO:     Uvicorn running on http://0.0.0.0:8001 (Press CTRL+C to quit)
```

## Alternative Methods:

### Method 2 - Direct uvicorn:

```bash
cd /home/andrew/Development/Tools/AI/Engines/computer-use-agent/cua2-core
export SANDBOX_ENABLED=false
export HF_TOKEN=hf_RkYXbqhpzuACGnLGMBJYQeTBKvdPwJxXkSVW
uv run uvicorn cua2_core.app:app --host 0.0.0.0 --port 8001 --reload
```

### Method 3 - Python module:

```bash
cd /home/andrew/Development/Tools/AI/Engines/computer-use-agent/cua2-core
export SANDBOX_ENABLED=false
export HF_TOKEN=hf_RkYXbqhpzuACGnLGMBJYQeTBKvdPwJxXkSVW
python -m uvicorn cua2_core.app:app --host 0.0.0.0 --port 8001 --reload
```

## Verify It's Working:

In a new terminal, test CUA is running:

# Check if server is responding
```bash
curl http://localhost:8001/api/agents
```

# Test command execution (replace with your command)
```bash
curl -X POST http://localhost:8001/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "echo CUA is working!"}'
```
Expected response: CUA is working!

## Troubleshooting:

| Issue | Solution |
|-------|----------|
| Port 8001 in use | `lsof -i :8001` then `kill -9 <PID>` |
| Missing dependencies | `pip install -r requirements_no_sandbox.txt` |
| HF_TOKEN not set | Already configured in .env file |
| Module not found | `pip install <missing-package>` |

## ⚠️ Important Security Note:

CUA is running with no sandbox = full system access. The server on port 8001 can execute any command as your user. Do not expose this port to the internet unless you add authentication. Run on 127.0.0.1 instead of 0.0.0.0 for local-only access.
