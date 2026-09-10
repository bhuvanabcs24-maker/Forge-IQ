import re
from typing import Dict, Any, List, Optional
from app.models.schemas import DFMAnalysisResult, DFMIssue
from app.tools.bending_calculator import check_bending_feasibility
from app.rag.knowledge_loader import factory_knowledge_service

class DFMAgent:
    """
    Implements Section 14, 16, 17, 18, 34 & 64:
    Autonomous DFM analysis evaluating hole-to-edge, hole-to-bend,
    minimum flange, critical tolerances, and high-strength steels.
    """

    def analyze_part_feasibility(
        self,
        material_grade: str,
        thickness_mm: float,
        flange_length_mm: Optional[float] = None,
        hole_diameter_mm: Optional[float] = None,
        hole_to_bend_distance_mm: Optional[float] = None,
        hole_to_edge_distance_mm: Optional[float] = None,
        slot_width_mm: Optional[float] = None,
        tolerance_mm: Optional[float] = None,
        bend_length_mm: float = 100.0,
        inside_radius_mm: Optional[float] = None,
        raw_notes: str = ""
    ) -> DFMAnalysisResult:
        issues: List[DFMIssue] = []
        warnings: List[str] = []
        recommendations: List[str] = []
        assumptions: List[str] = []
        requires_review = False

        grade_upper = material_grade.upper()

        # 1. Check Hardox / High-strength materials (Section 18 & Example 8)
        if "HARDOX" in grade_upper:
            # If OEM SSAB compliant tooling is provided (R >= 3T), allow with verified advisory
            if inside_radius_mm is not None and inside_radius_mm >= 3.0 * thickness_mm:
                warnings.append("Hardox wear plate with OEM SSAB-compliant tooling (punch radius >= 3T) approved for scheduling.")
            else:
                issues.append(DFMIssue(
                    feature="HARDOX_MATERIAL_GRADE",
                    risk="High yield strength causes excessive springback, punch cracking, and requires 3-4x tonnage.",
                    severity="HIGH",
                    current_design=f"{material_grade} ({thickness_mm} mm)",
                    manufacturing_constraint="Hardox requires punch radius >= 3T, die opening >= 10-12T, and OEM bending charts.",
                    recommendation="Hardox bending requires OEM SSAB bending chart and verifying press-brake capacity before scheduling.",
                    confidence=0.98,
                    engineering_review_required=True
                ))
                requires_review = True

        # 2. Check Critical Tolerances (Section 7, 34 & Example 4)
        if tolerance_mm is not None and tolerance_mm <= 0.05:
            issues.append(DFMIssue(
                feature="DIMENSIONAL_TOLERANCE",
                risk=f"Tolerance +/-{tolerance_mm} mm exceeds standard thermal laser cutting capability (ISO 9013 Class 1/2 approx +/-0.1 mm).",
                severity="CRITICAL" if tolerance_mm <= 0.02 else "HIGH",
                current_design=f"+/-{tolerance_mm} mm",
                manufacturing_constraint="Thermal cutting heat-affected zone (HAZ) and kerf taper cannot reliably hold +/-0.02 mm.",
                recommendation="Recommend secondary precision CNC milling, wire EDM, or surface grinding and CMM inspection.",
                confidence=0.99,
                engineering_review_required=True
            ))
            requires_review = True

        # 3. Check Minimum Flange & Tooling (Section 16 & Example 2)
        if flange_length_mm is not None:
            bend_check = check_bending_feasibility(
                material_grade=material_grade,
                thickness_mm=thickness_mm,
                flange_length_mm=flange_length_mm,
                bend_length_mm=bend_length_mm,
                inside_radius_mm=inside_radius_mm
            )
            if bend_check.get("short_flange_warning"):
                issues.append(DFMIssue(
                    feature="BEND_FLANGE_LENGTH",
                    risk="Flange may fall into V-die opening causing slipping, distortion, or incomplete bend angle.",
                    severity="MEDIUM",
                    current_design=f"Flange = {flange_length_mm} mm",
                    manufacturing_constraint=f"Recommended minimum flange is {bend_check['minimum_safe_flange_mm']} mm for V={bend_check['recommended_v_die_mm']} mm.",
                    recommendation="Potential short-flange condition detected. Verify tooling and minimum flange requirement against factory press-brake table.",
                    confidence=0.95,
                    engineering_review_required=True
                ))
                requires_review = True

        # 4. Check Hole-to-Bend proximity (Section 17)
        if hole_to_bend_distance_mm is not None:
            safe_distance = (2.5 * thickness_mm) + (inside_radius_mm or (1.2 * thickness_mm))
            if hole_to_bend_distance_mm < safe_distance:
                issues.append(DFMIssue(
                    feature="HOLE_TO_BEND_PROXIMITY",
                    risk="Hole lies within plastic deformation zone and will distort into an ellipse during bending.",
                    severity="MEDIUM",
                    current_design=f"Distance = {hole_to_bend_distance_mm} mm",
                    manufacturing_constraint=f"Recommended distance D >= 2.5T + R ({round(safe_distance, 1)} mm).",
                    recommendation="Move hole further from bend line, or laser cut relief slots / pierce after bending.",
                    confidence=0.92,
                    engineering_review_required=True
                ))
                requires_review = True

        # 5. Check Hole Diameter vs Thickness
        if hole_diameter_mm is not None and hole_diameter_mm < thickness_mm:
            issues.append(DFMIssue(
                feature="HOLE_DIAMETER_RATIO",
                risk="Hole diameter smaller than thickness (D < T) causes severe nozzle blowback and dross in laser cutting.",
                severity="LOW",
                current_design=f"Hole diameter {hole_diameter_mm} mm < thickness {thickness_mm} mm",
                manufacturing_constraint="Laser cutting rule: Hole diameter D >= 1.0T (preferably >= 1.2T for SS).",
                recommendation="Pierce pilot hole and finish with CNC drilling, or enlarge hole to at least thickness T.",
                confidence=0.94,
                engineering_review_required=False
            ))

        # 6. Check Hole-to-Edge Distance (Bulging and tear risk)
        if hole_to_edge_distance_mm is not None:
            min_edge_dist = 1.5 * thickness_mm
            if hole_to_edge_distance_mm < min_edge_dist:
                issues.append(DFMIssue(
                    feature="HOLE_TO_EDGE_PROXIMITY",
                    risk="Hole positioned too close to sheet edge risks bulging or edge tearing during punching/cutting.",
                    severity="HIGH",
                    current_design=f"Edge distance = {hole_to_edge_distance_mm} mm",
                    manufacturing_constraint=f"Recommended edge distance E >= 1.5T ({round(min_edge_dist, 1)} mm).",
                    recommendation="Move hole center to at least 1.5x thickness from the nearest cut edge.",
                    confidence=0.95,
                    engineering_review_required=True
                ))
                requires_review = True

        # 7. Check Narrow Slot Width
        if slot_width_mm is not None and slot_width_mm < thickness_mm:
            issues.append(DFMIssue(
                feature="NARROW_SLOT_WIDTH",
                risk="Slot width narrower than material thickness causes thermal heat accumulation and slag bridging.",
                severity="MEDIUM",
                current_design=f"Slot width = {slot_width_mm} mm < {thickness_mm} mm",
                manufacturing_constraint="Minimum slot width W >= 1.0T.",
                recommendation="Widen slot to at least material thickness or adjust laser cut parameters.",
                confidence=0.92,
                engineering_review_required=True
            ))
            requires_review = True

        # Overall Status
        if any(issue.severity == "CRITICAL" for issue in issues):
            overall_status = "FAIL"
        elif issues or requires_review:
            overall_status = "REVIEW"
        else:
            overall_status = "PASS"
            recommendations.append("Part geometry conforms to standard sheet metal and CNC fabrication design guidelines.")

        return DFMAnalysisResult(
            status=overall_status,
            issues=issues,
            warnings=warnings,
            recommendations=recommendations,
            assumptions=assumptions,
            confidence=0.96,
            engineering_review_required=requires_review
        )

dfm_agent = DFMAgent()
