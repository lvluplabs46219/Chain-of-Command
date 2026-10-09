"""
Acquit Platform - Code Agent
Specializes in generating legal-tech automation scripts, redaction tools, and schema validators.
"""

from typing import Dict, Any, Optional
from .base_agent import BaseAgent
from security.permissions import Permission, SensitivityLevel


class CodeAgent(BaseAgent):
    def __init__(self, config: Optional[Dict[str, Any]] = None, **kwargs):
        cfg = config or {}
        cfg.setdefault("capabilities", ["code_generation", "redaction", "script_generation"])
        super().__init__(name="code_agent", config=cfg, **kwargs)

    def _do_specialized_work(
        self,
        task: Dict[str, Any],
        context: Dict[str, Any],
        sensitivity: SensitivityLevel
    ) -> Dict[str, Any]:
        params = task.get("parameters", {})
        requirements = params.get("requirements", "Create a function to redact sensitive information...")
        language = params.get("language", "python")

        # Delegate the code-generation prompt directly to the LLM router for live output
        prompt = (
            f"Generate production-quality {language} code for the following legal-tech requirement: "
            f"{requirements}. Return only the complete, runnable code with docstrings and no explanation."
        )

        llm_result: Optional[Dict[str, Any]] = None
        if self.llm_router:
            llm_result = self.llm_router.delegate(
                task={"prompt": prompt},
                sensitivity=sensitivity,
                agent_id=self.name
            )

        if llm_result and llm_result.get("status") == "success":
            code = llm_result.get("content", "")
            return {
                "language": language,
                "requirements": requirements,
                "provider": llm_result.get("provider"),
                "model": llm_result.get("model"),
                "code": code,
                "lines": len(code.strip().splitlines()) if code.strip() else 0,
                "tokens_used": llm_result.get("tokens_used"),
                "cost": llm_result.get("cost"),
                "task_id": llm_result.get("task_id")
            }

        # No router or delegation failed - surface the error instead of mock data
        error = llm_result.get("error") if llm_result else "No LLM router configured"
        return {
            "language": language,
            "requirements": requirements,
            "status": "error",
            "error": f"LLM delegation failed: {error}"
        }
