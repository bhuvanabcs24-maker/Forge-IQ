import pytest
from app.tools.material_calculator import (
    calculate_part_weight,
    calculate_material_requirement,
    calculate_material_cost,
)
from app.tools.inventory_tools import (
    check_inventory,
    find_remnant_material,
    resolve_inventory_decision,
)
from app.tools.laser_calculator import (
    get_laser_cutting_speed,
    estimate_laser_cutting_time,
    calculate_laser_cost,
)
from app.tools.bending_calculator import (
    calculate_bend_allowance,
    calculate_bend_deduction,
    check_bending_feasibility,
    calculate_bending_cost,
)
from app.tools.quotation_calculator import (
    calculate_quotation,
    calculate_lead_time_days,
)

def test_material_weight_and_cost_calculation():
    """
    Test deterministic weight formula: V = L*W*T, W = V * density
    1000 x 500 x 2 mm sheet with density 7930 kg/m3 = 7.93 kg
    """
    weight = calculate_part_weight(1000.0, 500.0, 2.0, 7930.0)
    assert weight == 7.93

    req = calculate_material_requirement(120.0, 80.0, 3.0, quantity=500, density_kg_m3=7930.0, nesting_efficiency=0.85)
    assert req["quantity"] == 500
    assert req["net_weight_single_kg"] > 0
    assert req["total_gross_weight_kg"] > req["total_net_weight_kg"]

    cost_res = calculate_material_cost(10.0, "SS304")
    assert cost_res["success"] is True
    assert cost_res["rate_inr_kg"] == 228.0
    assert cost_res["cost_inr"] == 2280.0

def test_inventory_remnant_before_procurement():
    """
    Verify Section 32 & Example 5: Checks usable remnants before recommending procurement.
    """
    decision = resolve_inventory_decision(
        material_code="SS304",
        required_sheets=15,  # 10 available, 5 shortage
        part_length_mm=800.0,
        part_width_mm=500.0,
        thickness_mm=3.0
    )
    assert decision["shortage_sheets"] == 5
    assert decision["usable_remnants_count"] >= 1
    assert "remnants" in decision["recommendation"].lower()

def test_laser_cutting_calculations():
    """
    Verify laser speed lookup and time estimation for 3mm SS304.
    """
    speed = get_laser_cutting_speed("SS304", 3.0)
    assert speed == 4200.0

    times = estimate_laser_cutting_time(cut_length_mm=4200.0, cutting_speed_mm_min=4200.0, pierce_count=4)
    assert times["cutting_time_min"] == 1.0

    cost = calculate_laser_cost(cut_length_mm=1200.0, pierce_count=2, material_grade="SS304", thickness_mm=3.0, quantity=100)
    assert cost["success"] is True
    assert cost["total_laser_cost_inr"] > 0
    assert cost["laser_cost_per_part_inr"] > 0

def test_bending_feasibility_and_hardox_refusal():
    """
    Verify Section 16 & Section 18: Flags short flanges and strictly refuses normal parameters for Hardox.
    """
    # Short flange test (12 mm flange on 3mm SS304 with V=24mm)
    res_normal = check_bending_feasibility(
        material_grade="SS304",
        thickness_mm=3.0,
        flange_length_mm=12.0,
        bend_length_mm=120.0
    )
    assert res_normal["feasible"] is True
    assert res_normal["short_flange_warning"] is True
    assert "short-flange" in res_normal["warnings"][0].lower()

    # Hardox refusal test
    res_hardox = check_bending_feasibility(
        material_grade="Hardox 450",
        thickness_mm=6.0,
        flange_length_mm=50.0,
        bend_length_mm=200.0
    )
    assert res_hardox["feasible"] is False
    assert res_hardox["engineering_review_required"] is True
    assert "Hardox" in res_hardox["message"]

def test_deterministic_quotation_and_missing_finishing():
    """
    Verify Section 24 & Example 7: Mathematical quote accuracy and ASSUMPTION tagging on missing rates.
    """
    quote = calculate_quotation(
        material_cost=12500.0,
        laser_cutting_cost=3200.0,
        bending_cost=1800.0,
        finishing_cost=None,  # Missing finishing rate
        quantity=500
    )
    assert quote["confidence_level"] == "LOW"
    assert any("ASSUMPTION" in a for a in quote["assumptions"])
    assert quote["breakdown"]["final_price_inr"] > 0
    assert quote["breakdown"]["tax_amount_inr"] > 0

    lead_time = calculate_lead_time_days(queue_days=1, material_procurement_days=2, processing_days=2)
    assert lead_time >= 7
