from typing import List
from fastapi import APIRouter, Depends, Query
from app.models.responses import APIEnvelope, COMMON_ERROR_RESPONSES
from app.models.schemas import TelemetryRecord
from app.security.auth import get_tenant_context, TenantContext
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/api/v1/telemetry", tags=["Observability & Telemetry"])

@router.get(
    "",
    response_model=APIEnvelope[List[TelemetryRecord]],
    summary="List Organization AI Telemetry & Observability Records",
    description="""
Returns sanitized execution telemetry audit records for the authenticated organization.
- Tracks `request_id`, `agent_used`, `latency_ms`, model confidence, and operational status.
- **Pagination**: Supports count limiting via `?limit=N` (default 50, max 200). Note: Cursor-based pagination (`?cursor=...`) is not currently implemented.
- **Sorting**: Records are delivered in reverse-chronological order (most recent first). Arbitrary field sorting (`?sort=...`) is not currently supported.
    """,
    responses=COMMON_ERROR_RESPONSES
)
async def get_telemetry_records(
    limit: int = Query(50, ge=1, le=200, description="Maximum number of telemetry records to return", examples=[50]),
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Returns sanitized AI observability records for the authenticated organization.
    """
    records = telemetry_service.get_recent(org_id=tenant.org_id, limit=limit)
    return APIEnvelope(
        success=True,
        data=records,
        provider_used="telemetry_engine"
    )
