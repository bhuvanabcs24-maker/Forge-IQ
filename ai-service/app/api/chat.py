from fastapi import APIRouter, Depends
from app.models.requests import ChatQueryRequest, CustomerChatRequest
from app.models.responses import APIEnvelope, CopilotResponse, COMMON_ERROR_RESPONSES
from app.security.auth import get_tenant_context, TenantContext
from app.agents.orchestrator import orchestrator

router = APIRouter(prefix="/api/v1/chat", tags=["Chat & Copilot"])

@router.post(
    "/completions",
    response_model=APIEnvelope[CopilotResponse],
    summary="Multi-Agent Manufacturing Operations Copilot",
    description="""
Evaluates manufacturing inquiries, machine telemetry questions, or quotation calculations.
Routes intent to specialized autonomous agents:
- **ProductionAgent**: Machine capacity, bottleneck resolution, shift schedules.
- **InventoryAgent**: Sheet stock levels, material reservations, warehouse location.
- **QuotationAgent**: Laser cutting cycle times, bending tonnage, raw material scrap.
- **AnalyticsAgent**: COGS, margin variances, scrap metrics.

Enforces strict tenant isolation via `X-Org-ID` and retrieves context from the company's private RAG index.
    """,
    responses=COMMON_ERROR_RESPONSES
)
async def chat_completions(
    req: ChatQueryRequest,
    tenant: TenantContext = Depends(get_tenant_context)
):
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

@router.post(
    "/customer",
    response_model=APIEnvelope[CopilotResponse],
    summary="Customer Portal Buyer Copilot",
    description="""
Dedicated assistant for external buyers and customers.
Provides order tracking, quotation explanations, and delivery ETAs strictly constrained
to the authenticated `customer_id`. Guarantees zero cross-tenant or factory internal data leakage.
    """,
    responses=COMMON_ERROR_RESPONSES
)
async def customer_chat(
    req: CustomerChatRequest,
    tenant: TenantContext = Depends(get_tenant_context)
):
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
