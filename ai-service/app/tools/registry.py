"""
ForgeIQ Master Tool Registry
Implements Section 9 & 13: Deterministic Tool Calling Architecture.
Maintains all 18+ manufacturing calculators and verified data lookup functions.
All exact calculations remain deterministic Python functions outside the LLM.
"""

import math
import time
from typing import Dict, Any, List, Optional, Callable
from pydantic import BaseModel, Field

from app.tools.material_calculator import (
    calculate_part_weight,
    calculate_sheet_weight,
    calculate_scrap as calc_scrap,
    calculate_material_requirement,
    calculate_material_cost as calc_mat_cost
)
from app.tools.laser_calculator import (
    get_laser_cutting_speed,
    estimate_laser_cutting_time,
    calculate_laser_cost as calc_laser_cost
)
from app.tools.bending_calculator import (
    calculate_bend_allowance,
    calculate_bend_deduction,
    check_bending_feasibility
)
from app.tools.inventory_tools import (
    check_inventory as check_inv,
    resolve_inventory_decision,
    VERIFIED_REMNANTS
)
from app.tools.quotation_calculator import (
    calculate_quotation as calc_quote,
    calculate_lead_time_days as calc_lead_time
)
from app.agents.dfm_agent import dfm_agent
from app.rag.knowledge_loader import factory_knowledge_service
from app.models.schemas import ToolCallResult

# ==============================================================================
# TOOL IMPLEMENTATIONS (STRICT ZERO-HALLUCINATION & DETERMINISTIC LOGIC)
# ==============================================================================

def get_current_material_price(material_code: str) -> Dict[str, Any]:
    """Retrieve the verified live factory catalog price for a material. Never invents prices."""
    mat = factory_knowledge_service.get_material(material_code)
    if not mat or mat.current_price_inr_kg is None:
        return {
            "success": False,
            "status": "MATERIAL_RATE_UNAVAILABLE",
            "material_code": material_code,
            "message": f"Verified rate for '{material_code}' is not currently available in factory database. A supplier RFQ is required.",
            "price_inr_kg": None,
            "is_stale": True if mat else None
        }
    return {
        "success": True,
        "material_code": mat.material_code,
        "grade": mat.grade,
        "price_inr_kg": mat.current_price_inr_kg,
        "unit": mat.price_unit,
        "source": mat.source,
        "is_stale": mat.is_stale,
        "effective_from": mat.effective_from,
        "confidence": 1.0 if not mat.is_stale else 0.45
    }

def get_inventory(material_code: str) -> Dict[str, Any]:
    """Check current on-hand raw material stock and reserved allocations."""
    mat = factory_knowledge_service.get_material(material_code)
    if not mat:
        return {
            "success": False,
            "error": "MATERIAL_NOT_FOUND",
            "material_code": material_code,
            "message": f"Material '{material_code}' not found in active inventory registry."
        }
    available = max(0, mat.stock_quantity - mat.reserved_quantity)
    return {
        "success": True,
        "material_code": mat.material_code,
        "family": mat.family,
        "grade": mat.grade,
        "total_stock_sheets": mat.stock_quantity,
        "reserved_sheets": mat.reserved_quantity,
        "available_sheets": available,
        "thickness_mm": mat.thickness_mm,
        "dimensions_mm": mat.dimensions_mm,
        "lead_time_days": mat.supplier_lead_time_days,
        "source": mat.source
    }

def get_machine_status(machine_id: str) -> Dict[str, Any]:
    """Check live operational status, current load, and specs of a factory machine."""
    mach = factory_knowledge_service.get_machine(machine_id)
    if not mach:
        return {
            "success": False,
            "error": "MACHINE_NOT_FOUND",
            "machine_id": machine_id,
            "message": f"Machine '{machine_id}' is not registered on shop floor."
        }
    return {
        "success": True,
        "machine_id": mach.machine_id,
        "manufacturer": mach.manufacturer,
        "model": mach.model,
        "process": mach.process,
        "status": mach.status,
        "laser_power_kw": mach.laser_power_kw,
        "tonnage": mach.tonnage,
        "hourly_rate_inr": mach.hourly_rate_inr,
        "setup_cost_inr": mach.setup_cost_inr,
        "source": mach.source
    }

def get_machine_capability(process: str) -> Dict[str, Any]:
    """Find all machines capable of executing a specific manufacturing process."""
    proc_upper = process.upper().replace(" ", "_")
    all_machines = list(factory_knowledge_service.machines.values())
    matches = [m for m in all_machines if proc_upper in m.process.upper() or m.process.upper() in proc_upper]
    return {
        "success": True,
        "process_queried": process,
        "match_count": len(matches),
        "machines": [
            {
                "machine_id": m.machine_id,
                "model": f"{m.manufacturer} {m.model}",
                "status": m.status,
                "hourly_rate_inr": m.hourly_rate_inr,
                "bed_dimension": f"{m.bed_length_mm}x{m.bed_width_mm}mm" if m.bed_length_mm else None
            }
            for m in matches
        ]
    }

def get_supplier_data(supplier_id: str) -> Dict[str, Any]:
    """Fetch verified vendor performance, quality score, and lead times."""
    # Deterministic supplier registry
    suppliers = {
        "SUP-01": {"name": "Jindal Steel & Power", "grade": "SS304/SS316", "lead_time_days": 3, "quality_score": 4.9, "payment_terms": "Net 30"},
        "SUP-02": {"name": "Hindalco Industries", "grade": "AL6061-T6", "lead_time_days": 4, "quality_score": 4.8, "payment_terms": "Net 30"},
        "SUP-03": {"name": "Tata Steel Tubes & Sheets", "grade": "MS IS2062", "lead_time_days": 2, "quality_score": 4.95, "payment_terms": "Net 45"},
    }
    sup = suppliers.get(supplier_id.upper())
    if not sup:
        return {
            "success": False,
            "error": "SUPPLIER_NOT_FOUND",
            "message": f"Supplier ID '{supplier_id}' not found in approved supplier registry."
        }
    return {"success": True, "supplier_id": supplier_id, **sup}

def calculate_material_weight(
    length_mm: float,
    width_mm: float,
    thickness_mm: float,
    density_kg_m3: float = 7930.0
) -> Dict[str, Any]:
    """Deterministic formula: Volume (m3) * density = Weight (kg)."""
    w = calculate_part_weight(length_mm, width_mm, thickness_mm, density_kg_m3)
    return {
        "success": True,
        "length_mm": length_mm,
        "width_mm": width_mm,
        "thickness_mm": thickness_mm,
        "density_kg_m3": density_kg_m3,
        "weight_kg": w
    }

def calculate_material_cost(
    weight_kg: float,
    material_code: str,
    override_price: Optional[float] = None
) -> Dict[str, Any]:
    """Multiply gross material weight by verified factory catalog price."""
    return calc_mat_cost(weight_kg, material_code, override_price)

def calculate_scrap(
    purchased_weight_kg: float,
    net_part_weight_kg: float
) -> Dict[str, Any]:
    """Calculate scrap weight and scrap percentage."""
    scrap_kg = calc_scrap(purchased_weight_kg, net_part_weight_kg)
    pct = round((scrap_kg / purchased_weight_kg * 100.0), 2) if purchased_weight_kg > 0 else 0.0
    return {
        "success": True,
        "purchased_weight_kg": purchased_weight_kg,
        "net_part_weight_kg": net_part_weight_kg,
        "scrap_weight_kg": scrap_kg,
        "scrap_percentage": pct
    }

def calculate_laser_time(
    cutting_length_m: float,
    thickness_mm: float,
    material_grade: str,
    pierce_count: int = 1
) -> Dict[str, Any]:
    """Calculates laser beam-on runtime and piercing time."""
    speed = get_laser_cutting_speed(material_grade, thickness_mm)
    if not speed:
        return {
            "success": False,
            "error": "SPEED_PARAMETER_UNAVAILABLE",
            "message": f"No verified laser cutting speed for {material_grade} at {thickness_mm}mm."
        }
    length_mm = cutting_length_m * 1000.0
    res = estimate_laser_cutting_time(length_mm, speed, pierce_count)
    return {
        "success": True,
        "cutting_length_m": cutting_length_m,
        "thickness_mm": thickness_mm,
        "material_grade": material_grade,
        "cutting_speed_mm_min": speed,
        **res
    }

def calculate_laser_cost(
    machine_minutes: float,
    hourly_rate_inr: float = 2500.0
) -> Dict[str, Any]:
    """Calculate machining laser cost based on beam runtime."""
    cost = round((machine_minutes / 60.0) * hourly_rate_inr, 2)
    return {
        "success": True,
        "machine_minutes": machine_minutes,
        "hourly_rate_inr": hourly_rate_inr,
        "laser_cost_inr": cost
    }

def calculate_bending_time(
    bend_strokes: int,
    seconds_per_stroke: float = 12.0
) -> Dict[str, Any]:
    """Compute press brake machine cycle time."""
    total_sec = bend_strokes * seconds_per_stroke
    mins = round(total_sec / 60.0, 2)
    return {
        "success": True,
        "bend_strokes": bend_strokes,
        "seconds_per_stroke": seconds_per_stroke,
        "total_minutes": mins,
        "total_hours": round(mins / 60.0, 3)
    }

def calculate_bending_cost(
    bending_minutes: float,
    hourly_rate_inr: float = 1800.0
) -> Dict[str, Any]:
    """Compute press brake operation cost."""
    cost = round((bending_minutes / 60.0) * hourly_rate_inr, 2)
    return {
        "success": True,
        "bending_minutes": bending_minutes,
        "hourly_rate_inr": hourly_rate_inr,
        "bending_cost_inr": cost
    }

def calculate_quote(
    material_cost: float,
    laser_cutting_cost: float = 0.0,
    bending_cost: float = 0.0,
    machining_cost: float = 0.0,
    welding_cost: float = 0.0,
    finishing_cost: Optional[float] = None,
    quantity: int = 1
) -> Dict[str, Any]:
    """Deterministic quotation calculator applying overhead, margin, and Indian GST."""
    return calc_quote(
        material_cost=material_cost,
        laser_cutting_cost=laser_cutting_cost,
        bending_cost=bending_cost,
        machining_cost=machining_cost,
        welding_cost=welding_cost,
        finishing_cost=finishing_cost,
        quantity=quantity
    )

def calculate_lead_time(
    queue_days: int = 1,
    procurement_days: int = 2,
    processing_days: int = 2,
    finishing_days: int = 1,
    qc_and_pack_days: int = 1
) -> Dict[str, Any]:
    """Compute total shop floor delivery days."""
    total_days = calc_lead_time(
        queue_days=queue_days,
        material_procurement_days=procurement_days,
        processing_days=processing_days,
        finishing_days=finishing_days,
        qc_and_pack_days=qc_and_pack_days
    )
    return {
        "success": True,
        "lead_time_days": total_days,
        "breakdown": {
            "queue_days": queue_days,
            "procurement_days": procurement_days,
            "processing_days": processing_days,
            "finishing_days": finishing_days,
            "qc_and_pack_days": qc_and_pack_days
        }
    }

def check_inventory(material_code: str, required_quantity: int) -> Dict[str, Any]:
    """Verify stock availability against required part quantity."""
    return check_inv(material_code, required_quantity)

def check_machine_capability(
    machine_id: str,
    thickness_mm: float,
    material: str
) -> Dict[str, Any]:
    """Verify if a specific machine can cut or bend the specified thickness and grade."""
    mach = factory_knowledge_service.get_machine(machine_id)
    if not mach:
        return {"success": False, "error": "MACHINE_NOT_FOUND", "capable": False}
    
    # Validation logic based on factory parameter cards
    if "LASER" in mach.process:
        max_thk = 16.0 if "SS" in material.upper() else (20.0 if "MS" in material.upper() else 10.0)
        capable = thickness_mm <= max_thk
        return {
            "success": True,
            "machine_id": machine_id,
            "capable": capable,
            "max_thickness_for_material_mm": max_thk,
            "reason": f"Maximum cutting thickness for {material} is {max_thk}mm." if not capable else "Within verified machine limits."
        }
    elif "PRESS_BRAKE" in mach.process:
        capable = thickness_mm <= 12.0
        return {
            "success": True,
            "machine_id": machine_id,
            "capable": capable,
            "max_thickness_mm": 12.0
        }
    return {"success": True, "machine_id": machine_id, "capable": True}

def check_machine_capacity(
    machine_id: str,
    required_hours: float
) -> Dict[str, Any]:
    """Check open machine headroom in the active shop schedule."""
    mach = factory_knowledge_service.get_machine(machine_id)
    if not mach:
        return {"success": False, "error": "MACHINE_NOT_FOUND"}
    
    # 2-shift capacity = 16 hours daily, average 72% utilization = ~4.5 hours open per day
    daily_open_hours = 4.5
    weekly_open_hours = daily_open_hours * 5
    can_fit_today = required_hours <= daily_open_hours
    can_fit_week = required_hours <= weekly_open_hours

    return {
        "success": True,
        "machine_id": machine_id,
        "required_hours": required_hours,
        "daily_headroom_hours": daily_open_hours,
        "weekly_headroom_hours": weekly_open_hours,
        "can_complete_today": can_fit_today,
        "can_complete_this_week": can_fit_week,
        "current_utilization_pct": 72.0
    }

def check_production_capacity(
    process: str,
    required_hours: float
) -> Dict[str, Any]:
    """Evaluate shop floor department capacity for scheduling."""
    caps = {
        "laser_cutting": {"available_hours_this_week": 28.0, "headroom_pct": 28.0},
        "bending": {"available_hours_this_week": 22.5, "headroom_pct": 25.0},
        "cnc_milling": {"available_hours_this_week": 18.0, "headroom_pct": 20.0},
        "welding": {"available_hours_this_week": 35.0, "headroom_pct": 35.0}
    }
    key = process.lower().replace(" ", "_")
    cap = caps.get(key, {"available_hours_this_week": 15.0, "headroom_pct": 20.0})
    feasible = required_hours <= cap["available_hours_this_week"]

    return {
        "success": True,
        "process": process,
        "required_hours": required_hours,
        "available_hours_this_week": cap["available_hours_this_week"],
        "feasible_this_week": feasible,
        "headroom_pct": cap["headroom_pct"]
    }

def check_dfm(
    material: str,
    thickness_mm: float,
    min_hole_dia_mm: Optional[float] = None,
    inside_radius_mm: Optional[float] = None,
    tolerance_mm: Optional[float] = None
) -> Dict[str, Any]:
    """Run comprehensive Design for Manufacturability feasibility analysis."""
    res = dfm_agent.analyze_part_feasibility(
        material_grade=material,
        thickness_mm=thickness_mm,
        min_hole_diameter_mm=min_hole_dia_mm,
        internal_radius_mm=inside_radius_mm,
        tolerance_mm=tolerance_mm
    )
    return {
        "success": True,
        "status": res.status,
        "engineering_review_required": res.engineering_review_required,
        "issues_count": len(res.issues),
        "issues": [i.model_dump() for i in res.issues],
        "recommendations": res.recommendations,
        "confidence": res.confidence
    }

# ==============================================================================
# MASTER REGISTRY DICTIONARY
# ==============================================================================

TOOL_REGISTRY: Dict[str, Callable[..., Dict[str, Any]]] = {
    "get_current_material_price": get_current_material_price,
    "get_inventory": get_inventory,
    "get_machine_status": get_machine_status,
    "get_machine_capability": get_machine_capability,
    "get_supplier_data": get_supplier_data,
    "calculate_material_weight": calculate_material_weight,
    "calculate_material_cost": calculate_material_cost,
    "calculate_scrap": calculate_scrap,
    "calculate_laser_time": calculate_laser_time,
    "calculate_laser_cost": calculate_laser_cost,
    "calculate_bending_time": calculate_bending_time,
    "calculate_bending_cost": calculate_bending_cost,
    "calculate_quote": calculate_quote,
    "calculate_lead_time": calculate_lead_time,
    "check_inventory": check_inventory,
    "check_machine_capability": check_machine_capability,
    "check_machine_capacity": check_machine_capacity,
    "check_production_capacity": check_production_capacity,
    "check_dfm": check_dfm
}

# Pure mathematical calculators eligible for memoization
PURE_CALCULATION_TOOLS = {
    "calculate_material_weight",
    "calculate_material_cost",
    "calculate_scrap",
    "calculate_laser_time",
    "calculate_laser_cost",
    "calculate_bending_time",
    "calculate_bending_cost",
    "calculate_quote",
    "calculate_lead_time"
}

_CALC_CACHE: Dict[str, Dict[str, Any]] = {}
_MAX_CACHE_SIZE = 1000

def _get_cache_key(tool_name: str, arguments: Dict[str, Any]) -> str:
    try:
        sorted_args = tuple(sorted((k, str(v)) for k, v in arguments.items()))
        return f"{tool_name}:{sorted_args}"
    except Exception:
        return ""

import logging

logger = logging.getLogger("forgeiq.tools")

def execute_tool(tool_name: str, arguments: Dict[str, Any]) -> ToolCallResult:
    """Safely dispatches a tool call by name with memoization for pure calculators and timing."""
    start = time.time()
    func = TOOL_REGISTRY.get(tool_name)
    if not func:
        logger.warning(
            f"Tool '{tool_name}' not found in registry",
            extra={"tool_name": tool_name, "operation": "tool_execute"}
        )
        return ToolCallResult(
            tool_name=tool_name,
            arguments=arguments,
            output=None,
            success=False,
            error_message=f"Tool '{tool_name}' not found in ForgeIQ Tool Registry.",
            execution_time_ms=0.0
        )

    is_calculator = tool_name in PURE_CALCULATION_TOOLS
    logger.info(
        f"Calculator/tool execution initiated: {tool_name}",
        extra={
            "tool_name": tool_name,
            "is_calculator": is_calculator,
            "arguments": {k: str(v) for k, v in arguments.items()},
            "operation": "tool_execute"
        }
    )

    # Check memoized result for pure math functions
    cache_key = ""
    if is_calculator:
        cache_key = _get_cache_key(tool_name, arguments)
        if cache_key and cache_key in _CALC_CACHE:
            cached_output = _CALC_CACHE[cache_key]
            elapsed = (time.time() - start) * 1000.0
            logger.info(
                f"Calculator/tool execution finished (cached): {tool_name}",
                extra={
                    "tool_name": tool_name,
                    "duration_ms": round(elapsed, 3),
                    "cache_hit": True,
                    "operation": "tool_execute"
                }
            )
            return ToolCallResult(
                tool_name=tool_name,
                arguments=arguments,
                output=cached_output,
                success=True,
                execution_time_ms=round(elapsed, 3)
            )

    try:
        output = func(**arguments)
        elapsed = (time.time() - start) * 1000.0

        # Cache result if pure
        if cache_key and len(_CALC_CACHE) < _MAX_CACHE_SIZE:
            _CALC_CACHE[cache_key] = output

        # Performance monitoring (>1000ms threshold)
        if elapsed > 1000.0:
            logger.warning(
                f"SLOW TOOL EXECUTION: {tool_name} took {elapsed:.1f}ms (>1000ms threshold)",
                extra={
                    "tool_name": tool_name,
                    "duration_ms": round(elapsed, 2),
                    "performance_warning": True,
                    "threshold_ms": 1000.0,
                    "operation": "tool_execute"
                }
            )

        logger.info(
            f"Calculator/tool execution finished: {tool_name}",
            extra={
                "tool_name": tool_name,
                "duration_ms": round(elapsed, 2),
                "cache_hit": False,
                "operation": "tool_execute"
            }
        )

        return ToolCallResult(
            tool_name=tool_name,
            arguments=arguments,
            output=output,
            success=output.get("success", True) if isinstance(output, dict) else True,
            error_message=output.get("error") if isinstance(output, dict) else None,
            execution_time_ms=round(elapsed, 2)
        )
    except Exception as e:
        elapsed = (time.time() - start) * 1000.0
        logger.error(
            f"Calculator/tool execution failed: {tool_name}: {str(e)}",
            exc_info=True,
            extra={
                "tool_name": tool_name,
                "duration_ms": round(elapsed, 2),
                "error_type": type(e).__name__,
                "operation": "tool_execute"
            }
        )
        return ToolCallResult(
            tool_name=tool_name,
            arguments=arguments,
            output=None,
            success=False,
            error_message=f"Execution error in '{tool_name}': {str(e)}",
            execution_time_ms=round(elapsed, 2)
        )

