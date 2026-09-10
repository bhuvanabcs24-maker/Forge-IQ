import time
from fastapi import APIRouter, Depends
from app.models.requests import QuotationEstimationRequest
from app.models.responses import APIEnvelope, COMMON_ERROR_RESPONSES
from app.models.schemas import QuotationEstimate
from app.security.auth import get_tenant_context, TenantContext
from app.agents.quotation_agent import QuotationAgent

router = APIRouter(prefix="/api/v1/quotation", tags=["Quotation Estimation"])

quotation_agent = QuotationAgent()

@router.post(
    "/estimate",
    response_model=APIEnvelope[QuotationEstimate],
    summary="Estimate Technical Quotation & Manufacturing Parameters",
    description="""
Calculates technical manufacturing estimates for sheet metal components prior to commercial pricing:
- Raw blank material weight (kg) based on alloy density and part geometry
- Anticipated scrap rate percentage
- Total laser cutting perimeter length (meters) and beam-on cutting time
- Press brake bending stroke count and machine cycle time
- Secondary deburring / finishing requirements and labor minutes
- Estimated factory lead time in calendar days

*Note: Commercial markups and GST pricing calculations are deterministically computed on these engineering outputs.*
    """,
    responses=COMMON_ERROR_RESPONSES
)
async def estimate_quotation_parameters(
    req: QuotationEstimationRequest,
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Estimates technical manufacturing parameters (cycle time, scrap, blank weight, labor minutes).
    NOTE: Deterministic pricing formulas in ForgeIQ will calculate final prices from these estimates.
    """
    start = time.time()
    
    estimate = await quotation_agent.estimate_parameters(
        part_title=req.part_title,
        material=f"{req.material} {req.material_grade or ''}".strip(),
        thickness=req.thickness or "3 mm",
        quantity=req.quantity,
        dimensions=req.dimensions or "Standard Profile"
    )

    elapsed_ms = (time.time() - start) * 1000.0

    return APIEnvelope(
        success=True,
        data=estimate,
        is_mock=True if estimate.confidence_score == 0.93 else False,
        provider_used="quotation_agent",
        latency_ms=round(elapsed_ms, 1)
    )
