"""
Acquit Platform - Immutable Audit Logging
Maintains append-only execution records for compliance, explainability, and observability.
"""

import json
import os
import time
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any


@dataclass
class AuditEntry:
    task_id: str
    agent_id: str
    provider: str
    sensitivity_level: str
    tokens_used: int
    cost: float
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None

    def to_display_string(self) -> str:
        return (
            f"  Task: {self.task_id}, Agent: {self.agent_id}, Provider: {self.provider}, "
            f"Sensitivity: {self.sensitivity_level}, Tokens: {self.tokens_used}, Cost: ${self.cost:.6f}"
        )


class AuditLogger:
    def __init__(self, log_path: str = "audit.log"):
        self.log_path = log_path
        self._memory_log: List[AuditEntry] = []

    def record(
        self,
        task_id: str,
        agent_id: str,
        provider: str,
        sensitivity_level: str,
        tokens_used: int,
        cost: float,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AuditEntry:
        entry = AuditEntry(
            task_id=task_id,
            agent_id=agent_id,
            provider=provider,
            sensitivity_level=sensitivity_level,
            tokens_used=tokens_used,
            cost=cost,
            timestamp=time.strftime("%Y-%m-%d %H:%M:%S"),
            metadata=metadata or {}
        )
        self._memory_log.append(entry)

        # Append to immutable persistent log file
        try:
            with open(self.log_path, "a", encoding="utf-8") as f:
                f.write(json.dumps(asdict(entry)) + "\n")
        except Exception:
            pass

        return entry

    def get_entries(self) -> List[AuditEntry]:
        return list(self._memory_log)

    def print_summary(self) -> None:
        print("Audit Log Entries")
        print("-" * 80)
        print(f"Total audit entries: {len(self._memory_log)}")
        for entry in self._memory_log:
            print(entry.to_display_string())
