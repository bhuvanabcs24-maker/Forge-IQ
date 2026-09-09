import math
from typing import Dict, Any, Optional
from app.rag.knowledge_loader import factory_knowledge_service

# Standard factory K-factors
DEFAULT_K_FACTORS = {
    "SS304": 0.38,
    "SS316L": 0.38,
    "MS": 0.42,
    "CRCA": 0.42,
    "AL6061": 0.40,
}

def calculate_bend_allowance(
    thickness_mm: float,
    inside_radius_mm: float,
    bend_angle_deg: float = 90.0,
    k_factor: float = 0.40
) -> float:
    """
    BA = (pi / 180) * Angle * (R + K * T)
    """
    angle_rad = math.radians(bend_angle_deg)
    ba = angle_rad * (inside_radius_mm + (k_factor * thickness_mm))
    return round(ba, 4)

def calculate_bend_deduction(
    thickness_mm: float,
    inside_radius_mm: float,
    bend_angle_deg: float = 90.0,
    k_factor: float = 0.40
) -> float:
    """
    BD = 2 * (R + T) * tan(Angle / 2) - BA
    """
    ba = calculate_bend_allowance(thickness_mm, inside_radius_mm, bend_angle_deg, k_factor)
    half_angle_rad = math.radians(bend_angle_deg / 2.0)
    setback = (inside_radius_mm + thickness_mm) * math.tan(half_angle_rad)
    bd = (2.0 * setback) - ba
    return round(bd, 4)

def check_bending_feasibility(
    material_grade: str,
    thickness_mm: float,
    flange_length_mm: float,
    bend_length_mm: float,
    inside_radius_mm: Optional[float] = None
) -> Dict[str, Any]:
    """
    Validates air bending rules:
    - V-die opening V ~ 8T
    - Minimum inside bend radius ~ 1.0T to 1.5T
    - Minimum flange ~ V / 1.4 or 6T
    - Refuses mild steel parameters for Hardox wear plates
    """
    warnings = []
    risks = []
    grade_upper = material_grade.upper()

    # Section 18 & Example 8: Hardox wear plate check
    if "HARDOX" in grade_upper:
        return {
            "feasible": False,
            "status": "ENGINEERING_VERIFICATION_REQUIRED",
            "message": (
                "Hardox wear plate detected. Normal mild steel bending parameters cannot be used. "
                "Hardox requires higher press tonnage (3-4x MS), punch radius >= 3T, and die opening >= 10-12T. "
                "Verify exact grade, thickness, rolling direction, and press-brake capacity before proceeding."
            ),
            "warnings": ["Hardox high-yield springback and crack risk"],
            "engineering_review_required": True
        }

    # Reference V-die opening: V ~ 8T
    recommended_v_die = round(8.0 * thickness_mm, 1)
    min_radius = inside_radius_mm if inside_radius_mm is not None else round(1.2 * thickness_mm, 2)

    # Minimum flange check: approx recommended_v_die * 0.7
    min_safe_flange = round(recommended_v_die * 0.7, 1)
    short_flange_detected = False

    if flange_length_mm < min_safe_flange:
        short_flange_detected = True
        warnings.append(
            f"Potential short-flange condition detected ({flange_length_mm} mm < recommended {min_safe_flange} mm for V={recommended_v_die}mm). "
            f"Verify tooling and minimum flange requirement against the factory press-brake table."
        )

    # Bending tonnage estimate: Tonnage (tons/meter) ~ (68 * T^2) / V for MS, +40% for SS
    material_factor = 1.45 if ("SS" in grade_upper or "304" in grade_upper) else (0.6 if "AL" in grade_upper else 1.0)
    tonnage_per_meter = (68.0 * (thickness_mm ** 2) / recommended_v_die) * material_factor
    total_tonnage_required = round((tonnage_per_meter * (bend_length_mm / 1000.0)), 1)

    return {
        "feasible": True,
        "material_grade": material_grade,
        "thickness_mm": thickness_mm,
        "recommended_v_die_mm": recommended_v_die,
        "inside_radius_mm": min_radius,
        "minimum_safe_flange_mm": min_safe_flange,
        "short_flange_warning": short_flange_detected,
        "estimated_tonnage_required": total_tonnage_required,
        "warnings": warnings,
        "engineering_review_required": short_flange_detected
    }

def calculate_bending_cost(
    num_bends: int,
    quantity: int = 1,
    machine_id: str = "PRESS-001",
    cycle_time_per_bend_sec: float = 15.0
) -> Dict[str, Any]:
    machine = factory_knowledge_service.get_machine(machine_id)
    rate_hourly = machine.hourly_rate_inr if machine and machine.hourly_rate_inr else 950.0
    setup_cost = machine.setup_cost_inr if machine and machine.setup_cost_inr else 350.0

    total_strokes = num_bends * quantity
    total_time_min = (total_strokes * cycle_time_per_bend_sec) / 60.0

    runtime_cost = (total_time_min / 60.0) * rate_hourly
    total_cost = round(setup_cost + runtime_cost, 2)
    cost_per_part = round(total_cost / quantity, 2) if quantity > 0 else 0.0

    return {
        "success": True,
        "machine_id": machine_id,
        "num_bends_per_part": num_bends,
        "quantity": quantity,
        "total_strokes": total_strokes,
        "total_time_minutes": round(total_time_min, 2),
        "setup_cost_inr": setup_cost,
        "runtime_cost_inr": round(runtime_cost, 2),
        "total_bending_cost_inr": total_cost,
        "bending_cost_per_part_inr": cost_per_part,
        "confidence": 0.98
    }
