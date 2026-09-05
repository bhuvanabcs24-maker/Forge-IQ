from fastapi import APIRouter, Depends
from app.models.requests import ChatQueryRequest, CustomerChatRequest
from app.models.responses import APIEnvelope, CopilotResponse
from app.security.auth import get_tenant_context, TenantContext
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/v1/chat", tags=["Chat & Copilot"])

@router.post("/completions", response_model=APIEnvelope[CopilotResponse])
async def chat_completions(
    req: ChatQueryRequest,
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Main Copilot entrypoint supporting multi-agent routing,
    organization-scoped RAG retrieval, evidence citations, and confidence scoring.
    """
    res = await orchestrator.process_query(
        query=req.query,
        tenant=tenant,
        context=req.context
    )
    return APIEnvelope(
        success=True,
        data=res,
        is_mock=res.is_mock,
        provider_used=res.provider_used,
        latency_ms=res.latency_ms
    )

@router.post("/customer", response_model=APIEnvelope[CopilotResponse])
async def customer_chat(
    req: CustomerChatRequest,
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Dedicated endpoint for Buyer / Customer Portal assistants.
    Strictly enforces customer_id scope to prevent cross-tenant data leakage.
    """
    customer_tenant = TenantContext(
        org_id=tenant.org_id,
        user_id=tenant.user_id,
        user_role="customer",
        customer_id=req.customer_id,
        is_admin=False
    )
    res = await orchestrator.process_query(
        query=req.query,
        tenant=customer_tenant,
        context={"order_id": req.order_id}
    )
    return APIEnvelope(
        success=True,
        data=res,
        is_mock=res.is_mock,
        provider_used=res.provider_used,
        latency_ms=res.latency_ms
    )
