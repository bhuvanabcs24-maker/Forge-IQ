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

        # 3. Outer profile & cut perimeter
        perimeter_result = PerimeterEngine.calculate_cut_perimeter(entities, bounds)
        cut_perimeter_mm = perimeter_result["cut_perimeter_mm"]
        outer_loop = perimeter_result.get("outer_loop")

        # Dimensions: calculate from outer loop bbox if available, else overall bounds
        if outer_loop and outer_loop.get("bbox"):
            obbox = outer_loop["bbox"]
            width_mm = round(obbox[2] - obbox[0], 2)
            height_mm = round(obbox[3] - obbox[1], 2)
        else:
            width_mm = bounds["width"]
            height_mm = bounds["height"]

        # 4. Detect holes
        outer_bbox_tuple = (
            outer_loop["bbox"][0], outer_loop["bbox"][1],
            outer_loop["bbox"][2], outer_loop["bbox"][3]
        ) if outer_loop and outer_loop.get("bbox") else None

        holes_result = FeatureDetectors.detect_holes(entities, outer_bbox_tuple)

        # 5. Detect bends
        bends_result = FeatureDetectors.detect_bends(entities, metadata["notes"], outer_bbox_tuple)

        # 6. Detect welds
        welds_result = FeatureDetectors.detect_welds(entities)

        # 7. Mass and weight calculation
        gross_area_mm2 = outer_loop["area_mm2"] if outer_loop else (width_mm * height_mm)
        mass_result = FeatureDetectors.calculate_weight_and_mass(
            gross_area_mm2=gross_area_mm2,
            hole_area_mm2=holes_result["total_hole_area_mm2"],
            thickness_mm=thickness_mm,
            material_name=material_name,
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
                "angle_deg": b["angle_deg"],
                "color": "#F59E0B",
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
        conf_dimensions = 98 if (width_mm > 0 and height_mm > 0) else 50
        conf_cut = int(perimeter_result["confidence"] * 100)
        conf_holes = int(holes_result["confidence"] * 100)
        conf_bends = int(bends_result["confidence"] * 100)
        conf_mass = int(mass_result["confidence"] * 100)
        conf_thickness = 95 if metadata["has_thickness_specified"] else 80

        return {
            "success": True,
            "fileName": file_name,
            "geometry": {
                "partName": file_name.replace(".dxf", "").replace("_", " "),
                "drawingNumber": f"DWG-2026-{abs(hash(file_name)) % 9000 + 1000}",
                "fileType": "dxf",
                "dimensions": {
                    "lengthMm": width_mm,
                    "widthMm": height_mm,
                    "thicknessMm": thickness_mm,
                },
                "materialGrade": mass_result["material"],
                "holeCount": holes_result["hole_count"],
                "holeDiameters": holes_result["diameter_groups"],
                "bendCount": bends_result["bend_count"],
                "weldCount": welds_result["weld_count"],
                "cutLengthMm": cut_perimeter_mm,
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
                    "mass": mass_result,
                },
                "vectorEntities": vector_entities,
                "analysisDetails": {
                    "totalEntities": entity_count,
                    **entity_breakdown,
                    "units": "mm",
                    "material": mass_result["material"],
                    "thickness": f"{thickness_mm} mm",
                    "warnings": all_warnings,
                    "densityUsed": f"{mass_result['density_kg_m3']} kg/m³",
                },
            },
        }
