import pytest
from app.agents.dfm_agent import dfm_agent
from app.tools.quotation_calculator import calculate_quotation

def test_dfm_critical_tolerance_flagging():
    """
    Verify Section 34 & Example 4: Critical tolerance (+/-0.02 mm) flags engineering review
    and recommends secondary precision machining.
    """
    res = dfm_agent.analyze_part_feasibility(
        material_grade="SS304",
        thickness_mm=3.0,
        tolerance_mm=0.02
    )
    assert res.status in ["REVIEW", "FAIL"]
    assert res.engineering_review_required is True
    assert any("laser" in issue.risk.lower() for issue in res.issues)
    assert any("cnc milling" in issue.recommendation.lower() for issue in res.issues)

def test_dfm_short_flange_detection():
    """
    Verify Section 16 & Example 2: 12 mm flange on 3mm SS304 flags short-flange warning.
    """
    res = dfm_agent.analyze_part_feasibility(
        material_grade="SS304",
        thickness_mm=3.0,
        flange_length_mm=12.0
    )
    assert res.status == "REVIEW"
    assert res.engineering_review_required is True
    assert any("short-flange" in issue.recommendation.lower() for issue in res.issues)

def test_dfm_hardox_refusal():
    """
    Verify Section 18 & Example 8: Hardox wear plates require OEM bending parameters.
    """
    res = dfm_agent.analyze_part_feasibility(
        material_grade="Hardox 450",
        thickness_mm=8.0,
        flange_length_mm=80.0
    )
    assert res.status == "REVIEW"
    assert res.engineering_review_required is True
    assert any("hardox" in issue.feature.lower() or "hardox" in issue.recommendation.lower() for issue in res.issues)

def test_dfm_clean_pass():
    """
    Verify standard geometry passes without engineering review flag.
    """
    res = dfm_agent.analyze_part_feasibility(
        material_grade="MS",
        thickness_mm=2.0,
        flange_length_mm=30.0,
        tolerance_mm=0.2
    )
    assert res.status == "PASS"
    assert res.engineering_review_required is False
    assert len(res.issues) == 0
