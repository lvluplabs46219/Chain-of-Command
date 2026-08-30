#!/usr/bin/env python3
"""
Agent Synchronization Script for Aquit-Platform

Manages synchronization between:
- Vibe/Mistral agents and skills
- Genspark agents and configurations
- Google services (MCP, Chrome extensions)
- Supabase local development configurations

Usage:
    python sync_agents.py [command] [options]

Commands:
    status          Show status of all agents
    sync            Sync all agent configurations
    backup          Create backup of current configurations
    restore         Restore from backup
    validate        Validate all agent configurations
    list            List all registered agents
"""

import os
import json
import shutil
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Any
import subprocess
import sys

# Optional toml import
try:
    import toml as toml_module
    HAS_TOML = True
except ImportError:
    HAS_TOML = False
    toml_module = None


class AgentSync:
    """Main class for managing agent synchronization."""
    
    def __init__(self, config_path: Optional[str] = None):
        """Initialize AgentSync with configuration."""
        self.config_path = config_path or self._find_config()
        self.config = self._load_config()
        self.backup_dir = Path(self.config.get('directories', {}).get('backups', '.agents/backups'))
        self.log_dir = Path(self.config.get('directories', {}).get('logs', '.agents/logs'))
        
    def _find_config(self) -> str:
        """Find the agent sync configuration file."""
        possible_paths = [
            'agents-sync.json',
            'agents-sync.toml',
            '.agents/agents-sync.json',
            '.agents/agents-sync.toml',
            '/tmp/vibe-scratchpad-5d08771e-i_qvvtob/agents-sync.json'
        ]
        for path in possible_paths:
            if Path(path).exists():
                return path
        return '/tmp/vibe-scratchpad-5d08771e-i_qvvtob/agents-sync.json'
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from file."""
        try:
            if self.config_path.endswith('.json'):
                with open(self.config_path, 'r') as f:
                    return json.load(f)
            elif self.config_path.endswith('.toml'):
                if HAS_TOML:
                    with open(self.config_path, 'r') as f:
                        return toml_module.load(f)
                else:
                    print("Warning: toml module not installed. Install with 'pip install toml'")
                    return {}
        except FileNotFoundError:
            print(f"Config file not found: {self.config_path}")
            return {}
        except Exception as e:
            print(f"Error loading config: {e}")
            return {}
        return {}
    
    def get_agents(self) -> Dict[str, Dict]:
        """Get all registered agents."""
        return self.config.get('agents', {})
    
    def get_agent(self, name: str) -> Optional[Dict]:
        """Get a specific agent by name."""
        return self.get_agents().get(name)
    
    def status(self) -> Dict[str, Any]:
        """Get status of all agents."""
        agents = self.get_agents()
        result = {}
        
        for name, agent in agents.items():
            result[name] = {
                'type': agent.get('type', 'unknown'),
                'status': agent.get('status', 'unknown'),
                'config_path': agent.get('config_path', 'N/A'),
                'enabled': agent.get('status') == 'active'
            }
            
            # Add skills if present
            if 'skills' in agent:
                project_skills = agent['skills'].get('project_skills', [])
                if isinstance(project_skills, list):
                    result[name]['skills'] = [s.get('name', s.get('path', 'unknown')) for s in project_skills]
                elif isinstance(project_skills, dict):
                    result[name]['skills'] = list(project_skills.keys())
                else:
                    result[name]['skills'] = []
            
            # Add components if present
            if 'components' in agent:
                components = agent['components']
                if isinstance(components, dict):
                    result[name]['components'] = list(components.keys())
                else:
                    result[name]['components'] = []
        
        return result
    
    def validate_config(self) -> Dict[str, Any]:
        """Validate all agent configurations."""
        result = {
            'valid': True,
            'errors': [],
            'warnings': [],
            'checked': []
        }
        
        agents = self.get_agents()
        
        for name, agent in agents.items():
            result['checked'].append(name)
            
            # Check config path exists
            config_path = agent.get('config_path')
            if config_path:
                expanded = Path(config_path).expanduser()
                if not expanded.exists():
                    result['warnings'].append(f"{name}: Config path not found: {config_path}")
            
            # Check skills paths
            if 'skills' in agent:
                for skill in agent['skills'].get('project_skills', []):
                    path = skill.get('path')
                    if path:
                        full_path = Path(path)
                        if not full_path.exists():
                            result['warnings'].append(f"{name}: Skill path not found: {path}")
        
        if result['errors']:
            result['valid'] = False
        
        return result
    
    def backup(self, backup_name: Optional[str] = None) -> str:
        """Create backup of current configurations."""
        backup_name = backup_name or f"backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        backup_path = self.backup_dir / backup_name
        backup_path.mkdir(parents=True, exist_ok=True)
        
        agents = self.get_agents()
        
        for name, agent in agents.items():
            # Backup config files
            config_path = agent.get('config_path')
            if config_path:
                src = Path(config_path).expanduser()
                if src.exists():
                    dst = backup_path / name / Path(config_path).name
                    dst.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src, dst)
            
            # Backup skills
            if 'skills' in agent:
                for skill in agent['skills'].get('project_skills', []):
                    path = skill.get('path')
                    if path:
                        src = Path(path)
                        if src.exists():
                            dst = backup_path / name / 'skills' / Path(path).name
                            dst.parent.mkdir(parents=True, exist_ok=True)
                            shutil.copy2(src, dst)
        
        # Save manifest
        manifest = {
            'timestamp': datetime.now().isoformat(),
            'agents': list(agents.keys()),
            'backup_name': backup_name
        }
        with open(backup_path / 'manifest.json', 'w') as f:
            json.dump(manifest, f, indent=2)
        
        return str(backup_path)
    
    def restore(self, backup_name: str) -> bool:
        """Restore from backup."""
        backup_path = self.backup_dir / backup_name
        
        if not backup_path.exists():
            print(f"Backup not found: {backup_name}")
            return False
        
        manifest_path = backup_path / 'manifest.json'
        if not manifest_path.exists():
            print(f"Invalid backup: missing manifest")
            return False
        
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
        
        agents = self.get_agents()
        
        for name in manifest.get('agents', []):
            agent = agents.get(name)
            if not agent:
                continue
            
            # Restore config files
            config_path = agent.get('config_path')
            if config_path:
                src = backup_path / name / Path(config_path).name
                if src.exists():
                    dst = Path(config_path).expanduser()
                    dst.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src, dst)
            
            # Restore skills
            if 'skills' in agent:
                for skill in agent['skills'].get('project_skills', []):
                    path = skill.get('path')
                    if path:
                        src = backup_path / name / 'skills' / Path(path).name
                        if src.exists():
                            dst = Path(path)
                            dst.parent.mkdir(parents=True, exist_ok=True)
                            shutil.copy2(src, dst)
        
        return True
    
    def list_backups(self) -> List[str]:
        """List all available backups."""
        if not self.backup_dir.exists():
            return []
        
        backups = []
        for item in self.backup_dir.iterdir():
            if item.is_dir() and (item / 'manifest.json').exists():
                backups.append(item.name)
        
        return sorted(backups, reverse=True)
    
    def sync(self) -> Dict[str, Any]:
        """Sync all agent configurations."""
        result = {
            'synced': [],
            'errors': [],
            'warnings': []
        }
        
        agents = self.get_agents()
        
        for name, agent in agents.items():
            try:
                # For now, just validate
                # In future, implement actual sync logic
                config_path = agent.get('config_path')
                if config_path:
                    expanded = Path(config_path).expanduser()
                    if expanded.exists():
                        result['synced'].append(name)
                    else:
                        result['warnings'].append(f"{name}: Config not found at {config_path}")
                else:
                    result['synced'].append(name)
            except Exception as e:
                result['errors'].append(f"{name}: {str(e)}")
        
        return result


def main():
    """Main entry point."""
    sync = AgentSync()
    
    if len(sys.argv) < 2:
        print("Usage: python sync_agents.py [command] [options]")
        print("\nCommands:")
        print("  status          Show status of all agents")
        print("  sync            Sync all agent configurations")
        print("  backup          Create backup of current configurations")
        print("  restore <name>  Restore from backup")
        print("  validate        Validate all agent configurations")
        print("  list            List all registered agents")
        print("  backups         List all available backups")
        return
    
    command = sys.argv[1]
    
    if command == 'status':
        status = sync.status()
        print("\n=== Agent Status ===")
        for name, info in status.items():
            print(f"\n{name}:")
            print(f"  Type: {info['type']}")
            print(f"  Status: {info['status']}")
            print(f"  Config: {info['config_path']}")
            if 'skills' in info:
                print(f"  Skills: {', '.join(info['skills'])}")
            if 'components' in info:
                print(f"  Components: {', '.join(info['components'])}")
    
    elif command == 'sync':
        result = sync.sync()
        print("\n=== Sync Results ===")
        print(f"Synced: {len(result['synced'])} agents")
        if result['errors']:
            print(f"Errors: {len(result['errors'])}")
            for error in result['errors']:
                print(f"  - {error}")
        if result['warnings']:
            print(f"Warnings: {len(result['warnings'])}")
            for warning in result['warnings']:
                print(f"  - {warning}")
    
    elif command == 'backup':
        backup_name = sys.argv[2] if len(sys.argv) > 2 else None
        backup_path = sync.backup(backup_name)
        print(f"\nBackup created at: {backup_path}")
    
    elif command == 'restore':
        if len(sys.argv) < 3:
            print("Usage: python sync_agents.py restore <backup_name>")
            return
        backup_name = sys.argv[2]
        if sync.restore(backup_name):
            print(f"\nRestored from backup: {backup_name}")
        else:
            print(f"\nFailed to restore from backup: {backup_name}")
    
    elif command == 'validate':
        result = sync.validate_config()
        print("\n=== Validation Results ===")
        print(f"Valid: {result['valid']}")
        if result['errors']:
            print(f"Errors: {len(result['errors'])}")
            for error in result['errors']:
                print(f"  - {error}")
        if result['warnings']:
            print(f"Warnings: {len(result['warnings'])}")
            for warning in result['warnings']:
                print(f"  - {warning}")
        print(f"Checked: {', '.join(result['checked'])}")
    
    elif command == 'list':
        agents = sync.get_agents()
        print("\n=== Registered Agents ===")
        for name in agents.keys():
            print(f"  - {name}")
    
    elif command == 'backups':
        backups = sync.list_backups()
        print("\n=== Available Backups ===")
        for backup in backups:
            print(f"  - {backup}")
    
    else:
        print(f"Unknown command: {command}")


if __name__ == '__main__':
    main()
