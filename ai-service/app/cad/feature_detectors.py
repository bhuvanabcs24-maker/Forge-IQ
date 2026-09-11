"""
ForgeIQ CAD Feature Detectors.
Deterministic and heuristic detection for Holes, Bends, Welds,
Dimensions, Material, Thickness, Net Area, Volume, and Mass.
"""

from typing import List, Dict, Any, Tuple, Optional
import math
import re

# Standard Industrial Material Densities (kg/m³)
MATERIAL_DENSITIES: Dict[str, float] = {
    "MILD STEEL": 7850.0,
    "CARBON STEEL": 7850.0,
    "CRCA": 7850.0,
    "STAINLESS STEEL": 8000.0,
    "304 STAINLESS STEEL": 8000.0,
    "316 STAINLESS STEEL": 8000.0,
    "ALUMINUM": 2700.0,
    "AL6061": 2700.0,
    "AL5052": 2680.0,
    "COPPER": 8960.0,
    "BRASS": 8500.0,
}
DEFAULT_DENSITY = 7850.0  # Mild Steel baseline


class FeatureDetectors:
    """
    Modular feature detection engines for manufacturing CAD drawings.
    """

    @classmethod
    def detect_holes(
        cls,
        entities: List[Dict[str, Any]],
        outer_bbox: Optional[Tuple[float, float, float, float]] = None,
    ) -> Dict[str, Any]:
        """
        Detects cut holes from CIRCLE entities and closed circular profiles.
        """
        holes: List[Dict[str, Any]] = []
        hole_entities: List[int] = []
        total_area = 0.0

        for e in entities:
            if e.get("type") == "CIRCLE":
                cx, cy = e["center"]
                dia = round(float(e["diameter"]), 2)
                rad = round(float(e["radius"]), 2)
                area = math.pi * (rad ** 2)

                # Check if circle is inside outer bounding box
                is_inside = True
                if outer_bbox:
                    min_x, min_y, max_x, max_y = outer_bbox
                    if cx < min_x or cx > max_x or cy < min_y or cy > max_y:
                        is_inside = False

                layer = str(e.get("layer", "")).upper()
                # Skip if layer explicitly indicates center mark or dimension
                if any(k in layer for k in ["CENTER", "DIM", "DEFPOINTS"]):
                    continue

                if is_inside and dia > 0.5:
                    confidence = 0.99 if ("HOLE" in layer or "CUT" in layer) else 0.94
                    holes.append({
                        "entity_id": e["id"],
                        "center": [round(cx, 2), round(cy, 2)],
                        "radius_mm": rad,
                        "diameter_mm": dia,
                        "area_mm2": round(area, 2),
                        "layer": e.get("layer"),
                        "confidence": confidence,
                    })
                    hole_entities.append(e["id"])
                    total_area += area

        # Sort holes by coordinates for deterministic ordering
        holes.sort(key=lambda h: (h["center"][0], h["center"][1]))

        # Group by diameter for reporting
        diameter_groups: Dict[float, int] = {}
        for h in holes:
            d = h["diameter_mm"]
            diameter_groups[d] = diameter_groups.get(d, 0) + 1

        confidence = 0.99 if len(holes) > 0 else 0.95

        return {
            "value": len(holes),
            "hole_count": len(holes),
            "confidence": confidence,
            "method": "DXF_CIRCLE_GEOMETRY",
            "source_entities": hole_entities,
            "holes": holes,
            "diameter_groups": diameter_groups,
            "total_hole_area_mm2": round(total_area, 2),
            "warnings": [],
        }

    @classmethod
    def detect_bends(
        cls,
        entities: List[Dict[str, Any]],
        text_annotations: List[str],
        outer_bbox: Optional[Tuple[float, float, float, float]] = None,
    ) -> Dict[str, Any]:
        """
        Detects press brake bend lines using layer hints, linetype, geometry, and annotations.
        """
        bends: List[Dict[str, Any]] = []
        bend_entities: List[int] = []

        # Check for angle specifications in drawing text (e.g. 90°, R5, BEND)
        detected_angle = 90.0  # default sheet metal bend
        for txt in text_annotations:
            angle_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)", txt, re.IGNORECASE)
            if angle_match:
                detected_angle = float(angle_match.group(1))
                break

        for e in entities:
            if e.get("type") == "LINE":
                layer = str(e.get("layer", "")).upper()
                linetype = str(e.get("linetype", "")).upper()
                length = float(e.get("length", 0.0))

                # Heuristic: Layer has BEND or linetype has DASH/CENTER/HIDDEN
                is_bend_layer = any(k in layer for k in ["BEND", "FOLD", "BRAKE", "CREASE"])
                is_bend_linetype = any(k in linetype for k in ["DASHED", "CENTER", "HIDDEN", "PHANTOM"])

                if (is_bend_layer or is_bend_linetype) and length > 5.0:
                    confidence = 0.96 if is_bend_layer else 0.85

                    bends.append({
                        "entity_id": e["id"],
                        "line": {
                            "start": [round(c, 2) for c in e["start"]],
                            "end": [round(c, 2) for c in e["end"]],
                            "length_mm": round(length, 2),
                        },
                        "angle_deg": detected_angle,
                        "confidence": confidence,
                        "layer": e.get("layer"),
                    })
                    bend_entities.append(e["id"])

        # Sort bends by starting X then Y
        bends.sort(key=lambda b: (b["line"]["start"][0], b["line"]["start"][1]))

        confidence = 0.95 if len(bends) > 0 else 0.98

        return {
            "value": len(bends),
            "bend_count": len(bends),
            "confidence": confidence,
            "method": "LAYER_AND_LINETYPES_GEOMETRY",
            "source_entities": bend_entities,
            "bends": bends,
            "default_angle_deg": detected_angle,
            "warnings": [],
        }

    @classmethod
    def detect_welds(cls, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Identifies weld seams and symbols, ensuring they are isolated from cutting perimeter.
        """
        welds: List[Dict[str, Any]] = []
        weld_entities: List[int] = []
        total_length = 0.0

        for e in entities:
            if e.get("type") == "LINE":
                layer = str(e.get("layer", "")).upper()
                if any(k in layer for k in ["WELD", "SEAM", "JOIN"]):
                    length = float(e.get("length", 0.0))
                    welds.append({
                        "entity_id": e["id"],
                        "line": {
                            "start": [round(c, 2) for c in e["start"]],
                            "end": [round(c, 2) for c in e["end"]],
                            "length_mm": round(length, 2),
                        },
                        "confidence": 0.96,
                        "layer": e.get("layer"),
                    })
                    weld_entities.append(e["id"])
                    total_length += length

        confidence = 0.95 if len(welds) > 0 else 0.98

        return {
            "value": len(welds),
            "weld_count": len(welds),
            "weld_length_mm": round(total_length, 2),
            "confidence": confidence,
            "method": "WELD_LAYER_ISOLATION",
            "source_entities": weld_entities,
            "welds": welds,
            "warnings": [],
        }

    @classmethod
    def extract_metadata_notes(cls, entities: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extracts material, thickness, and drawing notes using regex patterns.
        """
        texts: List[str] = []
        for e in entities:
            if e.get("type") in ("TEXT", "MTEXT"):
                txt = str(e.get("text", "")).strip()
                if txt:
                    texts.append(txt)

        combined_notes = " | ".join(texts)

        # Extract material
        detected_material: Optional[str] = None
        mat_match = re.search(
            r"Material\s*[:=\-]\s*([A-Za-z0-9\s\-]+?)(?=\||$|\n|Thickness|Thk)",
            combined_notes,
            re.IGNORECASE,
        )
        if mat_match:
            detected_material = mat_match.group(1).strip()
        else:
            # Look for common material names
            for mat_key in MATERIAL_DENSITIES.keys():
                if mat_key in combined_notes.upper():
                    detected_material = mat_key.title()
                    break

        # Extract thickness
        detected_thickness_mm: Optional[float] = None
        thk_match = re.search(
            r"(?:Thickness|Thk|T)\s*[:=\-]?\s*(\d+(?:\.\d+)?)\s*(?:mm|in)?",
            combined_notes,
            re.IGNORECASE,
        )
        if thk_match:
            detected_thickness_mm = float(thk_match.group(1))

        # Check for stated envelope (for cross-validation)
        envelope_match = re.search(
            r"envelope\s*[:=\-]?\s*(\d+(?:\.\d+)?)\s*[xX*]\s*(\d+(?:\.\d+)?)",
            combined_notes,
            re.IGNORECASE,
        )
        stated_envelope = None
        if envelope_match:
            stated_envelope = (float(envelope_match.group(1)), float(envelope_match.group(2)))

        return {
            "material": detected_material or "Unknown",
            "thickness_mm": detected_thickness_mm or 6.0,  # default 6mm if unspecified
            "stated_envelope": stated_envelope,
            "notes": texts,
            "has_material_specified": detected_material is not None,
            "has_thickness_specified": detected_thickness_mm is not None,
        }

    @classmethod
    def calculate_weight_and_mass(
        cls,
        gross_area_mm2: float,
        hole_area_mm2: float,
        thickness_mm: float,
        material_name: str,
    ) -> Dict[str, Any]:
        """
        Calculates sheet volume, gross mass, and net mass accounting for holes.
        """
        clean_mat = material_name.strip().upper()
        density = MATERIAL_DENSITIES.get(clean_mat, DEFAULT_DENSITY)
        is_assumed = clean_mat not in MATERIAL_DENSITIES and clean_mat != "UNKNOWN"

        warnings = []
        if material_name == "Unknown":
            warnings.append(f"Material not explicitly specified; weight estimated using Mild Steel ({DEFAULT_DENSITY:.0f} kg/m³).")
        elif is_assumed:
            warnings.append(f"Unrecognized material '{material_name}'; default density {DEFAULT_DENSITY:.0f} kg/m³ applied.")

        net_area_mm2 = max(0.0, gross_area_mm2 - hole_area_mm2)

        # Convert to SI units: m² and m
        gross_area_m2 = gross_area_mm2 * 1e-6
        net_area_m2 = net_area_mm2 * 1e-6
        thickness_m = thickness_mm * 1e-3

        gross_volume_m3 = gross_area_m2 * thickness_m
        net_volume_m3 = net_area_m2 * thickness_m

        gross_mass_kg = gross_volume_m3 * density
        net_mass_kg = net_volume_m3 * density

        confidence = 0.96 if material_name != "Unknown" else 0.85

        return {
            "value": round(net_mass_kg, 2),
            "estimated_weight_kg": round(net_mass_kg, 2),
            "gross_weight_kg": round(gross_mass_kg, 2),
            "gross_area_mm2": round(gross_area_mm2, 2),
            "net_area_mm2": round(net_area_mm2, 2),
            "volume_cm3": round(net_volume_m3 * 1e6, 2),
            "density_kg_m3": density,
            "material": material_name if material_name != "Unknown" else "Mild Steel (Default)",
            "thickness_mm": thickness_mm,
            "confidence": confidence,
            "method": "NET_VOLUME_DENSITY_PRODUCT",
            "warnings": warnings,
        }

    @classmethod
    def calculate_complexity(
        cls,
        hole_count: int,
        bend_count: int,
        weld_count: int,
        cut_perimeter_mm: float,
        gross_area_mm2: float,
    ) -> str:
        """
        Calculates manufacturing complexity score (Low, Medium, High).
        """
        score = 0
        if hole_count > 10:
            score += 2
        elif hole_count > 4:
            score += 1

        if bend_count >= 5:
            score += 3
        elif bend_count >= 2:
            score += 2
        elif bend_count == 1:
            score += 1

        if weld_count >= 3:
            score += 2
        elif weld_count >= 1:
            score += 1

        # Perimeter to area ratio (tortuosity)
        if gross_area_mm2 > 0:
            aspect = cut_perimeter_mm / math.sqrt(gross_area_mm2)
            if aspect > 6.0:
                score += 1

        if score >= 5:
            return "High"
        elif score >= 2:
            return "Medium"
        return "Low"
