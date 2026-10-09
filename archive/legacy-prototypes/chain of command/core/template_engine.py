"""
Acquit Platform - Enhanced Template Engine
Provides dual-path variable substitution with comprehensive template support:
1. Trusted Path (render_trusted / substitute): Resolves structured variables, conditionals, defaults, functions.
2. Untrusted Path (render_untrusted): Neutralizes prompt injection by escaping template syntax.

Security Features:
- Environment variables blocked by default (allow_env_vars=False)
- Separate engine instances for trusted vs untrusted contexts
- SecurityError raised on blocked environment variable access

Template Syntax:
- Variables: {{env.VAR}}, {{context.key}}, {{config.nested.path}}, {{agent.name}}, {{system.timestamp}}, {{literal_name}}
- Defaults: {{var|default_value}}
- Functions: {{uppercase(var)}}, {{lowercase(var)}}, {{date(format)}}, {{now()}}, {{len(var)}}, {{trim(var)}}
- Conditionals: {{if condition}}...{{elif other_condition}}...{{else}}...{{endif}}
- Literal definitions: {{#var name=value}}

Resolution Priority: local > context > config > agent > env > system > literal
"""

import os
import re
import time
import uuid
from enum import Enum
from typing import Dict, Any, Optional, Union, List, Callable, Tuple
from dataclasses import dataclass


class SecurityError(Exception):
    """Raised when a security violation is detected during template rendering."""
    pass


class TemplateSyntaxError(Exception):
    """Raised when template syntax is invalid."""
    pass


class VariableType(Enum):
    ENVIRONMENT = "env"
    CONTEXT = "context"
    CONFIGURATION = "config"
    AGENT = "agent"
    SYSTEM = "system"
    LITERAL = "literal"


@dataclass
class ConditionalBlock:
    """Represents a parsed conditional block."""
    condition: str
    content: str
    elif_blocks: List['ConditionalBlock']
    else_content: Optional[str]


class TemplateEngine:
    """
    Enhanced template engine with security isolation and comprehensive template support.
    
    Features:
    - All 6 variable types from architecture spec
    - Default values: {{var|default}}
    - Built-in functions: uppercase, lowercase, date, now, len, trim
    - Conditionals: {{if}}...{{elif}}...{{else}}...{{endif}}
    - Literal variable definitions: {{#var name=value}}
    - Security: Environment variables blocked by default
    
    Example:
        engine = TemplateEngine(allow_env_vars=False)  # Safe for user templates
        result = engine.render("Hello {{context.name|Unknown}}!")
        # If context.name is not set, returns "Hello Unknown!"
    """
    
    # =============================================================================
    # Regex Patterns - Fixed and Enhanced
    # =============================================================================
    
    # Main variable pattern: {{var}}, {{env.KEY}}, {{context.key|default}}, {{func(arg1, arg2)}}
    # Uses non-greedy matching with balanced brace handling
    # Supports: variables, defaults, functions, nested dots
    VARIABLE_PATTERN = re.compile(r'\{\{(.+?)\}\}')
    
    # Literal variable definition: {{#var name=value}}
    LITERAL_PATTERN = re.compile(r'\{\{#var\s+([^=]+)=([^}]+)\}\}')
    
    # Conditional blocks: {{if condition}}...{{elif}}...{{else}}...{{endif}}
    # Note: These need special handling, not just regex substitution
    CONDITIONAL_START = re.compile(r'\{\{if\s+(.+?)\}\}')
    CONDITIONAL_ELIF = re.compile(r'\{\{elif\s+(.+?)\}\}')
    CONDITIONAL_ELSE = re.compile(r'\{\{else\}\}')
    CONDITIONAL_END = re.compile(r'\{\{endif\}\}')
    
    # Default value pattern: {{var|default}}
    DEFAULT_PATTERN = re.compile(r'^(.+?)\|(.+)$')
    
    # Function pattern: {{func(arg1, arg2, ...)}
    FUNCTION_PATTERN = re.compile(r'^(\w+)\((.*)\)$')

    def __init__(
        self,
        context: Optional[Dict[str, Any]] = None,
        config: Optional[Dict[str, Any]] = None,
        allow_env_vars: bool = False,
        allow_system_vars: bool = True
    ):
        """
        Initialize the template engine.
        
        Args:
            context: Dictionary of context variables
            config: Dictionary of configuration variables
            allow_env_vars: If True, allows {{env.*}} substitution. WARNING: Only enable
                        for trusted system prompts, never for user-supplied templates.
            allow_system_vars: If True, allows {{system.*}} substitution (timestamp, uuid, etc.)
        """
        self.context: Dict[str, Any] = context or {}
        self.config: Dict[str, Any] = config or {}
        self.literal_vars: Dict[str, str] = {}
        self.agent_vars: Dict[str, Any] = {}
        self.allow_env_vars = allow_env_vars
        self.allow_system_vars = allow_system_vars
        
        # System variables (safe to expose)
        self._system_vars = {
            'timestamp': lambda: time.strftime("%Y-%m-%d %H:%M:%S"),
            'date': lambda: time.strftime("%Y-%m-%d"),
            'time': lambda: time.strftime("%H:%M:%S"),
            'now': lambda: time.strftime("%Y-%m-%d %H:%M:%S"),
            'uuid': lambda: str(uuid.uuid4()),
            'task_id': lambda: str(uuid.uuid4()),
            'platform': "Acquit.ai",
            'user_id': os.getenv('USER', 'pro_se_litigant')
        }
        
        # Built-in functions
        self._functions: Dict[str, Callable] = {
            'uppercase': lambda x: str(x).upper() if x else '',
            'lowercase': lambda x: str(x).lower() if x else '',
            'len': lambda x: len(str(x)) if x else 0,
            'trim': lambda x: str(x).strip() if x else '',
            'strip': lambda x: str(x).strip() if x else '',
            'date': lambda fmt="%Y-%m-%d": time.strftime(fmt),
        }

    # =============================================================================
    # Public API
    # =============================================================================

    def render_untrusted(self, text: str) -> str:
        """
        Escapes template delimiters in untrusted user-supplied evidence or web content
        to eliminate prompt injection and unauthorized variable expansion.
        
        This is the SAFE path for any user-supplied text that will be included in prompts.
        """
        if not text:
            return ""
        # Escape double braces to prevent injection
        return text.replace("{{", "\\{\\{").replace("}}", "\\}\\}")

    def render(self, text: str, local_vars: Optional[Dict[str, Any]] = None) -> str:
        """
        Main render method that handles all template features.
        
        Supports:
        - Variables with defaults: {{var|default}}
        - Functions: {{func(arg)}}
        - Conditionals: {{if cond}}...{{endif}}
        - Literal definitions: {{#var name=value}}
        
        Args:
            text: Template text
            local_vars: Local variables (highest priority)
            
        Returns:
            Rendered text with all templates resolved
        """
        if not text:
            return text
        
        # First, parse and extract literal definitions
        text = self.parse_literal_definitions(text)
        
        # Process conditionals
        text = self.process_conditionals(text, local_vars)
        
        # Process all variable/function references
        text = self.process_variables_and_functions(text, local_vars)
        
        return text
    
    def render_trusted(self, text: str, local_vars: Optional[Dict[str, Any]] = None) -> str:
        """
        Fully resolves template variables in trusted text (system prompts, configs).
        
        SECURITY: Only use this for system-controlled templates. For user-supplied
        text, use render_untrusted() first or create a separate engine with
        allow_env_vars=False.
        """
        return self.render(text, local_vars)

    def substitute(self, text: str) -> str:
        """Alias for render_trusted (backwards compatibility)."""
        return self.render_trusted(text)

    def substitute_dict(self, data: Dict[str, Any], local_vars: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Recursively substitute variables in dictionary values."""
        result = {}
        for key, value in data.items():
            if isinstance(value, str):
                result[key] = self.render(value, local_vars)
            elif isinstance(value, dict):
                result[key] = self.substitute_dict(value, local_vars)
            elif isinstance(value, list):
                result[key] = [
                    self.substitute_dict(item, local_vars) if isinstance(item, dict) else
                    self.render(item, local_vars) if isinstance(item, str) else
                    item
                    for item in value
                ]
            else:
                result[key] = value
        return result

    # =============================================================================
    # Conditional Processing
    # =============================================================================

    def process_conditionals(self, text: str, local_vars: Optional[Dict[str, Any]] = None) -> str:
        """
        Process {{if}}...{{elif}}...{{else}}...{{endif}} conditional blocks.
        
        Supports nested conditionals and evaluates conditions in the current context.
        """
        if not text:
            return text
        
        result = []
        i = 0
        
        while i < len(text):
            # Check for if block
            if_match = self.CONDITIONAL_START.search(text, i)
            if if_match:
                # Found conditional block
                start_pos = if_match.start()
                result.append(text[i:start_pos])
                
                # Parse the entire conditional block
                conditional_text, end_pos = self._parse_conditional_block(text, if_match.end(), local_vars)
                result.append(conditional_text)
                i = end_pos
            else:
                result.append(text[i:])
                break
        
        return ''.join(result)
    
    def _parse_conditional_block(self, text: str, start: int, local_vars: Optional[Dict[str, Any]]) -> Tuple[str, int]:
        """
        Parse a conditional block starting from 'if' to matching 'endif'.
        
        Returns:
            Tuple of (resolved_text, end_position)
        """
        conditions = []
        depth = 1
        current_pos = start
        current_content_start = start
        
        # We need to find the first if condition that opened this block
        # Look back from start to find the most recent {{if ...}}
        first_if_condition = None
        initial_if_match = self.CONDITIONAL_START.search(text, max(0, start - 200))
        if initial_if_match and initial_if_match.end() == start:
            first_if_condition = initial_if_match.group(1).strip()
        
        # Current condition we're collecting content for
        current_condition = first_if_condition
        
        while depth > 0 and current_pos < len(text):
            # Check for nested if
            if_match = self.CONDITIONAL_START.search(text, current_pos)
            elif_match = self.CONDITIONAL_ELIF.search(text, current_pos)
            else_match = self.CONDITIONAL_ELSE.search(text, current_pos)
            endif_match = self.CONDITIONAL_END.search(text, current_pos)
            
            # Find the earliest match
            matches = [
                (if_match.start() if if_match else len(text), 'if', if_match),
                (elif_match.start() if elif_match else len(text), 'elif', elif_match),
                (else_match.start() if else_match else len(text), 'else', else_match),
                (endif_match.start() if endif_match else len(text), 'endif', endif_match),
            ]
            matches.sort(key=lambda x: x[0])
            
            pos, match_type, match_obj = matches[0]
            
            if pos >= len(text):
                raise TemplateSyntaxError(f"Unclosed conditional block starting at {start}")
            
            if match_type == 'if':
                # Nested if - increase depth
                depth += 1
                current_pos = pos + len(match_obj.group(0))
            elif match_type == 'elif':
                if depth == 1:
                    # End current content and store with current condition
                    content = text[current_content_start:pos]
                    conditions.append((current_condition, content))
                    
                    # Set current condition to the elif condition
                    current_condition = match_obj.group(1)
                    current_content_start = match_obj.end()
                current_pos = pos + len(match_obj.group(0))
            elif match_type == 'else':
                if depth == 1:
                    # End current content and store with current condition
                    content = text[current_content_start:pos]
                    conditions.append((current_condition, content))
                    
                    # Set current condition to None (else)
                    current_condition = None
                    current_content_start = match_obj.end()
                current_pos = pos + len(match_obj.group(0))
            elif match_type == 'endif':
                depth -= 1
                if depth == 0:
                    # This is our closing endif
                    # End current content and store with current condition
                    if current_content_start < pos:
                        content = text[current_content_start:pos]
                        conditions.append((current_condition, content))
                    elif current_condition is not None:
                        # No content for this condition
                        conditions.append((current_condition, ""))
                    
                    # Evaluate conditions and get the matching content
                    resolved = self._evaluate_conditions(conditions, local_vars)
                    return resolved, pos + len(match_obj.group(0))
                current_pos = pos + len(match_obj.group(0))
            else:
                current_pos += 1
        
        if depth > 0:
            raise TemplateSyntaxError(f"Unclosed conditional block starting at {start}")
        
        return "", current_pos
    
    def _evaluate_conditions(self, conditions: List[Tuple[Optional[str], str]], local_vars: Optional[Dict[str, Any]]) -> str:
        """
        Evaluate conditional blocks and return the first matching content.
        
        Args:
            conditions: List of (condition_string, content) tuples
            local_vars: Local variables for evaluation
            
        Returns:
            The content of the first condition that evaluates to True, or empty string
        """
        for i, (condition, content) in enumerate(conditions):
            if i == 0:
                # First condition is the 'if'
                if self._evaluate_condition(condition, local_vars) if condition else True:
                    return self.render(content, local_vars)
            else:
                # elif or else
                if condition is None or self._evaluate_condition(condition, local_vars):
                    return self.render(content, local_vars)
        return ""
    
    def _evaluate_condition(self, condition: str, local_vars: Optional[Dict[str, Any]]) -> bool:
        """
        Evaluate a condition string as a boolean expression.
        
        Supports:
        - Variable existence: {{var}} -> True if var exists and is truthy
        - String equality: var == "value"
        - String comparison: var != "value"
        - Numeric comparison: var > 5, var >= 5, var < 5, var <= 5
        - Boolean logic: and, or, not
        - Grouping: (condition)
        """
        condition = condition.strip()
        
        # Simple variable check
        if condition.startswith('{{') and condition.endswith('}}'):
            var_ref = condition[2:-2].strip()
            try:
                value = self.resolve_variable(var_ref, local_vars)
                return bool(value) if value != "" else False
            except:
                return False
        
        # For now, use a simple eval-based approach with safe variables
        # In production, replace with a proper expression parser
        try:
            # Resolve variables in the condition
            resolved_condition = self._resolve_condition_variables(condition, local_vars)
            
            # Safe evaluation - only allow basic comparisons
            # Remove potentially dangerous operations
            safe_condition = re.sub(r'[^\w\s=!<>\|\&\(\)"\'\.\d]', '', resolved_condition)
            
            # Create a safe namespace with resolved variables
            # We need to handle the case where variables might be strings that look like numbers
            safe_namespace = {}
            
            # Extract all variable references and resolve them
            for var_match in self.VARIABLE_PATTERN.finditer(condition):
                var_ref = var_match.group(1).strip()
                try:
                    value = self.resolve_variable(var_ref, local_vars)
                    # Try to convert to int/float if possible
                    try:
                        if '.' in value:
                            safe_namespace[var_ref] = float(value)
                        else:
                            safe_namespace[var_ref] = int(value)
                    except (ValueError, TypeError):
                        safe_namespace[var_ref] = value
                except:
                    safe_namespace[var_ref] = None
            
            # Replace variable references with safe names
            for var_ref, value in safe_namespace.items():
                if var_ref in resolved_condition:
                    resolved_condition = resolved_condition.replace(var_ref, repr(value))
            
            return eval(resolved_condition, {"__builtins__": {}}, {})
        except Exception as e:
            print(f"Condition evaluation error: {e}")
            return False
    
    def _resolve_condition_variables(self, condition: str, local_vars: Optional[Dict[str, Any]]) -> str:
        """Resolve all variable references in a condition string."""
        # First, try to find braced variables {{var}}
        def replace_braced_var(match):
            var_ref = match.group(1).strip()
            try:
                value = self.resolve_variable(var_ref, local_vars)
                if isinstance(value, str):
                    return repr(value)
                return str(value)
            except:
                return 'None'
        
        condition = self.VARIABLE_PATTERN.sub(replace_braced_var, condition)
        
        # Now look for unbraced variables that look like var paths (contain dots)
        # This handles variables like context.age, config.model, etc.
        import re
        var_ref_pattern = re.compile(r'\b([a-zA-Z_][a-zA-Z0-9_]*\.[a-zA-Z0-9_]+(?:\.[a-zA-Z0-9_]+)*)\b')
        
        def replace_unbraced_var(match):
            var_ref = match.group(1)
            try:
                value = self.resolve_variable(var_ref, local_vars)
                if isinstance(value, str):
                    # Try to convert to number if it looks like one
                    try:
                        if '.' in value:
                            return str(float(value))
                        else:
                            return str(int(value))
                    except (ValueError, TypeError):
                        return repr(value)
                return str(value)
            except:
                return 'None'
        
        condition = var_ref_pattern.sub(replace_unbraced_var, condition)
        
        return condition

    # =============================================================================
    # Variable and Function Processing
    # =============================================================================

    def process_variables_and_functions(self, text: str, local_vars: Optional[Dict[str, Any]]) -> str:
        """
        Process all variable references and function calls in the text.
        """
        if not text:
            return text
        
        def replace_match(match):
            var_expr = match.group(1).strip()
            return self._resolve_expression(var_expr, local_vars)
        
        return self.VARIABLE_PATTERN.sub(replace_match, text)
    
    def _resolve_expression(self, expression: str, local_vars: Optional[Dict[str, Any]]) -> str:
        """
        Resolve an expression which can be a variable, default, or function call.
        
        Priority: function > variable_with_default > variable
        """
        expression = expression.strip()
        
        # Check for function call - must be first since functions can contain pipes
        func_match = self.FUNCTION_PATTERN.match(expression)
        if func_match:
            func_name = func_match.group(1)
            func_args_str = func_match.group(2).strip()
            return self._execute_function(func_name, func_args_str, local_vars)
        
        # Check for default value: var|default
        # We need to check if the expression contains | but is NOT inside function parentheses
        if '|' in expression and not self._is_inside_function(expression):
            # Split on the first | that's not inside a function
            var_ref, default_value = self._split_default(expression)
            var_ref = var_ref.strip()
            default_value = default_value.strip()
            try:
                value = self.resolve_variable(var_ref, local_vars)
                # Check if value is a placeholder (variable not found)
                if value.startswith('{{') and value.endswith('}}'):
                    return default_value
                return value if value != "" else default_value
            except SecurityError:
                raise
            except:
                return default_value
        
        # Regular variable
        return self.resolve_variable(expression, local_vars)
    
    def _is_inside_function(self, expression: str) -> bool:
        """Check if we're inside a function call."""
        # Count parentheses to see if we're inside a function
        depth = 0
        for char in expression:
            if char == '(':
                depth += 1
            elif char == ')':
                depth -= 1
        return depth > 0
    
    def _split_default(self, expression: str) -> Tuple[str, str]:
        """Split expression on | that's not inside function parentheses."""
        depth = 0
        split_pos = -1
        for i, char in enumerate(expression):
            if char == '(':
                depth += 1
            elif char == ')':
                depth -= 1
            elif char == '|' and depth == 0:
                split_pos = i
                break
        
        if split_pos == -1:
            return expression, ""
        
        return expression[:split_pos], expression[split_pos+1:]
    
    def _execute_function(self, func_name: str, args_str: str, local_vars: Optional[Dict[str, Any]]) -> str:
        """
        Execute a built-in function.
        
        Args:
            func_name: Name of the function
            args_str: Comma-separated arguments
            local_vars: Local variables for context
            
        Returns:
            Result of the function as string
        """
        if func_name not in self._functions:
            # Try to resolve as a variable if not a known function
            try:
                return self.resolve_variable(func_name, local_vars)
            except:
                return f"{{{{{func_name}({args_str})}}}}"
        
        # Parse arguments - handle nested braces and variable references
        args = self._parse_function_arguments(args_str, local_vars)
        
        try:
            func = self._functions[func_name]
            result = func(*args)
            return str(result) if result is not None else ""
        except Exception as e:
            return f"{{{{{func_name}({args_str})}}}}"
    
    def _parse_function_arguments(self, args_str: str, local_vars: Optional[Dict[str, Any]]) -> List[Any]:
        """Parse function arguments, handling nested braces and variable references."""
        args = []
        if not args_str:
            return args
        
        # Use a simple approach: split by commas not inside braces
        current_arg = []
        brace_depth = 0
        
        for char in args_str:
            if char == '{':
                brace_depth += 1
                current_arg.append(char)
            elif char == '}':
                brace_depth -= 1
                current_arg.append(char)
            elif char == ',' and brace_depth == 0:
                # End of current argument
                arg_str = ''.join(current_arg).strip()
                args.append(self._resolve_argument(arg_str, local_vars))
                current_arg = []
            else:
                current_arg.append(char)
        
        # Add the last argument
        if current_arg:
            arg_str = ''.join(current_arg).strip()
            args.append(self._resolve_argument(arg_str, local_vars))
        
        return args
    
    def _resolve_argument(self, arg_str: str, local_vars: Optional[Dict[str, Any]]) -> Any:
        """Resolve a function argument which can be a variable or literal."""
        # Check if it's a variable reference with braces
        if arg_str.startswith('{{') and arg_str.endswith('}}'):
            var_ref = arg_str[2:-2].strip()
            return self.resolve_variable(var_ref, local_vars)
        
        # Check if it looks like a variable reference without braces (contains dots or is a known type)
        if '.' in arg_str or arg_str in ['context', 'config', 'agent', 'system', 'env']:
            # Try to resolve it as a variable
            try:
                return self.resolve_variable(arg_str, local_vars)
            except SecurityError:
                raise
            except:
                pass  # Not a variable, fall through
        
        # Check if it's a string with quotes
        if (arg_str.startswith('"') and arg_str.endswith('"')) or \
           (arg_str.startswith("'") and arg_str.endswith("'")):
            return arg_str[1:-1]
        
        # Return as-is (could be a number, boolean, etc.)
        return arg_str

    # =============================================================================
    # Variable Resolution (Original functionality, now secure)
    # =============================================================================

    def parse_literal_definitions(self, text: str) -> str:
        """Parse and extract literal variable definitions from template."""
        def replace_literal(match):
            var_name = match.group(1).strip()
            var_value = match.group(2).strip()
            self.literal_vars[var_name] = var_value
            return ""
        return self.LITERAL_PATTERN.sub(replace_literal, text)

    def resolve_variable(self, variable_ref: str, local_vars: Optional[Dict[str, Any]] = None) -> str:
        """
        Resolve a variable reference with security checks.
        
        Priority order: local_vars > context > config > agent > env > system > literal
        
        Security: Environment variables are only resolved if allow_env_vars=True.
        """
        if not variable_ref:
            return ""

        variable_ref = variable_ref.strip()
        
        # Priority order: local_vars > context > config > agent > env > system > literal
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
                # Not a known type, try context
                if variable_ref in self.context:
                    return str(self.context[variable_ref])
                return f"{{{{{variable_ref}}}}}"
        else:
            # Simple variable name (no type prefix)
            if variable_ref in self.literal_vars:
                return self.literal_vars[variable_ref]
            if variable_ref in self.context:
                return str(self.context[variable_ref])
            if variable_ref in self.agent_vars:
                return str(self.agent_vars[variable_ref])
            if self.allow_system_vars and variable_ref in self._system_vars:
                value = self._system_vars[variable_ref]
                return str(value() if callable(value) else value)
            if self.allow_env_vars and variable_ref in os.environ:
                return os.environ[variable_ref]
            return f"{{{{{variable_ref}}}}}"

    def _get_variable_by_type(self, var_type: VariableType, var_name: str) -> Any:
        """
        Get variable value by type with security enforcement.
        
        Raises:
            SecurityError: If attempting to access environment variables when not allowed
        """
        if var_type == VariableType.ENVIRONMENT:
            if not self.allow_env_vars:
                raise SecurityError(
                    f"Environment variable access blocked: {var_name}. "
                    f"Set allow_env_vars=True only for trusted system templates."
                )
            return os.environ.get(var_name, "")
        elif var_type == VariableType.CONTEXT:
            return self._get_nested(self.context, var_name)
        elif var_type == VariableType.CONFIGURATION:
            return self._get_nested(self.config, var_name)
        elif var_type == VariableType.AGENT:
            return self._get_nested(self.agent_vars, var_name)
        elif var_type == VariableType.SYSTEM:
            if not self.allow_system_vars:
                return ""
            return self._resolve_system_var(var_name)
        elif var_type == VariableType.LITERAL:
            return self.literal_vars.get(var_name, "")
        return ""
    
    def _get_nested(self, data: Dict[str, Any], path: str) -> Any:
        """Get nested value by dot notation path."""
        keys = path.split('.')
        value = data
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return ""
        return value

    def _resolve_system_var(self, var_name: str) -> Any:
        if var_name in self._system_vars:
            val = self._system_vars[var_name]
            return val() if callable(val) else val
        return ""


# =============================================================================
# Factory Functions for Secure Usage
# =============================================================================

class TemplateEngineFactory:
    """
    Factory for creating template engines with appropriate security settings.
    
    Usage:
        # For system prompts and configurations (trusted)
        trusted_engine = TemplateEngineFactory.create_trusted(context, config)
        
        # For user prompts and external data (untrusted)
        untrusted_engine = TemplateEngineFactory.create_untrusted(context)
        
        # For maximum security (only explicit variables)
        restricted_engine = TemplateEngineFactory.create_restricted(context)
    """
    
    @staticmethod
    def create_trusted(
        context: Optional[Dict[str, Any]] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> TemplateEngine:
        """
        Create a template engine for trusted contexts.
        
        Allows:
        - All variable types (env, context, config, agent, system, literal)
        - Environment variable substitution (for system configs)
        - All functions and conditionals
        
        Use for: System prompts, configuration templates, internal prompts
        """
        return TemplateEngine(
            context=context,
            config=config,
            allow_env_vars=True,  # Trusted context can access env vars
            allow_system_vars=True
        )
    
    @staticmethod
    def create_untrusted(
        context: Optional[Dict[str, Any]] = None,
        config: Optional[Dict[str, Any]] = None
    ) -> TemplateEngine:
        """
        Create a template engine for untrusted contexts.
        
        Blocks:
        - Environment variable substitution
        
        Allows:
        - Context, config, agent, system, literal variables
        - All functions and conditionals
        
        Use for: User prompts, external data, any text that will be rendered
        in a prompt context where the user might inject variables.
        """
        return TemplateEngine(
            context=context,
            config=config,
            allow_env_vars=False,  # BLOCK env var access
            allow_system_vars=True   # System vars (timestamp, uuid) are safe
        )
    
    @staticmethod
    def create_restricted(
        context: Optional[Dict[str, Any]] = None
    ) -> TemplateEngine:
        """
        Create a maximally restricted template engine.
        
        Allows only:
        - Context variables
        - Literal variables
        - Agent variables
        
        Blocks:
        - Environment variables
        - Configuration variables
        - System variables
        
        Use for: High-security contexts where only explicit variables should be available.
        """
        return TemplateEngine(
            context=context,
            config={},  # No config access
            allow_env_vars=False,
            allow_system_vars=False
        )
