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
        rotation_deg: float = 0.0,
        true_dimensions: Optional[Tuple[float, float]] = None,
    ) -> Dict[str, Any]:
        """
        Detects press brake bend lines using general geometric candidate scoring,
        linetypes, envelope spans, parallel repetition patterns, and annotation corroboration.
        Does not rely strictly on semantic layer names; protects against construction/auxiliary geometry.
        """
        cut_ids = set(cut_entity_ids or [])

        # 1. Parse drawing text notes for explicit bend count and angle declarations
        expected_bend_count: Optional[int] = None
        detected_angle = 90.0  # standard sheet metal air bend default
        for txt in text_annotations:
            count_match = re.search(r"BENDS?\s*[:=\-]?\s*(\d+)", txt, re.IGNORECASE)
            if count_match:
                expected_bend_count = int(count_match.group(1))

            angle_match = re.search(r"(\d+(?:\.\d+)?)\s*(?:°|deg|degrees)", txt, re.IGNORECASE)
            if angle_match:
                detected_angle = float(angle_match.group(1))

        # Part envelope dimensions
        if outer_bbox:
            min_x, min_y, max_x, max_y = outer_bbox
            sheet_w = max_x - min_x
            sheet_h = max_y - min_y
        else:
            sheet_w = true_dimensions[0] if true_dimensions else 0.0
            sheet_h = true_dimensions[1] if true_dimensions else 0.0
            min_x, min_y, max_x, max_y = 0.0, 0.0, sheet_w, sheet_h

        # Layer evidence taxonomies
        POSITIVE_BEND_LAYERS = ["BEND", "FOLD", "BRAKE", "CREASE", "FORM"]
        REFERENCE_FAB_LAYERS = [
            "REF_LINES", "REFERENCE", "CENTERLINE", "CENTERLINES",
            "FAB", "FAB_FEATURE", "DETAIL"
        ]
        AUXILIARY_CONSTRUCTION_LAYERS = [
            "AUX", "AUXILIARY", "CONSTRUCTION", "DEFPOINTS", "DIM",
            "DIMENSION", "TITLE", "BORDER", "ANNO", "NOTE", "HATCH",
            "WELD", "CUT", "GUIDE", "GRID", "LEADER", "FRAME", "FRAMING"
        ]

        candidate_lines: List[Dict[str, Any]] = []

        # Coordinate transformation for rotated drawings
        rad = math.radians(rotation_deg)
        cos_rot = math.cos(-rad)
        sin_rot = math.sin(-rad)

        for e in entities:
            if e.get("type") != "LINE":
                continue
            eid = e["id"]
            if eid in cut_ids:
                continue

            sx, sy = e["start"]
            ex, ey = e["end"]
            length = float(e.get("length", 0.0))
            layer = str(e.get("layer", "")).upper()
            linetype = str(e.get("linetype", "")).upper()

            # Ignore lines outside envelope with 5mm margin
            if outer_bbox:
                if (max(sx, ex) < min_x - 5.0 or min(sx, ex) > max_x + 5.0 or
                    max(sy, ey) < min_y - 5.0 or min(sy, ey) > max_y + 5.0):
                    continue

            # Ignore micro-ticks or dot linetypes
            if length < 10.0 or "DOT" in linetype:
                continue

            # Rotate delta vector into part's intrinsic reference frame
            dx_orig = ex - sx
            dy_orig = ey - sy
            dx = dx_orig * cos_rot - dy_orig * sin_rot
            dy = dx_orig * sin_rot + dy_orig * cos_rot

            abs_dx = abs(dx)
            abs_dy = abs(dy)
            is_v = abs_dy >= abs_dx
            span_ratio = (abs_dy / max(sheet_h, 1e-6)) if is_v else (abs_dx / max(sheet_w, 1e-6))

            score = 0.0
            reasons = []

            # 1. Layer Evidence (+40 / +20 / -45)
            if any(b in layer for b in POSITIVE_BEND_LAYERS):
                score += 40.0
                reasons.append(f"layer:bend({layer})")
            elif any(c in layer for c in AUXILIARY_CONSTRUCTION_LAYERS):
                score -= 45.0
                reasons.append(f"layer:auxiliary_construction({layer})")
            elif any(r in layer for r in REFERENCE_FAB_LAYERS):
                score += 20.0
                reasons.append(f"layer:reference_fabrication({layer})")

            # 2. Linetype Evidence (+25 / +10)
            if any(lt in linetype for lt in ["DASHED", "HIDDEN", "DASH"]):
                score += 25.0
                reasons.append(f"linetype:dashed({linetype})")
            elif any(lt in linetype for lt in ["CENTER", "PHANTOM"]):
                score += 10.0
                reasons.append(f"linetype:center_phantom({linetype})")

            # 3. Geometric Span Ratio (+35 / +20 / +5 / -30)
            if span_ratio >= 0.70:
                score += 35.0
                reasons.append(f"span:strong({span_ratio:.2f})")
            elif span_ratio >= 0.50:
                score += 20.0
                reasons.append(f"span:moderate({span_ratio:.2f})")
            elif span_ratio >= 0.30:
                score += 5.0
                reasons.append(f"span:weak({span_ratio:.2f})")
            else:
                score -= 30.0
                reasons.append(f"span:short_insufficient({span_ratio:.2f})")

            # 4. Corner-to-corner diagonal envelope check (brace/framing X-lines)
            is_diagonal = (abs_dx > 0.3 * sheet_w and abs_dy > 0.3 * sheet_h)
            if is_diagonal:
                score -= 40.0
                reasons.append("negative:diagonal_cross_geometry")

            # 5. Drawing text annotation corroboration
            if expected_bend_count is not None and span_ratio >= 0.50 and not is_diagonal:
                score += 20.0
                reasons.append(f"annotation:corroborated_bends({expected_bend_count})")

            candidate_lines.append({
                "entity": e,
                "id": eid,
                "layer": layer,
                "length": length,
                "span_ratio": span_ratio,
                "is_v": is_v,
                "score": score,
                "reasons": reasons,
                "start": [round(sx, 2), round(sy, 2)],
                "end": [round(ex, 2), round(ey, 2)],
            })

        # 6. Negative Pattern Penalties: Dense parallel rule spacing (< 25mm) and cross-hatching
        for c1 in candidate_lines:
            close_parallel = 0
            perpendicular_crosses = 0
            for c2 in candidate_lines:
                if c1["id"] == c2["id"]:
                    continue
                if c1["is_v"] == c2["is_v"]:
                    coord1 = c1["start"][0] if c1["is_v"] else c1["start"][1]
                    coord2 = c2["start"][0] if c2["is_v"] else c2["start"][1]
                    dist = abs(coord1 - coord2)
                    if 0.1 < dist <= 25.0:
                        close_parallel += 1
                else:
                    # Perpendicular line intersection check
                    if c1["is_v"]:
                        vx = c1["start"][0]
                        hy = c2["start"][1]
                        if (min(c1["start"][1], c1["end"][1]) <= hy <= max(c1["start"][1], c1["end"][1]) and
                            min(c2["start"][0], c2["end"][0]) <= vx <= max(c2["start"][0], c2["end"][0])):
                            perpendicular_crosses += 1
                    else:
                        hy = c1["start"][1]
                        vx = c2["start"][0]
                        if (min(c1["start"][0], c1["end"][0]) <= vx <= max(c1["start"][0], c1["end"][0]) and
                            min(c2["start"][1], c2["end"][1]) <= hy <= max(c2["start"][1], c2["end"][1])):
                            perpendicular_crosses += 1

            if close_parallel >= 2:
                c1["score"] -= 35.0
                c1["reasons"].append("negative:dense_parallel_grid")
            if perpendicular_crosses >= 2:
                c1["score"] -= 35.0
                c1["reasons"].append("negative:perpendicular_lattice")

        # 7. Select valid candidates meeting confidence threshold
        valid_candidates = [c for c in candidate_lines if c["score"] >= 40.0]

        # 8. Reconcile with expected bend count from notes if present
        final_bends: List[Dict[str, Any]] = []
        if expected_bend_count is not None and len(valid_candidates) >= expected_bend_count:
            v_bends = [c for c in valid_candidates if c["is_v"]]
            h_bends = [c for c in valid_candidates if not c["is_v"]]
            if len(v_bends) == expected_bend_count:
                final_bends = v_bends
            elif len(h_bends) == expected_bend_count:
                final_bends = h_bends
            else:
                valid_candidates.sort(key=lambda x: x["score"], reverse=True)
                final_bends = valid_candidates[:expected_bend_count]
        else:
            final_bends = valid_candidates

        # Sort bends by starting coordinates for deterministic output
        final_bends.sort(key=lambda b: (b["start"][0], b["start"][1]))

        bends_output: List[Dict[str, Any]] = []
        bend_entities: List[int] = []
        for b in final_bends:
            has_corroboration = (expected_bend_count is not None and len(final_bends) == expected_bend_count)
            has_dedicated_layer = any(l in b["layer"] for l in POSITIVE_BEND_LAYERS)
            if has_corroboration:
                conf = 0.98
            elif has_dedicated_layer and b["score"] >= 60.0:
                conf = 0.96
            else:
                conf = min(0.95, max(0.65, 0.60 + (b["score"] / 200.0)))

            bends_output.append({
                "entity_id": b["id"],
                "line": {
                    "start": b["start"],
                    "end": b["end"],
                    "length_mm": round(b["length"], 2),
                },
                "angle_deg": detected_angle,
                "confidence": round(conf, 2),
                "layer": b["layer"],
                "reasons": b["reasons"],
            })
            bend_entities.append(b["id"])

        overall_conf = (
            round(sum(b["confidence"] for b in bends_output) / len(bends_output), 2)
            if bends_output else 0.98
        )

        warnings = []
        if expected_bend_count is not None and len(bends_output) != expected_bend_count:
            warnings.append(
                f"Drawing text states {expected_bend_count} bends, but {len(bends_output)} verified geometrically."
            )

        return {
            "value": len(bends_output),
            "bend_count": len(bends_output),
            "confidence": overall_conf,
            "method": "GEOMETRIC_CANDIDATE_SCORING",
            "source_entities": bend_entities,
            "bends": bends_output,
            "default_angle_deg": detected_angle,
            "angles_deg": [b["angle_deg"] for b in bends_output],
            "warnings": warnings,
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
