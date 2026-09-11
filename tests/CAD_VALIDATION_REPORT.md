# ForgeIQ CAD Intelligence — Multi-DXF Validation & Robustness Report

## Executive Summary

This report validates the ForgeIQ deterministic CAD engine across 10 unseen, varied sheet-metal DXF drawings.
The suite tests non-standard layer names, heavy construction geometry, weld indications, irregular polygons, true arc fillets, multi-hole distributions, rotated parts (37°), internal cutouts/slots, and cluttered engineering drawings.

### Accuracy Scorecard

| Metric | Engineering Tolerance | Achieved Performance | Status |
|---|---|---|---|
| **Overall Test Suite Pass Rate** | 100.0% | **100.0%** (10/10) | ✅ PASS |
| **Hole Count Accuracy** | ≥ 99.0% | **100.0%** (55/55) | ✅ PASS |
| **Bend Count Accuracy** | ≥ 95.0% | **100.0%** (13/13) | ✅ PASS |
| **Mean Perimeter Error** | ≤ 0.50% | **0.000%** (Max: 0.000%) | ✅ PASS |
| **Mean Dimension Error** | ≤ 0.50% | **0.000%** (Max: 0.000%) | ✅ PASS |
| **Mean Net Weight Error** | ≤ 2.00% | **0.142%** (Max: 0.563%) | ✅ PASS |

---

## Comprehensive Test Results Table

| Test File | Feature | Expected | Predicted | Error / Match | Status |
|---|---|---|---|---|---|
| **01_simple_rectangle_holes.dxf** | Outer Perimeter | 1000.00 mm | 1000.00 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 300.0 × 200.0 mm | 300.0 × 200.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 4 | 4 | Exact Match | ✅ PASS |
| | Bend Count | 0 | 0 | Exact Match | ✅ PASS |
| | Weld Count | 0 | 0 | Exact Match | ✅ PASS |
| | Net Mass | 2.323 kg | 2.320 kg | 0.13% | ✅ PASS |
| **02_rounded_rectangle.dxf** | Outer Perimeter | 1265.66 mm | 1265.66 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 400.0 × 250.0 mm | 400.0 × 250.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 6 | 6 | Exact Match | ✅ PASS |
| | Bend Count | 0 | 0 | Exact Match | ✅ PASS |
| | Weld Count | 0 | 0 | Exact Match | ✅ PASS |
| | Net Mass | 1.599 kg | 1.590 kg | 0.56% | ✅ PASS |
| **03_irregular_polygon.dxf** | Outer Perimeter | 1160.61 mm | 1160.61 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 400.0 × 250.0 mm | 400.0 × 250.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 5 | 5 | Exact Match | ✅ PASS |
| | Bend Count | 0 | 0 | Exact Match | ✅ PASS |
| | Weld Count | 0 | 0 | Exact Match | ✅ PASS |
| | Net Mass | 2.852 kg | 2.850 kg | 0.07% | ✅ PASS |
| **04_multiple_hole_diameters.dxf** | Outer Perimeter | 1500.00 mm | 1500.00 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 450.0 × 300.0 mm | 450.0 × 300.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 10 | 10 | Exact Match | ✅ PASS |
| | Bend Count | 0 | 0 | Exact Match | ✅ PASS |
| | Weld Count | 0 | 0 | Exact Match | ✅ PASS |
| | Net Mass | 5.216 kg | 5.220 kg | 0.08% | ✅ PASS |
| **05_different_layer_names.dxf** | Outer Perimeter | 1360.00 mm | 1360.00 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 400.0 × 280.0 mm | 400.0 × 280.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 6 | 6 | Exact Match | ✅ PASS |
| | Bend Count | 2 | 2 | Exact Match | ✅ PASS |
| | Weld Count | 0 | 0 | Exact Match | ✅ PASS |
| | Net Mass | 3.487 kg | 3.490 kg | 0.09% | ✅ PASS |
| **06_bends_with_construction_geometry.dxf** | Outer Perimeter | 1400.00 mm | 1400.00 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 400.0 × 300.0 mm | 400.0 × 300.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 4 | 4 | Exact Match | ✅ PASS |
| | Bend Count | 4 | 4 | Exact Match | ✅ PASS |
| | Weld Count | 0 | 0 | Exact Match | ✅ PASS |
| | Net Mass | 2.815 kg | 2.820 kg | 0.18% | ✅ PASS |
| **07_welds_and_annotations.dxf** | Outer Perimeter | 1200.00 mm | 1200.00 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 350.0 × 250.0 mm | 350.0 × 250.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 4 | 4 | Exact Match | ✅ PASS |
| | Bend Count | 2 | 2 | Exact Match | ✅ PASS |
| | Weld Count | 2 | 2 | Exact Match | ✅ PASS |
| | Net Mass | 3.475 kg | 3.480 kg | 0.14% | ✅ PASS |
| **08_rotated_part.dxf** | Outer Perimeter | 960.00 mm | 960.00 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 300.0 × 180.0 mm | 300.0 × 180.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 4 | 4 | Exact Match | ✅ PASS |
| | Bend Count | 2 | 2 | Exact Match | ✅ PASS |
| | Weld Count | 0 | 0 | Exact Match | ✅ PASS |
| | Net Mass | 1.681 kg | 1.680 kg | 0.06% | ✅ PASS |
| **09_internal_cutouts.dxf** | Outer Perimeter | 1600.00 mm | 1600.00 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 500.0 × 300.0 mm | 500.0 × 300.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 6 | 6 | Exact Match | ✅ PASS |
| | Bend Count | 0 | 0 | Exact Match | ✅ PASS |
| | Weld Count | 0 | 0 | Exact Match | ✅ PASS |
| | Net Mass | 5.595 kg | 5.590 kg | 0.09% | ✅ PASS |
| **10_messy_engineering_drawing.dxf** | Outer Perimeter | 1360.00 mm | 1360.00 mm | 0.000% | ✅ PASS |
| | Dimensions (L × W) | 420.0 × 260.0 mm | 420.0 × 260.0 mm | 0.00% | ✅ PASS |
| | Hole Count | 6 | 6 | Exact Match | ✅ PASS |
| | Bend Count | 3 | 3 | Exact Match | ✅ PASS |
| | Weld Count | 2 | 2 | Exact Match | ✅ PASS |
| | Net Mass | 3.869 kg | 3.870 kg | 0.03% | ✅ PASS |

---

## Engineering Insights & Bugs Resolved

1. **Non-Semantic Layer Decoupling (Test 5):** The engine successfully analyzed drawings where cutting contours were on `PROFILE_OUT`, holes on `GEOM_A`, and bends on `FAB_FEATURE`, proving zero hardcoded dependency on standard layer names.
2. **Centerline vs Bend Disambiguation (Tests 5, 6, 10):** By excluding `CENTER` and `PHANTOM` linetypes and filtering out lines crossing hole centers, 10+ construction lines were ignored without creating false-positive bends.
3. **Rotated Part Geometric Invariance (Test 8):** For parts rotated arbitrarily (37°), the engine computes both the True Minimum Oriented Bounding Box (300 × 180 mm) and the Axis-Aligned Bounding Box (347.92 × 324.30 mm), maintaining 0.0% perimeter and weight error.
4. **Internal Cutouts & Net Area (Test 9):** Rectangular cutouts and slot features are separated into `internal_cutouts`, preventing them from polluting the outer cut perimeter while deducting their void areas from net sheet mass.
5. **True Arc Contour Bulge Integration (Test 2):** Fillet corners constructed with real `ARC` entities were integrated trigonometrically, computing the exact 1265.66 mm perimeter without chordal approximation error.

**Conclusion:** ForgeIQ's CAD Intelligence Engine passes 100% of the multi-DXF robustness and accuracy test suite with zero hardcoding.