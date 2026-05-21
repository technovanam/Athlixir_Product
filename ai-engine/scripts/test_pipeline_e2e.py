import os
import sys
import unittest
import numpy as np

# Inject local python path for module loading
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.pipelines.biomechanics_pipeline import run_biomechanics_extraction_pipeline
from app.config import MIN_REQUIRED_FPS

class TestAIEngineE2E(unittest.TestCase):
    def setUp(self):
        self.valid_video = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../test-videos/sprint.mp4'))

    def test_invalid_video_file_handling(self):
        """Phase 3 — Verify invalid file formats or missing videos fail gracefully"""
        with self.assertRaises(ValueError) as context:
            run_biomechanics_extraction_pipeline("non_existent_video_file.mp4")
        self.assertTrue("Could not open video file" in str(context.exception))

    def test_empty_corrupted_file_handling(self):
        """Phase 3 — Verify corrupted or zero-byte file rejection"""
        temp_corrupt = "corrupted_temp.mp4"
        with open(temp_corrupt, "wb") as f:
            f.write(b"NOT A REAL VIDEO FILE")
        
        try:
            with self.assertRaises(ValueError) as context:
                run_biomechanics_extraction_pipeline(temp_corrupt)
            self.assertTrue(
                "Could not open video file" in str(context.exception) or
                "Insufficient body landmarks" in str(context.exception)
            )
        finally:
            if os.path.exists(temp_corrupt):
                os.remove(temp_corrupt)

    def test_valid_sprint_metrics(self):
        """Phase 4 — Verify standard video metrics fall in realistic ranges"""
        if not os.path.exists(self.valid_video):
            self.skipTest(f"Test video not found at {self.valid_video}")
            
        result = run_biomechanics_extraction_pipeline(self.valid_video)
        self.assertIn("metrics", result)
        self.assertIn("footStrikes", result)
        
        metrics = result["metrics"]
        self.assertGreater(metrics["cadence"], 100) # realistic runner cadence
        self.assertGreater(metrics["gct"], 50)       # realistic ground contact time (ms)
        self.assertLess(metrics["gct"], 500)
        self.assertGreater(metrics["strideLength"], 0.5)
        self.assertGreaterEqual(metrics["symmetry"], 0.0)
        self.assertLessEqual(metrics["symmetry"], 100.0)

    def test_determinism_stability(self):
        """Phase 4 — Determinism check (runs 5 times to ensure stable calculations)"""
        if not os.path.exists(self.valid_video):
            self.skipTest(f"Test video not found at {self.valid_video}")

        runs = 5
        cadences = []
        gcts = []
        strides = []
        symmetries = []

        for _ in range(runs):
            res = run_biomechanics_extraction_pipeline(self.valid_video)
            metrics = res["metrics"]
            cadences.append(metrics["cadence"])
            gcts.append(metrics["gct"])
            strides.append(metrics["strideLength"])
            symmetries.append(metrics["symmetry"])

        # Check allowed variations: Cadence ±1, GCT ±5ms, Stride ±0.03m, Symmetry ±2%
        self.assertLessEqual(np.max(cadences) - np.min(cadences), 1.0, "Cadence variation exceeded threshold of ±1")
        self.assertLessEqual(np.max(gcts) - np.min(gcts), 5.0, "GCT variation exceeded threshold of ±5ms")
        self.assertLessEqual(np.max(strides) - np.min(strides), 0.03, "Stride length variation exceeded threshold of ±0.03m")
        self.assertLessEqual(np.max(symmetries) - np.min(symmetries), 2.0, "Symmetry variation exceeded threshold of ±2%")

if __name__ == '__main__':
    unittest.main()
