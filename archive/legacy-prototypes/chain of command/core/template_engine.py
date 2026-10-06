"""
Acquit Platform - Secure Template Engine
Provides dual-path variable substitution:
1. Trusted Path (render_trusted / substitute): Resolves structured variables.
2. Untrusted Path (render_untrusted): Neutralizes prompt injection by escaping template syntax.
"""

import os
import re
import time
import uuid
from enum import Enum
from typing import Dict, Any, Optional, Union, List


class VariableType(Enum):
    ENVIRONMENT = "env"
    CONTEXT = "context"
    CONFIGURATION = "config"
    AGENT = "agent"
    SYSTEM = "system"
    LITERAL = "literal"


class TemplateEngine:
    VARIABLE_PATTERN = re.compile(r'\{\{([^}]+)\}\}')
    LITERAL_PATTERN = re.compile(r'\{\{#var\s+([^=]+)=([^}]+)\}\}')

    def __init__(self, context: Optional[Dict[str, Any]] = None, config: Optional[Dict[str, Any]] = None):
        self.context: Dict[str, Any] = context or {}
        self.config: Dict[str, Any] = config or {}
        self.literal_vars: Dict[str, str] = {}
        self.agent_vars: Dict[str, Any] = {}
        self._system_vars = {
            'timestamp': lambda: time.strftime("%Y-%m-%d %H:%M:%S"),
            'date': lambda: time.strftime("%Y-%m-%d"),
            'time': lambda: time.strftime("%H:%M:%S"),
            'uuid': lambda: str(uuid.uuid4()),
            'task_id': lambda: str(uuid.uuid4()),
            'platform': "Acquit.ai",
            'user_id': os.getenv('USER', 'pro_se_litigant')
        }

    def render_untrusted(self, text: str) -> str:
        """
        Escapes template delimiters in untrusted user-supplied evidence or web content
        to eliminate prompt injection and unauthorized variable expansion.
        """
        if not text:
            return ""
        return text.replace("{{", "\\{\\{").replace("}}", "\\}\\}")

    def parse_literal_definitions(self, text: str) -> str:
        def replace_literal(match):
            var_name = match.group(1).strip()
            var_value = match.group(2).strip()
            self.literal_vars[var_name] = var_value
            return ""
        return self.LITERAL_PATTERN.sub(replace_literal, text)

    def resolve_variable(self, variable_ref: str, local_vars: Optional[Dict[str, Any]] = None) -> str:
        if not variable_ref:
            return ""

        # Priority order: local_vars > context > config > env > system
        if local_vars and variable_ref in local_vars:
            return str(local_vars[variable_ref])

        if '.' in variable_ref:
            var_type, var_name = variable_ref.split('.', 1)
            var_type_lower = var_type.lower()
            try:
                type_enum = VariableType(var_type_lower)
                val = self._get_variable_by_type(type_enum, var_name)
                return str(val) if val is not None else ""
            except ValueError:
                if variable_ref in self.context:
                    return str(self.context[variable_ref])
                return f"{{{{{variable_ref}}}}}"
        else:
            if variable_ref in self.literal_vars:
                return self.literal_vars[variable_ref]
            if variable_ref in self.context:
                return str(self.context[variable_ref])
            if variable_ref in self.agent_vars:
                return str(self.agent_vars[variable_ref])
            if variable_ref in self._system_vars:
                value = self._system_vars[variable_ref]
                return str(value() if callable(value) else value)
            if variable_ref in os.environ:
                return os.environ[variable_ref]
            return f"{{{{{variable_ref}}}}}"

    def _get_variable_by_type(self, var_type: VariableType, var_name: str) -> Any:
        if var_type == VariableType.ENVIRONMENT:
            return os.environ.get(var_name, "")
        elif var_type == VariableType.CONTEXT:
            return self.context.get(var_name, "")
        elif var_type == VariableType.CONFIGURATION:
            return self._get_nested_config(var_name)
        elif var_type == VariableType.AGENT:
            return self.agent_vars.get(var_name, "")
        elif var_type == VariableType.SYSTEM:
            return self._resolve_system_var(var_name)
        elif var_type == VariableType.LITERAL:
            return self.literal_vars.get(var_name, "")
        return ""

    def _resolve_system_var(self, var_name: str) -> Any:
        if var_name in self._system_vars:
            val = self._system_vars[var_name]
            return val() if callable(val) else val
        return ""

    def _get_nested_config(self, path: str) -> Any:
        keys = path.split('.')
        value = self.config
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return ""
        return value

    def render_trusted(self, text: str, local_vars: Optional[Dict[str, Any]] = None) -> str:
        """
        Fully resolves template variables in trusted text (system prompts, configs).
        """
        if not text:
            return text
        text = self.parse_literal_definitions(text)

        def replace_match(match):
            var_expr = match.group(1).strip()
            return self.resolve_variable(var_expr, local_vars)

        return self.VARIABLE_PATTERN.sub(replace_match, text)

    def substitute(self, text: str) -> str:
        return self.render_trusted(text)

    def substitute_dict(self, data: Dict[str, Any], local_vars: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        result = {}
        for key, value in data.items():
            if isinstance(value, str):
                result[key] = self.render_trusted(value, local_vars)
            elif isinstance(value, dict):
                result[key] = self.substitute_dict(value, local_vars)
            elif isinstance(value, list):
                result[key] = [
                    self.substitute_dict(item, local_vars) if isinstance(item, dict) else
                    self.render_trusted(item, local_vars) if isinstance(item, str) else
                    item
                    for item in value
                ]
            else:
                result[key] = value
        return result
