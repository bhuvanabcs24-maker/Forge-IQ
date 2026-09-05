import time
from fastapi import APIRouter, Depends
from app.models.requests import ProductionRecommendationRequest
from app.models.responses import APIEnvelope
from app.models.schemas import ProductionSchedulingProposal
from app.security.auth import get_tenant_context, TenantContext
from app.services.llm_service import get_llm_provider

router = APIRouter(prefix="/api/v1/production", tags=["Production AI"])

@router.post("/recommendations", response_model=APIEnvelope[ProductionSchedulingProposal])
async def get_production_scheduling_recommendation(
    req: ProductionRecommendationRequest,
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Evaluates current shop floor load and generates scheduling recommendations.
    Always flags manager_approval_required=True before committing changes to shop floor.
    """
    start = time.time()
    provider = get_llm_provider()

    prompt = (
        f"Recommend machine routing and shift schedule for Job:\n"
        f"ID: {req.job_id}\n"
        f"Part: {req.part_name}\n"
        f"Quantity: {req.quantity}\n"
        f"Required Processes: {', '.join(req.required_processes)}\n"
        f"Target Deadline: {req.target_deadline}\n"
    )

    proposal = await provider.generate_structured(
        prompt=prompt,
        response_model=ProductionSchedulingProposal
    )

    # Overwrite job details from request to guarantee consistency
    proposal.job_id = req.job_id
    proposal.job_title = f"{req.part_name} ({req.quantity} pcs)"
    proposal.manager_approval_required = True

    elapsed_ms = (time.time() - start) * 1000.0

    return APIEnvelope(
        success=True,
        data=proposal,
        is_mock=(provider.provider_name == 'mock'),
        provider_used=provider.provider_name,
        latency_ms=round(elapsed_ms, 1)
    )
