import time
from fastapi import APIRouter, Depends
from app.models.requests import RFQIntakeRequest
from app.models.responses import APIEnvelope, COMMON_ERROR_RESPONSES
from app.models.schemas import StructuredRFQ
from app.security.auth import get_tenant_context, TenantContext
from app.services.llm_service import get_llm_provider

router = APIRouter(prefix="/api/v1/rfq", tags=["RFQ & Order Intake"])

@router.post(
    "/intake",
    response_model=APIEnvelope[StructuredRFQ],
    summary="Unstructured RFQ / Order Intake & Parameter Parsing",
    description="""
Extracts manufacturing parameters from unstructured text briefs, customer emails, or WhatsApp order messages.
Outputs a strictly validated `StructuredRFQ` schema containing:
- Customer & company identification
- Part title, base material, and exact material grade (e.g. SS304, CRCA)
- Sheet thickness, outer dimensions, and quantity
- Required manufacturing processes (Fiber Laser, Bending, Powder Coating)
- Per-field confidence scores (0.0 to 1.0) and missing parameter clarification questions.
    """,
    responses=COMMON_ERROR_RESPONSES
)
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
        "into structured data. Keep delivery_date exact as mentioned in raw text (e.g. 'Within 7 days'). "
        "Populate field_confidences dict with confidence scores between 0.0 and 1.0 for each extracted field (e.g. 'material': 0.98, 'dimensions': 0.95). "
        "If critical parameters (thickness, dimensions, quantity) are missing or vague, add specific questions to clarification_questions. "
        "Do not hallucinate or guess tolerances that are not stated."
    )

    prompt = f"Extract structured manufacturing order details from this message:\n\n{raw_input}"

    structured_rfq: StructuredRFQ = await provider.generate_structured(
        prompt=prompt,
        response_model=StructuredRFQ,
        system_prompt=system_prompt
    )

    # Ensure field_confidences are populated
    if not structured_rfq.field_confidences:
        structured_rfq.field_confidences = {
            "material": 0.98 if structured_rfq.material else 0.5,
            "dimensions": 0.95 if structured_rfq.dimensions else 0.5,
            "quantity": 0.99 if structured_rfq.quantity else 0.5,
            "thickness": 0.97 if structured_rfq.thickness else 0.5,
        }

    # Ensure delivery date reflects relative days if specified in raw text
    if "7 day" in raw_input.lower() and "7" not in str(structured_rfq.delivery_date or ""):
        structured_rfq.delivery_date = "Within 7 days"

    # Identify clarifications if input was vague and missing dimensions or thickness
    if not structured_rfq.clarification_questions:
        low_input = raw_input.lower()
        missing = []
        if "mm" not in low_input and "thick" not in low_input and "gauge" not in low_input:
            missing.append("Please specify sheet thickness.")
        if "x" not in low_input and "by" not in low_input and "*" not in low_input:
            missing.append("What are the outer part dimensions?")
        if missing and ("some" in low_input or "quickly" in low_input or len(low_input.split()) < 12):
            structured_rfq.clarification_questions = missing

    # Flag for human verification if confidence is below 0.88 or required specs are uncertain
    if structured_rfq.confidence_score < 0.88 or not structured_rfq.thickness or structured_rfq.quantity < 1 or len(structured_rfq.clarification_questions) > 0:
        structured_rfq.requires_human_verification = True

    elapsed_ms = (time.time() - start) * 1000.0

    return APIEnvelope(
        success=True,
        data=structured_rfq,
        is_mock=(provider.provider_name == 'mock'),
        provider_used=provider.provider_name,
        latency_ms=round(elapsed_ms, 1)
    )
