import time
from fastapi import APIRouter, Depends
from app.models.requests import RFQIntakeRequest
from app.models.responses import APIEnvelope
from app.models.schemas import StructuredRFQ
from app.security.auth import get_tenant_context, TenantContext
from app.services.llm_service import get_llm_provider

router = APIRouter(prefix="/api/v1/rfq", tags=["RFQ & Order Intake"])

@router.post("/intake", response_model=APIEnvelope[StructuredRFQ])
async def rfq_intake(
    req: RFQIntakeRequest,
    tenant: TenantContext = Depends(get_tenant_context)
):
    """
    Parses unstructured text, emails, or WhatsApp order messages into
    a strictly validated Pydantic StructuredRFQ schema.
    """
    start = time.time()
    provider = get_llm_provider()

    raw_input = req.raw_text or f"Order file: {req.file_name or 'unnamed_rfq.pdf'}"
    if req.sample_preset_id:
        raw_input = f"{raw_input} (Preset: {req.sample_preset_id})"

    system_prompt = (
        "You are ForgeIQ's AI Order Intake Agent. "
        "Extract manufacturing parameters (customer, part, material, grade, thickness, dimensions, quantity, delivery date, processes) "
        "into structured data. Do not hallucinate or guess tolerances that are not stated."
    )

    prompt = f"Extract structured manufacturing order details from this message:\n\n{raw_input}"

    structured_rfq: StructuredRFQ = await provider.generate_structured(
        prompt=prompt,
        response_model=StructuredRFQ,
        system_prompt=system_prompt
    )

    # Flag for human verification if confidence is below 0.88 or required specs are uncertain
    if structured_rfq.confidence_score < 0.88 or not structured_rfq.thickness or structured_rfq.quantity < 1:
        structured_rfq.requires_human_verification = True

    elapsed_ms = (time.time() - start) * 1000.0

    return APIEnvelope(
        success=True,
        data=structured_rfq,
        is_mock=(provider.provider_name == 'mock'),
        provider_used=provider.provider_name,
        latency_ms=round(elapsed_ms, 1)
    )
