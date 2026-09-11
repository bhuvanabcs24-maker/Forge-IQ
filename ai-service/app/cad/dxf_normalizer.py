"""
ForgeIQ CAD Entity Normalizer & DXF Preprocessor.
Safely ingests standard and non-standard/legacy DXF drawings using ezdxf.
Normalizes all geometric primitives into strongly-typed internal structures.
"""

from typing import List, Dict, Any, Tuple, Optional
import io
import math
import re
import ezdxf
from ezdxf import recover
from ezdxf.entities import DXFGraphic


def sanitize_dxf_text(content: str) -> str:
    """
    Sanitizes DXF string content to fix common structural errors in handcrafted
    or legacy CAD exports, such as missing AcDbEntity/AcDbPolyline subclass markers.
    """
    lines = content.splitlines()
    new_lines = []
    n = len(lines)
    i = 0

    while i < n:
        line = lines[i]
        new_lines.append(line)

        # Check if line indicates an LWPOLYLINE entity
        if line.strip() == "LWPOLYLINE" and i > 0 and lines[i - 1].strip() == "0":
            # Check ahead if subclass marker '100' exists before next entity ('0')
            has_subclass = False
            layer_tag_index = -1
            for j in range(i + 1, min(i + 20, n)):
                if lines[j].strip() == "100":
                    has_subclass = True
                    break
                if lines[j].strip() == "0":
                    break
                if lines[j].strip() == "8" and layer_tag_index == -1:
                    layer_tag_index = j

            if not has_subclass:
                # Insert AcDbEntity and AcDbPolyline markers
                # We can place them right after the LWPOLYLINE or around the layer tag
                # To maintain clean DXF tag order:
                # 0 \n LWPOLYLINE \n 100 \n AcDbEntity \n 8 \n <layer> \n 100 \n AcDbPolyline
                pass

        i += 1

    # Standard fix for LWPOLYLINE without subclass in AC1015
    sanitized = content
    if "LWPOLYLINE\n8\n" in sanitized and "\n100\nAcDbPolyline" not in sanitized:
        # Pattern match LWPOLYLINE followed by layer 8 tag
        sanitized = re.sub(
            r"0\r?\nLWPOLYLINE\r?\n8\r?\n([^\r\n]+)\r?\n90",
            r"0\nLWPOLYLINE\n100\nAcDbEntity\n8\n\1\n100\nAcDbPolyline\n90",
            sanitized,
        )

    return sanitized


def compute_bulge_arc_length(p1: Tuple[float, float], p2: Tuple[float, float], bulge: float) -> Tuple[float, Dict[str, Any]]:
    """
    Computes arc length and geometry for an LWPOLYLINE bulge segment.
    In DXF: bulge = tan(theta / 4), where theta is the included angle.
    bulge > 0: counter-clockwise arc, bulge < 0: clockwise arc.
    """
    chord = math.hypot(p2[0] - p1[0], p2[1] - p1[1])
    if abs(bulge) < 1e-9 or chord < 1e-9:
        return chord, {"is_arc": False, "length": chord}

    theta = 4.0 * math.atan(abs(bulge))
    radius = chord / (2.0 * math.sin(theta / 2.0))
    arc_length = radius * theta
    sagitta = (chord / 2.0) * abs(bulge)

    return arc_length, {
        "is_arc": True,
        "bulge": bulge,
        "theta_rad": theta,
        "theta_deg": math.degrees(theta),
        "radius": radius,
        "sagitta": sagitta,
        "length": arc_length,
    }


class DxfNormalizer:
    """
    Normalizes DXF drawings into strongly-typed geometric representations.
    """

    @staticmethod
    def load_document(source: Any) -> ezdxf.document.Drawing:
        """
        Loads an ezdxf Drawing from filepath, bytes, or string with multi-stage fallback.
        """
        if isinstance(source, bytes):
            text_content = source.decode("utf-8", errors="ignore")
        elif isinstance(source, str):
            if "\n" in source or "SECTION" in source:
                text_content = source
            else:
                # File path
                with open(source, "r", encoding="utf-8", errors="ignore") as f:
                    text_content = f.read()
        else:
            raise ValueError("Unsupported source type for DXF loading")

        # Stage 1: Standard read
        try:
            return ezdxf.read(io.StringIO(text_content))
        except Exception:
            pass

        # Stage 2: Sanitized read (subclass repair)
        try:
            fixed = sanitize_dxf_text(text_content)
            return ezdxf.read(io.StringIO(fixed))
        except Exception:
            pass

        # Stage 3: Recovery mode
        try:
            fixed = sanitize_dxf_text(text_content)
            doc, _ = recover.read(io.StringIO(fixed))
            return doc
        except Exception as err:
            raise ValueError(f"Failed to parse DXF drawing: {str(err)}")

    @classmethod
    def normalize(cls, source: Any) -> Dict[str, Any]:
        """
        Parses and normalizes all drawing entities, bounding bounds, and layers.
        """
        doc = cls.load_document(source)
        msp = doc.modelspace()

        entities: List[Dict[str, Any]] = []
        layers: Dict[str, int] = {}
        all_x: List[float] = []
        all_y: List[float] = []

        entity_index = 0

        for e in msp:
            dxftype = e.dxftype()
            layer = getattr(e.dxf, "layer", "0") or "0"
            linetype = getattr(e.dxf, "linetype", "BYLAYER") or "BYLAYER"
            color = getattr(e.dxf, "color", 256)

            layers[layer] = layers.get(layer, 0) + 1

            norm_entity: Optional[Dict[str, Any]] = None

            if dxftype == "LINE":
                x1, y1 = float(e.dxf.start.x), float(e.dxf.start.y)
                x2, y2 = float(e.dxf.end.x), float(e.dxf.end.y)
                length = math.hypot(x2 - x1, y2 - y1)
                all_x.extend([x1, x2])
                all_y.extend([y1, y2])

                norm_entity = {
                    "id": entity_index,
                    "type": "LINE",
                    "layer": layer,
                    "linetype": linetype,
                    "color": color,
                    "start": [x1, y1],
                    "end": [x2, y2],
                    "length": length,
                    "angle_deg": math.degrees(math.atan2(y2 - y1, x2 - x1)) % 180.0,
                }

            elif dxftype == "CIRCLE":
                cx, cy = float(e.dxf.center.x), float(e.dxf.center.y)
                radius = float(e.dxf.radius)
                diameter = radius * 2.0
                all_x.extend([cx - radius, cx + radius])
                all_y.extend([cy - radius, cy + radius])

                norm_entity = {
                    "id": entity_index,
                    "type": "CIRCLE",
                    "layer": layer,
                    "linetype": linetype,
                    "color": color,
                    "center": [cx, cy],
                    "radius": radius,
                    "diameter": diameter,
                    "circumference": 2.0 * math.pi * radius,
                    "area": math.pi * (radius ** 2),
                }

            elif dxftype == "ARC":
                cx, cy = float(e.dxf.center.x), float(e.dxf.center.y)
                radius = float(e.dxf.radius)
                start_angle = math.radians(float(e.dxf.start_angle))
                end_angle = math.radians(float(e.dxf.end_angle))

                # Normalize angle range
                span = end_angle - start_angle
                if span < 0:
                    span += 2 * math.pi
                arc_len = radius * span

                p1 = [cx + radius * math.cos(start_angle), cy + radius * math.sin(start_angle)]
                p2 = [cx + radius * math.cos(end_angle), cy + radius * math.sin(end_angle)]
                all_x.extend([p1[0], p2[0], cx])
                all_y.extend([p1[1], p2[1], cy])

                norm_entity = {
                    "id": entity_index,
                    "type": "ARC",
                    "layer": layer,
                    "linetype": linetype,
                    "color": color,
                    "center": [cx, cy],
                    "radius": radius,
                    "start_angle_deg": float(e.dxf.start_angle),
                    "end_angle_deg": float(e.dxf.end_angle),
                    "start": p1,
                    "end": p2,
                    "length": arc_len,
                }

            elif dxftype in ("LWPOLYLINE", "POLYLINE"):
                is_closed = bool(e.is_closed)
                raw_points = list(e.get_points(format="xyseb")) if hasattr(e, "get_points") else []
                if not raw_points and hasattr(e, "vertices"):
                    raw_points = [(float(v.dxf.location.x), float(v.dxf.location.y), 0, 0, getattr(v.dxf, "bulge", 0)) for v in e.vertices]

                vertices: List[List[float]] = []
                segments: List[Dict[str, Any]] = []
                total_poly_len = 0.0

                num_pts = len(raw_points)
                for idx in range(num_pts):
                    pt = raw_points[idx]
                    x, y = float(pt[0]), float(pt[1])
                    bulge = float(pt[4]) if len(pt) > 4 else 0.0
                    vertices.append([x, y])
                    all_x.append(x)
                    all_y.append(y)

                # Build segments between consecutive vertices
                limit = num_pts if is_closed else num_pts - 1
                for idx in range(limit):
                    next_idx = (idx + 1) % num_pts
                    p1 = (vertices[idx][0], vertices[idx][1])
                    p2 = (vertices[next_idx][0], vertices[next_idx][1])
                    bulge = float(raw_points[idx][4]) if len(raw_points[idx]) > 4 else 0.0

                    seg_len, arc_meta = compute_bulge_arc_length(p1, p2, bulge)
                    total_poly_len += seg_len

                    segments.append({
                        "start": list(p1),
                        "end": list(p2),
                        "length": seg_len,
                        "bulge": bulge,
                        "is_arc": arc_meta["is_arc"],
                        **arc_meta,
                    })

                norm_entity = {
                    "id": entity_index,
                    "type": "LWPOLYLINE",
                    "layer": layer,
                    "linetype": linetype,
                    "color": color,
                    "vertices": vertices,
                    "is_closed": is_closed,
                    "segments": segments,
                    "length": total_poly_len,
                }

            elif dxftype in ("TEXT", "MTEXT"):
                txt = getattr(e.dxf, "text", "") or ""
                # Strip formatting codes like \P, \A1; etc.
                clean_txt = re.sub(r"\\[A-Za-z0-9]+;?", " ", txt).strip()
                pos_x = float(getattr(e.dxf, "insert", [0, 0])[0])
                pos_y = float(getattr(e.dxf, "insert", [0, 0])[1])
                height = float(getattr(e.dxf, "height", 5.0))

                norm_entity = {
                    "id": entity_index,
                    "type": dxftype,
                    "layer": layer,
                    "text": clean_txt or txt,
                    "position": [pos_x, pos_y],
                    "height": height,
                }

            elif dxftype == "DIMENSION":
                dim_txt = getattr(e.dxf, "text", "") or ""
                actual_measurement = float(getattr(e.dxf, "actual_measurement", 0.0))
                norm_entity = {
                    "id": entity_index,
                    "type": "DIMENSION",
                    "layer": layer,
                    "text": dim_txt,
                    "actual_measurement": actual_measurement,
                }

            if norm_entity:
                entities.append(norm_entity)
                entity_index += 1

        # Calculate bounding box
        if all_x and all_y:
            min_x, max_x = min(all_x), max(all_x)
            min_y, max_y = min(all_y), max(all_y)
            width = max_x - min_x
            height = max_y - min_y
        else:
            min_x = min_y = max_x = max_y = width = height = 0.0

        return {
            "entities": entities,
            "entity_count": len(entities),
            "layers": layers,
            "bounds": {
                "min_x": round(min_x, 3),
                "min_y": round(min_y, 3),
                "max_x": round(max_x, 3),
                "max_y": round(max_y, 3),
                "width": round(width, 3),
                "height": round(height, 3),
            },
        }
