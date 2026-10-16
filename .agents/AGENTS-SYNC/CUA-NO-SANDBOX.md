# Computer Use Agent (CUA) - No Sandbox Mode Setup

## Overview

This guide explains how to configure and run Computer Use Agent 2 (CUA2) **without sandbox isolation**, allowing direct system access for full control over your environment.

## Why No Sandbox?

By default, CUA2 uses E2B sandboxes for security isolation. However, you may want to disable the sandbox for:
- **Full system access**: Direct control over your local files and processes
- **No E2B dependency**: Don't need E2B API key or sandbox infrastructure
- **Faster execution**: No sandbox creation overhead
- **Local development**: Testing and debugging without sandbox constraints

## Configuration

### Environment Variables

Create or modify the `.env` file in `cua2-core/src/cua2_core/.env`:

```bash
# Required


# Sandbox Configuration - DISABLE SANDBOX
SANDBOX_ENABLED=false
MAX_SANDBOXES=1

# Server Configuration
HOST=0.0.0.0
PORT=8001
DEBUG=true
LOG_LEVEL=DEBUG

# Agent Configuration
AGENT_TIMEOUT=300
MAX_CONCURRENT_TASKS=10
```

### Key Settings

| Variable | Value | Description |
|----------|-------|-------------|
| `SANDBOX_ENABLED` | `false` | **Critical**: Disables sandbox isolation |
| `MAX_SANDBOXES` | `1` | Minimum value (not used when sandbox disabled) |
| `E2B_API_KEY` | Not required | Can be omitted when sandbox is disabled |
| `HF_TOKEN` | Required | Your Hugging Face API token |
| `LOG_LEVEL` | `DEBUG` | Verbose logging for debugging |
| `PORT` | `8001` | Port for the CUA server |

## Installation

### 1. Install Dependencies (No Sandbox)

Use the special requirements file without e2b-desktop:

```bash
# Navigate to cua2-core
cd /home/andrew/Development/Tools/AI/Engines/computer-use-agent/cua2-core

# Install without sandbox dependencies
pip install -r requirements_no_sandbox.txt
```

### 2. Install with uv (Recommended)

```bash
# Install uv if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add uv to PATH
export PATH="$HOME/.local/bin:$PATH"

# Install dependencies with uv
uv pip install -r requirements_no_sandbox.txt
```

### 3. Or Install from pyproject.toml (Modified)

If you want to modify the pyproject.toml to remove e2b-desktop:

```toml
# Remove this line from dependencies:
# e2b-desktop==2.1.0

dependencies = [
    "fastapi>=0.115.13",
    "uvicorn[standard]>=0.29.0,<0.30.0",
    # ... other dependencies
    # e2b-desktop removed
    "huggingface_hub==1.1.2",
]
```

## Running CUA Without Sandbox

### Method 1: Using the Run Script

```bash
# Navigate to cua2-core
cd /home/andrew/Development/Tools/AI/Engines/computer-use-agent/cua2-core

# Make executable
chmod +x run_no_sandbox.sh

# Run with no sandbox
./run_no_sandbox.sh
```

### Method 2: Direct uvicorn Command

```bash
# Set environment variables
export SANDBOX_ENABLED=false
export HF_TOKEN=your_token_here

# Run the server
uv run uvicorn cua2_core.app:app --host 0.0.0.0 --port 8001 --reload
```

### Method 3: Using Python Module

```bash
# Set environment variables
export SANDBOX_ENABLED=false
export HF_TOKEN=your_token_here

# Run with Python
python -m uvicorn cua2_core.app:app --host 0.0.0.0 --port 8001 --reload
```

## Verification

### Check Sandbox Status

When CUA starts, you should see:

```
Initializing services...
Sandbox feature: DISABLED
Services initialized successfully
```

### Test Direct System Access

Once running, test that the agent can access your system directly:

```bash
# In another terminal, use curl to send a command
curl -X POST http://localhost:8001/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la /home/andrew"}'
```

If configured correctly, you should see the output of the command without any sandbox isolation.

## Agent Sync Integration

The CUA agent is integrated into the Agent Synchronization System:

```json
{
  "cua": {
    "type": "computer-use-agent",
    "config_path": "/home/andrew/Development/Tools/AI/Engines/computer-use-agent/cua2-core/src/cua2_core/.env",
    "root_path": "/home/andrew/Development/Tools/AI/Engines/computer-use-agent/cua2-core",
    "status": "active",
    "sandbox_enabled": false,
    "no_sandbox": true,
    "direct_system_access": true,
    "port": 8001,
    "host": "0.0.0.0"
  }
}
```

### Agent Sync Commands

```bash
# Show CUA status
cd /home/andrew/Development/Repos/Aquit-Platform
python .agents/sync_agents.py status

# Validate CUA configuration
python .agents/sync_agents.py validate

# Create backup of CUA config
python .agents/sync_agents.py backup
```

## Security Considerations

### ⚠️ IMPORTANT WARNINGS

Running CUA **without sandbox** means:

1. **Full system access**: The agent can execute any command with your user's permissions
2. **No isolation**: Any issues in the agent code can affect your entire system
3. **Network exposure**: If you expose the API, remote users could potentially execute arbitrary code
4. **Token security**: Your HF_TOKEN and any other API keys are accessible to the agent

### Recommended Security Measures

1. **Run in a dedicated user account** with limited permissions
2. **Use a firewall** to restrict access to the CUA port (8001)
3. **Only run on localhost** unless you have proper authentication
4. **Regularly audit** the commands being executed
5. **Use HTTPS** if accessing remotely
6. **Rate limiting** to prevent abuse
7. **Monitor logs** for suspicious activity

### Secure Configuration Example

```bash
# Run on localhost only (not 0.0.0.0)
HOST=127.0.0.1
PORT=8001

# Add authentication middleware
# (You'll need to implement this in your FastAPI app)
```

## Troubleshooting

### Common Issues

#### 1. "E2B_API_KEY is not set"

Even though sandbox is disabled, the code might check for E2B_API_KEY. 

**Solution**: Either set a dummy value or modify the validation in `sandbox_service.py`.

#### 2. "Sandbox feature is enabled"

**Solution**: Ensure `SANDBOX_ENABLED=false` is set **before** importing any CUA modules:

```bash
# Correct order
export SANDBOX_ENABLED=false
python -m cua2_core.app

# Wrong order (won't work)
python -m cua2_core.app  # Imports happen before env is set
```

#### 3. Port already in use

**Solution**: Change the PORT in your .env file or kill the existing process:

```bash
# Find and kill process on port 8001
lsof -i :8001
kill -9 <PID>
```

#### 4. Missing dependencies

**Solution**: Install all dependencies:

```bash
pip install -r requirements_no_sandbox.txt
```

### Debug Mode

Enable debug mode for more information:

```bash
export LOG_LEVEL=DEBUG
export DEBUG=true
```

## Performance Optimization

### Memory Usage

Without sandbox, CUA uses less memory since no sandbox processes are created.

### Startup Time

No sandbox means faster startup (no sandbox initialization).

### Concurrent Tasks

Increase `MAX_CONCURRENT_TASKS` in .env for better throughput:

```bash
MAX_CONCURRENT_TASKS=20
```

## Advanced Configuration

### Custom Sandbox Service

If you want to create a custom sandbox service (not using E2B), modify `sandbox_service.py`:

```python
# In sandbox_service.py, modify the _create_and_setup_sandbox method
# to use your own sandbox implementation
```

### Direct Command Execution

The agent can execute commands directly on your system. You can extend the functionality by:

1. Adding custom command handlers
2. Implementing pre-execution validation
3. Adding logging for all executed commands

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | List all agents |
| `/api/agents/execute` | POST | Execute a command |
| `/api/agents/tasks` | GET | List tasks |
| `/api/agents/{agent_id}` | GET | Get agent details |
| `/ws` | WebSocket | Real-time agent interaction |

### Example: Execute Command

```bash
curl -X POST http://localhost:8001/api/agents/execute \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "default",
    "command": "echo Hello, World!",
    "timeout": 30
  }'
```

### Example: List Agents

```bash
curl http://localhost:8001/api/agents
```

## Integration with Other Agents

CUA can work alongside:
- **Vibe/Mistral**: Use CUA for system tasks, Vibe for AI reasoning
- **Genspark**: Use Genspark for code generation, CUA for execution
- **Google**: Use Google services via MCP through Vibe
- **Supabase**: Use CUA to manage Supabase infrastructure

## Files Created

1. `.env` - Environment configuration with no sandbox
2. `run_no_sandbox.sh` - Run script for no sandbox mode
3. `requirements_no_sandbox.txt` - Dependencies without e2b-desktop
4. `agents-sync.json` - Updated with CUA configuration

## Maintenance

### Updating CUA

```bash
# Pull latest changes
cd /home/andrew/Development/Tools/AI/Engines/computer-use-agent/cua2-core
git pull origin main

# Reinstall dependencies
pip install -r requirements_no_sandbox.txt --upgrade

# Restart the server
./run_no_sandbox.sh
```

### Monitoring

Check the logs for any issues:

```bash
# View real-time logs
tail -f /tmp/cua.log

# Check running processes
ps aux | grep cua2_core
```

## References

- [CUA2 GitHub](https://github.com/huggingface/CUA2)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Uvicorn Documentation](https://www.uvicorn.org/)
- [E2B Documentation](https://e2b.dev/) (not used in no-sandbox mode)
- [Hugging Face Hub](https://huggingface.co/)

## Support

For issues with CUA in no-sandbox mode:
1. Check the logs
2. Verify environment variables
3. Test with a simple command
4. Check for Python errors
5. Review the configuration files

## License

This configuration is provided as-is. CUA2 is licensed under the MIT License.
