from typing import Dict, Any, List, Optional
from datetime import datetime

def calculate_quotation(
    material_cost: float,
    laser_cutting_cost: float = 0.0,
    bending_cost: float = 0.0,
    machining_cost: float = 0.0,
    welding_cost: float = 0.0,
    finishing_cost: Optional[float] = None,
    inspection_cost: float = 350.0,
    setup_cost: float = 500.0,
    cam_programming_fee: float = 650.0,
    tooling_cost: float = 0.0,
    packaging_logistics_cost: float = 400.0,
    overhead_percentage: float = 8.0,
    risk_contingency_percentage: float = 3.0,
    margin_percentage: float = 18.0,
    tax_gst_percentage: float = 18.0,
    quantity: int = 1,
    rush_surcharge_percentage: float = 0.0
) -> Dict[str, Any]:
    """
    Deterministic Quotation Engine implementing Section 17 & 24.
    Every single line item is mathematically computed and traceable.
    """
    assumptions = []
    confidence = 0.98

    # Handle missing finishing cost per Section 24 & Example 7
    effective_finishing_cost = finishing_cost
    if effective_finishing_cost is None:
        effective_finishing_cost = 0.0
        assumptions.append(
            "ASSUMPTION: Powder coating / surface finishing rate not verified. "
            "Final quotation requires current approved finishing rate confirmation."
        )
        confidence = 0.70

    # 1. Direct Manufacturing Cost
    direct_manufacturing_cost = round(
        material_cost +
        laser_cutting_cost +
        bending_cost +
        machining_cost +
        welding_cost +
        effective_finishing_cost +
        inspection_cost +
        packaging_logistics_cost,
        2
    )

    # 2. Setup & Engineering NRE
    total_setup_and_nre = round(setup_cost + cam_programming_fee + tooling_cost, 2)
    setup_per_unit = round(total_setup_and_nre / quantity, 2) if quantity > 0 else total_setup_and_nre

    # Subtotal Before Overhead
    subtotal_manufacturing = direct_manufacturing_cost + total_setup_and_nre

    # 3. Factory Overhead & Risk Contingency
    overhead_cost = round(subtotal_manufacturing * (overhead_percentage / 100.0), 2)
    risk_cost = round(subtotal_manufacturing * (risk_contingency_percentage / 100.0), 2)
    rush_cost = round(subtotal_manufacturing * (rush_surcharge_percentage / 100.0), 2)

    total_cost_basis = round(subtotal_manufacturing + overhead_cost + risk_cost + rush_cost, 2)

    # 4. Profit Margin
    margin_cost = round(total_cost_basis * (margin_percentage / 100.0), 2)
    total_before_tax = round(total_cost_basis + margin_cost, 2)

    # 5. Applicable GST Tax
    tax_amount = round(total_before_tax * (tax_gst_percentage / 100.0), 2)
    final_price_inr = round(total_before_tax + tax_amount, 2)

    unit_price_inr = round(final_price_inr / quantity, 2) if quantity > 0 else final_price_inr

    return {
        "quantity": quantity,
        "line_items": {
            "material_cost_inr": material_cost,
            "laser_cutting_cost_inr": laser_cutting_cost,
            "bending_cost_inr": bending_cost,
            "machining_cost_inr": machining_cost,
            "welding_cost_inr": welding_cost,
            "finishing_cost_inr": effective_finishing_cost,
            "inspection_cost_inr": inspection_cost,
            "packaging_logistics_cost_inr": packaging_logistics_cost,
            "setup_cost_inr": setup_cost,
            "cam_programming_fee_inr": cam_programming_fee,
            "tooling_cost_inr": tooling_cost,
        },
        "breakdown": {
            "direct_manufacturing_cost": direct_manufacturing_cost,
            "total_setup_and_nre": total_setup_and_nre,
            "setup_cost_per_unit": setup_per_unit,
            "overhead_cost": overhead_cost,
            "overhead_percentage": overhead_percentage,
            "risk_contingency_cost": risk_cost,
            "rush_surcharge_cost": rush_cost,
            "margin_cost": margin_cost,
            "margin_percentage": margin_percentage,
            "total_before_tax": total_before_tax,
            "tax_gst_percentage": tax_gst_percentage,
            "tax_amount_inr": tax_amount,
            "final_price_inr": final_price_inr,
            "unit_price_inr": unit_price_inr
        },
        "assumptions": assumptions,
        "confidence": confidence,
        "confidence_level": "HIGH" if confidence >= 0.9 else ("MEDIUM" if confidence >= 0.75 else "LOW")
    }

def calculate_lead_time_days(
    queue_days: int = 1,
    material_procurement_days: int = 2,
    processing_days: int = 2,
    inspection_days: int = 1,
    finishing_days: int = 2,
    dispatch_buffer_days: int = 1,
    rush_priority: bool = False
) -> int:
    """
    Implements Section 28 Lead Time Formula:
    Queue + Material Procurement + Processing + Inspection + Finishing + Dispatch Buffer
    """
    total = (
        queue_days +
        material_procurement_days +
        processing_days +
        inspection_days +
        finishing_days +
        dispatch_buffer_days
    )
    if rush_priority:
        # Overtime & priority machine queue compresses queue and buffer
        total = max(3, total - 2)
    return total
