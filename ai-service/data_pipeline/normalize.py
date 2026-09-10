"""
ForgeIQ Data Pipeline - Engineering Unit Normalization Engine
Standardizes manufacturing units across dimensional, physical, and process data.
Base Units:
- Length: mm
- Mass: kg
- Force: kN
- Velocity: mm/min (or m/min for laser speed)
- Pressure: bar
- Power: kW
- Currency: INR (₹)
"""

import re
from typing import Dict, Any, Union

def normalize_length_to_mm(value: float, unit: str) -> float:
    u = unit.lower().strip()
    if u in ["mm", "millimeter", "millimeters"]:
        return round(value, 4)
    elif u in ["in", "inch", "inches", '"']:
        return round(value * 25.4, 4)
    elif u in ["cm", "centimeter", "centimeters"]:
        return round(value * 10.0, 4)
    elif u in ["m", "meter", "meters"]:
        return round(value * 1000.0, 4)
    return round(value, 4)

def normalize_mass_to_kg(value: float, unit: str) -> float:
    u = unit.lower().strip()
    if u in ["kg", "kilogram", "kilograms"]:
        return round(value, 4)
    elif u in ["g", "gram", "grams"]:
        return round(value / 1000.0, 4)
    elif u in ["lb", "lbs", "pound", "pounds"]:
        return round(value * 0.453592, 4)
    elif u in ["ton", "tons", "tonne", "metric_ton"]:
        return round(value * 1000.0, 4)
    return round(value, 4)

def normalize_pressure_to_bar(value: float, unit: str) -> float:
    u = unit.lower().strip()
    if u in ["bar", "bars"]:
        return round(value, 2)
    elif u in ["psi"]:
        return round(value * 0.0689476, 2)
    elif u in ["mpa"]:
        return round(value * 10.0, 2)
    return round(value, 2)

def normalize_engineering_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """Recursively normalizes numeric fields with recognized units."""
    norm = record.copy()
    if "thickness" in norm and isinstance(norm["thickness"], dict):
        val = norm["thickness"].get("value", 0.0)
        unit = norm["thickness"].get("unit", "mm")
        norm["thickness_mm"] = normalize_length_to_mm(val, unit)

    if "weight" in norm and isinstance(norm["weight"], dict):
        val = norm["weight"].get("value", 0.0)
        unit = norm["weight"].get("unit", "kg")
        norm["weight_kg"] = normalize_mass_to_kg(val, unit)

    return norm
