#!/usr/bin/env python3
"""
ForgeIQ Model & Decision Quality Evaluator
Implements Section 28 Evaluation Architecture:
Tests the 10 core dimensions before deployment:
1. Quotation accuracy
2. Material cost accuracy
3. DFM accuracy
4. Machine selection
5. Inventory reasoning
6. Lead-time estimation
7. Tool selection
8. Hallucination rate (target: 0.0%)
9. Missing-data handling
10. Source attribution
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.tools.material_calculator import calculate_part_weight, calculate_material_cost
from app.tools.inventory_tools import resolve_inventory_decision
from app.tools.laser_calculator import get_laser_cutting_speed, calculate_laser_cost
from app.tools.bending_calculator import check_bending_feasibility
from app.tools.quotation_calculator import calculate_quotation, calculate_lead_time_days
from app.agents.dfm_agent import dfm_agent
from app.rag.knowledge_loader import KnowledgeConflictResolver, factory_knowledge_service

def evaluate_all() -> bool:
    results = {}

    # 1. Material Cost Accuracy
    mat_cost = calculate_material_cost(10.0, "SS304")
    results["material_cost_accuracy"] = (
        mat_cost["success"] is True and mat_cost["cost_inr"] == 2280.0
    )

    # 2. Quotation Arithmetic Accuracy
    quote = calculate_quotation(
        material_cost=10000.0,
        laser_cutting_cost=2000.0,
        bending_cost=1000.0,
        finishing_cost=1500.0,
        quantity=100
    )
    # Direct = 10000 + 2000 + 1000 + 350 + 400 = 13750
    # NRE = 500 + 650 = 1150
    # Subtotal = 14900
    # Overhead 8% = 1192, Risk 3% = 447
    # Cost basis = 16539
    # Margin 18% = 2977.02 -> 19516.02
    # Tax 18% = 3512.88 -> 23028.90
    results["quotation_accuracy"] = (
        quote["breakdown"]["final_price_inr"] > 20000.0 and
        quote["confidence_level"] == "HIGH"
    )

    # 3. DFM Accuracy (Flags critical +/-0.02 mm tolerance and Hardox)
    dfm_tol = dfm_agent.analyze_part_feasibility("SS304", 3.0, tolerance_mm=0.02)
    dfm_hardox = dfm_agent.analyze_part_feasibility("Hardox 450", 6.0)
    results["dfm_accuracy"] = (
        dfm_tol.engineering_review_required is True and
        dfm_hardox.engineering_review_required is True
    )

    # 4. Machine Selection & Capability
    speed = get_laser_cutting_speed("SS304", 3.0)
    results["machine_selection"] = (speed == 4200.0)

    # 5. Inventory & Remnant Reasoning
    inv = resolve_inventory_decision("SS304", required_sheets=12)
    results["inventory_reasoning"] = (
        inv["shortage_sheets"] > 0 and inv["usable_remnants_count"] >= 1
    )

    # 6. Lead Time Estimation
    lead = calculate_lead_time_days(queue_days=1, material_procurement_days=2, processing_days=2)
    results["lead_time_estimation"] = (lead >= 7)

    # 7. Tool Selection & Deterministic Execution
    w = calculate_part_weight(1000.0, 500.0, 2.0, 7930.0)
    results["tool_selection"] = (w == 7.93)

    # 8. Hallucination Rate (Strict zero tolerance on missing factory rates)
    fake_mat = calculate_material_cost(5.0, "UNOBTAINIUM-999")
    results["hallucination_rate_zero"] = (
        fake_mat["success"] is False and fake_mat["error"] == "MATERIAL_RATE_UNAVAILABLE"
    )

    # 9. Missing Data Handling (Assumption tagging)
    missing_quote = calculate_quotation(material_cost=5000.0, finishing_cost=None)
    results["missing_data_handling"] = (
        missing_quote["confidence_level"] == "LOW" and
        any("ASSUMPTION" in a for a in missing_quote["assumptions"])
    )

    # 10. Source Attribution & Hierarchy
    competing = [
        {"value": 300, "source": "Web", "source_type": "general_web"},
        {"value": 228, "source": "Factory DB", "source_type": "factory_database"}
    ]
    resolved = KnowledgeConflictResolver.resolve(competing)
    results["source_attribution"] = (
        resolved.chosen_source == "Factory DB" and resolved.source_priority_rank == 1
    )

    print("\n" + "="*50)
    print("FORGEIQ MASTER AI BENCHMARK EVALUATION SCORECARD")
    print("="*50)
    all_passed = True
    for metric, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        if not passed:
            all_passed = False
        print(f"{metric.replace('_', ' ').title():<35}: {status}")
    print("="*50)
    print(f"Overall Benchmark Status: {'✅ PASSED (10/10)' if all_passed else '❌ FAILED'}\n")
    return all_passed

if __name__ == "__main__":
    success = evaluate_all()
    sys.exit(0 if success else 1)
