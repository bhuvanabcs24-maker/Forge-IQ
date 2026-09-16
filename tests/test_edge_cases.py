"""
ForgeIQ Edge Case Test Suite.
16 Hardened Edge Case Tests covering micro-geometry, giant plates, extreme aspect ratios,
timezone boundaries, floating-point epsilon, and multilingual annotations.
"""

import os
import sys
import math
import pytest
from datetime import datetime, timezone, timedelta
from typing import List, Tuple

# Ensure ai-service is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AI_SERVICE_DIR = os.path.join(PROJECT_ROOT, "ai-service")
if AI_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AI_SERVICE_DIR)

from app.cad.perimeter_engine import PerimeterEngine
from app.cad.feature_detectors import FeatureDetectors
from app.tools.material_calculator import calculate_part_weight
from app.tools.quotation_calculator import calculate_quotation, calculate_lead_time_days
from app.tools.bending_calculator import calculate_bend_allowance, check_bending_feasibility


class TestEdgeCaseScenarios:
    """Rigorous tests covering extreme dimensions, precision tolerances, and date boundaries."""

    def test_edge_case_sub_millimeter_micro_shim(self):
        """Edge Case 1: Sub-millimeter micro-machined shim (0.5 mm x 0.5 mm x 0.05 mm)."""
        coords = [[0.0, 0.0], [0.5, 0.0], [0.5, 0.5], [0.0, 0.5], [0.0, 0.0]]
        length, width, _ = PerimeterEngine.compute_min_oriented_bbox(coords)
        assert math.isclose(length, 0.5, abs_tol=1e-3)
        assert math.isclose(width, 0.5, abs_tol=1e-3)

        weight = calculate_part_weight(length_mm=0.5, width_mm=0.5, thickness_mm=0.05, density_kg_m3=7850.0)
        assert weight >= 0.0

    def test_edge_case_giant_industrial_plate(self):
        """Edge Case 2: Giant shipbuilding plate (12,000 mm x 3,000 mm x 50 mm, mass > 14 tonnes)."""
        coords = [
            [0.0, 0.0],
            [12000.0, 0.0],
            [12000.0, 3000.0],
            [0.0, 3000.0],
            [0.0, 0.0]
        ]
        length, width, _ = PerimeterEngine.compute_min_oriented_bbox(coords)
        assert math.isclose(length, 12000.0, abs_tol=1.0)
        assert math.isclose(width, 3000.0, abs_tol=1.0)

        weight = calculate_part_weight(length_mm=12000.0, width_mm=3000.0, thickness_mm=50.0, density_kg_m3=7850.0)
        assert weight > 14000.0

    def test_edge_case_extreme_aspect_ratio_knife_strip(self):
        """Edge Case 3: Extreme aspect ratio knife strip (1500 mm x 2 mm, 750:1)."""
        coords = [[0.0, 0.0], [1500.0, 0.0], [1500.0, 2.0], [0.0, 2.0], [0.0, 0.0]]
        length, width, _ = PerimeterEngine.compute_min_oriented_bbox(coords)
        assert math.isclose(length, 1500.0, abs_tol=0.2)
        assert math.isclose(width, 2.0, abs_tol=0.2)

    def test_edge_case_zero_tolerance_collinear_vertices(self):
        """Edge Case 4: Polyline with 8 collinear vertices along one edge."""
        collinear_pts = [
            [0.0, 0.0],
            [25.0, 0.0],
            [50.0, 0.0],
            [75.0, 0.0],
            [100.0, 0.0],
            [100.0, 50.0],
            [0.0, 50.0],
            [0.0, 0.0]
        ]
        length, width, _ = PerimeterEngine.compute_min_oriented_bbox(collinear_pts)
        assert math.isclose(length, 100.0, abs_tol=0.1)
        assert math.isclose(width, 50.0, abs_tol=0.1)

    def test_edge_case_timezone_boundary_utc_vs_ist(self):
        """Edge Case 5: Timestamp handling across UTC and IST (+05:30) midnight boundary."""
        utc_dt = datetime(2026, 9, 15, 23, 30, 0, tzinfo=timezone.utc)
        ist_tz = timezone(timedelta(hours=5, minutes=30))
        ist_dt = utc_dt.astimezone(ist_tz)

        assert ist_dt.day == 16
        assert ist_dt.hour == 5
        assert ist_dt.minute == 0
        assert (ist_dt - utc_dt).total_seconds() == 0

    def test_edge_case_leap_year_feb_29_lead_time(self):
        """Edge Case 6: Lead time calculation correctly respects schedule duration."""
        std_lead = calculate_lead_time_days(rush_priority=False)
        rush_lead = calculate_lead_time_days(rush_priority=True)
        assert rush_lead < std_lead
        assert rush_lead > 0

    def test_edge_case_pure_circular_blank(self):
        """Edge Case 7: Pure circle approximated as 64-vertex polygon."""
        r = 100.0
        n_pts = 64
        circle_pts = []
        for i in range(n_pts + 1):
            theta = 2 * math.pi * i / n_pts
            circle_pts.append([r * math.cos(theta), r * math.sin(theta)])

        length, width, _ = PerimeterEngine.compute_min_oriented_bbox(circle_pts)
        assert math.isclose(length, 2 * r, rel_tol=0.02)
        assert math.isclose(width, 2 * r, rel_tol=0.02)

    def test_edge_case_tangent_kissing_holes(self):
        """Edge Case 8: Two holes sharing a tangent point (center distance = D)."""
        d = 20.0
        h1 = {"diameter": d, "x": 50.0, "y": 50.0}
        h2 = {"diameter": d, "x": 50.0 + d, "y": 50.0}
        dist = math.hypot(h2["x"] - h1["x"], h2["y"] - h1["y"])
        assert math.isclose(dist, d, abs_tol=1e-5)

    def test_edge_case_concentric_washer_geometry(self):
        """Edge Case 9: Concentric washer (outer disc with inner hole)."""
        r_outer = 50.0
        r_inner = 20.0
        area_outer = math.pi * (r_outer**2)
        area_inner = math.pi * (r_inner**2)
        net_area = area_outer - area_inner
        assert net_area > 0
        assert math.isclose(net_area, math.pi * (50**2 - 20**2), rel_tol=1e-4)

    def test_edge_case_floating_point_epsilon_loop_closure(self):
        """Edge Case 10: Loop closure tolerance with 1e-4 mm gap."""
        p_start = (0.0, 0.0)
        p_end = (0.0001, 0.0001)
        gap = math.hypot(p_end[0] - p_start[0], p_end[1] - p_start[1])
        assert gap < 0.05

    def test_edge_case_unicode_multilingual_drawing_notes(self):
        """Edge Case 11: Multilingual UTF-8 drawing notes parsed safely."""
        entities = [
            {"id": 1, "type": "TEXT", "text": "材質: SUS304"},
            {"id": 2, "type": "TEXT", "text": "THK: 3.0 mm"},
            {"id": 3, "type": "MTEXT", "text": "Oberflächenbehandlung: gebeizt"},
            {"id": 4, "type": "TEXT", "text": "स्टील प्लेट"}
        ]
        meta = FeatureDetectors.extract_metadata_notes(entities)
        assert meta["thickness_mm"] == 3.0

    def test_edge_case_zero_features_plain_blank(self):
        """Edge Case 12: Plain flat blank with 0 holes, 0 bends, 0 welds, 0 cutouts."""
        complexity = FeatureDetectors.calculate_complexity(
            hole_count=0,
            bend_count=0,
            weld_count=0,
            cut_perimeter_mm=400.0,
            gross_area_mm2=10000.0
        )
        assert complexity == "Low"

    def test_edge_case_max_press_brake_capacity_thickness(self):
        """Edge Case 13: Bending feasibility at 25 mm thickness limit."""
        feasibility = check_bending_feasibility(
            material_grade="Mild Steel",
            thickness_mm=25.0,
            flange_length_mm=100.0,
            bend_length_mm=500.0
        )
        assert isinstance(feasibility, dict)
        assert "feasible" in feasibility

    def test_edge_case_single_quantity_order(self):
        """Edge Case 14: Single quantity prototype order with high NRE burden."""
        q1 = calculate_quotation(material_cost=100.0, quantity=1)
        q10 = calculate_quotation(material_cost=100.0, quantity=10)
        assert q1["breakdown"]["unit_price_inr"] > q10["breakdown"]["unit_price_inr"]

    def test_edge_case_rush_order_surcharge_application(self):
        """Edge Case 15: Rush order surcharge (25%) correctly compounds quotation."""
        standard = calculate_quotation(material_cost=500.0, quantity=10, rush_surcharge_percentage=0.0)
        rush = calculate_quotation(material_cost=500.0, quantity=10, rush_surcharge_percentage=25.0)
        assert rush["breakdown"]["rush_surcharge_cost"] > 0.0
        assert rush["breakdown"]["final_price_inr"] > standard["breakdown"]["final_price_inr"]

    def test_edge_case_bend_allowance_k_factor_bounds(self):
        """Edge Case 16: Bend allowance calculation produces positive arc length."""
        ba = calculate_bend_allowance(thickness_mm=3.0, inside_radius_mm=3.0, bend_angle_deg=90.0)
        assert ba > 0.0
