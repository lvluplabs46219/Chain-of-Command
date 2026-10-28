"""
Acquit Platform - Base Agent Class
Abstract foundation for all specialized legal AI agents with permission and variable capabilities.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from core.template_engine import TemplateEngine
from security.permissions import PermissionGuard, Permission, SensitivityLevel, PermissionDeniedError


class BaseAgent(ABC):
    def __init__(
        self,
        name: str,
        config: Optional[Dict[str, Any]] = None,
        llm_router: Optional[Any] = None,
        task_bot: Optional[Any] = None,
        permission_guard: Optional[PermissionGuard] = None,
        template_engine: Optional[TemplateEngine] = None
    ):
        self.name = name
        self.config = config or {}
        self.llm_router = llm_router
        self.task_bot = task_bot
        self.permission_guard = permission_guard
        self.template_engine = template_engine or TemplateEngine()
        self.capabilities: List[str] = self.config.get("capabilities", [])

    def execute(
        self,
        task: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None,
        sensitivity: SensitivityLevel = SensitivityLevel.INTERNAL
    ) -> Dict[str, Any]:
        """
        Executes an assigned task after applying template variable substitutions.
        """
        ctx = context or {}
        # Variable substitution on task parameters and descriptions
        processed_task = self.template_engine.substitute_dict(task, local_vars=ctx)

        try:
            result = self._do_specialized_work(processed_task, ctx, sensitivity)
            return {
                "status": "success",
                "agent": self.name,
                "task_id": task.get("task_id", "unknown"),
                "result": result
            }
        except Exception as e:
            return {
                "status": "error",
                "agent": self.name,
                "task_id": task.get("task_id", "unknown"),
                "error": str(e)
            }

    @abstractmethod
    def _do_specialized_work(
        self,
        task: Dict[str, Any],
        context: Dict[str, Any],
        sensitivity: SensitivityLevel
    ) -> Dict[str, Any]:
        """Subclasses implement specific legal tech capabilities here."""
        pass
