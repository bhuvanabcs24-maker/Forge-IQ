"""
ForgeIQ Multi-DXF Validation & Robustness Test Generator.
Generates 10 distinct, realistic, manufacturing-grade DXF test files with
true mathematical ground truth JSON files.
"""

import os
import json
import math
from typing import List, Tuple, Dict, Any
import ezdxf

SAMPLES_DIR = os.path.abspath("tests/cad_samples")
AI_SAMPLES_DIR = os.path.abspath("ai-service/tests/cad_samples")

os.makedirs(SAMPLES_DIR, exist_ok=True)
os.makedirs(AI_SAMPLES_DIR, exist_ok=True)


def save_test_pair(name: str, doc: ezdxf.document.Drawing, ground_truth: Dict[str, Any]):
    """Saves DXF and corresponding ground-truth JSON to both test directories."""
    for folder in [SAMPLES_DIR, AI_SAMPLES_DIR]:
        dxf_path = os.path.join(folder, f"{name}.dxf")
        json_path = os.path.join(folder, f"{name}.json")
        doc.saveas(dxf_path)
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(ground_truth, f, indent=2)
    print(f"Generated {name}.dxf and {name}.json")


# ==============================================================================
# TEST 1: Simple Rectangle + Holes
# ==============================================================================
def generate_test_01():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.layers.add("CUT", color=7)
    doc.layers.add("HOLES", color=1)
    doc.layers.add("NOTES", color=3)

    w, h, thk = 300.0, 200.0, 5.0
    # Outer rectangle
    pts = [(0, 0), (w, 0), (w, h), (0, h)]
    msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": "CUT"})

    # 4 circular holes Ø16mm
    holes = [(50, 50), (250, 50), (50, 150), (250, 150)]
    r = 8.0
    dia = 16.0
    for cx, cy in holes:
        msp.add_circle((cx, cy), r, dxfattribs={"layer": "HOLES"})

    # Notes
    msp.add_text("MATERIAL: MILD STEEL", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 210))
    msp.add_text("THICKNESS: 5.0 MM", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 220))

    hole_area = 4 * math.pi * (r ** 2)
    gross_area = w * h
    net_area = gross_area - hole_area
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 7850.0

    gt = {
        "file": "01_simple_rectangle_holes.dxf",
        "description": "Simple 300x200 rectangle with 4 holes",
        "width_mm": w,
        "height_mm": h,
        "thickness_mm": thk,
        "material": "Mild Steel",
        "outer_perimeter_mm": 2 * (w + h),
        "gross_area_mm2": gross_area,
        "net_area_mm2": round(net_area, 2),
        "hole_count": 4,
        "hole_diameters": [dia] * 4,
        "hole_size_distribution": {f"{dia:.1f}": 4},
        "bend_count": 0,
        "weld_count": 0,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("01_simple_rectangle_holes", doc, gt)


# ==============================================================================
# TEST 2: Rounded Rectangle (Real Arcs)
# ==============================================================================
def generate_test_02():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.layers.add("CUT", color=7)
    doc.layers.add("HOLES", color=1)
    doc.layers.add("NOTES", color=3)

    w, h, thk = 400.0, 250.0, 6.0
    r_corner = 20.0

    # 4 lines and 4 arcs
    # Bottom line: (20, 0) -> (380, 0)
    msp.add_line((r_corner, 0), (w - r_corner, 0), dxfattribs={"layer": "CUT"})
    # Bottom-right arc: center (380, 20), start 270, end 360
    msp.add_arc((w - r_corner, r_corner), r_corner, 270, 360, dxfattribs={"layer": "CUT"})
    # Right line: (400, 20) -> (400, 230)
    msp.add_line((w, r_corner), (w, h - r_corner), dxfattribs={"layer": "CUT"})
    # Top-right arc: center (380, 230), start 0, end 90
    msp.add_arc((w - r_corner, h - r_corner), r_corner, 0, 90, dxfattribs={"layer": "CUT"})
    # Top line: (380, 250) -> (20, 250)
    msp.add_line((w - r_corner, h), (r_corner, h), dxfattribs={"layer": "CUT"})
    # Top-left arc: center (20, 230), start 90, end 180
    msp.add_arc((r_corner, h - r_corner), r_corner, 90, 180, dxfattribs={"layer": "CUT"})
    # Left line: (0, 230) -> (0, 20)
    msp.add_line((0, h - r_corner), (0, r_corner), dxfattribs={"layer": "CUT"})
    # Bottom-left arc: center (20, 20), start 180, end 270
    msp.add_arc((r_corner, r_corner), r_corner, 180, 270, dxfattribs={"layer": "CUT"})

    # 6 holes Ø14mm
    holes = [
        (80, 60), (200, 60), (320, 60),
        (80, 190), (200, 190), (320, 190)
    ]
    r_hole = 7.0
    dia = 14.0
    for cx, cy in holes:
        msp.add_circle((cx, cy), r_hole, dxfattribs={"layer": "HOLES"})

    msp.add_text("MATERIAL: ALUMINUM", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 265))
    msp.add_text("THICKNESS: 6.0 MM", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 275))

    # True perimeter = 2*(360 + 210) + 4*(2*pi*20 / 4) = 1140 + 40*pi
    perimeter = 2 * ((w - 2 * r_corner) + (h - 2 * r_corner)) + 2 * math.pi * r_corner
    # Area = w*h - 4*(r^2 - pi/4 * r^2)
    gross_area = (w * h) - (4 * (r_corner ** 2) - math.pi * (r_corner ** 2))
    hole_area = 6 * math.pi * (r_hole ** 2)
    net_area = gross_area - hole_area
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 2700.0  # Aluminum

    gt = {
        "file": "02_rounded_rectangle.dxf",
        "description": "400x250 rounded rectangle with 4 true arcs and 6 holes",
        "width_mm": w,
        "height_mm": h,
        "thickness_mm": thk,
        "material": "Aluminum",
        "outer_perimeter_mm": round(perimeter, 2),
        "gross_area_mm2": round(gross_area, 2),
        "net_area_mm2": round(net_area, 2),
        "hole_count": 6,
        "hole_diameters": [dia] * 6,
        "hole_size_distribution": {f"{dia:.1f}": 6},
        "bend_count": 0,
        "weld_count": 0,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("02_rounded_rectangle", doc, gt)


# ==============================================================================
# TEST 3: Irregular Polygon
# ==============================================================================
def generate_test_03():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.layers.add("CUT", color=7)
    doc.layers.add("HOLES", color=1)
    doc.layers.add("NOTES", color=3)

    # Vertices
    pts = [
        (0.0, 0.0),
        (350.0, 0.0),
        (400.0, 50.0),
        (380.0, 180.0),
        (300.0, 250.0),
        (100.0, 250.0),
        (0.0, 180.0)
    ]
    # Add polyline
    msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": "CUT"})

    # Exact perimeter
    perim = 0.0
    for i in range(len(pts)):
        p1 = pts[i]
        p2 = pts[(i + 1) % len(pts)]
        perim += math.hypot(p2[0] - p1[0], p2[1] - p1[1])

    # Shoelace area
    area = 0.0
    for i in range(len(pts)):
        p1 = pts[i]
        p2 = pts[(i + 1) % len(pts)]
        area += p1[0] * p2[1] - p2[0] * p1[1]
    gross_area = 0.5 * abs(area)

    # 5 holes
    holes = [
        ((120, 80), 5.0, 10.0),
        ((200, 80), 6.0, 12.0),
        ((280, 80), 5.0, 10.0),
        ((150, 160), 7.5, 15.0),
        ((250, 160), 7.5, 15.0)
    ]
    hole_area = 0.0
    dias = []
    dia_dist = {}
    for pos, rad, dia in holes:
        msp.add_circle(pos, rad, dxfattribs={"layer": "HOLES"})
        hole_area += math.pi * (rad ** 2)
        dias.append(dia)
        dia_dist[f"{dia:.1f}"] = dia_dist.get(f"{dia:.1f}", 0) + 1

    thk = 4.0
    msp.add_text("MATERIAL: STAINLESS STEEL", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 265))
    msp.add_text("THICKNESS: 4.0 MM", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 275))

    net_area = gross_area - hole_area
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 8000.0  # Stainless Steel

    gt = {
        "file": "03_irregular_polygon.dxf",
        "description": "Asymmetric 7-sided polygon profile with 5 holes",
        "width_mm": 400.0,
        "height_mm": 250.0,
        "thickness_mm": thk,
        "material": "Stainless Steel",
        "outer_perimeter_mm": round(perim, 2),
        "gross_area_mm2": round(gross_area, 2),
        "net_area_mm2": round(net_area, 2),
        "hole_count": 5,
        "hole_diameters": sorted(dias),
        "hole_size_distribution": dia_dist,
        "bend_count": 0,
        "weld_count": 0,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("03_irregular_polygon", doc, gt)


# ==============================================================================
# TEST 4: Multiple Hole Diameters
# ==============================================================================
def generate_test_04():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.layers.add("CUT", color=7)
    doc.layers.add("HOLES", color=1)
    doc.layers.add("NOTES", color=3)

    w, h, thk = 450.0, 300.0, 5.0
    msp.add_lwpolyline([(0, 0), (w, 0), (w, h), (0, h)], close=True, dxfattribs={"layer": "CUT"})

    # 4x Ø10mm, 4x Ø16mm, 2x Ø25mm
    h_specs = [
        ((60, 60), 5.0, 10.0), ((120, 60), 5.0, 10.0),
        ((60, 240), 5.0, 10.0), ((120, 240), 5.0, 10.0),
        ((200, 100), 8.0, 16.0), ((300, 100), 8.0, 16.0),
        ((200, 200), 8.0, 16.0), ((300, 200), 8.0, 16.0),
        ((380, 90), 12.5, 25.0), ((380, 210), 12.5, 25.0)
    ]
    hole_area = 0.0
    dias = []
    dia_dist = {}
    for pos, rad, dia in h_specs:
        msp.add_circle(pos, rad, dxfattribs={"layer": "HOLES"})
        hole_area += math.pi * (rad ** 2)
        dias.append(dia)
        dia_dist[f"{dia:.1f}"] = dia_dist.get(f"{dia:.1f}", 0) + 1

    msp.add_text("MATERIAL: MILD STEEL", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 310))
    msp.add_text("THICKNESS: 5.0 MM", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 320))

    gross_area = w * h
    net_area = gross_area - hole_area
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 7850.0

    gt = {
        "file": "04_multiple_hole_diameters.dxf",
        "description": "450x300 sheet with multi-diameter distribution (4x10, 4x16, 2x25)",
        "width_mm": w,
        "height_mm": h,
        "thickness_mm": thk,
        "material": "Mild Steel",
        "outer_perimeter_mm": 2 * (w + h),
        "gross_area_mm2": gross_area,
        "net_area_mm2": round(net_area, 2),
        "hole_count": 10,
        "hole_diameters": sorted(dias),
        "hole_size_distribution": dia_dist,
        "bend_count": 0,
        "weld_count": 0,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("04_multiple_hole_diameters", doc, gt)


# ==============================================================================
# TEST 5: Different Non-Semantic Layer Names
# ==============================================================================
def generate_test_05():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.linetypes.add("DASHED", pattern="A,.5,-.25")
    doc.linetypes.add("CENTER", pattern="A,1.25,-.25,.25,-.25")

    # Non-standard layer names
    doc.layers.add("PROFILE_OUT", color=7)
    doc.layers.add("GEOM_A", color=1)
    doc.layers.add("FAB_FEATURE", color=2, linetype="DASHED")
    doc.layers.add("CENTERLINES", color=3, linetype="CENTER")
    doc.layers.add("AUX", color=8)
    doc.layers.add("ANNO", color=4)

    w, h, thk = 400.0, 280.0, 4.0
    msp.add_lwpolyline([(0, 0), (w, 0), (w, h), (0, h)], close=True, dxfattribs={"layer": "PROFILE_OUT"})

    # 6 holes on layer GEOM_A (4x Ø12mm, 2x Ø18mm)
    h_specs = [
        ((80, 140), 6.0, 12.0), ((140, 140), 6.0, 12.0),
        ((260, 140), 6.0, 12.0), ((320, 140), 6.0, 12.0),
        ((200, 90), 9.0, 18.0), ((200, 190), 9.0, 18.0)
    ]
    dias = []
    dia_dist = {}
    hole_area = 0.0
    for pos, rad, dia in h_specs:
        msp.add_circle(pos, rad, dxfattribs={"layer": "GEOM_A"})
        dias.append(dia)
        dia_dist[f"{dia:.1f}"] = dia_dist.get(f"{dia:.1f}", 0) + 1
        hole_area += math.pi * (rad ** 2)

        # Cross centerlines for holes on CENTERLINES layer
        cx, cy = pos
        msp.add_line((cx - 15, cy), (cx + 15, cy), dxfattribs={"layer": "CENTERLINES", "linetype": "CENTER"})
        msp.add_line((cx, cy - 15), (cx, cy + 15), dxfattribs={"layer": "CENTERLINES", "linetype": "CENTER"})

    # 2 Bends on FAB_FEATURE with DASHED linetype
    msp.add_line((0, 70), (w, 70), dxfattribs={"layer": "FAB_FEATURE", "linetype": "DASHED"})
    msp.add_line((0, 210), (w, 210), dxfattribs={"layer": "FAB_FEATURE", "linetype": "DASHED"})

    # Auxiliary construction lines extending outside on AUX
    msp.add_line((-20, 0), (-20, h), dxfattribs={"layer": "AUX"})
    msp.add_line((w + 20, 0), (w + 20, h), dxfattribs={"layer": "AUX"})

    # Annotations on ANNO
    msp.add_text("MATERIAL: MILD STEEL", dxfattribs={"layer": "ANNO", "height": 3.5}).set_placement((20, 290))
    msp.add_text("THICKNESS: 4.0 MM", dxfattribs={"layer": "ANNO", "height": 3.5}).set_placement((20, 300))
    msp.add_text("BEND: 90 DEG", dxfattribs={"layer": "ANNO", "height": 3.0}).set_placement((20, 75))

    gross_area = w * h
    net_area = gross_area - hole_area
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 7850.0

    gt = {
        "file": "05_different_layer_names.dxf",
        "description": "400x280 part using non-standard layers (PROFILE_OUT, GEOM_A, FAB_FEATURE)",
        "width_mm": w,
        "height_mm": h,
        "thickness_mm": thk,
        "material": "Mild Steel",
        "outer_perimeter_mm": 2 * (w + h),
        "gross_area_mm2": gross_area,
        "net_area_mm2": round(net_area, 2),
        "hole_count": 6,
        "hole_diameters": sorted(dias),
        "hole_size_distribution": dia_dist,
        "bend_count": 2,
        "weld_count": 0,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("05_different_layer_names", doc, gt)


# ==============================================================================
# TEST 6: Bends with Heavy Construction Geometry
# ==============================================================================
def generate_test_06():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.linetypes.add("DASHED", pattern="A,.5,-.25")
    doc.linetypes.add("CENTER", pattern="A,1.25,-.25,.25,-.25")
    doc.linetypes.add("PHANTOM", pattern="A,1.25,-.25,.25,-.25,.25,-.25")

    doc.layers.add("CUT", color=7)
    doc.layers.add("HOLES", color=1)
    doc.layers.add("BEND", color=2, linetype="DASHED")
    doc.layers.add("CONSTRUCTION", color=8, linetype="CENTER")
    doc.layers.add("REF_FRAMING", color=9, linetype="PHANTOM")
    doc.layers.add("DIM", color=4)
    doc.layers.add("NOTES", color=3)

    w, h, thk = 400.0, 300.0, 3.0
    msp.add_lwpolyline([(0, 0), (w, 0), (w, h), (0, h)], close=True, dxfattribs={"layer": "CUT"})

    # 4 actual bend lines
    # 2 horizontal bends across the plate
    msp.add_line((0, 60), (w, 60), dxfattribs={"layer": "BEND", "linetype": "DASHED"})
    msp.add_line((0, 240), (w, 240), dxfattribs={"layer": "BEND", "linetype": "DASHED"})
    # 2 vertical bends between horizontal bends
    msp.add_line((80, 60), (80, 240), dxfattribs={"layer": "BEND", "linetype": "DASHED"})
    msp.add_line((320, 60), (320, 240), dxfattribs={"layer": "BEND", "linetype": "DASHED"})

    # 4 holes
    holes = [(140, 150), (260, 150), (200, 110), (200, 190)]
    for cx, cy in holes:
        msp.add_circle((cx, cy), 6.0, dxfattribs={"layer": "HOLES"})
        # Centerlines for holes
        msp.add_line((cx - 20, cy), (cx + 20, cy), dxfattribs={"layer": "CONSTRUCTION", "linetype": "CENTER"})
        msp.add_line((cx, cy - 20), (cx, cy + 20), dxfattribs={"layer": "CONSTRUCTION", "linetype": "CENTER"})

    # Diagonal phantom framing lines on REF_FRAMING
    msp.add_line((0, 0), (w, h), dxfattribs={"layer": "REF_FRAMING", "linetype": "PHANTOM"})
    msp.add_line((0, h), (w, 0), dxfattribs={"layer": "REF_FRAMING", "linetype": "PHANTOM"})
    msp.add_line((w / 2, 0), (w / 2, h), dxfattribs={"layer": "CONSTRUCTION", "linetype": "CENTER"})
    msp.add_line((0, h / 2), (w, h / 2), dxfattribs={"layer": "CONSTRUCTION", "linetype": "CENTER"})

    # Dimension extension lines outside
    msp.add_line((0, -10), (0, -30), dxfattribs={"layer": "DIM"})
    msp.add_line((w, -10), (w, -30), dxfattribs={"layer": "DIM"})
    msp.add_line((0, -25), (w, -25), dxfattribs={"layer": "DIM"})

    msp.add_text("MATERIAL: MILD STEEL", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 310))
    msp.add_text("THICKNESS: 3.0 MM", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 320))
    msp.add_text("4x BEND 90 DEG UP", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 330))

    gross_area = w * h
    hole_area = 4 * math.pi * (6.0 ** 2)
    net_area = gross_area - hole_area
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 7850.0

    gt = {
        "file": "06_bends_with_construction_geometry.dxf",
        "description": "400x300 sheet with 4 true bends and 12+ construction/center/phantom lines",
        "width_mm": w,
        "height_mm": h,
        "thickness_mm": thk,
        "material": "Mild Steel",
        "outer_perimeter_mm": 2 * (w + h),
        "gross_area_mm2": gross_area,
        "net_area_mm2": round(net_area, 2),
        "hole_count": 4,
        "hole_diameters": [12.0] * 4,
        "hole_size_distribution": {"12.0": 4},
        "bend_count": 4,
        "weld_count": 0,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("06_bends_with_construction_geometry", doc, gt)


# ==============================================================================
# TEST 7: Welds and Annotations
# ==============================================================================
def generate_test_07():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.linetypes.add("DASHED", pattern="A,.5,-.25")

    doc.layers.add("CUT", color=7)
    doc.layers.add("HOLES", color=1)
    doc.layers.add("BEND", color=2, linetype="DASHED")
    doc.layers.add("WELD_SEAM", color=5)
    doc.layers.add("DIMENSIONS", color=4)
    doc.layers.add("ANNOTATIONS", color=3)

    w, h, thk = 350.0, 250.0, 5.0
    msp.add_lwpolyline([(0, 0), (w, 0), (w, h), (0, h)], close=True, dxfattribs={"layer": "CUT"})

    # 4 holes Ø14mm
    holes = [(60, 60), (290, 60), (60, 190), (290, 190)]
    for cx, cy in holes:
        msp.add_circle((cx, cy), 7.0, dxfattribs={"layer": "HOLES"})

    # 2 bends
    msp.add_line((0, 50), (w, 50), dxfattribs={"layer": "BEND", "linetype": "DASHED"})
    msp.add_line((0, 200), (w, 200), dxfattribs={"layer": "BEND", "linetype": "DASHED"})

    # 2 weld indications
    msp.add_line((100, 125), (250, 125), dxfattribs={"layer": "WELD_SEAM"})  # 150mm
    msp.add_line((175, 75), (175, 125), dxfattribs={"layer": "WELD_SEAM"})   # 50mm

    # Leader and Annotations
    msp.add_text("FILLET WELD 4mm BOTH SIDES", dxfattribs={"layer": "ANNOTATIONS", "height": 3.0}).set_placement((100, 135))
    msp.add_text("MATERIAL: STAINLESS STEEL", dxfattribs={"layer": "ANNOTATIONS", "height": 3.5}).set_placement((20, 260))
    msp.add_text("THICKNESS: 5.0 MM", dxfattribs={"layer": "ANNOTATIONS", "height": 3.5}).set_placement((20, 270))
    msp.add_text("BEND: 90 DEG", dxfattribs={"layer": "ANNOTATIONS", "height": 3.0}).set_placement((20, 55))

    gross_area = w * h
    hole_area = 4 * math.pi * (7.0 ** 2)
    net_area = gross_area - hole_area
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 8000.0

    gt = {
        "file": "07_welds_and_annotations.dxf",
        "description": "350x250 sheet with 2 weld seams, 2 bends, 4 holes, dimensions and leaders",
        "width_mm": w,
        "height_mm": h,
        "thickness_mm": thk,
        "material": "Stainless Steel",
        "outer_perimeter_mm": 2 * (w + h),
        "gross_area_mm2": gross_area,
        "net_area_mm2": round(net_area, 2),
        "hole_count": 4,
        "hole_diameters": [14.0] * 4,
        "hole_size_distribution": {"14.0": 4},
        "bend_count": 2,
        "weld_count": 2,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("07_welds_and_annotations", doc, gt)


# ==============================================================================
# TEST 8: Rotated Part (37 degrees)
# ==============================================================================
def generate_test_08():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.linetypes.add("DASHED", pattern="A,.5,-.25")
    doc.layers.add("CUT", color=7)
    doc.layers.add("HOLES", color=1)
    doc.layers.add("BEND", color=2, linetype="DASHED")
    doc.layers.add("NOTES", color=3)

    w, h, thk = 300.0, 180.0, 4.0
    angle_deg = 37.0
    rad = math.radians(angle_deg)
    cos_a = math.cos(rad)
    sin_a = math.sin(rad)

    def rot(x: float, y: float) -> Tuple[float, float]:
        return (x * cos_a - y * sin_a, x * sin_a + y * cos_a)

    # Rotated rectangle
    pts = [(0, 0), (w, 0), (w, h), (0, h)]
    rot_pts = [rot(x, y) for x, y in pts]
    msp.add_lwpolyline(rot_pts, close=True, dxfattribs={"layer": "CUT"})

    # 4 rotated holes Ø12mm
    holes = [(50, 40), (250, 40), (50, 140), (250, 140)]
    for cx, cy in holes:
        rcx, rcy = rot(cx, cy)
        msp.add_circle((rcx, rcy), 6.0, dxfattribs={"layer": "HOLES"})

    # 2 rotated bends
    b1_start, b1_end = rot(0, 60), rot(w, 60)
    b2_start, b2_end = rot(0, 120), rot(w, 120)
    msp.add_line(b1_start, b1_end, dxfattribs={"layer": "BEND", "linetype": "DASHED"})
    msp.add_line(b2_start, b2_end, dxfattribs={"layer": "BEND", "linetype": "DASHED"})

    # Text notes
    tpos = rot(20, 190)
    msp.add_text("MATERIAL: MILD STEEL", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement(tpos)
    msp.add_text("THICKNESS: 4.0 MM", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement(rot(20, 200))
    msp.add_text("BEND: 90 DEG", dxfattribs={"layer": "NOTES", "height": 3.0}).set_placement(rot(20, 70))

    # Calculate AABB vs OBB
    xs = [p[0] for p in rot_pts]
    ys = [p[1] for p in rot_pts]
    aabb_w = max(xs) - min(xs)
    aabb_h = max(ys) - min(ys)

    gross_area = w * h
    hole_area = 4 * math.pi * (6.0 ** 2)
    net_area = gross_area - hole_area
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 7850.0

    gt = {
        "file": "08_rotated_part.dxf",
        "description": "300x180 sheet metal part rotated by 37 degrees",
        "width_mm": w,  # True unrotated OBB width
        "height_mm": h,  # True unrotated OBB height
        "aabb_width_mm": round(aabb_w, 2),
        "aabb_height_mm": round(aabb_h, 2),
        "rotation_deg": angle_deg,
        "thickness_mm": thk,
        "material": "Mild Steel",
        "outer_perimeter_mm": 2 * (w + h),
        "gross_area_mm2": gross_area,
        "net_area_mm2": round(net_area, 2),
        "hole_count": 4,
        "hole_diameters": [12.0] * 4,
        "hole_size_distribution": {"12.0": 4},
        "bend_count": 2,
        "weld_count": 0,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("08_rotated_part", doc, gt)


# ==============================================================================
# TEST 9: Internal Cutouts & Slots
# ==============================================================================
def generate_test_09():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.layers.add("OUTER_CUT", color=7)
    doc.layers.add("INTERNAL_CUT", color=6)
    doc.layers.add("HOLES", color=1)
    doc.layers.add("NOTES", color=3)

    w, h, thk = 500.0, 300.0, 5.0
    msp.add_lwpolyline([(0, 0), (w, 0), (w, h), (0, h)], close=True, dxfattribs={"layer": "OUTER_CUT"})

    # 6 circular holes Ø15mm
    holes = [
        (60, 50), (250, 50), (440, 50),
        (60, 250), (250, 250), (440, 250)
    ]
    hole_area = 0.0
    hole_perim = 0.0
    for cx, cy in holes:
        msp.add_circle((cx, cy), 7.5, dxfattribs={"layer": "HOLES"})
        hole_area += math.pi * (7.5 ** 2)
        hole_perim += 2 * math.pi * 7.5

    # 2 rectangular cutouts: (120, 110) 60x40mm and (320, 110) 60x40mm
    cut1 = [(120, 110), (180, 110), (180, 150), (120, 150)]
    cut2 = [(320, 110), (380, 110), (380, 150), (320, 150)]
    msp.add_lwpolyline(cut1, close=True, dxfattribs={"layer": "INTERNAL_CUT"})
    msp.add_lwpolyline(cut2, close=True, dxfattribs={"layer": "INTERNAL_CUT"})
    cutout_area = 2 * (60.0 * 40.0)
    cutout_perim = 2 * (2 * (60.0 + 40.0))

    # 1 slot cutout in center: 80x20mm at (210, 170)
    slot = [(210, 170), (290, 170), (290, 190), (210, 190)]
    msp.add_lwpolyline(slot, close=True, dxfattribs={"layer": "INTERNAL_CUT"})
    slot_area = 80.0 * 20.0
    slot_perim = 2 * (80.0 + 20.0)

    msp.add_text("MATERIAL: MILD STEEL", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 310))
    msp.add_text("THICKNESS: 5.0 MM", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 320))

    gross_area = w * h
    total_internal_perim = cutout_perim + slot_perim + hole_perim
    net_area = gross_area - (hole_area + cutout_area + slot_area)
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 7850.0

    gt = {
        "file": "09_internal_cutouts.dxf",
        "description": "500x300 outer sheet with 6 holes, 2 rectangular cutouts, and 1 slot",
        "width_mm": w,
        "height_mm": h,
        "thickness_mm": thk,
        "material": "Mild Steel",
        "outer_perimeter_mm": 2 * (w + h),
        "internal_cutouts_count": 3,
        "internal_cutout_perimeter_mm": cutout_perim + slot_perim,
        "total_internal_cut_perimeter_mm": round(total_internal_perim, 2),
        "gross_area_mm2": gross_area,
        "net_area_mm2": round(net_area, 2),
        "hole_count": 6,
        "hole_diameters": [15.0] * 6,
        "hole_size_distribution": {"15.0": 6},
        "bend_count": 0,
        "weld_count": 0,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("09_internal_cutouts", doc, gt)


# ==============================================================================
# TEST 10: Messy Real-World Engineering Drawing
# ==============================================================================
def generate_test_10():
    doc = ezdxf.new("R2010")
    msp = doc.modelspace()
    doc.linetypes.add("DASHED", pattern="A,.5,-.25")
    doc.linetypes.add("CENTER", pattern="A,1.25,-.25,.25,-.25")

    doc.layers.add("CUT_GEOM", color=7)
    doc.layers.add("PUNCH_HOLES", color=1)
    doc.layers.add("INTERNAL_FEATURE", color=6)
    doc.layers.add("FORM_BEND", color=2, linetype="DASHED")
    doc.layers.add("FAB_WELD", color=5)
    doc.layers.add("CENTERLINES", color=8, linetype="CENTER")
    doc.layers.add("DIMENSIONS", color=4)
    doc.layers.add("TITLE_BLOCK", color=9)
    doc.layers.add("NOTES", color=3)

    # Stepped profile outer contour
    pts = [
        (0.0, 0.0),
        (420.0, 0.0),
        (420.0, 120.0),
        (360.0, 120.0),
        (360.0, 260.0),
        (0.0, 260.0)
    ]
    msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": "CUT_GEOM"})

    # Perimeter: 420 + 120 + 60 + 140 + 360 + 260 = 1360.0 mm
    outer_perim = 420.0 + 120.0 + 60.0 + 140.0 + 360.0 + 260.0
    # Gross area = (420 * 120) + (360 * 140) = 50400 + 50400 = 100800.0 mm²
    gross_area = 100800.0

    # 6 holes: 4x Ø10mm, 2x Ø16mm
    holes = [
        ((60, 60), 5.0, 10.0), ((180, 60), 5.0, 10.0),
        ((60, 180), 5.0, 10.0), ((180, 180), 5.0, 10.0),
        ((300, 60), 8.0, 16.0), ((300, 180), 8.0, 16.0)
    ]
    hole_area = 0.0
    dias = []
    dia_dist = {}
    for pos, rad, dia in holes:
        msp.add_circle(pos, rad, dxfattribs={"layer": "PUNCH_HOLES"})
        hole_area += math.pi * (rad ** 2)
        dias.append(dia)
        dia_dist[f"{dia:.1f}"] = dia_dist.get(f"{dia:.1f}", 0) + 1

        # Centerlines across holes
        cx, cy = pos
        msp.add_line((cx - 15, cy), (cx + 15, cy), dxfattribs={"layer": "CENTERLINES", "linetype": "CENTER"})
        msp.add_line((cx, cy - 15), (cx, cy + 15), dxfattribs={"layer": "CENTERLINES", "linetype": "CENTER"})

    # 1 internal cutout: 50x30mm at (100, 110)
    cut = [(100, 110), (150, 110), (150, 140), (100, 140)]
    msp.add_lwpolyline(cut, close=True, dxfattribs={"layer": "INTERNAL_FEATURE"})
    cut_area = 50.0 * 30.0

    # 3 bend lines on FORM_BEND
    msp.add_line((0, 80), (360, 80), dxfattribs={"layer": "FORM_BEND", "linetype": "DASHED"})
    msp.add_line((0, 200), (360, 200), dxfattribs={"layer": "FORM_BEND", "linetype": "DASHED"})
    msp.add_line((240, 0), (240, 120), dxfattribs={"layer": "FORM_BEND", "linetype": "DASHED"})

    # 2 weld seams on FAB_WELD
    msp.add_line((360, 120), (420, 120), dxfattribs={"layer": "FAB_WELD"})
    msp.add_line((240, 120), (240, 160), dxfattribs={"layer": "FAB_WELD"})

    # Dimensions on DIMENSIONS
    msp.add_line((-15, 0), (-15, 260), dxfattribs={"layer": "DIMENSIONS"})
    msp.add_line((0, -15), (420, -15), dxfattribs={"layer": "DIMENSIONS"})
    msp.add_text("260.0", dxfattribs={"layer": "DIMENSIONS", "height": 3.0}).set_placement((-25, 130))
    msp.add_text("420.0", dxfattribs={"layer": "DIMENSIONS", "height": 3.0}).set_placement((210, -25))

    # Title block on TITLE_BLOCK
    tb_pts = [(-50, -60), (450, -60), (450, -40), (-50, -40)]
    msp.add_lwpolyline(tb_pts, close=True, dxfattribs={"layer": "TITLE_BLOCK"})
    msp.add_text("FORGEIQ SHEET METAL CORP - REV C", dxfattribs={"layer": "TITLE_BLOCK", "height": 4.0}).set_placement((-40, -55))

    thk = 5.0
    msp.add_text("MATERIAL: MILD STEEL", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 275))
    msp.add_text("THICKNESS: 5.0 MM", dxfattribs={"layer": "NOTES", "height": 3.5}).set_placement((20, 285))
    msp.add_text("3x BEND 90 DEG", dxfattribs={"layer": "NOTES", "height": 3.0}).set_placement((20, 85))

    net_area = gross_area - (hole_area + cut_area)
    net_weight = (net_area * 1e-6) * (thk * 1e-3) * 7850.0

    gt = {
        "file": "10_messy_engineering_drawing.dxf",
        "description": "Stepped 420x260 profile with 6 holes, internal cutout, 3 bends, 2 welds, dimensions, title block, centerlines",
        "width_mm": 420.0,
        "height_mm": 260.0,
        "thickness_mm": thk,
        "material": "Mild Steel",
        "outer_perimeter_mm": outer_perim,
        "gross_area_mm2": gross_area,
        "net_area_mm2": round(net_area, 2),
        "hole_count": 6,
        "hole_diameters": sorted(dias),
        "hole_size_distribution": dia_dist,
        "bend_count": 3,
        "weld_count": 2,
        "estimated_weight_kg": round(net_weight, 3),
    }
    save_test_pair("10_messy_engineering_drawing", doc, gt)


if __name__ == "__main__":
    print("Generating 10 CAD validation test cases...")
    generate_test_01()
    generate_test_02()
    generate_test_03()
    generate_test_04()
    generate_test_05()
    generate_test_06()
    generate_test_07()
    generate_test_08()
    generate_test_09()
    generate_test_10()
    print("All 10 test pairs generated successfully.")
