"""
Acquit Platform - Workflow Orchestrator
Coordinates multi-agent workflows, performs task decomposition, enforces security guards,
and aggregates structured results.
"""

import uuid
from typing import Dict, Any, List, Optional
from dataclasses import dataclass, field

from security.permissions import PermissionGuard, Permission, SensitivityLevel, PermissionDeniedError
from .template_engine import TemplateEngine
from .task_bot import TaskBot
from .llm_router import LLMRouter


@dataclass
class WorkflowTask:
    task_id: str = field(default_factory=lambda: f"task_{uuid.uuid4().hex[:6]}")
    name: str = ""
    description: str = ""
    sensitivity: SensitivityLevel = SensitivityLevel.INTERNAL
    steps: List[Dict[str, Any]] = field(default_factory=list)
    context: Dict[str, Any] = field(default_factory=dict)


class Orchestrator:
    # Mapping actions to required permissions for validation
    ACTION_PERMISSION_MAP = {
        "legal_research": Permission.LEGAL_RESEARCH,
        "precedent_lookup": Permission.LEGAL_RESEARCH,
        "statute_analysis": Permission.LEGAL_RESEARCH,
        "generate_code": Permission.EXECUTE_CODE,
        "access_case_data": Permission.ACCESS_CASE_DATA,
        "read_documents": Permission.READ_DOCUMENTS,
    }

    def __init__(
        self,
        agents: Dict[str, Any],
        task_bot: TaskBot,
        llm_router: Optional[LLMRouter] = None,
        permission_guard: Optional[PermissionGuard] = None,
        template_engine: Optional[TemplateEngine] = None
    ):
        self.agents = agents
        self.task_bot = task_bot
        self.llm_router = llm_router
        self.permission_guard = permission_guard or PermissionGuard()
        self.template_engine = template_engine or TemplateEngine()

    def execute_workflow(
        self,
        workflow: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes a multi-step workflow with variable substitution and permission enforcement.
        """
        ctx = context or {}
        workflow_id = workflow.get("id", f"wf_{uuid.uuid4().hex[:6]}")
        sensitivity_val = workflow.get("sensitivity", "internal")
        try:
            sensitivity = SensitivityLevel(sensitivity_val)
        except ValueError:
            sensitivity = SensitivityLevel.INTERNAL

        steps = workflow.get("steps", [])
        results = []

        for i, step in enumerate(steps):
            step_id = f"{workflow_id}_step_{i+1}"
            agent_name = step.get("agent")
            action = step.get("action", "execute")
            params = step.get("parameters", {})

            # Substitute variables across parameters
            resolved_params = self.template_engine.substitute_dict(params, local_vars=ctx)
            task_spec = {
                "task_id": step_id,
                "action": action,
                "parameters": resolved_params,
                "context": ctx,
                "sensitivity": sensitivity
            }

            if agent_name == "task_bot" or agent_name == "TaskBot":
                # Routed to automation task bot
                res = self.task_bot.execute(task_spec, input_data=results[-1] if results else None)
                results.append({"agent": "TaskBot", "result": res})
            else:
                agent = self.agents.get(agent_name)
                if not agent:
                    return {
                        "status": "error",
                        "error": f"Target agent '{agent_name}' not configured in orchestrator"
                    }

                # Verify agent permission before execution
                required_perm = self.ACTION_PERMISSION_MAP.get(action.lower(), Permission.READ_DOCUMENTS)
                self.permission_guard.check_permission(
                    agent_id=agent_name,
                    required_permission=required_perm,
                    task_id=step_id,
                    sensitivity=sensitivity
                )

                res = agent.execute(task_spec, context=ctx, sensitivity=sensitivity)
                results.append({"agent": agent_name, "result": res.get("result", res)})

        return {
            "status": "completed",
            "workflow_id": workflow_id,
            "results": results,
            "num_results": len(results)
        }
