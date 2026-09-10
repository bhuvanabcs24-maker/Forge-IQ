"""
ForgeIQ Data Pipeline - Domain Classification Engine
Classifies raw manufacturing records into the 25 capability domains
and determines whether data routes to TRAINING, RAG, or EVALUATION.
"""

from typing import Dict, Any, List

DOMAIN_KEYWORDS: Dict[str, List[str]] = {
    "01_conversation": ["hello", "hi", "good morning", "role", "who are you", "copilot"],
    "02_manufacturing": ["workflow", "planning", "process sequence", "fabrication step"],
    "03_dfm": ["dfm", "manufacturability", "hole to bend", "bend relief", "minimum hole"],
    "04_sheet_metal": ["sheet metal", "gauge", "k-factor", "bend deduction", "grain direction"],
    "05_laser_cutting": ["laser", "fiber laser", "cutting speed", "piercing", "kerf", "nitrogen assist", "oxygen assist"],
    "06_bending": ["press brake", "v-die", "flange length", "air bending", "tonnage", "inside radius"],
    "07_machining": ["milling", "turning", "spindle rpm", "chipload", "climb milling", "endmill"],
    "08_welding": ["welding", "mig", "tig", "weld seam", "heat affected zone", "shielding gas"],
    "09_materials": ["ss304", "ss316", "aluminum", "6061", "hardox", "mild steel", "is2062", "density", "yield strength"],
    "10_quotation": ["quote", "cost", "rfq", "price", "margin", "overhead", "gst", "itemized"],
    "11_inventory": ["stock", "inventory", "sheets on hand", "warehouse", "remnant", "reorder point"],
    "12_machine": ["machine status", "machine rate", "hourly rate", "bed size", "axis travel", "trumpf", "amada", "haas"],
    "13_production": ["schedule", "shift", "capacity", "bottleneck", "headroom", "dispatch queue"],
    "14_quality": ["cmm", "inspection", "as9102", "fai", "gd&t", "true position", "flatness", "tolerance"],
    "15_maintenance": ["predictive maintenance", "tool wear", "bearing vibration", "spindle degradation", "failure mode"],
    "16_supplier": ["supplier", "vendor", "lead time", "moq", "payment terms", "jindal", "hindalco", "tata"],
    "17_engineering_drawings": ["drawing", "title block", "blueprint", "dimension", "revision block"],
    "18_cad": ["step", "dxf", "stl", "b-rep", "cad model", "geometry loop"],
    "19_tool_calling": ["tool_call", "execute_tool", "get_current_material_price", "check_inventory"],
    "20_rag": ["citation", "retrieved", "knowledge base", "standard reference", "sop"],
    "21_uncertainty": ["assumption", "confidence", "preliminary", "uncertain", "requires verification"],
    "22_missing_data": ["missing", "unspecified", "clarification required", "please provide"],
    "23_source_priority": ["source priority", "factory db vs web", "authoritative source"],
    "24_adversarial": ["prompt injection", "ignore rules", "bypass safety", "impossible tolerance"],
    "25_multimodal": ["uploaded dxf", "cad feature table", "scanned drawing"]
}

def classify_record_domain(text: str) -> str:
    """Classifies a prompt or document into one of the 25 target categories."""
    t_low = text.lower()
    scores = {}
    for domain, kw_list in DOMAIN_KEYWORDS.items():
        score = sum(1 for kw in kw_list if kw in t_low)
        if score > 0:
            scores[domain] = score
    if not scores:
        return "02_manufacturing"
    return max(scores.items(), key=lambda x: x[1])[0]

def determine_intended_destination(source_metadata: Dict[str, Any], content_type: str) -> str:
    """Assigns data to TRAINING, RAG, EVALUATION, or TOOL_DATA."""
    if "standard" in content_type or "manual" in content_type or "sop" in content_type:
        return "RAG"
    if "simulation_matrix" in content_type or "sensor_dataset" in content_type:
        return "TOOL_DATA"
    if "benchmark_case" in content_type or "test" in content_type:
        return "EVALUATION"
    return "TRAINING"
