"""
Acquit Platform - TaskBot Automation Layer
Handles repetitive tasks, data formatting, and multi-LLM broadcast operations with security guards.
"""

from typing import Dict, Any, Optional, List
from security.permissions import SensitivityLevel, PermissionGuard, PermissionDeniedError
from .llm_router import LLMRouter
from .template_engine import TemplateEngine


class TaskBot:
    def __init__(
        self,
        llm_router: Optional[LLMRouter] = None,
        permission_guard: Optional[PermissionGuard] = None,
        template_engine: Optional[TemplateEngine] = None
    ):
        self.llm_router = llm_router
        self.permission_guard = permission_guard or PermissionGuard()
        self.template_engine = template_engine or TemplateEngine()

    def execute(self, task: Dict[str, Any], input_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        action = task.get("action", "format_output").lower()
        params = task.get("parameters", {})

        if action == "format_output":
            fmt = params.get("format", "json")
            return {
                "status": "success",
                "action": "format_output",
                "format": fmt,
                "formatted_data": input_data or {}
            }
        elif action == "fetch_data":
            return {
                "status": "success",
                "action": "fetch_data",
                "source": params.get("source", "court_records"),
                "records": []
            }
        else:
            return {
                "status": "success",
                "action": action,
                "data": input_data or {}
            }

    def broadcast_to_llms(
        self,
        task: Dict[str, Any],
        sensitivity: SensitivityLevel = SensitivityLevel.PUBLIC,
        providers: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Executes a task across external LLMs, ensuring sensitive case data is never broadcast.
        """
        # Security Guard check
        self.permission_guard.validate_broadcast(sensitivity)

        if not self.llm_router:
            raise RuntimeError("LLMRouter not configured on TaskBot")

        return self.llm_router.broadcast(task, sensitivity=sensitivity, providers=providers)

    def execute_on_all_llms(
        self,
        task: Dict[str, Any],
        sensitivity: SensitivityLevel = SensitivityLevel.PUBLIC,
        providers: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        return self.broadcast_to_llms(task, sensitivity=sensitivity, providers=providers)

    def get_llm_consensus(
        self,
        task: Dict[str, Any],
        sensitivity: SensitivityLevel = SensitivityLevel.PUBLIC,
        threshold: float = 0.7
    ) -> Dict[str, Any]:
        self.permission_guard.validate_broadcast(sensitivity)
        if not self.llm_router:
            raise RuntimeError("LLMRouter not configured on TaskBot")
        return {"status": "consensus_achieved", "threshold": threshold}
