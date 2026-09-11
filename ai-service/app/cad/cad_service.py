"""
ForgeIQ Master CAD & Engineering Intelligence Service.
Combines deterministic ezdxf geometry engines with ML feature classification
and confidence scoring to analyze 2D/3D fabrication drawings.
"""

from typing import Dict, Any, Optional
from app.cad.dxf_normalizer import DxfNormalizer
from app.cad.perimeter_engine import PerimeterEngine
from app.cad.feature_detectors import FeatureDetectors
from app.cad.classifier import CadClassifier


class CadService:
    """
    Unified CAD analysis service.
    """

    @classmethod
    def analyze_dxf(cls, source: Any, file_name: str = "drawing.dxf") -> Dict[str, Any]:
        """
        Executes end-to-end CAD drawing analysis.
        """
        # 1. Normalize DXF entities
        normalized = DxfNormalizer.normalize(source)
        entities = normalized["entities"]
        bounds = normalized["bounds"]
        entity_count = normalized["entity_count"]

        # 2. Extract drawing metadata and notes (Material, stated envelope, thickness)
        metadata = FeatureDetectors.extract_metadata_notes(entities)
        thickness_mm = metadata["thickness_mm"]
        material_name = metadata["material"]

        # 3. Outer profile, cut perimeter, internal cutouts, and oriented bounding box
        perimeter_result = PerimeterEngine.calculate_cut_perimeter(entities, bounds)
        cut_perimeter_mm = perimeter_result["cut_perimeter_mm"]
        outer_loop = perimeter_result.get("outer_loop")

        # Dimensions: use true oriented bounding box (OBB) if calculated, otherwise AABB
        true_len = perimeter_result.get("true_length_mm", bounds["width"])
        true_wid = perimeter_result.get("true_width_mm", bounds["height"])
        aabb_len = perimeter_result.get("aabb_length_mm", bounds["width"])
        aabb_wid = perimeter_result.get("aabb_width_mm", bounds["height"])
        rotation_deg = perimeter_result.get("rotation_deg", 0.0)

        # 4. Identify cut entity IDs to exclude from bends/welds
        cut_eids = list(perimeter_result.get("source_entities", []))
        for c in perimeter_result.get("all_internal_loops", []):
            cut_eids.extend(c.get("entities", []))
        cut_eids = list(set(cut_eids))

        outer_bbox_tuple = (
            outer_loop["bbox"][0], outer_loop["bbox"][1],
            outer_loop["bbox"][2], outer_loop["bbox"][3]
        ) if outer_loop and outer_loop.get("bbox") else None

        holes_result = FeatureDetectors.detect_holes(entities, outer_bbox_tuple)

        # 5. Detect bends (pass cut_eids to prevent classifying slot/profile lines as bends)
        bends_result = FeatureDetectors.detect_bends(
            entities, metadata["notes"], outer_bbox_tuple, cut_entity_ids=cut_eids
        )

        # 6. Detect welds (pass cut_eids and bend_eids to prevent overlap)
        welds_result = FeatureDetectors.detect_welds(
            entities,
            cut_entity_ids=cut_eids,
            bend_entity_ids=bends_result["source_entities"],
            outer_bbox=outer_bbox_tuple,
        )

        # 7. Mass and weight calculation (subtract holes, internal cutouts, and slots)
        gross_area_mm2 = outer_loop["area_mm2"] if outer_loop else (true_len * true_wid)
        cutout_area_mm2 = perimeter_result.get("internal_cutout_area_mm2", 0.0)
        slot_area_mm2 = perimeter_result.get("slot_area_mm2", 0.0)
        mass_result = FeatureDetectors.calculate_weight_and_mass(
            gross_area_mm2=gross_area_mm2,
            hole_area_mm2=holes_result["total_hole_area_mm2"],
            thickness_mm=thickness_mm,
            material_name=material_name,
            cutout_area_mm2=cutout_area_mm2,
            slot_area_mm2=slot_area_mm2,
        )

        # 8. Complexity score
        complexity = FeatureDetectors.calculate_complexity(
            hole_count=holes_result["hole_count"],
            bend_count=bends_result["bend_count"],
            weld_count=welds_result["weld_count"],
            cut_perimeter_mm=cut_perimeter_mm,
            gross_area_mm2=gross_area_mm2,
        )

        # 9. ML entity classification and audit breakdown
        classified_entities = []
        entity_breakdown = {
            "cut_entities": 0,
            "hole_entities": 0,
            "bend_entities": 0,
            "weld_entities": 0,
            "annotation_entities": 0,
            "ignored_entities": 0,
        }

        for e in entities:
            pred_class, conf = CadClassifier.classify_entity(e, bounds)
            classified_entities.append({
                "id": e["id"],
                "type": e["type"],
                "layer": e.get("layer"),
                "predicted_class": pred_class,
                "confidence": conf,
            })
            if pred_class == "outer_cut":
                entity_breakdown["cut_entities"] += 1
            elif pred_class == "hole":
                entity_breakdown["hole_entities"] += 1
            elif pred_class == "bend":
                entity_breakdown["bend_entities"] += 1
            elif pred_class == "weld":
                entity_breakdown["weld_entities"] += 1
            elif pred_class == "annotation":
                entity_breakdown["annotation_entities"] += 1
            else:
                entity_breakdown["ignored_entities"] += 1

        # 10. Vector entities formatted for synchronized UI rendering
        vector_entities = []

        # Outer contour
        if outer_loop and outer_loop.get("vertices"):
            vector_entities.append({
                "id": "outer-loop-0",
                "type": "outer_cut",
                "geometry_type": "polygon",
                "points": outer_loop["vertices"],
                "color": "#3B82F6",
                "perimeter_mm": cut_perimeter_mm,
            })

        # Internal cutouts
        for idx, c_loop in enumerate(perimeter_result.get("internal_cutouts", [])):
            vector_entities.append({
                "id": f"internal-cutout-{idx}",
                "type": "internal_cut",
                "geometry_type": "polygon",
                "points": c_loop["vertices"],
                "color": "#F59E0B",
                "perimeter_mm": c_loop["perimeter"],
            })

        # Slots
        for idx, s_loop in enumerate(perimeter_result.get("slots", [])):
            vector_entities.append({
                "id": f"slot-{idx}",
                "type": "slot",
                "geometry_type": "polygon",
                "points": s_loop["vertices"],
                "color": "#06B6D4",
                "perimeter_mm": s_loop["perimeter"],
            })

        # Holes
        for idx, h in enumerate(holes_result["holes"]):
            vector_entities.append({
                "id": f"hole-{idx}",
                "type": "hole",
                "geometry_type": "circle",
                "center": h["center"],
                "radius": h["radius_mm"],
                "diameter": h["diameter_mm"],
                "color": "#EF4444",
            })

        # Bends
        for idx, b in enumerate(bends_result["bends"]):
            vector_entities.append({
                "id": f"bend-{idx}",
                "type": "bend",
                "geometry_type": "line",
                "start": b["line"]["start"],
                "end": b["line"]["end"],
                "color": "#F59E0B",
                "angle_deg": b.get("angle_deg", 90.0),
            })

        # Welds
        for idx, w in enumerate(welds_result["welds"]):
            vector_entities.append({
                "id": f"weld-{idx}",
                "type": "weld",
                "geometry_type": "line",
                "start": w["line"]["start"],
                "end": w["line"]["end"],
                "color": "#8B5CF6",
            })

        all_warnings = []
        all_warnings.extend(perimeter_result.get("warnings", []))
        all_warnings.extend(holes_result.get("warnings", []))
        all_warnings.extend(bends_result.get("warnings", []))
        all_warnings.extend(mass_result.get("warnings", []))

        # Confidence compilation (0-100 scale for UI)
        conf_dimensions = 98 if (true_len > 0 and true_wid > 0) else 50
        conf_cut = int(perimeter_result["confidence"] * 100)
        conf_holes = int(holes_result["confidence"] * 100)
        conf_bends = int(bends_result["confidence"] * 100)
        conf_mass = int(mass_result["confidence"] * 100)
        conf_thickness = int(metadata["thickness_details"]["confidence"] * 100)

        hole_cut_perim = round(sum(3.1415926535 * h["diameter_mm"] for h in holes_result["holes"]), 2)
        internal_cut_perim = round(perimeter_result.get("internal_cutout_perimeter_mm", 0.0), 2)
        slot_cut_perim = round(perimeter_result.get("slot_perimeter_mm", 0.0), 2)
        total_internal_perim = round(internal_cut_perim + slot_cut_perim + hole_cut_perim, 2)
        total_cutting_path = round(cut_perimeter_mm + total_internal_perim, 2)

        analysis_id = f"cad-{abs(hash(file_name + str(cut_perimeter_mm))) % 100000000:08d}"
        clean_part_name = file_name.replace(".dxf", "").replace("_", " ")

        return {
            "success": True,
            "analysis_id": analysis_id,
            "fileName": file_name,
            "geometry": {
                "analysisId": analysis_id,
                "partName": clean_part_name,
                "drawingNumber": f"DWG-2026-{abs(hash(file_name)) % 9000 + 1000}",
                "fileType": "dxf",
                "dimensions": {
                    "lengthMm": true_len,
                    "widthMm": true_wid,
                    "thicknessMm": thickness_mm,
                    "trueLengthMm": true_len,
                    "trueWidthMm": true_wid,
                    "aabbLengthMm": aabb_len,
                    "aabbWidthMm": aabb_wid,
                    "rotationDeg": rotation_deg,
                },
                "materialGrade": mass_result["material"],
                "holeCount": holes_result["hole_count"],
                "holeDiameters": holes_result["diameter_groups"],
                "holeSizeDistribution": holes_result.get("hole_size_distribution", {}),
                "bendCount": bends_result["bend_count"],
                "weldCount": welds_result["weld_count"],
                "cutLengthMm": cut_perimeter_mm,
                "outerPerimeterMm": cut_perimeter_mm,
                "internalCutoutCount": perimeter_result.get("internal_cutouts_count", 0),
                "internalCutouts": perimeter_result.get("internal_cutouts", []),
                "internalCutoutPerimeterMm": internal_cut_perim,
                "slotCount": perimeter_result.get("slot_count", 0),
                "slots": perimeter_result.get("slots", []),
                "slotPerimeterMm": slot_cut_perim,
                "holeCutPerimeterMm": hole_cut_perim,
                "totalInternalCutPerimeterMm": total_internal_perim,
                "totalCuttingPathMm": total_cutting_path,
                "outer_perimeter_mm": cut_perimeter_mm,
                "internal_cut_perimeter_mm": internal_cut_perim,
                "hole_cut_perimeter_mm": hole_cut_perim,
                "slot_cut_perimeter_mm": slot_cut_perim,
                "total_cutting_path_mm": total_cutting_path,
                "weldLengthMm": welds_result["weld_length_mm"],
                "surfaceAreaSqFt": round(gross_area_mm2 * 1.07639e-5, 2),
                "grossAreaMm2": gross_area_mm2,
                "netAreaMm2": mass_result["net_area_mm2"],
                "estimatedWeightKg": mass_result["estimated_weight_kg"],
                "grossWeightKg": mass_result["gross_weight_kg"],
                "complexityScore": complexity,
                "confidenceScores": {
                    "dimensions": conf_dimensions,
                    "thickness": conf_thickness,
                    "holeCount": conf_holes,
                    "bendCount": conf_bends,
                    "cutLength": conf_cut,
                    "weight": conf_mass,
                },
                "featureConfidenceDetails": {
                    "cut_perimeter": perimeter_result,
                    "holes": holes_result,
                    "bends": bends_result,
                    "welds": welds_result,
                    "mass": mass_result,
                    "thickness": metadata["thickness_details"],
                },
                "vectorEntities": vector_entities,
                "analysisDetails": {
                    "totalEntities": entity_count,
                    **entity_breakdown,
                    "units": "mm",
                    "material": mass_result["material"],
                    "thickness": f"{thickness_mm} mm",
                    "thicknessDetails": metadata["thickness_details"],
                    "warnings": all_warnings,
                    "densityUsed": f"{mass_result['density_kg_m3']} kg/m³",
                    "orientedBoundingBox": {
                        "trueLength": true_len,
                        "trueWidth": true_wid,
                        "rotationDeg": rotation_deg,
                        "aabbLength": aabb_len,
                        "aabbWidth": aabb_wid,
                    },
                },
            },
        }
