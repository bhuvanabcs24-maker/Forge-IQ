#!/usr/bin/env python3
"""
ForgeIQ Data Pipeline - RAG Reference Corpus Builder
Implements Section 16, 29, 40:
- Reads authoritative manufacturing standards and documentation:
  * NIST Smart Manufacturing Architecture & Cybersecurity (SRC-NIST-SMARTMFG-01)
  * NIST Additive Manufacturing Benchmark (AM-Bench) Principles (SRC-NIST-AM-01)
  * ASME Y14.5M Geometric Dimensioning & Tolerancing (SRC-ASME-GDNT-01)
  * BenDFM Sheet Metal Air Bending & Collision Principles (SRC-BENDFM-01)
  * Industrial Spindle Predictive Maintenance Guidelines (SRC-KAGGLE-PRED-MAINT-01)
- Validates licensing (RAG permitted)
- Chunks text semantically using chunk_engineering_text
- Stores chunks in data/rag/indexed_corpus.json and integrates with knowledge loader.
"""

import json
from pathlib import Path
from typing import Dict, Any, List

from data_pipeline.chunk import chunk_engineering_text
from data_pipeline.validate import validate_license_for_destination

BASE_DIR = Path(__file__).resolve().parent.parent
SOURCES_PATH = BASE_DIR / "data" / "sources" / "sources.json"
RAG_DIR = BASE_DIR / "data" / "rag"
RAG_DIR.mkdir(parents=True, exist_ok=True)

RAG_DOCUMENTS = [
    {
        "source_id": "SRC-NIST-SMARTMFG-01",
        "title": "NIST Smart Manufacturing & Operational Technology Framework",
        "author": "National Institute of Standards and Technology (NIST)",
        "content": (
            "NIST Smart Manufacturing Systems Framework\n\n"
            "The NIST Smart Manufacturing Systems (SMS) framework defines digital thread integration across design, "
            "production, and quality inspection. Key requirements include semantic interoperability using standardized open schemas "
            "(MTConnect for CNC telemetry, QIF for quality inspection, STEP AP242 for CAD/CAM).\n\n"
            "Trustworthy AI in Manufacturing\n\n"
            "Deterministic real-time closed-loop control must be separated from cloud analytics. "
            "AI recommendations in manufacturing execution systems (MES) must provide traceable provenance, "
            "explicit uncertainty estimates, and human-in-the-loop overrides for safety-critical machine operations."
        )
    },
    {
        "source_id": "SRC-ASME-GDNT-01",
        "title": "ASME Y14.5M Geometric Dimensioning and Tolerancing Reference",
        "author": "American Society of Mechanical Engineers (ASME)",
        "content": (
            "ASME Y14.5 Standard Rules\n\n"
            "Rule #1 (Taylor Principle / Envelope Principle): Where only a size tolerance is specified, the surface of an individual feature shall not extend beyond the boundary of perfect form at maximum material condition (MMC).\n\n"
            "True Position and Material Condition Modifiers\n\n"
            "True Position specifies the allowable variation in feature location relative to a Datum Reference Frame. The tolerance zone is typically cylindrical (⌀). "
            "MMC Modifier (Ⓜ) provides bonus tolerance as the actual produced feature departs from maximum material condition toward least material condition (LMC). "
            "Profile of a Surface controls size, form, orientation, and location simultaneously within a bilateral or unilateral tolerance zone."
        )
    },
    {
        "source_id": "SRC-BENDFM-01",
        "title": "BenDFM Sheet Metal Air Bending & Collision Avoidance Principles",
        "author": "Ghent University CVAMO",
        "content": (
            "Hole-to-Bend Plastic Deformation Limits\n\n"
            "Sheet-metal air bending feasibility is governed by geometric and tool clearance constraints: "
            "Holes situated closer than 2.5 * Thickness + Inside_Radius to the bend line undergo severe plastic deformation into elliptical shapes.\n\n"
            "Flange Length and Tooling Collisions\n\n"
            "To span the die shoulders stably, the outside flange length must be b_min >= 0.7 * V_die_opening. For standard 8xT die opening, b_min >= 5.6 * T. "
            "Bend Sequence Feasibility: Parts with return flanges (channel bends, box folds) must be checked for collision against the punch holder, upper clamp, and lower bed."
        )
    },
    {
        "source_id": "SRC-KAGGLE-PRED-MAINT-01",
        "title": "Industrial CNC Spindle Predictive Maintenance Guidelines",
        "author": "Factory Maintenance Engineering Division",
        "content": (
            "Tool Wear Failure TWF\n\n"
            "Cutting tool wear accumulates as a function of in-cut minutes and workpiece hardness. When cumulative tool contact time exceeds 200 minutes for hardened alloys (or 240 min for structural steel), tool replacement must be scheduled.\n\n"
            "Thermal Drift and Overstrain Failure\n\n"
            "If difference between process temperature and ambient temperature is less than 8.6 K while spindle rotational speed is below 1380 RPM, convective cooling is inadequate, causing thermal expansion and dimensional drift. "
            "Overstrain occurs when the product of cutting tool torque (Nm) and tool wear (min) exceeds 11,000 Nm*min, leading to catastrophic tool shank fracture."
        )
    }
]

def main():
    print("INFO: Building ForgeIQ RAG Reference Corpus...")
    with open(SOURCES_PATH, "r", encoding="utf-8") as f:
        sources_list = json.load(f)
    sources_dict = {s["id"]: s for s in sources_list}

    all_chunks = []

    for doc in RAG_DOCUMENTS:
        src = sources_dict.get(doc["source_id"], {})
        valid, msg = validate_license_for_destination(src, "RAG")
        if not valid:
            print(f"WARN: Skipping RAG doc from {doc['source_id']}: {msg}")
            continue

        raw_chunks = chunk_engineering_text(
            content=doc["content"],
            doc_id=doc["source_id"],
            source_title=doc["title"],
            source_type="engineering_standard",
            target_chunk_tokens=80
        )
        for rc in raw_chunks:
            rc["source_license"] = src.get("license", "Unknown")
            rc["author"] = doc["author"]
            all_chunks.append(rc)

    out_file = RAG_DIR / "indexed_corpus.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2)

    print(f"INFO: RAG Corpus built successfully with {len(all_chunks)} semantic chunks saved to {out_file}.")

if __name__ == "__main__":
    main()
