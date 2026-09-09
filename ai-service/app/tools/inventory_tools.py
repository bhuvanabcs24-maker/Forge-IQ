from typing import Dict, Any, List, Optional
from app.rag.knowledge_loader import factory_knowledge_service

# Mock verified remnants registry (reusable sheet remnants on shop floor)
VERIFIED_REMNANTS: List[Dict[str, Any]] = [
    {
        "remnant_id": "REM-SS304-01",
        "material": "SS304",
        "thickness_mm": 3.0,
        "length_mm": 1200.0,
        "width_mm": 800.0,
        "weight_kg": 22.8,
        "location": "BAY-2-RACK-C",
        "usable": True
    },
    {
        "remnant_id": "REM-SS304-02",
        "material": "SS304",
        "thickness_mm": 3.0,
        "length_mm": 950.0,
        "width_mm": 600.0,
        "weight_kg": 13.5,
        "location": "BAY-2-RACK-C",
        "usable": True
    },
    {
        "remnant_id": "REM-AL6061-01",
        "material": "AL6061-T6",
        "thickness_mm": 6.0,
        "length_mm": 1000.0,
        "width_mm": 500.0,
        "weight_kg": 8.1,
        "location": "BAY-1-RACK-A",
        "usable": True
    }
]

def check_inventory(material_code: str, required_qty: int) -> Dict[str, Any]:
    """
    Checks exact inventory, reserved stock, and available quantity from factory DB.
    Never guesses or hallucinates stock numbers.
    """
    mat = factory_knowledge_service.get_material(material_code)
    if not mat:
        return {
            "success": False,
            "error": "MATERIAL_NOT_FOUND",
            "message": f"Material '{material_code}' does not exist in factory inventory catalog."
        }

    available = max(0, mat.stock_quantity - mat.reserved_quantity)
    shortage = max(0, required_qty - available)

    return {
        "success": True,
        "material_code": mat.material_code,
        "family": mat.family,
        "grade": mat.grade,
        "total_stock": mat.stock_quantity,
        "reserved_stock": mat.reserved_quantity,
        "available_stock": available,
        "required_qty": required_qty,
        "has_sufficient_stock": (shortage == 0),
        "shortage_qty": shortage,
        "unit": "sheets",
        "supplier": mat.supplier,
        "supplier_lead_time_days": mat.supplier_lead_time_days
    }

def find_remnant_material(
    material_code: str,
    min_length_mm: float = 0.0,
    min_width_mm: float = 0.0,
    thickness_mm: Optional[float] = None
) -> List[Dict[str, Any]]:
    """
    Searches usable off-cuts/remnants before recommending new sheet purchase.
    """
    code_upper = material_code.upper()
    matches = []
    for rem in VERIFIED_REMNANTS:
        if not rem.get("usable", False):
            continue
        if code_upper in rem["material"].upper():
            if thickness_mm is not None and abs(rem["thickness_mm"] - thickness_mm) > 0.05:
                continue
            if rem["length_mm"] >= min_length_mm and rem["width_mm"] >= min_width_mm:
                matches.append(rem)
    return matches

def resolve_inventory_decision(
    material_code: str,
    required_sheets: int,
    part_length_mm: float = 0.0,
    part_width_mm: float = 0.0,
    thickness_mm: Optional[float] = None
) -> Dict[str, Any]:
    """
    Implements Section 32 Inventory Decision Logic:
    1. Check exact inventory
    2. Check reserved inventory
    3. Check reusable remnants
    4. Check shortage
    5. Formulate procurement or remnant recommendation
    """
    inv = check_inventory(material_code, required_sheets)
    if not inv.get("success"):
        return inv

    available = inv["available_stock"]
    shortage = inv["shortage_qty"]

    remnants = find_remnant_material(material_code, part_length_mm, part_width_mm, thickness_mm)
    usable_remnants_count = len(remnants)

    net_shortage = max(0, shortage - usable_remnants_count)

    if shortage == 0:
        recommendation = f"Sufficient factory stock available ({available} sheets ready). Reserve {required_sheets} sheets."
    elif usable_remnants_count >= shortage:
        recommendation = f"Stock shortage of {shortage} sheets can be fully covered by {usable_remnants_count} usable shop-floor remnants."
    else:
        recommendation = (
            f"Stock shortage detected: Need {required_sheets}, Available: {available}. "
            f"Found {usable_remnants_count} usable remnants. Recommend procuring {net_shortage} sheets "
            f"from approved supplier '{inv['supplier']}' (lead time: {inv['supplier_lead_time_days']} days)."
        )

    return {
        "material_code": material_code,
        "required_sheets": required_sheets,
        "available_sheets": available,
        "shortage_sheets": shortage,
        "usable_remnants_count": usable_remnants_count,
        "remnants_found": remnants,
        "net_procurement_needed_sheets": net_shortage,
        "recommendation": recommendation,
        "confidence": 0.98
    }
