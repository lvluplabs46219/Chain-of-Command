"""
Acquit Platform - Security & Permission Subsystem
Enforces role-based agent permissions and data sensitivity levels.
"""

from enum import Enum
from typing import Dict, Set, Optional, Any
from dataclasses import dataclass, field


class SensitivityLevel(Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CASE_DATA = "case_data"
    PRIVILEGED = "privileged"

    @property
    def rank(self) -> int:
        hierarchy = {
            "public": 0,
            "internal": 1,
            "case_data": 2,
            "privileged": 3,
        }
        return hierarchy.get(self.value, 1)

    def __ge__(self, other: 'SensitivityLevel') -> bool:
        if not isinstance(other, SensitivityLevel):
            return NotImplemented
        return self.rank >= other.rank

    def __gt__(self, other: 'SensitivityLevel') -> bool:
        if not isinstance(other, SensitivityLevel):
            return NotImplemented
        return self.rank > other.rank

    def __le__(self, other: 'SensitivityLevel') -> bool:
        if not isinstance(other, SensitivityLevel):
            return NotImplemented
        return self.rank <= other.rank

    def __lt__(self, other: 'SensitivityLevel') -> bool:
        if not isinstance(other, SensitivityLevel):
            return NotImplemented
        return self.rank < other.rank


class Permission(Enum):
    READ_DOCUMENTS = "READ_DOCUMENTS"
    ACCESS_CASE_DATA = "ACCESS_CASE_DATA"
    EXECUTE_CODE = "EXECUTE_CODE"
    LEGAL_RESEARCH = "LEGAL_RESEARCH"
    NETWORK_ACCESS = "NETWORK_ACCESS"
    DELEGATE_LLM = "DELEGATE_LLM"


class PermissionDeniedError(Exception):
    """Raised when an agent attempts an action or accesses data exceeding its permissions."""
    pass


@dataclass
class AgentPermissionProfile:
    agent_id: str
    allowed: Set[Permission] = field(default_factory=set)
    max_sensitivity: SensitivityLevel = SensitivityLevel.INTERNAL


class PermissionGuard:
    def __init__(self):
        self._profiles: Dict[str, AgentPermissionProfile] = {}

    def register_agent(
        self,
        agent_id: str,
        allowed_permissions: Set[Permission],
        max_sensitivity: SensitivityLevel = SensitivityLevel.INTERNAL
    ) -> None:
        self._profiles[agent_id] = AgentPermissionProfile(
            agent_id=agent_id,
            allowed=set(allowed_permissions),
            max_sensitivity=max_sensitivity
        )

    def get_profile(self, agent_id: str) -> Optional[AgentPermissionProfile]:
        return self._profiles.get(agent_id)

    def check_permission(
        self,
        agent_id: str,
        required_permission: Permission,
        task_id: str = "unknown",
        sensitivity: SensitivityLevel = SensitivityLevel.INTERNAL
    ) -> bool:
        """
        Validates both functional permission and data sensitivity thresholds.
        Raises PermissionDeniedError if validation fails.
        """
        profile = self._profiles.get(agent_id)
        if not profile:
            raise PermissionDeniedError(
                f"Agent '{agent_id}' denied permission: unregistered agent (Task: {task_id})"
            )

        if required_permission not in profile.allowed:
            raise PermissionDeniedError(
                f"Agent '{agent_id}' denied permission: {required_permission.value} (Task: {task_id})"
            )

        if sensitivity.rank > profile.max_sensitivity.rank:
            raise PermissionDeniedError(
                f"Agent '{agent_id}' exceeded sensitivity ceiling: requested {sensitivity.value} > max {profile.max_sensitivity.value} (Task: {task_id})"
            )

        return True

    def validate_broadcast(self, sensitivity: SensitivityLevel) -> None:
        """
        Prohibits broadcasting sensitive or privileged data across all external LLMs.
        """
        if sensitivity.rank >= SensitivityLevel.CASE_DATA.rank:
            raise PermissionDeniedError("Broadcast prohibited for sensitive data")
