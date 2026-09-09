import math
from typing import Dict, Any, Optional
from app.rag.knowledge_loader import factory_knowledge_service

def calculate_part_weight(
    length_mm: float,
    width_mm: float,
    thickness_mm: float,
    density_kg_m3: float
) -> float:
    """
    Deterministic formula:
    Volume (m3) = (length / 1000) * (width / 1000) * (thickness / 1000)
    Weight (kg) = Volume * density
    """
    if length_mm <= 0 or width_mm <= 0 or thickness_mm <= 0 or density_kg_m3 <= 0:
        return 0.0
    volume_m3 = (length_mm / 1000.0) * (width_mm / 1000.0) * (thickness_mm / 1000.0)
    return round(volume_m3 * density_kg_m3, 4)

def calculate_sheet_weight(
    sheet_length_mm: float,
    sheet_width_mm: float,
    thickness_mm: float,
    density_kg_m3: float
) -> float:
    return calculate_part_weight(sheet_length_mm, sheet_width_mm, thickness_mm, density_kg_m3)

def calculate_scrap(
    purchased_weight_kg: float,
    net_part_weight_kg: float
) -> float:
    scrap = max(0.0, purchased_weight_kg - net_part_weight_kg)
    return round(scrap, 4)

def calculate_material_requirement(
    part_length_mm: float,
    part_width_mm: float,
    thickness_mm: float,
    quantity: int,
    density_kg_m3: float,
    nesting_efficiency: float = 0.85
) -> Dict[str, Any]:
    """
    Calculates material requirements including net weight, gross weight with nesting,
    scrap percentage, and sheet count.
    """
    net_weight_single = calculate_part_weight(part_length_mm, part_width_mm, thickness_mm, density_kg_m3)
    total_net_weight = round(net_weight_single * quantity, 4)

    eff = max(0.10, min(1.0, nesting_efficiency))
    total_gross_weight = round(total_net_weight / eff, 4)
    total_scrap_weight = calculate_scrap(total_gross_weight, total_net_weight)
    scrap_percentage = round((total_scrap_weight / total_gross_weight) * 100.0, 2) if total_gross_weight > 0 else 0.0

    return {
        "part_dimensions_mm": f"{part_length_mm} x {part_width_mm} x {thickness_mm}",
        "quantity": quantity,
        "net_weight_single_kg": net_weight_single,
        "total_net_weight_kg": total_net_weight,
        "total_gross_weight_kg": total_gross_weight,
        "total_scrap_weight_kg": total_scrap_weight,
        "nesting_efficiency": eff,
        "scrap_percentage": scrap_percentage
    }

def calculate_material_cost(
    required_gross_weight_kg: float,
    material_code: str,
    override_price_inr_kg: Optional[float] = None
) -> Dict[str, Any]:
    """
    Determines material cost from verified factory catalog or override.
    Refuses to invent price if missing or expired.
    """
    rate = override_price_inr_kg
    source = "OVERRIDE"
    is_stale = False

    if rate is None:
        mat = factory_knowledge_service.get_material(material_code)
        if mat and mat.current_price_inr_kg:
            rate = mat.current_price_inr_kg
            source = mat.source
            is_stale = mat.is_stale
        else:
            return {
                "success": False,
                "error": "MATERIAL_RATE_UNAVAILABLE",
                "message": f"Current material rate for '{material_code}' is missing or expired. Supplier quote required.",
                "cost_inr": None,
                "confidence": 0.0
            }

    cost = round(required_gross_weight_kg * rate, 2)
    return {
        "success": True,
        "material_code": material_code,
        "rate_inr_kg": rate,
        "source": source,
        "is_stale": is_stale,
        "gross_weight_kg": required_gross_weight_kg,
        "cost_inr": cost,
        "confidence": 0.98 if not is_stale else 0.40
    }
