# ForgeIQ CAD Feature Classifier — Held-Out Test Set Evaluation Report

**Test Set Samples**: 15 synthetic CAD drawings
**Total Evaluated Entities**: 164
**Overall Accuracy**: 100.00%

## Per-Class Performance

| Feature Class | Precision | Recall | F1-Score | Target | Status |
|---|---|---|---|---|---|
| **outer_cut** | 100.0% | 100.0% | 100.0% | ≥ 95% | ✅ PASS |
| **hole** | 100.0% | 100.0% | 100.0% | ≥ 99% | ✅ PASS |
| **bend** | 100.0% | 100.0% | 100.0% | ≥ 95% | ✅ PASS |
| **weld** | 100.0% | 100.0% | 100.0% | ≥ 95% | ✅ PASS |
| **annotation** | 100.0% | 100.0% | 100.0% | ≥ 90% | ✅ PASS |

## Confusion Matrix

| Actual \ Predicted | outer_cut | hole | bend | weld | annotation |
|---|---|---|---|---|---|
| **outer_cut** | 15 | 0 | 0 | 0 | 0 |
| **hole** | 0 | 94 | 0 | 0 | 0 |
| **bend** | 0 | 0 | 22 | 0 | 0 |
| **weld** | 0 | 0 | 0 | 18 | 0 |
| **annotation** | 0 | 0 | 0 | 0 | 15 |

## Conclusion

✅ **All Phase 15 precision, recall, and F1 targets successfully met on the held-out test set.**
