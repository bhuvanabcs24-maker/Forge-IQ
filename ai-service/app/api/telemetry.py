from typing import List
from fastapi import APIRouter, Depends, Query
from app.models.responses import APIEnvelope
from app.models.schemas import TelemetryRecord
from app.security.auth import get_tenant_context, TenantContext
from app.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/api/v1/telemetry", tags=["Observability & Telemetry"])

@router.get("", response_model=APIEnvelope[List[TelemetryRecord]])
async def get_telemetry_records(
    limit: int = Query(50, ge=1, le=200),
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
