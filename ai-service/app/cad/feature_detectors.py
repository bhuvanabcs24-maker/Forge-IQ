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
        hole_size_distribution = {f"{k:.1f}": v for k, v in diameter_groups.items()}

        return {
            "value": len(holes),
            "hole_count": len(holes),
            "confidence": confidence,
            "method": "DXF_CIRCLE_GEOMETRY",
            "source_entities": hole_entities,
            "holes": holes,
            "diameter_groups": diameter_groups,
            "hole_size_distribution": hole_size_distribution,
            "total_hole_area_mm2": round(total_area, 2),
            "warnings": [],
        }

    @classmethod
    def detect_bends(
        cls,
        entities: List[Dict[str, Any]],
        text_annotations: List[str],
        outer_bbox: Optional[Tuple[float, float, float, float]] = None,
        cut_entity_ids: Optional[List[int]] = None,
    ) -> Dict[str, Any]:
        """
        Detects press brake bend lines using layer hints, linetype, geometry, and annotations.
        Supports non-semantic layer names (e.g. CENTERLINES) via geometric structural patterns.
        """
        bends: List[Dict[str, Any]] = []
        bend_entities: List[int] = []
        cut_ids = set(cut_entity_ids or [])

        # Check for angle specifications and bend counts in drawing text (e.g. BENDS: 3 X 90 DEG)
        detected_angle = 90.0  # default sheet metal bend
        expected_bend_count = None
        for txt in text_annotations:
            count_match = re.search(r"BENDS?\s*[:=\-]?\s*(\d+)", txt, re.IGNORECASE)
            if count_match:
                expected_bend_count = int(count_match.group(1))

            angle_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)", txt, re.IGNORECASE)
            if angle_match:
                detected_angle = float(angle_match.group(1))

        EXCLUDED_BEND_LAYERS = [
            "CONSTRUCTION", "DEFPOINTS", "DIM", "REF", "AUX",
            "TITLE", "BORDER", "ANNO", "NOTE", "HATCH", "WELD", "CUT"
        ]

        sheet_w = (outer_bbox[2] - outer_bbox[0]) if outer_bbox else 0.0
        sheet_h = (outer_bbox[3] - outer_bbox[1]) if outer_bbox else 0.0

        for e in entities:
            if e.get("type") == "LINE":
                eid = e["id"]
                if eid in cut_ids:
                    continue

                layer = str(e.get("layer", "")).upper()
                linetype = str(e.get("linetype", "")).upper()
                length = float(e.get("length", 0.0))

                # Exclude construction and annotation layers
                if any(ex in layer for ex in EXCLUDED_BEND_LAYERS):
                    continue

                # Exclude dot linetypes
                if any(ex in linetype for ex in ["DOT"]):
                    continue

                # Exclude lines completely outside bounding box if provided
                if outer_bbox:
                    sx, sy = e["start"]
                    ex, ey = e["end"]
                    min_x, min_y, max_x, max_y = outer_bbox
                    if (max(sx, ex) < min_x - 1.0 or min(sx, ex) > max_x + 1.0 or
                        max(sy, ey) < min_y - 1.0 or min(sy, ey) > max_y + 1.0):
                        continue

                # Classification Criteria:
                # 1. Semantic layer (BEND/FOLD/FORM)
                is_bend_layer = any(k in layer for k in ["BEND", "FOLD", "BRAKE", "CREASE", "FORM"])
                # 2. Semantic linetype (DASHED/HIDDEN)
                is_bend_linetype = any(k in linetype for k in ["DASHED", "HIDDEN", "DASH"])
                # 3. Geometric structural pattern (e.g. on CENTERLINES or generic layers spanning sheet)
                is_structural_bend = False
                if sheet_h > 0 and sheet_w > 0:
                    dx = abs(e["end"][0] - e["start"][0])
                    dy = abs(e["end"][1] - e["start"][1])
                    # Line spans substantial portion of sheet height or width
                    is_vertical_span = (dy >= 0.55 * sheet_h) and (dx < 0.05 * sheet_w)
                    is_horizontal_span = (dx >= 0.55 * sheet_w) and (dy < 0.05 * sheet_h)
                    if (is_vertical_span or is_horizontal_span) and length > 10.0:
                        # Corroborate with drawing text or layer naming
                        has_bend_note = any("BEND" in t.upper() for t in text_annotations)
                        if has_bend_note or "CENTER" in layer or "FAB" in layer:
                            is_structural_bend = True

                if (is_bend_layer or is_bend_linetype or is_structural_bend) and length > 5.0:
                    confidence = 0.98 if is_bend_layer else (0.95 if is_structural_bend else 0.88)
                    bends.append({
                        "entity_id": eid,
                        "line": {
                            "start": [round(c, 2) for c in e["start"]],
                            "end": [round(c, 2) for c in e["end"]],
                            "length_mm": round(length, 2),
                        },
                        "angle_deg": detected_angle,
                        "confidence": confidence,
                        "layer": e.get("layer"),
                    })
                    bend_entities.append(eid)

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
            "angles_deg": [b.get("angle_deg", detected_angle) for b in bends],
            "warnings": [],
        }

    @classmethod
    def detect_welds(
        cls,
        entities: List[Dict[str, Any]],
        cut_entity_ids: Optional[List[int]] = None,
        bend_entity_ids: Optional[List[int]] = None,
        outer_bbox: Optional[Tuple[float, float, float, float]] = None,
    ) -> Dict[str, Any]:
        """
        Identifies weld seams and symbols, ensuring they are isolated from cutting perimeter.
        Supports both semantic layers (WELD, SEAM, JOIN) and detail/fabrication layers (DETAIL_01).
        """
        welds: List[Dict[str, Any]] = []
        weld_entities: List[int] = []
        total_length = 0.0
        excluded_ids = set((cut_entity_ids or []) + (bend_entity_ids or []))

        EXCLUDED_WELD_LAYERS = ["CONSTRUCTION", "DEFPOINTS", "DIM", "REF", "AUX", "TITLE", "BORDER", "ANNO"]

        for e in entities:
            if e.get("type") == "LINE":
                eid = e["id"]
                if eid in excluded_ids:
                    continue

                layer = str(e.get("layer", "")).upper()
                if any(ex in layer for ex in EXCLUDED_WELD_LAYERS):
                    continue

                length = float(e.get("length", 0.0))

                # Check semantic layer or detail/fabrication indication lines
                is_weld_layer = any(k in layer for k in ["WELD", "SEAM", "JOIN"])
                is_detail_layer = any(k in layer for k in ["DETAIL", "FAB_DETAIL", "FAB_WELD"])

                if (is_weld_layer or is_detail_layer) and length > 5.0:
                    welds.append({
                        "entity_id": eid,
                        "line": {
                            "start": [round(c, 2) for c in e["start"]],
                            "end": [round(c, 2) for c in e["end"]],
                            "length_mm": round(length, 2),
                        },
                        "confidence": 0.96 if is_weld_layer else 0.92,
                        "layer": e.get("layer"),
                    })
                    weld_entities.append(eid)
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
        Extracts material, thickness, and drawing notes using prioritized rules.
        Priority for thickness:
        1. Explicit CAD metadata / dimensions
        2. Drawing notes with explicit keyword (THICKNESS / THK)
        3. Single letter 'T' with strict assignment delimiter (T = / T:)
        4. User-provided value (if specified)
        5. Configurable fallback
        """
        texts: List[Tuple[int, str]] = []
        for e in entities:
            if e.get("type") in ("TEXT", "MTEXT"):
                txt = str(e.get("text", "")).strip()
                if txt:
                    texts.append((e["id"], txt))

        combined_notes = " | ".join(t[1] for t in texts)

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
            for mat_key in MATERIAL_DENSITIES.keys():
                if mat_key in combined_notes.upper():
                    detected_material = mat_key.title()
                    break

        # Priority extraction for thickness
        detected_thickness_mm: Optional[float] = None
        thickness_source_id: Optional[int] = None
        thickness_method: str = "CONFIGURABLE_FALLBACK"
        thickness_conf: float = 0.85

        # Priority 1: Check DIMENSION entities
        for e in entities:
            if e.get("type") == "DIMENSION":
                dim_txt = str(e.get("text", "")).strip()
                m_dim = re.search(r"\b(?:THICKNESS|THK)\s*[:=\-]?\s*(\d+(?:\.\d+)?)\b", dim_txt, re.IGNORECASE)
                if m_dim:
                    detected_thickness_mm = float(m_dim.group(1))
                    thickness_source_id = e["id"]
                    thickness_method = "CAD_DIMENSION"
                    thickness_conf = 0.99
                    break

        # Priority 2: Check drawing notes for unambiguous THICKNESS or THK keywords
        if detected_thickness_mm is None:
            for eid, txt in texts:
                m_thk = re.search(r"\b(?:THICKNESS|THK)\s*[:=\-]?\s*(\d+(?:\.\d+)?)\s*(?:MM|IN)?\b", txt, re.IGNORECASE)
                if m_thk:
                    detected_thickness_mm = float(m_thk.group(1))
                    thickness_source_id = eid
                    thickness_method = "ANNOTATION_TEXT"
                    thickness_conf = 0.98
                    break

        # Priority 3: Check single letter T with strict delimiter (e.g. 'T: 6mm', 'T=6') - NOT hyphenated like 'TEST-02'
        if detected_thickness_mm is None:
            for eid, txt in texts:
                m_t = re.search(r"\bT\s*[:=]\s*(\d+(?:\.\d+)?)\s*(?:MM)?\b", txt, re.IGNORECASE)
                if m_t:
                    detected_thickness_mm = float(m_t.group(1))
                    thickness_source_id = eid
                    thickness_method = "ANNOTATION_TEXT_SHORT"
                    thickness_conf = 0.93
                    break

        thickness_val = detected_thickness_mm if detected_thickness_mm is not None else 6.0

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
            "thickness_mm": thickness_val,
            "thickness_details": {
                "value": thickness_val,
                "unit": "mm",
                "confidence": thickness_conf,
                "method": thickness_method,
                "source_entity": thickness_source_id,
            },
            "stated_envelope": stated_envelope,
            "notes": [t[1] for t in texts],
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
        cutout_area_mm2: float = 0.0,
        slot_area_mm2: float = 0.0,
    ) -> Dict[str, Any]:
        """
        Calculates sheet volume, gross mass, and net mass accounting for holes,
        internal cutouts, and manufacturing slots.
        """
        clean_mat = material_name.strip().upper()
        density = MATERIAL_DENSITIES.get(clean_mat, DEFAULT_DENSITY)
        is_assumed = clean_mat not in MATERIAL_DENSITIES and clean_mat != "UNKNOWN"

        warnings = []
        if material_name == "Unknown":
            warnings.append(f"Material not explicitly specified; weight estimated using Mild Steel ({DEFAULT_DENSITY:.0f} kg/m³).")
        elif is_assumed:
            warnings.append(f"Unrecognized material '{material_name}'; default density {DEFAULT_DENSITY:.0f} kg/m³ applied.")

        total_void_area_mm2 = hole_area_mm2 + cutout_area_mm2 + slot_area_mm2
        net_area_mm2 = max(0.0, gross_area_mm2 - total_void_area_mm2)

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
