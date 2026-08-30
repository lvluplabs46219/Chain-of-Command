# Agent Synchronization System for Aquit-Platform

This system manages and synchronizes all AI agents, configurations, and skills across the Aquit-Platform project.

## Overview

The Agent Synchronization System provides a centralized way to manage:
- **Vibe/Mistral Agents** - AI assistant with skills and MCP servers
- **Genspark Agents** - Code generation and team collaboration tools
- **Google Services** - MCP servers and Chrome extensions
- **Supabase** - Local development database and API configurations

## Configuration Files

### Primary Configuration
- `agents-sync.json` - JSON format configuration (recommended for programmatic access)
- `agents-sync.toml` - TOML format configuration (human-readable)

### Configuration Structure

```json
{
  "agents": {
    "vibe": {
      "type": "mistral",
      "config_path": "~/.vibe/config.toml",
      "status": "active",
      "skills": {...},
      "mcp_servers": [...]
    },
    "genspark": {
      "type": "genspark",
      "cli_config": "~/.genspark-tool-cli/config.json",
      "status": "active",
      "api_key": "...",
      "vscode_extension": {...}
    },
    "google": {
      "type": "google",
      "services": [...],
      "chrome_extensions": [...]
    },
    "supabase": {
      "type": "supabase",
      "config_path": "supabase/config.toml",
      "components": {...}
    }
  },
  "sync_settings": {...},
  "skills_registry": {...},
  "directories": {...}
}
```

## Usage

### Python Script

The main synchronization script is `sync_agents.py`:

```bash
# Show status of all agents
python sync_agents.py status

# List all registered agents
python sync_agents.py list

# Validate all configurations
python sync_agents.py validate

# Create backup of current configurations
python sync_agents.py backup

# Create named backup
python sync_agents.py backup my_backup_name

# List available backups
python sync_agents.py backups

# Restore from backup
python sync_agents.py restore backup_20260830_123456

# Sync all agent configurations
python sync_agents.py sync
```

### Bash Aliases (Recommended)

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
# Agent synchronization aliases
alias agents-status='python /path/to/sync_agents.py status'
alias agents-list='python /path/to/sync_agents.py list'
alias agents-validate='python /path/to/sync_agents.py validate'
alias agents-backup='python /path/to/sync_agents.py backup'
alias agents-backups='python /path/to/sync_agents.py backups'
alias agents-restore='python /path/to/sync_agents.py restore'
alias agents-sync='python /path/to/sync_agents.py sync'
```

## Agent Details

### Vibe (Mistral)
- **Type**: AI Assistant
- **Config**: `~/.vibe/config.toml`
- **Status**: Active
- **Skills**: supabase, supabase-postgres-best-practices, workflow-init
- **MCP Servers**: Google Stitch API

**Skills**:
- `supabase` - Supabase database and API management
- `supabase-postgres-best-practices` - PostgreSQL best practices
- `workflow-init` - Vercel workflow initialization

**MCP Servers**:
- Stitch API: Google services via MCP protocol

### Genspark
- **Type**: AI Code Generation
- **CLI Config**: `~/.genspark-tool-cli/config.json`
- **VSCode Extension**: genspark.genspark-1.0.0 v1.0.0
- **Status**: Active
- **Git Branch**: genspark_ai_developer
- **Features**: Code generation, team collaboration, AI assistance

**Configuration** (`~/.genspark-tool-cli/config.json`):
```json
{
  "api_key": "gsk-eyJjb2dlbl9pZCI6ImEyYTMxN2VmLWMzMGEtNGMzZC1hMTMwLWRhODhhZjc1MTUwMi...",
  "base_url": "https://www.genspark.ai"
}
```

### Google
- **Type**: Cloud Services
- **Status**: Active

**Services**:
- **Stitch API**: MCP server at `https://stitch.googleapis.com/mcp`
  - API Key: `AQ.Ab8RN6L96CR5ey_d6FEMkeq44nwMzMEKVzlli3KkNmxO-p9CEw`
  - Purpose: Google cloud services integration

**Chrome Extensions**:
- Genspark Extension: `hmdkfngkncmbgiehonfebecighedjiak` v1.1.23

### Supabase
- **Type**: Database & Backend
- **Config**: `supabase/config.toml`
- **Project ID**: Aquit-Platform
- **Status**: Active

**Components**:
- API: Port 54321, Schemas: public, graphql_public
- Database: Port 54322, PostgreSQL 17
- Studio: Port 54323
- Realtime: Enabled
- Storage: Enabled
- Auth: Enabled

## Directory Structure

```
.agents/
├── agents-sync.json          # Main configuration (JSON)
├── agents-sync.toml          # Main configuration (TOML)
├── backups/                   # Backup storage
│   └── backup_YYYYMMDD_HHMMSS/
│       ├── manifest.json
│       └── [agent_name]/
│           ├── config_files/
│           └── skills/
├── outputs/                   # Agent outputs
├── skills/                    # Installed skills
│   ├── supabase/
│   │   ├── SKILL.md
│   │   └── ...
│   ├── supabase-postgres-best-practices/
│   │   ├── SKILL.md
│   │   └── references/
│   └── workflow-init/
│       └── SKILL.md
├── cua/                      # CUA agent data
└── cue/                      # CUE agent data

agent/
└── skills/                   # Project-specific skills
    └── workflow-init/
        └── SKILL.md
```

## Sync Settings

```json
{
  "auto_sync": true,
  "sync_interval": "5m",
  "conflict_resolution": "manual",
  "backup_enabled": true,
  "backup_path": ".agents/backups/",
  "notifications": {
    "email": false,
    "desktop": true,
    "log_file": ".agents/logs/sync.log"
  }
}
```

## Skills Registry

```json
{
  "sources": [
    {
      "name": "supabase/agent-skills",
      "type": "github",
      "skills": ["supabase", "supabase-postgres-best-practices"]
    },
    {
      "name": "vercel/workflow",
      "type": "github",
      "skills": ["workflow-init"]
    }
  ],
  "lock_file": "skills-lock.json"
}
```

## Backup & Restore

### Creating Backups

```bash
# Automatic backup with timestamp
python sync_agents.py backup

# Named backup
python sync_agents.py backup pre_deployment

# Custom backup location
python sync_agents.py backup my_custom_backup
```

Backups are stored in `.agents/backups/` with the following structure:
```
backups/
└── backup_20260830_123456/
    ├── manifest.json          # Metadata about the backup
    ├── vibe/                  # Vibe agent configs and skills
    ├── genspark/              # Genspark configs
    ├── google/                # Google service configs
    └── supabase/              # Supabase configs
```

### Restoring from Backups

```bash
# List available backups
python sync_agents.py backups

# Restore specific backup
python sync_agents.py restore backup_20260830_123456
```

## Validation

The validation command checks:
- Config file existence
- Skills file existence
- Directory permissions
- Configuration syntax

```bash
python sync_agents.py validate
```

## Metadata

- **Created By**: andrew
- **Repository**: Aquit-Platform
- **Total Skills**: 3
- **Total MCP Servers**: 1
- **Total Extensions**: 2
- **Last Updated**: 2026-08-30

## Security Notes

1. **API Keys**: All sensitive information (API keys, tokens) are stored in configuration files
2. **Backups**: Backups contain copies of configuration files, which may include sensitive data
3. **Permissions**: Ensure proper file permissions on all configuration files
4. **Git**: Configuration files should be in `.gitignore` if they contain secrets

## Integration

### With Git

Add to `.gitignore`:
```gitignore
# Agent configurations
.vibe/config.toml
.genspark-tool-cli/config.json
supabase/config.toml

# Backups
.agents/backups/
.agents/outputs/
```

### With CI/CD

```yaml
# .github/workflows/agents-sync.yml
name: Agent Sync

on:
  push:
    paths:
      - '.agents/**'
      - 'agent/**'

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Sync Agents
        run: python sync_agents.py sync
      - name: Validate Agents
        run: python sync_agents.py validate
```

## Troubleshooting

### Config File Not Found

Ensure the configuration file exists at one of these locations:
- `agents-sync.json`
- `agents-sync.toml`
- `.agents/agents-sync.json`
- `.agents/agents-sync.toml`

### Missing Dependencies

```bash
# Install required Python packages
pip install toml
```

### Permission Errors

Ensure you have read/write permissions for:
- Configuration files
- Backup directories
- Skills directories

## Future Enhancements

- [ ] Auto-discovery of new agents
- [ ] Real-time synchronization
- [ ] Conflict detection and resolution
- [ ] Web-based dashboard
- [ ] Integration with Vibe CLI
- [ ] Git-based versioning for configurations
- [ ] Multi-user collaboration support
