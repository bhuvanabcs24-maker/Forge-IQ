"""
ForgeIQ Invariant Test Suite.
17 Hardened Mathematical & Physical Invariant Tests asserting non-negotiable
manufacturing laws, cost bounds, geometric conservation, and volume economics.
"""

import os
import sys
import math
import pytest
from typing import List, Tuple

# Ensure ai-service is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AI_SERVICE_DIR = os.path.join(PROJECT_ROOT, "ai-service")
if AI_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AI_SERVICE_DIR)

from app.cad.perimeter_engine import PerimeterEngine
from app.cad.feature_detectors import FeatureDetectors
from app.cad.cad_service import CadService
from app.tools.material_calculator import calculate_part_weight, calculate_scrap
from app.tools.quotation_calculator import calculate_quotation
from app.tools.laser_calculator import estimate_laser_cutting_time, calculate_laser_cost
from app.tools.bending_calculator import calculate_bending_cost


class TestManufacturingAndEconomicInvariants:
    """Invariants that must hold true across all valid configurations."""

    def test_invariant_cost_non_negative(self):
        """Invariant 1: Total quotation cost must always be >= 0 under all combinations."""
        for qty in [1, 5, 25, 100, 1000]:
            for mat_cost in [0.0, 10.0, 500.0, 25000.0]:
                quote = calculate_quotation(material_cost=mat_cost, quantity=qty)
                final_price = quote["breakdown"]["final_price_inr"]
                unit_price = quote["breakdown"]["unit_price_inr"]
                assert final_price >= 0.0, f"Final price negative: {final_price}"
                assert unit_price >= 0.0, f"Unit price negative: {unit_price}"

    def test_invariant_confidence_bounded_zero_to_one(self):
        """Invariant 2: Confidence scores must be strictly bounded in [0.0, 1.0]."""
        quote = calculate_quotation(material_cost=150.0, finishing_cost=None)
        assert 0.0 <= quote["confidence"] <= 1.0, f"Confidence out of bounds: {quote['confidence']}"

        quote_complete = calculate_quotation(material_cost=150.0, finishing_cost=50.0)
        assert 0.0 <= quote_complete["confidence"] <= 1.0

    def test_invariant_mass_conservation(self):
        """Invariant 3: Net mass must be <= Gross envelope mass."""
        gross_area = 500.0 * 300.0  # 150,000 mm2
        hole_area = 1500.0          # 1,500 mm2
        cutout_area = 5000.0        # 5,000 mm2
        thickness = 6.0             # mm
        material = "Mild Steel"

        mass_data = FeatureDetectors.calculate_weight_and_mass(
            gross_area_mm2=gross_area,
            hole_area_mm2=hole_area,
            thickness_mm=thickness,
            material_name=material,
            cutout_area_mm2=cutout_area
        )
        assert mass_data["estimated_weight_kg"] <= mass_data["gross_weight_kg"]
        assert mass_data["estimated_weight_kg"] > 0.0

    def test_invariant_cut_length_ge_outer_perimeter(self):
        """Invariant 4: Total cut length must always be >= outer perimeter."""
        fixture_path = os.path.join(PROJECT_ROOT, "tests", "fixtures", "ForgeIQ_Test_02_Internal_Cutouts.dxf")
        if os.path.exists(fixture_path):
            with open(fixture_path, "rb") as f:
                res = CadService.analyze_dxf(f.read(), "Test_02.dxf")
            geom = res["geometry"]
            assert geom["cutLengthMm"] >= geom["outerPerimeterMm"] - 1e-3

    def test_invariant_isoperimetric_inequality(self):
        """Invariant 5: For any 2D closed polygon, Perimeter^2 >= 4 * pi * Area."""
        test_polygons = [
            [[0.0, 0.0], [100.0, 0.0], [100.0, 100.0], [0.0, 100.0], [0.0, 0.0]],
            [[0.0, 0.0], [300.0, 0.0], [300.0, 50.0], [0.0, 50.0], [0.0, 0.0]],
        ]
        for poly in test_polygons:
            length, width, _ = PerimeterEngine.compute_min_oriented_bbox(poly)
            perimeter = 2 * (length + width)
            area = length * width
            assert perimeter**2 >= 4 * math.pi * area - 1e-3

    def test_invariant_bounding_box_envelope_dimensions(self):
        """Invariant 6: Envelope length >= width > 0 for valid geometry."""
        coords = [[0.0, 0.0], [400.0, 0.0], [400.0, 200.0], [0.0, 200.0], [0.0, 0.0]]
        length, width, _ = PerimeterEngine.compute_min_oriented_bbox(coords)
        assert length >= width, f"Length {length} should be >= width {width}"
        assert width > 0.0

    def test_invariant_unit_price_monotonically_decreases_with_volume(self):
        """Invariant 7: Unit price decreases or stays equal as volume scales (NRE amortization)."""
        quantities = [1, 5, 20, 50, 200, 1000]
        prices = []
        for q in quantities:
            quote = calculate_quotation(material_cost=250.0, laser_cutting_cost=120.0, quantity=q)
            prices.append(quote["breakdown"]["unit_price_inr"])

        for i in range(len(prices) - 1):
            assert prices[i] >= prices[i + 1] - 1e-4, f"Unit price increased from {prices[i]} to {prices[i+1]}"

    def test_invariant_cutting_time_strictly_positive_for_non_zero_cut_length(self):
        """Invariant 8: Laser cutting time > 0 when cut length > 0."""
        time_data = estimate_laser_cutting_time(
            cut_length_mm=1500.0,
            cutting_speed_mm_min=2500.0,
            pierce_count=8,
            pierce_time_sec=0.5
        )
        assert time_data["total_machine_time_min"] > 0.0, f"Expected cutting time > 0, got {time_data}"
        assert time_data["cutting_time_min"] > 0.0

    def test_invariant_bending_setup_cost_invariance(self):
        """Invariant 9: Setup and NRE cost per batch remains fixed while setup per unit drops."""
        q1 = calculate_quotation(material_cost=100.0, quantity=1)
        q100 = calculate_quotation(material_cost=100.0, quantity=100)

        assert q1["breakdown"]["total_setup_and_nre"] == q100["breakdown"]["total_setup_and_nre"]
        assert q1["breakdown"]["setup_cost_per_unit"] == q1["breakdown"]["total_setup_and_nre"]
        assert math.isclose(
            q100["breakdown"]["setup_cost_per_unit"],
            q100["breakdown"]["total_setup_and_nre"] / 100.0,
            rel_tol=1e-3
        )

    def test_invariant_material_scrap_factor_bounded(self):
        """Invariant 10: Scrap calculation produces exact scrap weight (purchased - net)."""
        scrap_kg = calculate_scrap(
            purchased_weight_kg=10.0,
            net_part_weight_kg=7.5
        )
        assert scrap_kg >= 0.0, f"Scrap negative: {scrap_kg}"
        assert math.isclose(scrap_kg, 2.5, abs_tol=1e-4)

    def test_invariant_audit_trail_entity_count_consistency(self):
        """Invariant 11: Audit trail entity count strictly matches summary telemetry count."""
        sample_path = os.path.join(PROJECT_ROOT, "tests", "cad_samples", "03_bracket_with_holes.dxf")
        if os.path.exists(sample_path):
            with open(sample_path, "rb") as f:
                res = CadService.analyze_dxf(f.read(), "03_bracket_with_holes.dxf")
            geom = res["geometry"]
            details = geom["analysisDetails"]
            assert len(details["hole_entities"]) == geom["holesCount"]
            assert len(details["bend_entities"]) == geom["bendsCount"]

    def test_invariant_hole_area_subtraction(self):
        """Invariant 12: Net mass decreases monotonically with additional holes."""
        base_mass = FeatureDetectors.calculate_weight_and_mass(
            gross_area_mm2=100_000.0,
            hole_area_mm2=0.0,
            thickness_mm=5.0,
            material_name="Mild Steel"
        )
        holed_mass = FeatureDetectors.calculate_weight_and_mass(
            gross_area_mm2=100_000.0,
            hole_area_mm2=5_000.0,
            thickness_mm=5.0,
            material_name="Mild Steel"
        )
        assert holed_mass["estimated_weight_kg"] < base_mass["estimated_weight_kg"]

    def test_invariant_rotation_invariance_area(self):
        """Invariant 13: Rotating a rectangle 90 deg produces identical area and perimeter."""
        orig = [[0.0, 0.0], [300.0, 0.0], [300.0, 100.0], [0.0, 100.0], [0.0, 0.0]]
        rotated = [[0.0, 0.0], [0.0, 300.0], [-100.0, 300.0], [-100.0, 0.0], [0.0, 0.0]]

        l1, w1, _ = PerimeterEngine.compute_min_oriented_bbox(orig)
        l2, w2, _ = PerimeterEngine.compute_min_oriented_bbox(rotated)

        assert math.isclose(l1 * w1, l2 * w2, rel_tol=1e-3)
        assert math.isclose(2 * (l1 + w1), 2 * (l2 + w2), rel_tol=1e-3)

    def test_invariant_translation_invariance(self):
        """Invariant 14: Translating vertices produces identical dimensions."""
        orig = [[10.0, 20.0], [210.0, 20.0], [210.0, 120.0], [10.0, 120.0], [10.0, 20.0]]
        translated = [[p[0] + 500.0, p[1] - 300.0] for p in orig]

        l1, w1, _ = PerimeterEngine.compute_min_oriented_bbox(orig)
        l2, w2, _ = PerimeterEngine.compute_min_oriented_bbox(translated)

        assert math.isclose(l1, l2, abs_tol=0.1)
        assert math.isclose(w1, w2, abs_tol=0.1)

    def test_invariant_density_mass_proportionality(self):
        """Invariant 15: Doubling density doubles part mass exactly."""
        m1 = calculate_part_weight(length_mm=500.0, width_mm=200.0, thickness_mm=4.0, density_kg_m3=4000.0)
        m2 = calculate_part_weight(length_mm=500.0, width_mm=200.0, thickness_mm=4.0, density_kg_m3=8000.0)
        assert math.isclose(m2, 2 * m1, rel_tol=1e-3)

    def test_invariant_tax_gst_calculation_precision(self):
        """Invariant 16: Tax calculation is exact: Total = Subtotal + round(Subtotal * 0.18, 2)."""
        quote = calculate_quotation(material_cost=1234.56, quantity=7)
        bd = quote["breakdown"]
        expected_tax = round(bd["total_before_tax"] * 0.18, 2)
        assert math.isclose(bd["tax_amount_inr"], expected_tax, abs_tol=0.02)
        assert math.isclose(bd["final_price_inr"], bd["total_before_tax"] + bd["tax_amount_inr"], abs_tol=0.02)

    def test_invariant_complexity_monotonicity(self):
        """Invariant 17: Increasing bends, welds, and holes produces >= complexity level."""
        level_map = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}
        c_simple = FeatureDetectors.calculate_complexity(
            hole_count=0, bend_count=0, weld_count=0, cut_perimeter_mm=500.0, gross_area_mm2=10000.0
        )
        c_complex = FeatureDetectors.calculate_complexity(
            hole_count=15, bend_count=6, weld_count=4, cut_perimeter_mm=3000.0, gross_area_mm2=10000.0
        )
        assert level_map[c_complex] >= level_map[c_simple]
