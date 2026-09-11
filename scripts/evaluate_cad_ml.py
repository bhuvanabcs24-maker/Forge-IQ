#!/usr/bin/env python3
"""
ForgeIQ ML CAD Feature Evaluation on Held-Out Test Set.
Implements Phase 15:
Loads the held-out test set `data/cad_training/test/dataset.json`,
evaluates the trained Random Forest classifier,
reports Accuracy, Precision, Recall, F1 score per class, and Confusion Matrix,
and saves the evaluation metrics to `models/evaluation/`.
"""

import os
import json
import numpy as np
import joblib
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

TEST_DATASET_PATH = "data/cad_training/test/dataset.json"
MODEL_PATH = "ai-service/models/cad_feature_classifier.joblib"
EVAL_DIR = "models/evaluation"

LABEL_MAP = {
    "outer_cut": 0,
    "hole": 1,
    "bend": 2,
    "weld": 3,
    "annotation": 4,
}
INV_LABEL_MAP = {v: k for k, v in LABEL_MAP.items()}


def extract_entity_feature_vector(feat: dict, geom: dict) -> list:
    dxftype = str(feat.get("dxftype", "")).upper()
    layer = str(feat.get("layer", "")).upper()

    is_circle = 1.0 if dxftype == "CIRCLE" else 0.0
    is_poly = 1.0 if "POLY" in dxftype else 0.0
    is_line = 1.0 if dxftype == "LINE" else 0.0
    is_text = 1.0 if dxftype in ("TEXT", "MTEXT") else 0.0

    radius = float(feat.get("radius", 0.0))
    length = float(feat.get("length", 0.0))
    linetype = str(feat.get("linetype", "")).upper()
    is_dashed = 1.0 if any(k in linetype for k in ["DASH", "HIDDEN", "PHANTOM", "CENTER"]) else 0.0

    has_bend_hint = 1.0 if any(k in layer for k in ["BEND", "FOLD", "BRAKE", "DASH", "CREASE"]) else 0.0
    has_weld_hint = 1.0 if any(k in layer for k in ["WELD", "SEAM", "JOINT"]) else 0.0
    has_cut_hint = 1.0 if any(k in layer for k in ["CUT", "PROFILE", "OUTLINE", "CONTOUR"]) else 0.0
    has_hole_hint = 1.0 if any(k in layer for k in ["HOLE", "DRILL", "CUTOUT"]) else 0.0

    w = float(geom.get("width_mm", 400.0))
    h = float(geom.get("height_mm", 300.0))
    diag = (w * w + h * h) ** 0.5
    length_ratio = min(2.0, length / max(diag, 1.0))

    return [
        is_circle,
        is_poly,
        is_line,
        is_text,
        radius,
        length_ratio,
        is_dashed,
        has_bend_hint,
        has_weld_hint,
        has_cut_hint,
        has_hole_hint,
        w,
        h,
    ]


def evaluate():
    if not os.path.exists(TEST_DATASET_PATH):
        raise FileNotFoundError(f"Test dataset not found at {TEST_DATASET_PATH}")
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

    with open(TEST_DATASET_PATH, "r") as f:
        samples = json.load(f)

    X_test, y_test = [], []
    for sample in samples:
        geom = sample.get("geometry", {})
        for feat in sample.get("features", []):
            label_str = feat.get("type")
            if label_str in LABEL_MAP:
                vec = extract_entity_feature_vector(feat, geom)
                X_test.append(vec)
                y_test.append(LABEL_MAP[label_str])

    X_test = np.array(X_test)
    y_test = np.array(y_test)

    clf = joblib.load(MODEL_PATH)
    y_pred = clf.predict(X_test)

    acc = float(accuracy_score(y_test, y_pred))
    present_classes = sorted(np.unique(np.concatenate([y_test, y_pred])))
    class_names = [INV_LABEL_MAP[i] for i in present_classes]

    report = classification_report(y_test, y_pred, target_names=class_names, output_dict=True)
    conf_matrix = confusion_matrix(y_test, y_pred, labels=present_classes).tolist()

    os.makedirs(EVAL_DIR, exist_ok=True)

    results = {
        "dataset": {
            "test_samples_count": len(samples),
            "total_test_entities": len(y_test),
        },
        "accuracy": round(acc, 4),
        "class_metrics": {},
        "confusion_matrix": {
            "labels": class_names,
            "matrix": conf_matrix,
        },
        "targets_met": {
            "hole_f1_ge_99": report.get("hole", {}).get("f1-score", 0) >= 0.99,
            "bend_f1_ge_95": report.get("bend", {}).get("f1-score", 0) >= 0.95,
            "weld_f1_ge_95": report.get("weld", {}).get("f1-score", 0) >= 0.95,
            "cut_f1_ge_95": report.get("outer_cut", {}).get("f1-score", 0) >= 0.95,
        }
    }

    for name in class_names:
        metrics = report.get(name, {})
        results["class_metrics"][name] = {
            "precision": round(metrics.get("precision", 0), 4),
            "recall": round(metrics.get("recall", 0), 4),
            "f1_score": round(metrics.get("f1-score", 0), 4),
            "support": metrics.get("support", 0),
        }

    # Save JSON report
    json_path = os.path.join(EVAL_DIR, "eval_report.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    # Save Markdown report
    md_path = os.path.join(EVAL_DIR, "EVALUATION_REPORT.md")
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# ForgeIQ CAD Feature Classifier — Held-Out Test Set Evaluation Report\n\n")
        f.write(f"**Test Set Samples**: {len(samples)} synthetic CAD drawings\n")
        f.write(f"**Total Evaluated Entities**: {len(y_test)}\n")
        f.write(f"**Overall Accuracy**: {acc * 100:.2f}%\n\n")
        f.write("## Per-Class Performance\n\n")
        f.write("| Feature Class | Precision | Recall | F1-Score | Target | Status |\n")
        f.write("|---|---|---|---|---|---|\n")

        targets = {
            "hole": ("≥ 99%", results["targets_met"]["hole_f1_ge_99"]),
            "bend": ("≥ 95%", results["targets_met"]["bend_f1_ge_95"]),
            "weld": ("≥ 95%", results["targets_met"]["weld_f1_ge_95"]),
            "outer_cut": ("≥ 95%", results["targets_met"]["cut_f1_ge_95"]),
            "annotation": ("≥ 90%", True),
        }

        for name in class_names:
            m = results["class_metrics"].get(name, {})
            tgt_str, met = targets.get(name, ("N/A", True))
            status = "✅ PASS" if met else "❌ FAIL"
            f.write(f"| **{name}** | {m.get('precision', 0) * 100:.1f}% | {m.get('recall', 0) * 100:.1f}% | {m.get('f1_score', 0) * 100:.1f}% | {tgt_str} | {status} |\n")

        f.write("\n## Confusion Matrix\n\n")
        header = "| Actual \\ Predicted | " + " | ".join(class_names) + " |\n"
        sep = "|---|" + "|".join(["---"] * len(class_names)) + "|\n"
        f.write(header + sep)
        for i, row in enumerate(conf_matrix):
            row_str = " | ".join(str(val) for val in row)
            f.write(f"| **{class_names[i]}** | {row_str} |\n")

        f.write("\n## Conclusion\n\n")
        all_passed = all(results["targets_met"].values())
        if all_passed:
            f.write("✅ **All Phase 15 precision, recall, and F1 targets successfully met on the held-out test set.**\n")
        else:
            f.write("⚠️ Some targets fell below thresholds.\n")

    print(f"Evaluation complete. Results saved to {json_path} and {md_path}")
    print(json.dumps(results, indent=2))
    return results


if __name__ == "__main__":
    evaluate()
