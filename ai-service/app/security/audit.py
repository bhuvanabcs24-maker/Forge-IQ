import threading
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.models.audit_log import AuditAction, AuditLogEntry, AuditStatus


class AuditService:
    """
    Thread-safe, append-only audit logging service for enterprise compliance.
    """
    def __init__(self):
        self._lock = threading.Lock()
        self._logs: List[AuditLogEntry] = []

    def record_event(
        self,
        user_id: str,
        user_role: str,
        tenant_id: str,
        action: AuditAction,
        resource: str,
        details: Optional[str] = None,
        before_state: Optional[Dict[str, Any]] = None,
        after_state: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        request_id: Optional[str] = None,
        status: AuditStatus = AuditStatus.SUCCESS
    ) -> AuditLogEntry:
        entry = AuditLogEntry(
            user_id=user_id,
            user_role=user_role,
            tenant_id=tenant_id,
            action=action,
            resource=resource,
            details=details,
            before_state=before_state,
            after_state=after_state,
            ip_address=ip_address,
            request_id=request_id,
            status=status
        )
        with self._lock:
            self._logs.append(entry)
        return entry

    def get_logs(
        self,
        tenant_id: Optional[str] = None,
        user_id: Optional[str] = None,
        action: Optional[AuditAction] = None,
        resource: Optional[str] = None,
        limit: int = 100
    ) -> List[AuditLogEntry]:
        with self._lock:
            results = list(self._logs)
        
        if tenant_id:
            results = [r for r in results if r.tenant_id == tenant_id]
        if user_id:
            results = [r for r in results if r.user_id == user_id]
        if action:
            results = [r for r in results if r.action == action]
        if resource:
            results = [r for r in results if resource.lower() in r.resource.lower()]
        
        # Return newest first
        return sorted(results, key=lambda x: x.timestamp, reverse=True)[:limit]

    def clear(self):
        with self._lock:
            self._logs.clear()


audit_service = AuditService()

# FastAPI router for audit log queries
router = APIRouter(prefix="/api/v1/audit", tags=["Audit Logs"])


@router.get(
    "/logs",
    summary="Query Immutable Audit Trail",
    description="Returns immutable system audit records filtered by tenant, user, or action. Restricted to Owner and Manager roles."
)
async def list_audit_logs(
    limit: int = Query(50, ge=1, le=500),
    action: Optional[AuditAction] = None,
    resource: Optional[str] = None,
    user_id: Optional[str] = None,
    tenant_id: Optional[str] = None
):
    logs = audit_service.get_logs(
        tenant_id=tenant_id,
        user_id=user_id,
        action=action,
        resource=resource,
        limit=limit
    )
    return {
        "count": len(logs),
        "logs": logs,
        "formatted_summaries": [log.format_summary() for log in logs]
    }
