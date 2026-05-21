import os
import sys
import numpy as np
import time

# Ensure we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.pipelines.biomechanics_pipeline import run_biomechanics_extraction_pipeline
from app.config import DEBUG_MODE, MIN_REQUIRED_FPS

def run_validation(video_path: str, iterations: int = 20):
    if not os.path.exists(video_path):
        print(f"[FAIL] Test video not found at {video_path}")
        print("Please place a sprint video in the test-videos/ directory.")
        return

    print(f"[START] Starting Determinism Validation on {video_path}")
    print(f"Iterations: {iterations}")
    print("-" * 50)

    results_cadence = []
    results_gct = []
    results_stride = []
    results_symmetry = []

    for i in range(iterations):
        print(f"Run {i+1}/{iterations}...", end="", flush=True)
        t0 = time.time()
        try:
            # We enforce deterministic extraction 
            result = run_biomechanics_extraction_pipeline(video_path)
            metrics = result["metrics"]
            
            cadence = metrics["cadence"]
            gct = metrics["gct"]
            stride = metrics["strideLength"]
            symmetry = metrics["symmetry"]

            results_cadence.append(cadence)
            results_gct.append(gct)
            results_stride.append(stride)
            results_symmetry.append(symmetry)
            
            print(f" Done ({time.time()-t0:.2f}s) -> Cadence: {cadence} | GCT: {gct}ms")
            
        except Exception as e:
            print(f" FAILED: {e}")

    if not results_cadence:
        print("No successful runs.")
        return

    print("\n" + "=" * 50)
    print("[RESULTS] DETERMINISM METRICS")
    print("=" * 50)

    def print_stats(name, data, allowed_variance):
        min_v = np.min(data)
        max_v = np.max(data)
        std_v = np.std(data)
        variance = max_v - min_v
        
        status = "[STABLE]" if variance <= allowed_variance else "[UNSTABLE]"
        print(f"{name.ljust(15)} | Min: {min_v:.2f} | Max: {max_v:.2f} | StdDev: {std_v:.2f} | Var: {variance:.2f} | {status}")

    print_stats("Cadence (SPM)", results_cadence, 2.0)
    print_stats("GCT (ms)", results_gct, 10.0)
    print_stats("Stride (m)", results_stride, 0.06)
    print_stats("Symmetry (%)", results_symmetry, 4.0)

if __name__ == "__main__":
    test_video = "../test-videos/sprint.mp4"
    iters = 20
    if len(sys.argv) > 1:
        test_video = sys.argv[1]
    if len(sys.argv) > 2:
        iters = int(sys.argv[2])
    
    run_validation(test_video, iterations=iters)
