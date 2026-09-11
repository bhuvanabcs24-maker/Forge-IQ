"""
ForgeIQ Deterministic Outer Profile & Cut Perimeter Engine.
Identifies outer cut profile using graph topology, geometric loop closure,
and exact curve/polyline integration. Strictly isolates cut geometry from
holes, bend lines, welds, construction lines, and annotations.
"""

from typing import List, Dict, Any, Tuple, Optional, Set
import math


def points_match(p1: Tuple[float, float], p2: Tuple[float, float], tol: float = 0.05) -> bool:
    """Checks if two 2D points are within snapping tolerance."""
    return math.hypot(p1[0] - p2[0], p1[1] - p2[1]) <= tol


def compute_polygon_area(vertices: List[List[float]]) -> float:
    """Computes signed area of a 2D polygon using Shoelace formula."""
    n = len(vertices)
    if n < 3:
        return 0.0
    area = 0.0
    for i in range(n):
        j = (i + 1) % n
        area += vertices[i][0] * vertices[j][1]
        area -= vertices[j][0] * vertices[i][1]
    return 0.5 * abs(area)


class PerimeterEngine:
    """
    Deterministic loop closure and cut perimeter calculator.
    """

    EXCLUDED_LAYER_PATTERNS = [
        "BEND", "FOLD", "WELD", "SEAM", "DIM", "TEXT", "NOTE",
        "CONSTRUCTION", "DEFPOINTS", "CENTER", "HIDDEN", "HATCH"
    ]

    EXCLUDED_LINETYPES = [
        "DASHED", "HIDDEN", "CENTER", "PHANTOM", "DOT"
    ]

    @classmethod
    def is_candidate_entity(cls, entity: Dict[str, Any]) -> bool:
        """Determines whether an entity could belong to the outer cutting contour."""
        etype = entity.get("type", "")
        if etype not in ("LINE", "ARC", "LWPOLYLINE", "POLYLINE"):
            return False

        layer = str(entity.get("layer", "")).upper()
        linetype = str(entity.get("linetype", "")).upper()

        # Check if layer strongly suggests non-cut geometry
        for pat in cls.EXCLUDED_LAYER_PATTERNS:
            if pat in layer:
                return False

        # Check if linetype indicates construction/bend
        for lt in cls.EXCLUDED_LINETYPES:
            if lt in linetype:
                return False

        return True

    @classmethod
    def find_closed_loops_from_polyline(cls, entity: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Extracts loop metadata from a closed polyline entity."""
        if entity.get("type") in ("LWPOLYLINE", "POLYLINE") and entity.get("is_closed"):
            verts = entity.get("vertices", [])
            if len(verts) >= 3:
                area = compute_polygon_area(verts)
                perimeter = float(entity.get("length", 0.0))
                xs = [v[0] for v in verts]
                ys = [v[1] for v in verts]
                return {
                    "perimeter": perimeter,
                    "area": area,
                    "vertices": verts,
                    "bbox": (min(xs), min(ys), max(xs), max(ys)),
                    "entities": [entity["id"]],
                    "type": "POLYLINE_LOOP",
                }
        return None

    @classmethod
    def build_connected_loops(
        cls, candidate_entities: List[Dict[str, Any]], tolerance: float = 0.05
    ) -> List[Dict[str, Any]]:
        """
        Builds closed loops from a mix of LINE, ARC, and open POLYLINE entities using graph traversal.
        """
        # Linear segments pool: each segment has (p_start, p_end, length, entity_id)
        segments: List[Dict[str, Any]] = []

        for e in candidate_entities:
            etype = e.get("type")
            eid = e.get("id")

            if etype == "LINE":
                segments.append({
                    "start": tuple(e["start"]),
                    "end": tuple(e["end"]),
                    "length": float(e["length"]),
                    "entity_id": eid,
                })
            elif etype == "ARC":
                segments.append({
                    "start": tuple(e["start"]),
                    "end": tuple(e["end"]),
                    "length": float(e["length"]),
                    "entity_id": eid,
                })
            elif etype in ("LWPOLYLINE", "POLYLINE"):
                for seg in e.get("segments", []):
                    segments.append({
                        "start": tuple(seg["start"]),
                        "end": tuple(seg["end"]),
                        "length": float(seg["length"]),
                        "entity_id": eid,
                    })

        if not segments:
            return []

        # Graph DFS cycle search
        loops: List[Dict[str, Any]] = []
        visited_segments: Set[int] = set()

        def dfs_find_loop(current_pt: Tuple[float, float], start_pt: Tuple[float, float], path: List[int]) -> bool:
            # Check for loop closure
            if len(path) >= 3 and points_match(current_pt, start_pt, tolerance):
                return True

            for idx, seg in enumerate(segments):
                if idx in path:
                    continue

                if points_match(current_pt, seg["start"], tolerance):
                    path.append(idx)
                    if dfs_find_loop(seg["end"], start_pt, path):
                        return True
                    path.pop()
                elif points_match(current_pt, seg["end"], tolerance):
                    # Traverse in reverse
                    path.append(idx)
                    if dfs_find_loop(seg["start"], start_pt, path):
                        return True
                    path.pop()

            return False

        for i in range(len(segments)):
            if i in visited_segments:
                continue

            path = [i]
            found = dfs_find_loop(segments[i]["end"], segments[i]["start"], path)

            if found:
                loop_segments = [segments[idx] for idx in path]
                loop_len = sum(s["length"] for s in loop_segments)
                eids = sorted(list(set(s["entity_id"] for s in loop_segments)))
                verts = [list(s["start"]) for s in loop_segments]
                area = compute_polygon_area(verts)
                xs = [v[0] for v in verts]
                ys = [v[1] for v in verts]

                loops.append({
                    "perimeter": loop_len,
                    "area": area,
                    "vertices": verts,
                    "bbox": (min(xs), min(ys), max(xs), max(ys)),
                    "entities": eids,
                    "type": "CONNECTED_GRAPH_LOOP",
                })

                visited_segments.update(path)

        return loops

    @classmethod
    def calculate_cut_perimeter(
        cls, entities: List[Dict[str, Any]], drawing_bounds: Dict[str, float]
    ) -> Dict[str, Any]:
        """
        Extracts the outermost profile and calculates the exact cut perimeter.
        Returns auditable details and confidence score.
        """
        candidate_loops: List[Dict[str, Any]] = []

        # 1. Check for dedicated closed polylines
        for e in entities:
            # If layer is explicitly CUT/PROFILE/OUTLINE
            layer = str(e.get("layer", "")).upper()
            if cls.is_candidate_entity(e):
                loop = cls.find_closed_loops_from_polyline(e)
                if loop:
                    candidate_loops.append(loop)

        # 2. If no direct closed polyline or to cross-validate, search connected segments
        candidates = [e for e in entities if cls.is_candidate_entity(e)]
        connected_loops = cls.build_connected_loops(candidates)
        for cl in connected_loops:
            # Avoid duplicate if identical perimeter already found
            if not any(abs(cl["perimeter"] - existing["perimeter"]) < 0.1 for existing in candidate_loops):
                candidate_loops.append(cl)

        if not candidate_loops:
            # Fallback: Check if any unclassified entities form boundary
            return {
                "value": 0.0,
                "cut_perimeter_mm": 0.0,
                "confidence": 0.0,
                "method": "FAILED_NO_CLOSED_LOOP",
                "source_entities": [],
                "warnings": ["Unable to confidently identify outer cut profile. No closed outer loop found."],
                "candidates": [],
                "outer_loop": None,
            }

        # 3. Identify the outermost loop by maximum bounding box area and polygon area
        candidate_loops.sort(key=lambda l: (l["area"], l["perimeter"]), reverse=True)
        primary_loop = candidate_loops[0]

        # 4. Confidence evaluation
        warnings = []
        confidence = 0.98

        # If multiple large loops exist, assess if there are nested parts or ambiguity
        if len(candidate_loops) > 1:
            second_loop = candidate_loops[1]
            if second_loop["area"] > 0.8 * primary_loop["area"]:
                confidence = 0.82
                warnings.append(
                    f"Multiple candidate outer profiles detected with similar areas ({primary_loop['area']:.1f} vs {second_loop['area']:.1f} mm²)."
                )

        # Cross-check envelope match
        box_w = primary_loop["bbox"][2] - primary_loop["bbox"][0]
        box_h = primary_loop["bbox"][3] - primary_loop["bbox"][1]
        overall_w = drawing_bounds.get("width", 0.0)
        overall_h = drawing_bounds.get("height", 0.0)

        if overall_w > 0 and overall_h > 0:
            if box_w < 0.7 * overall_w or box_h < 0.7 * overall_h:
                warnings.append("Outer profile bounding box is significantly smaller than overall drawing extent.")
                confidence = min(confidence, 0.88)

        perimeter_mm = round(primary_loop["perimeter"], 2)

        return {
            "value": perimeter_mm,
            "cut_perimeter_mm": perimeter_mm,
            "confidence": round(confidence, 2),
            "method": primary_loop["type"],
            "source_entities": primary_loop["entities"],
            "warnings": warnings,
            "candidates_count": len(candidate_loops),
            "outer_loop": {
                "vertices": primary_loop["vertices"],
                "area_mm2": round(primary_loop["area"], 2),
                "bbox": [round(c, 2) for c in primary_loop["bbox"]],
            },
        }
