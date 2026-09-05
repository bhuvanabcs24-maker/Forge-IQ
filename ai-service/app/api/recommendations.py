import time
from fastapi import APIRouter, Depends
from app.models.requests import FactoryMatchRequest
from app.models.responses import APIEnvelope
from app.models.schemas import FactoryMatchRecommendation
from app.security.auth import get_tenant_context, TenantContext
from app.services.llm_service import get_llm_provider

router = APIRouter(prefix="/api/v1/recommendations", tags=["Manufacturer Matching"])

@router.post("/match", response_model=APIEnvelope[FactoryMatchRecommendation])
async def recommend_factory_match(
    req: FactoryMatchRequest,
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Evaluates buyer manufacturing specifications against verified supplier registry
    and produces an evidence-based recommendation with qualitative reasoning.
    """
    start = time.time()
    provider = get_llm_provider()

    prompt = (
        f"Match the best supplier factory for:\n"
        f"RFQ: {req.rfq_title}\n"
        f"Material: {req.material_grade}\n"
        f"Quantity: {req.quantity}\n"
        f"Delivery Window: {req.required_delivery_days} days\n"
        f"Target Budget: ₹{req.target_budget or 45000}\n"
        f"Required Processes: {', '.join(req.required_processes or ['Laser Cutting', 'Bending'])}\n"
        f"Buyer Preference: {req.buyer_preference}\n"
    )

    recommendation = await provider.generate_structured(
        prompt=prompt,
        response_model=FactoryMatchRecommendation
    )

    elapsed_ms = (time.time() - start) * 1000.0

    return APIEnvelope(
        success=True,
        data=recommendation,
        is_mock=(provider.provider_name == 'mock'),
        provider_used=provider.provider_name,
        latency_ms=round(elapsed_ms, 1)
    )
