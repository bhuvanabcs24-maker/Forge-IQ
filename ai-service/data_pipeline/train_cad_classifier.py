"""
ForgeIQ CAD Feature Classifier Trainer.
Trains a classical scikit-learn Random Forest model on geometric feature vectors
extracted from synthetic and real sheet metal drawings.
"""

import os
import json
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score


LABEL_MAP = {
    "outer_cut": 0,
    "hole": 1,
    "bend": 2,
    "weld": 3,
    "annotation": 4,
}
INV_LABEL_MAP = {v: k for k, v in LABEL_MAP.items()}


def extract_entity_feature_vector(feat: dict, geom: dict) -> list:
    """
    Extracts numerical feature vector for an entity.
    """
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


def train_classifier(dataset_path: str = "data/cad_training/train/dataset.json", model_output: str = "ai-service/models/cad_feature_classifier.joblib"):
    """
    Loads dataset, trains Random Forest, and outputs metrics.
    """
    if not os.path.exists(dataset_path):
        raise FileNotFoundError(f"Training dataset not found at {dataset_path}")

    with open(dataset_path, "r") as f:
        samples = json.load(f)

    X, y = [], []
    for sample in samples:
        geom = sample.get("geometry", {})
        for feat in sample.get("features", []):
            label_str = feat.get("type")
            if label_str in LABEL_MAP:
                vec = extract_entity_feature_vector(feat, geom)
                X.append(vec)
                y.append(LABEL_MAP[label_str])

    X = np.array(X)
    y = np.array(y)

    print(f"Training on {len(X)} entity feature vectors across {len(np.unique(y))} classes...")

    clf = RandomForestClassifier(n_estimators=50, max_depth=12, random_state=42)
    clf.fit(X, y)

    # Evaluate on training data
    preds = clf.predict(X)
    acc = accuracy_score(y, preds)
    print(f"Training Accuracy: {acc * 100:.2f}%")
    print(classification_report(y, preds, target_names=[INV_LABEL_MAP[i] for i in sorted(np.unique(y))]))

    os.makedirs(os.path.dirname(model_output), exist_ok=True)
    joblib.dump(clf, model_output)
    print(f"Model successfully saved to {model_output}")

    return clf


if __name__ == "__main__":
    train_classifier()
