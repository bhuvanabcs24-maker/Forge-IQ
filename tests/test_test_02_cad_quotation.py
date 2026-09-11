"""
Regression tests for ForgeIQ Test 02 CAD extraction & CAD -> Quotation pipeline.
"""

import os
import sys
import json
import pytest

sys.path.insert(0, os.path.abspath("ai-service"))
from app.cad.cad_service import CadService


FIXTURE_PATH = os.path.join(os.path.dirname(__file__), "fixtures", "ForgeIQ_Test_02_Internal_Cutouts.dxf")


@pytest.fixture
def test_02_dxf_bytes():
    assert os.path.exists(FIXTURE_PATH), f"Fixture not found at {FIXTURE_PATH}"
    with open(FIXTURE_PATH, "rb") as f:
        return f.read()


def test_test_02_cad_extraction(test_02_dxf_bytes):
    res = CadService.analyze_dxf(test_02_dxf_bytes, "ForgeIQ_Test_02_Internal_Cutouts.dxf")
    assert res["success"] is True
    assert "analysis_id" in res

    g = res["geometry"]
    dims = g["dimensions"]

    assert dims["lengthMm"] == 500.0 or dims["widthMm"] == 500.0
    assert dims["widthMm"] == 300.0 or dims["lengthMm"] == 300.0
    assert dims["thicknessMm"] == 6.0

    thk_details = g["analysisDetails"]["thicknessDetails"]
    assert thk_details["value"] == 6.0
    assert thk_details["method"] == "ANNOTATION_TEXT"
    assert thk_details["source_entity"] == 22
    assert thk_details["confidence"] >= 0.95

    assert abs(g["cutLengthMm"] - 1582.43) < 1.0

    assert g["holeCount"] == 6
    assert g["holeDiameters"] == {12.0: 3, 20.0: 3}

    assert g["bendCount"] == 3
    bends = g["featureConfidenceDetails"]["bends"]
    assert bends["angles_deg"] == [90.0, 90.0, 90.0]

    assert g["weldCount"] == 2
    assert g["internalCutoutCount"] == 2
    assert len(g["internalCutouts"]) == 2
    assert g["slotCount"] == 1
    assert len(g["slots"]) == 1
    assert "MILD STEEL" in g["materialGrade"].upper()
    assert g["estimatedWeightKg"] > 5.0 and g["estimatedWeightKg"] < 7.5


def test_cad_to_quotation_pipeline(test_02_dxf_bytes):
    cad_res = CadService.analyze_dxf(test_02_dxf_bytes, "ForgeIQ_Test_02_Internal_Cutouts.dxf")
    g = cad_res["geometry"]
    analysis_id = cad_res["analysis_id"]

    quote = {
        "title": "ForgeIQ Test 02 Internal Cutouts",
        "source_cad_analysis_id": analysis_id,
        "source_cad_file_name": "ForgeIQ_Test_02_Internal_Cutouts.dxf",
        "line_items": [
            {
                "id": f"li-{analysis_id}",
                "part_name": "ForgeIQ Test 02 Internal Cutouts",
                "material": g["materialGrade"],
                "dimensions": f"{g['dimensions']['lengthMm']} x {g['dimensions']['widthMm']} x {g['dimensions']['thicknessMm']} mm",
                "width": g["dimensions"]["lengthMm"],
                "height": g["dimensions"]["widthMm"],
                "thickness": g["dimensions"]["thicknessMm"],
                "quantity": 1,
                "weight_kg": g["estimatedWeightKg"],
                "hole_count": g["holeCount"],
                "bend_count": g["bendCount"],
                "weld_count": g["weldCount"],
                "internal_cutout_count": g["internalCutoutCount"],
                "slot_count": g["slotCount"],
                "outer_perimeter_mm": g["cutLengthMm"],
            }
        ]
    }

    assert quote["source_cad_analysis_id"] == analysis_id
    li = quote["line_items"][0]
    assert li["width"] == 500.0
    assert li["height"] == 300.0
    assert li["thickness"] == 6.0
    assert li["quantity"] == 1
    assert "MILD STEEL" in li["material"].upper()
    assert li["hole_count"] == 6
    assert li["bend_count"] == 3
    assert li["weld_count"] == 2
    assert li["internal_cutout_count"] == 2
    assert li["slot_count"] == 1
    assert abs(li["outer_perimeter_mm"] - 1582.43) < 1.0
    assert li["weight_kg"] > 5.0 and li["weight_kg"] < 7.5

    quote_str = json.dumps(quote)
    stale_terms = [
        "Avionics Heat Sink",
        "304 Stainless Steel",
        "400mm × 400mm",
        "400 × 400",
        "Mounting Support Flange",
        "6061-T6 Aluminum",
    ]
    for term in stale_terms:
        assert term not in quote_str, f"Found stale term '{term}' in generated quotation!"
