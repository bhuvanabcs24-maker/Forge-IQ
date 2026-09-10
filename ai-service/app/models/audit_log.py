from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field
import uuid


class AuditAction(str, Enum):
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    RATE_LIMITED = "RATE_LIMITED"
    SECURITY_VIOLATION = "SECURITY_VIOLATION"


class AuditStatus(str, Enum):
    SUCCESS = "SUCCESS"
    FAILURE = "FAILURE"
    BLOCKED = "BLOCKED"


class AuditLogEntry(BaseModel):
    """
    Immutable audit log record capturing WHO did WHAT, WHEN, and to WHICH RESOURCE.
    """
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    user_id: str = Field(..., description="ID of the user performing the action")
    user_role: str = Field(..., description="Role of the user at the time of execution")
    tenant_id: str = Field(..., description="Tenant / factory organization identifier")
    action: AuditAction = Field(..., description="Action performed")
    resource: str = Field(..., description="Target resource (e.g. 'Order #FG-2042')")
    details: Optional[str] = Field(None, description="Human-readable summary of the action")
    before_state: Optional[Dict[str, Any]] = Field(None, description="Resource state before mutation")
    after_state: Optional[Dict[str, Any]] = Field(None, description="Resource state after mutation")
    ip_address: Optional[str] = Field(None, description="Client IP address")
    request_id: Optional[str] = Field(None, description="Tracing correlation ID")
    status: AuditStatus = Field(default=AuditStatus.SUCCESS, description="Execution outcome")

    def format_summary(self) -> str:
        """
        Formats audit log into standard executive summary:
        e.g. 'Order #FG-2042 approved by manager_xyz at 2026-09-10T14:32:15Z'
        """
        action_verb = self.action.value.lower()
        if action_verb == "approve":
            action_verb = "approved"
        elif action_verb == "reject":
            action_verb = "rejected"
        elif action_verb == "create":
            action_verb = "created"
        elif action_verb == "update":
            action_verb = "updated"
        elif action_verb == "delete":
            action_verb = "deleted"
        
        return f"{self.resource} {action_verb} by {self.user_id} at {self.timestamp}"
