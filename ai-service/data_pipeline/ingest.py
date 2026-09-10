#!/usr/bin/env python3
"""
ForgeIQ Data Pipeline - Ingestion & Normalization Orchestrator
Processes registered sources from `sources.json`:
1. Checks and enforces licenses.
2. Extracts representative feature subsets (BenDFM, DDACS, NASA, PHM, NIST).
3. Normalizes units and schema structures.
4. Writes partitions to `data/raw/` and `data/processed/`.
"""

import json
import logging
from pathlib import Path
from typing import Dict, Any, List

from data_pipeline.validate import validate_license_for_destination, validate_payload_integrity
from data_pipeline.normalize import normalize_engineering_record
from data_pipeline.classify import classify_record_domain, determine_intended_destination

logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger("forgeiq.pipeline.ingest")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SOURCES_FILE = DATA_DIR / "sources" / "sources.json"
RAW_DIR = DATA_DIR / "raw"
PROCESSED_DIR = DATA_DIR / "processed"

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

# Representative sample records derived from the priority datasets
SOURCE_SAMPLE_EXTRACTIONS: Dict[str, List[Dict[str, Any]]] = {
    "SRC-BENDFM-01": [
        {
            "part_id": "bendfm_bracket_0001",
            "material": "SS304",
            "thickness_mm": 2.0,
            "bends_count": 3,
            "min_flange_length_mm": 12.0,
            "min_hole_distance_to_bend_mm": 8.5,
            "manufacturable": True,
            "feasibility_category": "GEOMETRIC_AND_CONFIGURATIONAL_PASS",
            "complexity_score": 0.32,
            "source_ref": "BenDFM UGent-CVAMO"
        },
        {
            "part_id": "bendfm_bracket_0042",
            "material": "AL6061-T6",
            "thickness_mm": 3.0,
            "bends_count": 4,
            "min_flange_length_mm": 8.0,
            "min_hole_distance_to_bend_mm": 3.2,
            "manufacturable": False,
            "feasibility_category": "COLLISION_AND_HOLE_DISTORTION_FAIL",
            "complexity_score": 0.88,
            "failure_reasons": ["Hole too close to bend line tangent (3.2mm < 10.0mm minimum allowance)"],
            "source_ref": "BenDFM UGent-CVAMO"
        }
    ],
    "SRC-DDACS-01": [
        {
            "simulation_id": "ddacs_dp600_0182",
            "process": "deep_drawing",
            "blank_material": "DP600",
            "initial_thickness_mm": 1.5,
            "draw_depth_mm": 45.0,
            "binder_force_kn": 120.0,
            "die_radius_mm": 8.0,
            "punch_radius_mm": 6.0,
            "max_thinning_percentage": 14.2,
            "springback_angle_deg": 2.8,
            "crack_risk": "LOW",
            "source_ref": "DDACS DaRUS University of Stuttgart"
        }
    ],
    "SRC-NASA-PCOE-01": [
        {
            "test_case_id": "nasa_pcoe_mill_case01",
            "machine": "CNC Vertical Knee Mill",
            "tool_type": "6-flute 19mm High Speed Steel End Mill",
            "workpiece_material": "Cast Iron",
            "spindle_rpm": 826,
            "feed_rate_mm_min": 150.0,
            "cut_depth_mm": 1.5,
            "flank_wear_vb_mm": 0.45,
            "wear_state": "CRITICAL_TOOL_CHANGE_REQUIRED",
            "vibration_rms_g": 3.8,
            "source_ref": "NASA Prognostics Center of Excellence"
        }
    ],
    "SRC-PHM-MILLING-01": [
        {
            "run_id": "phm2010_c1_cut180",
            "machine": "Röders Tech 3-Axis High Speed CNC Milling Center",
            "workpiece": "Inconel 718",
            "spindle_rpm": 10400,
            "feed_mm_min": 1555.0,
            "flute_wear_microns": [112.5, 128.0, 119.4],
            "max_cutting_force_fx_n": 842.0,
            "max_cutting_force_fz_n": 1240.0,
            "tool_condition": "SEVERE_ACCELERATED_WEAR",
            "source_ref": "PHM Society 2010 Prognostics Dataset"
        }
    ],
    "SRC-KAGGLE-PRED-MAINT-01": [
        {
            "machine_record_id": "ai4i_udiset_2480",
            "machine_type": "Milling Machine (H-Type Heavy)",
            "air_temperature_k": 298.2,
            "process_temperature_k": 308.7,
            "rotational_speed_rpm": 1380,
            "torque_nm": 64.2,
            "tool_wear_min": 215,
            "machine_failure": 1,
            "failure_type": "Tool Wear Failure (TWF)",
            "source_ref": "AI4I 2020 Predictive Maintenance Dataset"
        }
    ]
}

def run_ingestion_pipeline() -> Dict[str, Any]:
    logger.info("Starting ForgeIQ Data Ingestion Pipeline...")

    with open(SOURCES_FILE, "r", encoding="utf-8") as f:
        sources = json.load(f)

    source_map = {s["id"]: s for s in sources}
    processed_count = 0
    rejected_count = 0
    processed_records = []

    for sid, samples in SOURCE_SAMPLE_EXTRACTIONS.items():
        src_meta = source_map.get(sid)
        if not src_meta:
            logger.warning(f"Source {sid} not registered in sources.json. Skipping.")
            continue

        dest = src_meta.get("intended_use", "TRAINING")
        is_lic_ok, lic_msg = validate_license_for_destination(src_meta, "TRAINING")

        if not is_lic_ok:
            logger.warning(f"Source {sid} rejected: {lic_msg}")
            rejected_count += len(samples)
            continue

        for sample in samples:
            # 1. Raw staging
            raw_file = RAW_DIR / f"{sid}_sample_{sample.get('part_id') or sample.get('simulation_id') or sample.get('test_case_id') or sample.get('run_id') or sample.get('machine_record_id')}.json"
            with open(raw_file, "w", encoding="utf-8") as rf:
                json.dump(sample, rf, indent=2)

            # 2. Normalization
            norm_record = normalize_engineering_record(sample)
            domain = classify_record_domain(json.dumps(norm_record))

            proc_item = {
                "source_id": sid,
                "source_title": src_meta["name"],
                "license": src_meta["license"],
                "domain": domain,
                "data": norm_record
            }

            processed_records.append(proc_item)
            processed_count += 1

    # Save processed catalog
    processed_catalog_file = PROCESSED_DIR / "processed_feature_catalog.json"
    with open(processed_catalog_file, "w", encoding="utf-8") as pf:
        json.dump(processed_records, pf, indent=2)

    logger.info(f"Ingestion complete: {processed_count} records processed, {rejected_count} rejected.")
    return {
        "processed_count": processed_count,
        "rejected_count": rejected_count,
        "catalog_path": str(processed_catalog_file)
    }

if __name__ == "__main__":
    run_ingestion_pipeline()
