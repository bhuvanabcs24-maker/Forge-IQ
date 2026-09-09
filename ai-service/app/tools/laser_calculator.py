from typing import Dict, Any, Optional
from app.rag.knowledge_loader import factory_knowledge_service

# Verified cutting speed parameter card (Bystronic 6kW Fiber Laser)
VERIFIED_LASER_SPEEDS: Dict[str, Dict[float, float]] = {
    "SS304": {
        1.0: 12000.0,  # mm/min with N2
        2.0: 6500.0,
        3.0: 4200.0,
        4.0: 2800.0,
        6.0: 1600.0,
        8.0: 1100.0,
        10.0: 800.0
    },
    "MS": {
        1.0: 15000.0,  # mm/min with O2
        2.0: 8500.0,
        3.0: 5500.0,
        4.0: 4000.0,
        6.0: 2600.0,
        8.0: 1800.0,
        10.0: 1400.0,
        12.0: 1100.0
    },
    "AL6061": {
        1.0: 16000.0,
        2.0: 8000.0,
        3.0: 5000.0,
        6.0: 2200.0,
        8.0: 1400.0
    }
}

def get_laser_cutting_speed(material_grade: str, thickness_mm: float) -> Optional[float]:
    mat_key = "SS304" if ("304" in material_grade or "SS" in material_grade.upper()) else (
        "AL6061" if ("6061" in material_grade or "AL" in material_grade.upper()) else "MS"
    )
    chart = VERIFIED_LASER_SPEEDS.get(mat_key, {})
    if thickness_mm in chart:
        return chart[thickness_mm]
    # Linear interpolation between nearest available thicknesses
    available_thk = sorted(chart.keys())
    if not available_thk or thickness_mm < available_thk[0] or thickness_mm > available_thk[-1]:
        return None
    for i in range(len(available_thk) - 1):
        t1, t2 = available_thk[i], available_thk[i+1]
        if t1 <= thickness_mm <= t2:
            s1, s2 = chart[t1], chart[t2]
            ratio = (thickness_mm - t1) / (t2 - t1)
            return round(s1 + ratio * (s2 - s1), 1)
    return None

def estimate_laser_cutting_time(
    cut_length_mm: float,
    cutting_speed_mm_min: float,
    pierce_count: int,
    pierce_time_sec: float = 0.5
) -> Dict[str, Any]:
    """
    Cutting time = (cut_length / cutting_speed) [minutes]
    Piercing time = (pierce_count * pierce_time_sec) / 60 [minutes]
    Total time = Cutting time + Piercing time
    """
    if cutting_speed_mm_min <= 0 or cut_length_mm <= 0:
        return {"cutting_time_min": 0.0, "piercing_time_min": 0.0, "total_machine_time_min": 0.0}

    cut_time = cut_length_mm / cutting_speed_mm_min
    pierce_time = (pierce_count * pierce_time_sec) / 60.0
    total = cut_time + pierce_time

    return {
        "cut_length_mm": cut_length_mm,
        "cutting_speed_mm_min": cutting_speed_mm_min,
        "pierce_count": pierce_count,
        "cutting_time_min": round(cut_time, 3),
        "piercing_time_min": round(pierce_time, 3),
        "total_machine_time_min": round(total, 3)
    }

def calculate_laser_cost(
    cut_length_mm: float,
    pierce_count: int,
    material_grade: str,
    thickness_mm: float,
    quantity: int = 1,
    machine_id: str = "LASER-001"
) -> Dict[str, Any]:
    speed = get_laser_cutting_speed(material_grade, thickness_mm)
    if speed is None:
        return {
            "success": False,
            "error": "PARAMETER_MISSING",
            "message": f"Factory cutting parameters missing for {material_grade} at {thickness_mm} mm. Engineering verification required."
        }

    machine = factory_knowledge_service.get_machine(machine_id)
    rate_hourly = machine.hourly_rate_inr if machine and machine.hourly_rate_inr else 1850.0
    setup_cost = machine.setup_cost_inr if machine and machine.setup_cost_inr else 450.0

    time_breakdown = estimate_laser_cutting_time(cut_length_mm, speed, pierce_count)
    unit_machine_time_min = time_breakdown["total_machine_time_min"]
    total_machine_time_min = unit_machine_time_min * quantity

    # Machine Cost = (runtime_min / 60) * hourly_rate
    runtime_cost = (total_machine_time_min / 60.0) * rate_hourly

    # Consumables / Assist Gas allowance (approx Rs 12/min for N2 high-pressure)
    gas_cost = total_machine_time_min * 12.0
    total_cost = round(setup_cost + runtime_cost + gas_cost, 2)
    cost_per_part = round(total_cost / quantity, 2) if quantity > 0 else 0.0

    return {
        "success": True,
        "machine_id": machine_id,
        "cutting_speed_mm_min": speed,
        "time_per_part_min": round(unit_machine_time_min, 3),
        "total_runtime_min": round(total_machine_time_min, 2),
        "setup_cost_inr": setup_cost,
        "runtime_cost_inr": round(runtime_cost, 2),
        "gas_cost_inr": round(gas_cost, 2),
        "total_laser_cost_inr": total_cost,
        "laser_cost_per_part_inr": cost_per_part,
        "confidence": 0.98
    }
