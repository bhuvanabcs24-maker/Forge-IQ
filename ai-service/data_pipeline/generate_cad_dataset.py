"""
ForgeIQ Synthetic DXF Dataset Generator.
Generates thousands of diverse, controlled sheet-metal DXF examples with
ground-truth geometric properties and entity-level feature labels.
"""

import os
import json
import random
import math
from typing import Dict, Any, List, Tuple
import ezdxf


def generate_single_sample(sample_id: str, output_dir: str) -> Dict[str, Any]:
    """
    Generates a single synthetic sheet metal DXF file with known ground truth.
    """
    # 1. Randomize overall envelope
    width = random.choice([200.0, 250.0, 300.0, 350.0, 400.0, 500.0])
    height = random.choice([150.0, 200.0, 250.0, 300.0, 350.0])
    thickness = random.choice([1.5, 2.0, 3.0, 4.0, 5.0, 6.0, 8.0])
    material = random.choice(["Mild Steel", "Stainless Steel", "Aluminum", "CRCA"])

    # Randomize layer naming conventions (standard vs obfuscated/generic)
    naming_style = random.choice(["semantic", "generic", "mixed"])
    if naming_style == "semantic":
        cut_layer = "CUT"
        hole_layer = "HOLES"
        bend_layer = "BEND"
        weld_layer = "WELDS"
    elif naming_style == "generic":
        cut_layer = "0"
        hole_layer = "0"
        bend_layer = "CONTINUOUS"
        weld_layer = "0"
    else:
        cut_layer = random.choice(["PROFILE", "OUTLINE", "CONTOUR"])
        hole_layer = random.choice(["DRILL", "CUTOUTS", "HOLES"])
        bend_layer = random.choice(["FOLD", "BRAKE", "CREASE"])
        weld_layer = random.choice(["JOINTS", "SEAMS", "WELDING"])

    doc = ezdxf.new("R2000")
    msp = doc.modelspace()

    features: List[Dict[str, Any]] = []
    entity_counter = 0

    # 2. Outer Profile Generation (Rectangular with optional chamfers or notches)
    use_chamfers = random.choice([True, False])
    chamfer_size = 10.0 if use_chamfers else 0.0

    if use_chamfers:
        # Polygon with 4 chamfered corners
        pts = [
            (chamfer_size, 0.0),
            (width - chamfer_size, 0.0),
            (width, chamfer_size),
            (width, height - chamfer_size),
            (width - chamfer_size, height),
            (chamfer_size, height),
            (0.0, height - chamfer_size),
            (0.0, chamfer_size),
        ]
        poly = msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": cut_layer})
        # Calculate perimeter
        hyp = math.hypot(chamfer_size, chamfer_size)
        perimeter = (width - 2 * chamfer_size) * 2 + (height - 2 * chamfer_size) * 2 + 4 * hyp
        area = (width * height) - (2.0 * chamfer_size * chamfer_size)
    else:
        pts = [(0.0, 0.0), (width, 0.0), (width, height), (0.0, height)]
        poly = msp.add_lwpolyline(pts, close=True, dxfattribs={"layer": cut_layer})
        perimeter = 2.0 * (width + height)
        area = width * height

    features.append({
        "entity_id": entity_counter,
        "type": "outer_cut",
        "dxftype": "LWPOLYLINE",
        "layer": cut_layer,
    })
    entity_counter += 1

    # 3. Hole Generation
    hole_count_target = random.choice([2, 4, 6, 8, 10])
    holes_data: List[Dict[str, Any]] = []
    total_hole_area = 0.0

    hole_radius = random.choice([4.0, 5.0, 6.0, 8.0, 10.0])
    grid_cols = min(4, hole_count_target)
    grid_rows = math.ceil(hole_count_target / grid_cols)

    step_x = (width - 60.0) / max(1, grid_cols - 1) if grid_cols > 1 else 0
    step_y = (height - 60.0) / max(1, grid_rows - 1) if grid_rows > 1 else 0

    h_created = 0
    for r in range(grid_rows):
        for c in range(grid_cols):
            if h_created >= hole_count_target:
                break
            cx = 30.0 + c * step_x
            cy = 30.0 + r * step_y
            msp.add_circle((cx, cy), hole_radius, dxfattribs={"layer": hole_layer})

            h_area = math.pi * (hole_radius ** 2)
            total_hole_area += h_area
            holes_data.append({"center": [cx, cy], "diameter": hole_radius * 2.0})

            features.append({
                "entity_id": entity_counter,
                "type": "hole",
                "dxftype": "CIRCLE",
                "layer": hole_layer,
                "radius": hole_radius,
            })
            entity_counter += 1
            h_created += 1

    # 4. Bend Lines Generation
    bend_count_target = random.choice([0, 1, 2, 4])
    bends_data: List[Dict[str, Any]] = []
    if bend_count_target > 0:
        step_bend = width / (bend_count_target + 1)
        for b in range(bend_count_target):
            bx = (b + 1) * step_bend
            msp.add_line(
                (bx, 15.0),
                (bx, height - 15.0),
                dxfattribs={"layer": bend_layer, "linetype": "DASHED"},
            )
            bends_data.append({"start": [bx, 15.0], "end": [bx, height - 15.0], "angle_deg": 90.0})
            features.append({
                "entity_id": entity_counter,
                "type": "bend",
                "dxftype": "LINE",
                "layer": bend_layer,
            })
            entity_counter += 1

    # 5. Weld Lines Generation (Optional)
    weld_count_target = random.choice([0, 1, 2])
    if weld_count_target > 0:
        for w in range(weld_count_target):
            wy = 20.0 + w * 40.0
            msp.add_line(
                (40.0, wy),
                (120.0, wy),
                dxfattribs={"layer": weld_layer},
            )
            features.append({
                "entity_id": entity_counter,
                "type": "weld",
                "dxftype": "LINE",
                "layer": weld_layer,
            })
            entity_counter += 1

    # 6. Notes & Annotations
    msp.add_text(
        f"Material: {material} | Thickness: {thickness} mm",
        dxfattribs={"layer": "NOTES", "height": 5.0, "insert": (10.0, height + 15.0)},
    )
    features.append({
        "entity_id": entity_counter,
        "type": "annotation",
        "dxftype": "TEXT",
        "layer": "NOTES",
    })
    entity_counter += 1

    # Save DXF
    dxf_filename = f"{sample_id}.dxf"
    dxf_path = os.path.join(output_dir, dxf_filename)
    doc.saveas(dxf_path)

    # Return Ground Truth Meta
    return {
        "file": dxf_filename,
        "geometry": {
            "width_mm": width,
            "height_mm": height,
            "thickness_mm": thickness,
            "material": material,
            "cut_perimeter_mm": round(perimeter, 2),
            "gross_area_mm2": round(area, 2),
            "net_area_mm2": round(area - total_hole_area, 2),
            "hole_count": len(holes_data),
            "bend_count": len(bends_data),
            "weld_count": weld_count_target,
        },
        "features": features,
    }


def generate_dataset(num_samples: int = 100, base_dir: str = "data/cad_training"):
    """
    Generates train, validation, and test datasets.
    """
    raw_dir = os.path.join(base_dir, "raw")
    labels_dir = os.path.join(base_dir, "labels")
    train_dir = os.path.join(base_dir, "train")
    val_dir = os.path.join(base_dir, "validation")
    test_dir = os.path.join(base_dir, "test")

    for d in [raw_dir, labels_dir, train_dir, val_dir, test_dir]:
        os.makedirs(d, exist_ok=True)

    samples: List[Dict[str, Any]] = []
    print(f"Generating {num_samples} synthetic sheet metal CAD samples...")

    for i in range(num_samples):
        sid = f"part_{i+1:04d}"
        meta = generate_single_sample(sid, raw_dir)
        samples.append(meta)

        # Save individual label
        label_file = os.path.join(labels_dir, f"{sid}.json")
        with open(label_file, "w") as f:
            json.dump(meta, f, indent=2)

    # Split: 80% train, 10% val, 10% test
    random.shuffle(samples)
    n_train = int(0.8 * num_samples)
    n_val = int(0.1 * num_samples)

    train_samples = samples[:n_train]
    val_samples = samples[n_train : n_train + n_val]
    test_samples = samples[n_train + n_val :]

    with open(os.path.join(train_dir, "dataset.json"), "w") as f:
        json.dump(train_samples, f, indent=2)
    with open(os.path.join(val_dir, "dataset.json"), "w") as f:
        json.dump(val_samples, f, indent=2)
    with open(os.path.join(test_dir, "dataset.json"), "w") as f:
        json.dump(test_samples, f, indent=2)

    print(f"Dataset generated: {len(train_samples)} train, {len(val_samples)} val, {len(test_samples)} test.")


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--samples", type=int, default=100)
    args = parser.parse_args()
    generate_dataset(num_samples=args.samples)
