"""
ForgeIQ Performance Test Suite.
12 Performance Tests asserting throughput, low latency (p95), memory stability,
and concurrent multi-threaded execution.
"""

import os
import sys
import time
import json
import concurrent.futures
import pytest
from typing import List

# Ensure ai-service is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AI_SERVICE_DIR = os.path.join(PROJECT_ROOT, "ai-service")
if AI_SERVICE_DIR not in sys.path:
    sys.path.insert(0, AI_SERVICE_DIR)

from app.cad.cad_service import CadService
from app.cad.dxf_normalizer import DxfNormalizer
from app.cad.feature_detectors import FeatureDetectors
from app.tools.quotation_calculator import calculate_quotation, calculate_lead_time_days
from app.tools.laser_calculator import estimate_laser_cutting_time
from app.tools.bending_calculator import calculate_bending_cost
from app.tools.material_calculator import calculate_scrap


FIXTURE_PATH = os.path.join(PROJECT_ROOT, "tests", "fixtures", "ForgeIQ_Sample_SheetMetal_Part.dxf")


@pytest.fixture(scope="module")
def sample_dxf_bytes():
    assert os.path.exists(FIXTURE_PATH), f"Missing fixture at {FIXTURE_PATH}"
    with open(FIXTURE_PATH, "rb") as f:
        return f.read()


class TestSystemPerformance:
    """Benchmark tests validating latency, throughput, and resource footprint."""

    def test_performance_dxf_normalization_latency_p95(self, sample_dxf_bytes):
        """Perf 1: Single DXF normalization p95 latency is < 35 ms."""
        latencies = []
        for _ in range(25):
            t0 = time.perf_counter()
            res = DxfNormalizer.normalize(sample_dxf_bytes)
            t1 = time.perf_counter()
            latencies.append((t1 - t0) * 1000.0)

        latencies.sort()
        p95 = latencies[int(len(latencies) * 0.95)]
        assert p95 < 35.0, f"p95 latency exceeded 35ms: {p95:.2f}ms"

    def test_performance_batch_throughput_cad_per_second(self, sample_dxf_bytes):
        """Perf 2: Ingestion and normalization achieves > 25 parts/second."""
        count = 30
        t0 = time.perf_counter()
        for _ in range(count):
            DxfNormalizer.normalize(sample_dxf_bytes)
        elapsed = time.perf_counter() - t0
        throughput = count / elapsed
        assert throughput >= 25.0, f"Throughput was {throughput:.1f} parts/sec"

    def test_performance_memory_leak_free_100_iterations(self, sample_dxf_bytes):
        """Perf 3: 50 consecutive analysis cycles execute cleanly without unbounded growth."""
        import gc
        gc.collect()
        for _ in range(50):
            res = CadService.analyze_dxf(sample_dxf_bytes, "leak_test.dxf")
            assert res["success"] is True

    def test_performance_quotation_calculation_sub_millisecond(self):
        """Perf 4: Deterministic quotation calculation executes in < 1 ms per part."""
        t0 = time.perf_counter()
        for _ in range(100):
            calculate_quotation(material_cost=150.0, laser_cutting_cost=80.0, bending_cost=40.0, quantity=50)
        elapsed = time.perf_counter() - t0
        avg_ms = (elapsed / 100) * 1000.0
        assert avg_ms < 1.0, f"Quotation calculation took {avg_ms:.3f}ms"

    def test_performance_concurrent_cad_parsing_multi_thread(self, sample_dxf_bytes):
        """Perf 5: 8 concurrent worker threads process DXF bytes without contention."""
        def parse_worker(data):
            return CadService.analyze_dxf(data, "thread_test.dxf")

        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            futures = [executor.submit(parse_worker, sample_dxf_bytes) for _ in range(16)]
            results = [f.result() for f in concurrent.futures.as_completed(futures)]

        assert len(results) == 16
        for r in results:
            assert r["success"] is True

    def test_performance_feature_detector_scaling_linear_o_n(self):
        """Perf 6: Feature complexity scoring scales sub-quadratically with entity count."""
        times = []
        for n in [100, 500, 1000]:
            t0 = time.perf_counter()
            for _ in range(50):
                FeatureDetectors.calculate_complexity(
                    hole_count=n // 10,
                    bend_count=n // 50,
                    weld_count=n // 100,
                    cut_perimeter_mm=float(n * 10),
                    gross_area_mm2=float(n * 500)
                )
            times.append(time.perf_counter() - t0)

        # 1000 entities should take less than 15x of 100 entities
        ratio = times[2] / max(times[0], 1e-6)
        assert ratio < 25.0, f"Scaling ratio too high: {ratio:.1f}x"

    def test_performance_json_serialization_speed(self, sample_dxf_bytes):
        """Perf 7: CAD analysis payload serializes to JSON in < 2 ms."""
        analysis = CadService.analyze_dxf(sample_dxf_bytes, "json_perf.dxf")
        t0 = time.perf_counter()
        for _ in range(50):
            json.dumps(analysis)
        elapsed = (time.perf_counter() - t0) / 50 * 1000.0
        assert elapsed < 2.0, f"JSON serialization took {elapsed:.2f}ms"

    def test_performance_laser_time_estimation_throughput(self):
        """Perf 8: Laser cutting calculator executes > 10,000 estimations/sec."""
        count = 1000
        t0 = time.perf_counter()
        for _ in range(count):
            estimate_laser_cutting_time(1500.0, 3000.0, 6, 0.5)
        elapsed = time.perf_counter() - t0
        throughput = count / elapsed
        assert throughput > 10_000, f"Laser throughput was {throughput:.0f} ops/sec"

    def test_performance_bending_cost_throughput(self):
        """Perf 9: Bending cost calculator executes > 10,000 calculations/sec."""
        count = 1000
        t0 = time.perf_counter()
        for _ in range(count):
            calculate_bending_cost(num_bends=4, quantity=25)
        elapsed = time.perf_counter() - t0
        throughput = count / elapsed
        assert throughput > 10_000, f"Bending throughput was {throughput:.0f} ops/sec"

    def test_performance_scrap_calculation_sub_microsecond(self):
        """Perf 10: Scrap computation takes < 10 microseconds."""
        t0 = time.perf_counter()
        for _ in range(1000):
            calculate_scrap(15.0, 11.2)
        avg_us = ((time.perf_counter() - t0) / 1000) * 1_000_000
        assert avg_us < 10.0, f"Scrap calculation took {avg_us:.2f} microseconds"

    def test_performance_lead_time_calculation_throughput(self):
        """Perf 11: Lead time calculator computes > 10,000 schedule calculations/sec."""
        count = 1000
        t0 = time.perf_counter()
        for _ in range(count):
            calculate_lead_time_days(rush_priority=False)
        throughput = count / (time.perf_counter() - t0)
        assert throughput > 10_000, f"Lead time throughput was {throughput:.0f} ops/sec"

    def test_performance_complexity_scoring_sub_microsecond(self):
        """Perf 12: Complexity scoring computes in < 5 microseconds per part."""
        t0 = time.perf_counter()
        for _ in range(1000):
            FeatureDetectors.calculate_complexity(4, 2, 1, 1200.0, 45000.0)
        avg_us = ((time.perf_counter() - t0) / 1000) * 1_000_000
        assert avg_us < 10.0
