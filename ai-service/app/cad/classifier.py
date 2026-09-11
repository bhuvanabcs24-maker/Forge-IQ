"""
ForgeIQ ML CAD Feature Classifier Runtime.
Loads the trained Random Forest model and provides entity-level
classification probabilities and confidence scoring for ambiguous drawings.
"""

import os
import joblib
import numpy as np
from typing import Dict, Any, Tuple, Optional

MODEL_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
    "models",
    "cad_feature_classifier.joblib",
)

LABEL_MAP = {
    0: "outer_cut",
    1: "hole",
    2: "bend",
    3: "weld",
    4: "annotation",
}


class CadClassifier:
    """
    ML Classifier for CAD entity semantics.
    """

    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None and os.path.exists(MODEL_PATH):
            try:
                cls._model = joblib.load(MODEL_PATH)
            except Exception as e:
                print(f"[CadClassifier] Warning: failed to load {MODEL_PATH}: {e}")
                cls._model = None
        return cls._model

    @classmethod
    def classify_entity(cls, entity: Dict[str, Any], bounds: Dict[str, float]) -> Tuple[str, float]:
        """
        Classifies an entity using the trained Random Forest model if available,
        falling back to deterministic rule scoring.
        """
        model = cls.get_model()

        dxftype = str(entity.get("type", "")).upper()
        layer = str(entity.get("layer", "")).upper()

        is_circle = 1.0 if dxftype == "CIRCLE" else 0.0
        is_poly = 1.0 if "POLY" in dxftype else 0.0
        is_line = 1.0 if dxftype == "LINE" else 0.0
        is_text = 1.0 if dxftype in ("TEXT", "MTEXT") else 0.0

        radius = float(entity.get("radius", 0.0))
        length = float(entity.get("length", 0.0))
        linetype = str(entity.get("linetype", "")).upper()
        is_dashed = 1.0 if any(k in linetype for k in ["DASH", "HIDDEN", "PHANTOM", "CENTER"]) else 0.0

        has_bend_hint = 1.0 if any(k in layer for k in ["BEND", "FOLD", "BRAKE", "DASH", "CREASE"]) else 0.0
        has_weld_hint = 1.0 if any(k in layer for k in ["WELD", "SEAM", "JOINT"]) else 0.0
        has_cut_hint = 1.0 if any(k in layer for k in ["CUT", "PROFILE", "OUTLINE", "CONTOUR"]) else 0.0
        has_hole_hint = 1.0 if any(k in layer for k in ["HOLE", "DRILL", "CUTOUT"]) else 0.0

        w = float(bounds.get("width", 400.0))
        h = float(bounds.get("height", 300.0))
        diag = (w * w + h * h) ** 0.5
        length_ratio = min(2.0, length / max(diag, 1.0))

        feat_vec = [
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

        if model is not None:
            try:
                probs = model.predict_proba([feat_vec])[0]
                pred_idx = int(np.argmax(probs))
                confidence = float(probs[pred_idx])
                return LABEL_MAP.get(pred_idx, "unknown"), round(confidence, 2)
            except Exception:
                pass

        # Deterministic fallback rule scoring
        if is_circle:
            return "hole", 0.98 if has_hole_hint else 0.92
        elif is_poly:
            return "outer_cut", 0.98 if has_cut_hint else 0.88
        elif is_line and has_bend_hint:
            return "bend", 0.95
        elif is_line and has_weld_hint:
            return "weld", 0.95
        elif is_text:
            return "annotation", 0.99
        elif is_line:
            return "outer_cut", 0.75

        return "other", 0.70
