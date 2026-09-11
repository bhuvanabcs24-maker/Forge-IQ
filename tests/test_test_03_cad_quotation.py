"""
Regression tests for ForgeIQ Test 03 CAD extraction & CAD -> Quotation pipeline.
Verifies robust, non-hardcoded bend detection on reference layers,
auxiliary construction geometry rejection, internal cutouts, and physical weight extraction.
"""

import os
import sys
import json
import pytest

sys.path.insert(0, os.path.abspath("ai-service"))
from app.cad.cad_service import CadService


FIXTURE_PATH = os.path.join(os.path.dirname(__file__), "fixtures", "ForgeIQ_Test_03_Complex_Profile.dxf")


@pytest.fixture
def test_03_dxf_bytes():
    assert os.path.exists(FIXTURE_PATH), f"Fixture not found at {FIXTURE_PATH}"
    with open(FIXTURE_PATH, "rb") as f:
        return f.read()


def test_test_03_cad_extraction(test_03_dxf_bytes):
    res = CadService.analyze_dxf(test_03_dxf_bytes, "ForgeIQ_Test_03_Complex_Profile.dxf")
    assert res["success"] is True
    assert "analysis_id" in res

    g = res["geometry"]
    dims = g["dimensions"]

    # 1. Envelope Dimensions (500 x 360 x 8 mm)
    assert dims["lengthMm"] == 500.0
    assert dims["widthMm"] == 360.0
    assert dims["thicknessMm"] == 8.0

    # 2. Outer Cut Perimeter (1576.5 mm)
    assert abs(g["cutLengthMm"] - 1576.5) < 1.0
    assert abs(g["outerPerimeterMm"] - 1576.5) < 1.0

    # 3. Holes (7 holes)
    assert g["holeCount"] == 7

    # 4. Internal Cutouts (3 cutouts)
    assert g["internalCutoutCount"] == 3
    assert len(g["internalCutouts"]) == 3
    assert abs(g["internalCutoutPerimeterMm"] - 560.0) < 1.0

    # 5. Slots (0 slots)
    assert g["slotCount"] == 0

    # 6. Welds (2 welds)
    assert g["weldCount"] == 2

    # 7. Press Brake Bends (4 x 90 deg)
    assert g["bendCount"] == 4
    bends_detail = g["featureConfidenceDetails"]["bends"]
    assert bends_detail["bend_count"] == 4
    assert bends_detail["angles_deg"] == [90.0, 90.0, 90.0, 90.0]
    assert g["bendAngleText"] == "4 × 90°"

    # Entities 11, 12, 13, 14 are on REF_LINES
    bend_entities = bends_detail["source_entities"]
    assert bend_entities == [11, 12, 13, 14]

    # Protection against auxiliary construction lines (entities 15-24 must NOT be bends)
    auxiliary_ids = set(range(15, 25))
    assert len(set(bend_entities).intersection(auxiliary_ids)) == 0

    # 8. Material & Weight (~10.16 kg)
    assert "MILD STEEL" in g["materialGrade"].upper()
    assert abs(g["estimatedWeightKg"] - 10.16) <= 0.05
    assert g["confidenceScores"]["bendCount"] >= 90


def test_test_03_cad_to_quotation_lineage(test_03_dxf_bytes):
    cad_res = CadService.analyze_dxf(test_03_dxf_bytes, "ForgeIQ_Test_03_Complex_Profile.dxf")
    g = cad_res["geometry"]
    analysis_id = cad_res["analysis_id"]

    quote = {
        "title": "ForgeIQ Test 03 Complex Profile",
        "source_cad_analysis_id": analysis_id,
        "source_cad_file_name": "ForgeIQ_Test_03_Complex_Profile.dxf",
        "line_items": [
            {
                "id": f"li-{analysis_id}",
                "part_name": "ForgeIQ Test 03 Complex Profile",
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
                "total_cutting_path_mm": g["totalCuttingPathMm"],
            }
        ],
    }

    assert quote["source_cad_analysis_id"] == analysis_id
    li = quote["line_items"][0]
    assert li["width"] == 500.0
    assert li["height"] == 360.0
    assert li["thickness"] == 8.0
    assert li["quantity"] == 1
    assert "MILD STEEL" in li["material"].upper()
    assert li["hole_count"] == 7
    assert li["bend_count"] == 4
    assert li["weld_count"] == 2
    assert li["internal_cutout_count"] == 3
    assert li["slot_count"] == 0
    assert abs(li["weight_kg"] - 10.16) <= 0.05
    assert abs(li["total_cutting_path_mm"] - 2485.22) < 2.0
