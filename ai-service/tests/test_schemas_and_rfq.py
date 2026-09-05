import pytest
from pydantic import ValidationError
from app.models.schemas import StructuredRFQ, QuotationEstimate, ProductionSchedulingProposal
from app.api.rfq import rfq_intake
from app.models.requests import RFQIntakeRequest
from app.security.auth import TenantContext

def test_structured_rfq_schema_validation():
    # Valid model
    rfq = StructuredRFQ(
        part_title="Precision Bracket",
        material="Stainless Steel",
        material_grade="304",
        thickness="3 mm",
        quantity=500,
        delivery_date="Friday"
    )
    assert rfq.part_title == "Precision Bracket"
    assert rfq.quantity == 500
    assert rfq.requires_human_verification is False

    # Invalid model (quantity < 1)
    with pytest.raises(ValidationError):
        StructuredRFQ(
            part_title="Invalid",
            material="Steel",
            quantity=0
        )

def test_quotation_estimate_schema():
    estimate = QuotationEstimate(
        material_type="Aluminum",
        material_grade="6061-T6",
        raw_material_weight_kg=2.4,
        scrap_rate_percentage=10.0,
        cut_length_meters=2.1,
        machine_cycle_time_minutes=3.5,
        labor_time_minutes=5.0,
        estimated_lead_time_days=5
    )
    assert estimate.raw_material_weight_kg == 2.4
    assert estimate.confidence_score > 0.80

@pytest.mark.asyncio
async def test_rfq_intake_endpoint_mock():
    tenant = TenantContext(org_id="test_org", user_id="test_user")
    req = RFQIntakeRequest(
        raw_text="Need 500 stainless steel brackets, 3 mm thick, delivery within 7 days."
    )
    res = await rfq_intake(req, tenant)
    assert res.success is True
    assert res.data.quantity == 500
    assert "Stainless Steel" in res.data.material or "304" in res.data.material_grade
