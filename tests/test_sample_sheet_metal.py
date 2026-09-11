"""
Root Regression Test Runner for ForgeIQ CAD Engine.
Invokes the test_sample_sheet_metal test.
"""

import os
import sys

# Ensure ai-service is in python path
ai_service_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ai-service")
if ai_service_dir not in sys.path:
    sys.path.insert(0, ai_service_dir)

from tests.test_sample_sheet_metal import test_sample_sheet_metal_regression

def test_root_sample_sheet_metal():
    test_sample_sheet_metal_regression()
