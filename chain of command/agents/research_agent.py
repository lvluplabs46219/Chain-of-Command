"""
Acquit Platform - Research Agent
Performs statutory analysis, precedent queries, and case document research.
"""

from typing import Dict, Any, Optional
from .base_agent import BaseAgent
from security.permissions import Permission, SensitivityLevel


class ResearchAgent(BaseAgent):
    def __init__(self, config: Optional[Dict[str, Any]] = None, **kwargs):
        cfg = config or {}
        cfg.setdefault("capabilities", ["research", "legal_research", "precedent_lookup", "statute_analysis"])
        super().__init__(name="research_agent", config=cfg, **kwargs)

    def _do_specialized_work(
        self,
        task: Dict[str, Any],
        context: Dict[str, Any],
        sensitivity: SensitivityLevel
    ) -> Dict[str, Any]:
        params = task.get("parameters", {})
        query = params.get("query") or params.get("topic") or context.get("case_number", "unknown_case")
        depth = params.get("depth", "comprehensive")

        # Delegate the research prompt directly to the LLM router for live output
        prompt = (
            f"Perform {depth} legal research for case '{query}'. "
            f"Identify controlling statutes, precedent, and court rules relevant to the query, "
            f"and provide a concise summary of findings."
        )

        llm_result: Optional[Dict[str, Any]] = None
        if self.llm_router:
            llm_result = self.llm_router.delegate(
                task={"prompt": prompt},
                sensitivity=sensitivity,
                agent_id=self.name
            )

        if llm_result and llm_result.get("status") == "success":
            return {
                "query": query,
                "depth": depth,
                "provider": llm_result.get("provider"),
                "model": llm_result.get("model"),
                "authorities": llm_result.get("content"),
                "summary": llm_result.get("content"),
                "tokens_used": llm_result.get("tokens_used"),
                "cost": llm_result.get("cost"),
                "task_id": llm_result.get("task_id")
            }

        # No router or delegation failed - surface the error instead of mock data
        error = llm_result.get("error") if llm_result else "No LLM router configured"
        return {
            "query": query,
            "depth": depth,
            "status": "error",
            "error": f"LLM delegation failed: {error}"
        }
