"""
Regression Test Suite for ForgeIQ CAD & Engineering Intelligence Engine.
Tests ForgeIQ_Sample_SheetMetal_Part.dxf against exact manufacturing specifications.
Strictly verifies that perimeter is ~1382.4mm and FAILS if 1850mm.
"""

import os
import pytest
from app.cad.cad_service import CadService


SAMPLE_PATH = os.path.join(
    os.path.dirname(__file__), "fixtures", "ForgeIQ_Sample_SheetMetal_Part.dxf"
)
if not os.path.exists(SAMPLE_PATH):
    # Fallback to root fixtures
    SAMPLE_PATH = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        "tests",
        "fixtures",
        "ForgeIQ_Sample_SheetMetal_Part.dxf",
    )


def test_sample_sheet_metal_regression():
    assert os.path.exists(SAMPLE_PATH), f"Sample DXF missing at {SAMPLE_PATH}"

    result = CadService.analyze_dxf(SAMPLE_PATH, "ForgeIQ_Sample_SheetMetal_Part.dxf")
    assert result["success"] is True, "Analysis failed"

    geom = result["geometry"]

    # 1. Envelope dimensions: 400 x 300 mm (+-0.5%)
    dim = geom["dimensions"]
    assert abs(dim["lengthMm"] - 400.0) <= 2.0, f"Expected 400mm width, got {dim['lengthMm']}"
    assert abs(dim["widthMm"] - 300.0) <= 2.0, f"Expected 300mm height, got {dim['widthMm']}"
    assert abs(dim["thicknessMm"] - 6.0) <= 0.1, f"Expected 6mm thickness, got {dim['thicknessMm']}"

    # 2. Cut perimeter: Must be ~1382.4 mm (+- 0.5%) and MUST NOT be 1850 mm
    cut_length = geom["cutLengthMm"]
    assert cut_length != 1850.0, "Regression failure: Cut perimeter returned legacy mock 1850mm!"
    assert abs(cut_length - 1382.43) <= 5.0, f"Expected ~1382.4mm, got {cut_length}"

    # 3. Hole Count: Must be exactly 8
    assert geom["holeCount"] == 8, f"Expected exactly 8 holes, got {geom['holeCount']}"
    assert len(geom["holeDiameters"]) == 2, "Expected 2 diameter groups (16mm and 12mm)"
    assert geom["holeDiameters"].get(16.0) == 4, "Expected 4 holes of diameter 16mm"
    assert geom["holeDiameters"].get(12.0) == 4, "Expected 4 holes of diameter 12mm"

    # 4. Bend Count: Must be exactly 4
    assert geom["bendCount"] == 4, f"Expected 4 bend lines, got {geom['bendCount']}"

    # 5. Weld Count: Must be exactly 2
    assert geom["weldCount"] == 2, f"Expected 2 weld lines, got {geom['weldCount']}"

    # 6. Material and Weight Calculation
    assert "MILD STEEL" in geom["materialGrade"].upper(), f"Expected Mild Steel, got {geom['materialGrade']}"
    # Gross mass: ~5.64 - 5.65 kg
    assert abs(geom["grossWeightKg"] - 5.64) <= 0.1, f"Expected ~5.65 kg gross weight, got {geom['grossWeightKg']}"
    # Net mass (after subtracting 8 holes): ~5.59 kg
    assert abs(geom["estimatedWeightKg"] - 5.59) <= 0.1, f"Expected ~5.59 kg net weight, got {geom['estimatedWeightKg']}"

    # 7. Confidence scores and Vector Entities
    conf = geom["confidenceScores"]
    assert conf["cutLength"] >= 95, f"Confidence for cut perimeter too low: {conf['cutLength']}"
    assert conf["holeCount"] >= 95, f"Confidence for holes too low: {conf['holeCount']}"
    assert conf["bendCount"] >= 90, f"Confidence for bends too low: {conf['bendCount']}"

    # 8. Vector entities for UI synchronization
    vectors = geom["vectorEntities"]
    assert len(vectors) == 1 + 8 + 4 + 2, f"Expected 15 vector primitives (1 outer + 8 holes + 4 bends + 2 welds), got {len(vectors)}"

    # 9. Analysis breakdown
    breakdown = geom["analysisDetails"]
    assert breakdown["totalEntities"] == 20
    assert breakdown["cut_entities"] == 1
    assert breakdown["hole_entities"] == 8
    assert breakdown["bend_entities"] == 4
    assert breakdown["weld_entities"] == 2
    assert breakdown["annotation_entities"] == 5
