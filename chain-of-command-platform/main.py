"""
Acquit Platform — Agentic System Architecture
Main entry point and execution demonstration of core multi-agent workflows,
security guards, and compliance audit logging.
"""

import os
import sys

# Ensure local imports work seamlessly
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from security.permissions import (
    PermissionGuard,
    Permission,
    SensitivityLevel,
    PermissionDeniedError,
)
from security.audit import AuditLogger
from core.template_engine import TemplateEngine
from core.llm_router import LLMRouter
from core.task_bot import TaskBot
from core.orchestrator import Orchestrator
from agents.research_agent import ResearchAgent
from agents.code_agent import CodeAgent


def build_system():
    """Initializes and interconnects all platform components."""
    # 1. Security & Compliance
    permission_guard = PermissionGuard()
    permission_guard.register_agent(
        agent_id="research_agent",
        allowed_permissions={
            Permission.READ_DOCUMENTS,
            Permission.ACCESS_CASE_DATA,
            Permission.LEGAL_RESEARCH,
            Permission.DELEGATE_LLM,
        },
        max_sensitivity=SensitivityLevel.CASE_DATA,
    )
    permission_guard.register_agent(
        agent_id="code_agent",
        allowed_permissions={
            Permission.EXECUTE_CODE,
            Permission.READ_DOCUMENTS,
            Permission.DELEGATE_LLM,
        },
        max_sensitivity=SensitivityLevel.INTERNAL,
    )

    audit_logger = AuditLogger(log_path=os.path.join(current_dir, "audit.log"))

    # 2. Template & Prompt Security
    template_engine = TemplateEngine(
        context={"platform": "Acquit.ai", "user_role": "pro_se_litigant"}
    )

    # 3. Model Routing
    llm_router = LLMRouter(
        audit_logger=audit_logger,
        permission_guard=permission_guard,
    )

    # 4. Automation Layer
    task_bot = TaskBot(
        llm_router=llm_router,
        permission_guard=permission_guard,
        template_engine=template_engine,
    )

    # 5. Specialized Agents
    research_agent = ResearchAgent(
        llm_router=llm_router,
        task_bot=task_bot,
        permission_guard=permission_guard,
        template_engine=template_engine,
    )
    code_agent = CodeAgent(
        llm_router=llm_router,
        task_bot=task_bot,
        permission_guard=permission_guard,
        template_engine=template_engine,
    )

    agents = {
        "research_agent": research_agent,
        "code_agent": code_agent,
    }

    # 6. Workflow Orchestrator
    orchestrator = Orchestrator(
        agents=agents,
        task_bot=task_bot,
        llm_router=llm_router,
        permission_guard=permission_guard,
        template_engine=template_engine,
    )

    return {
        "orchestrator": orchestrator,
        "task_bot": task_bot,
        "llm_router": llm_router,
        "permission_guard": permission_guard,
        "audit_logger": audit_logger,
        "agents": agents,
    }


def main():
    print("=" * 80)
    print("Acquit Platform — Agentic System Architecture")
    print("=" * 80)
    print()
    print("Initializing components...")
    system = build_system()
    print("✓ All components initialized successfully")
    print()

    # -------------------------------------------------------------------------
    # Example 1: Legal Research Workflow
    # -------------------------------------------------------------------------
    print("-" * 80)
    print("Example 1: Legal Research Workflow")
    print("-" * 80)

    legal_workflow = {
        "id": "wf_research_01",
        "sensitivity": "case_data",
        "steps": [
            {
                "agent": "research_agent",
                "action": "legal_research",
                "parameters": {
                    "query": "{{context.case_number}}",
                    "depth": "comprehensive",
                },
            },
            {
                "agent": "task_bot",
                "action": "format_output",
                "parameters": {"format": "json"},
            },
        ],
    }

    res1 = system["orchestrator"].execute_workflow(
        legal_workflow, context={"case_number": "2026-CV-001"}
    )
    print("Workflow completed successfully:")
    print(f"  Status: {res1['status']}")
    print(f"  Number of results: {res1['num_results']}")
    for idx, r in enumerate(res1["results"], 1):
        agent_name = r["agent"]
        print(f"  Result {idx}:")
        print(f"    Agent: {agent_name}")
        if agent_name == "research_agent":
            data = r["result"]
            print(f"    Found {data.get('found_items', 3)} items")
            print(f"    Query: {data.get('query')}")
        else:
            print("    ...")
    print()

    # -------------------------------------------------------------------------
    # Example 2: Code Generation Workflow
    # -------------------------------------------------------------------------
    print("-" * 80)
    print("Example 2: Code Generation Workflow")
    print("-" * 80)

    code_workflow = {
        "id": "wf_code_02",
        "sensitivity": "internal",
        "steps": [
            {
                "agent": "code_agent",
                "action": "generate_code",
                "parameters": {
                    "requirements": "Create a function to redact sensitive information...",
                    "language": "python",
                },
            }
        ],
    }

    res2 = system["orchestrator"].execute_workflow(code_workflow)
    print("Workflow completed successfully:")
    print(f"  Status: {res2['status']}")
    print(f"  Number of results: {res2['num_results']}")
    for idx, r in enumerate(res2["results"], 1):
        print(f"  Result {idx}:")
        print(f"    Agent: {r['agent']}")
        code_text = r["result"].get("code", "")
        print("    Generated code snippet (first 100 chars):")
        first_100 = code_text[:100].strip().replace("\n", "\n    ")
        print(f"    {first_100}...")
    print()

    # -------------------------------------------------------------------------
    # Example 3: Multi-LLM Broadcast (Non-Sensitive Data)
    # -------------------------------------------------------------------------
    print("-" * 80)
    print("Example 3: Multi-LLM Broadcast (Non-Sensitive Data)")
    print("-" * 80)

    broadcast_task = {
        "task_id": "task_002",
        "task": "Analyze this public legal precedent",
        "jurisdiction": "federal",
    }
    broadcast_res = system["task_bot"].broadcast_to_llms(
        broadcast_task, sensitivity=SensitivityLevel.INTERNAL
    )
    print("Broadcast completed successfully:")
    print(f"  Provider: {broadcast_res['first_provider']}")
    print(f"  Result: {broadcast_res['result']}")
    print()

    # -------------------------------------------------------------------------
    # Example 4: Blocked Broadcast (Sensitive Data)
    # -------------------------------------------------------------------------
    print("-" * 80)
    print("Example 4: Blocked Broadcast (Sensitive Data)")
    print("-" * 80)

    sensitive_task = {
        "task_id": "task_004",
        "task": "Extract confidential client financial records",
    }
    try:
        system["task_bot"].broadcast_to_llms(
            sensitive_task, sensitivity=SensitivityLevel.CASE_DATA
        )
        print("Error: Broadcast should have been blocked!")
    except PermissionDeniedError as e:
        print(f"✓ Broadcast correctly blocked: {str(e)}")
    print()

    # -------------------------------------------------------------------------
    # Example 5: Permission Check
    # -------------------------------------------------------------------------
    print("-" * 80)
    print("Example 5: Permission Check")
    print("-" * 80)

    try:
        system["permission_guard"].check_permission(
            agent_id="code_agent",
            required_permission=Permission.ACCESS_CASE_DATA,
            task_id="task_005",
            sensitivity=SensitivityLevel.CASE_DATA,
        )
        print("Error: Permission should have been denied!")
    except PermissionDeniedError as e:
        print(f"✓ Permission correctly denied: {str(e)}")
    print()

    # -------------------------------------------------------------------------
    # Audit Log Entries
    # -------------------------------------------------------------------------
    print("-" * 80)
    print("Audit Log Entries")
    print("-" * 80)
    audit_entries = system["audit_logger"].get_entries()
    print(f"Total audit entries: {len(audit_entries)}")
    for entry in audit_entries:
        print(entry.to_display_string())


if __name__ == "__main__":
    main()
