import os
import shutil
import threading
import time
import requests
import tempfile
from fastapi import APIRouter, BackgroundTasks, File, Form, UploadFile, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Optional

from app.api.security import check_internal_secret

from app.config import DOWNLOAD_CHUNK_SIZE
from app.pipelines.biomechanics_pipeline import run_biomechanics_extraction_pipeline
from app.pipelines.scoring_pipeline import run_intelligence_pipeline
from app.pose.skeleton_overlay import render_skeleton_overlay_video

router = APIRouter()

class AthleteContext(BaseModel):
    ageGroup: Optional[str] = None
    gender: Optional[str] = None
    event: Optional[str] = None
    heightCm: Optional[float] = None

class AnalysisRequest(BaseModel):
    analysisId: str
    videoUrl: str
    userId: str
    athleteContext: Optional[AthleteContext] = None
    previousMetrics: Optional[dict[str, Any]] = None

NESTJS_CALLBACK_URL = f"{os.environ.get('BACKEND_URL', 'http://127.0.0.1:3001')}/api/analysis/callback"
NESTJS_OVERLAY_URL = f"{os.environ.get('BACKEND_URL', 'http://127.0.0.1:3001')}/api/analysis/overlay"
NESTJS_REPORT_URL = f"{os.environ.get('BACKEND_URL', 'http://127.0.0.1:3001')}/api/analysis/report"
AI_ENGINE_URL = os.environ.get('AI_ENGINE_URL', 'http://127.0.0.1:8000')


def _send_update(analysis_id: str, status: str, progress: int, payload: dict = None):
    data = {"analysisId": analysis_id, "status": status, "progress": progress}
    if payload:
        data.update(payload)
    try:
        requests.post(NESTJS_CALLBACK_URL, json=data, timeout=10)
    except Exception as e:
        print(f"[AI CALLBACK ERR] {e}")


def _upload_overlay(analysis_id: str, user_id: str, overlay_path: str) -> bool:
    if not os.path.exists(overlay_path) or os.path.getsize(overlay_path) < 1024:
        return False
    try:
        with open(overlay_path, "rb") as f:
            r = requests.post(
                NESTJS_OVERLAY_URL,
                files={"file": ("skeleton_overlay.mp4", f, "video/mp4")},
                data={"analysisId": analysis_id, "userId": user_id},
                timeout=120,
            )
            return r.ok
    except Exception as e:
        print(f"[AI OVERLAY ERR] {e}")
    return False


def _upload_report(analysis_id: str, user_id: str, html: str) -> bool:
    if not html:
        return False
    try:
        r = requests.post(
            NESTJS_REPORT_URL,
            files={"file": ("report.html", html.encode("utf-8"), "text/html")},
            data={"analysisId": analysis_id, "userId": user_id},
            timeout=60,
        )
        return r.ok
    except Exception as e:
        print(f"[AI REPORT ERR] {e}")
    return False


def _overlay_worker(analysis_id: str, user_id: str, video_path: str):
    os.makedirs("outputs", exist_ok=True)
    overlay_path = f"outputs/{analysis_id}_overlay.mp4"
    try:
        render_skeleton_overlay_video(video_path, overlay_path)
        
        # Build public HTTP URL
        overlay_url = f"{AI_ENGINE_URL}/outputs/{analysis_id}_overlay.mp4"
        
        # Report COMPLETED immediately with the proper static HTTP URL
        _send_update(
            analysis_id,
            "COMPLETED",
            100,
            {
                "skeletonOverlayReady": True,
                "skeletonOverlayPath": overlay_url,
            },
        )
        
        # Safe Firebase background upload fallback
        try:
            _upload_overlay(analysis_id, user_id, overlay_path)
        except Exception as upload_err:
            print(f"[AI OVERLAY UPLOAD BACKUP ERR] {upload_err}")
            
    except Exception as e:
        print(f"[AI OVERLAY WORKER ERR] {e}")



def _run_intelligence(
    metrics: dict,
    analysis_id: str,
    athlete_context: AthleteContext | None,
    previous_metrics: dict | None,
) -> dict:
    ctx = athlete_context or AthleteContext()
    return run_intelligence_pipeline(
        metrics,
        analysis_id=analysis_id,
        age_group=ctx.ageGroup,
        gender=ctx.gender,
        event=ctx.event,
        previous_metrics=previous_metrics,
    )


def run_analysis_from_path(
    analysis_id: str,
    video_path: str,
    user_id: str,
    athlete_context: AthleteContext | None = None,
    previous_metrics: dict | None = None,
):
    t0 = time.perf_counter()
    print(f"[AI PIPELINE] Processing file for {analysis_id}")

    try:
        _send_update(analysis_id, "QUEUED", 5)
        _send_update(analysis_id, "PROCESSING_POSE", 20)
        _send_update(analysis_id, "TRACKING_LANDMARKS", 40)

        result = run_biomechanics_extraction_pipeline(video_path)
        foot_strikes = result.get("footStrikes")
        result.pop("landmarkHistory", None)
        result.pop("footStrikes", None)
        metrics = result.get("metrics", {})

        # Validate biomechanical metrics (V3 scientific validation layer)
        from app.validation.biomechanics_validator import validate_biomechanics_metrics
        validated_metrics, metric_flags = validate_biomechanics_metrics(metrics)

        _send_update(analysis_id, "DETECTING_FOOT_STRIKES", 55)
        time.sleep(0.5)

        _send_update(analysis_id, "CALCULATING_METRICS", 70)
        intelligence = _run_intelligence(
            validated_metrics, analysis_id, athlete_context, previous_metrics
        )
        print(f"[AI PIPELINE] Intelligence ready in {time.perf_counter() - t0:.2f}s")

        if intelligence.get("reportHtml"):
            _upload_report(analysis_id, user_id, intelligence["reportHtml"])

        _send_update(analysis_id, "GENERATING_OVERLAY", 85)

        os.makedirs("outputs", exist_ok=True)
        overlay_path = f"outputs/{analysis_id}_overlay.mp4"
        try:
            render_skeleton_overlay_video(video_path, overlay_path, foot_strikes=foot_strikes)
            overlay_url = f"{AI_ENGINE_URL}/outputs/{analysis_id}_overlay.mp4"
            skeleton_overlay_ready = True

            # Safe Firebase background upload fallback
            threading.Thread(
                target=_upload_overlay,
                args=(analysis_id, user_id, overlay_path),
                daemon=True,
            ).start()
        except Exception as e:
            print(f"[AI OVERLAY ERR] {e}")
            overlay_url = ""
            skeleton_overlay_ready = False

        payload = {
            "metrics": intelligence["metrics"],
            "benchmarks": intelligence["benchmarks"],
            "scores": intelligence["scores"],
            "classification": intelligence["classification"],
            "injuryRisk": intelligence["injuryRisk"],
            "injuryRisks": intelligence["injuryRisks"],
            "insights": intelligence["insights"],
            "recommendations": intelligence["recommendations"],
            "progress": intelligence.get("progress"),
            "reportReady": bool(intelligence.get("reportHtml")),
            "fps": result.get("fps"),
            "durationSec": result.get("durationSec"),
            "landmarkFrameCount": result.get("landmarkFrameCount"),
            "skeletonOverlayReady": skeleton_overlay_ready,
            "skeletonOverlayPath": overlay_url,
            "metricFlags": metric_flags,
        }
        payload = {k: v for k, v in payload.items() if v is not None}

        # ONLY emit completion AFTER overlay is saved and URL is built
        _send_update(analysis_id, "COMPLETED", 100, payload)

    except Exception as err:
        print(f"[AI PIPELINE ERR] {err}")
        _send_update(analysis_id, "FAILED", 0, {"errorMessage": str(err)})


def run_analysis_pipeline(
    analysis_id: str,
    video_url: str,
    user_id: str,
    athlete_context: AthleteContext | None = None,
    previous_metrics: dict | None = None,
):
    temp_video = tempfile.NamedTemporaryFile(delete=False, suffix=".mp4")
    try:
        _send_update(analysis_id, "QUEUED", 5)
        response = requests.get(video_url, stream=True, timeout=60)
        response.raise_for_status()
        for chunk in response.iter_content(chunk_size=DOWNLOAD_CHUNK_SIZE):
            if chunk:
                temp_video.write(chunk)
        temp_video.close()
        run_analysis_from_path(
            analysis_id,
            temp_video.name,
            user_id,
            athlete_context,
            previous_metrics,
        )
    except Exception as err:
        _send_update(analysis_id, "FAILED", 0, {"errorMessage": str(err)})
    finally:
        def _cleanup():
            time.sleep(120)
            if os.path.exists(temp_video.name):
                os.unlink(temp_video.name)

        threading.Thread(target=_cleanup, daemon=True).start()


@router.post("/analyze/upload")
async def analyze_upload(
    background_tasks: BackgroundTasks,
    analysisId: str = Form(...),
    userId: str = Form(...),
    file: UploadFile = File(...),
):
    temp_dir = tempfile.mkdtemp(prefix="athlixir_upload_")
    temp_path = os.path.join(temp_dir, "upload.mp4")
    with open(temp_path, "wb") as out:
        shutil.copyfileobj(file.file, out)

    background_tasks.add_task(run_analysis_from_path, analysisId, temp_path, userId)

    def _cleanup():
        time.sleep(120)
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
            os.rmdir(temp_dir)
        except OSError:
            pass

    background_tasks.add_task(_cleanup)
    return {"success": True, "status": "PROCESSING_POSE"}


@router.post("/analyze")
def trigger_analysis(payload: AnalysisRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(
        run_analysis_pipeline,
        payload.analysisId,
        payload.videoUrl,
        payload.userId,
        payload.athleteContext,
        payload.previousMetrics,
    )
    return {"success": True, "status": "PROCESSING_POSE"}


class IntelligenceRequest(BaseModel):
    analyses: list[dict[str, Any]]

@router.post("/analyze/intelligence", dependencies=[Depends(check_internal_secret)])
def generate_intelligence(payload: IntelligenceRequest):
    import traceback
    import sys
    print(f"[AI INTEL] Received request with {len(payload.analyses)} analyses", flush=True)
    try:
        from app.scoring.evolution_engine import compute_athlete_evolution
        from app.scoring.consistency_engine import calculate_consistency
        from app.scoring.adaptation_engine import calculate_adaptation
        from app.scoring.advanced_injury_engine import calculate_advanced_injury_risk
        from app.scoring.forecast_engine import calculate_forecast
        from app.scoring.talent_engine import evaluate_talent
        from app.scoring.timeline_engine import generate_timeline

        evolution = compute_athlete_evolution(payload.analyses)
        consistency = calculate_consistency(payload.analyses)
        adaptation = calculate_adaptation(payload.analyses)
        injury_insights = calculate_advanced_injury_risk(payload.analyses)
        forecast = calculate_forecast(payload.analyses)
        talent_flags = evaluate_talent(payload.analyses, adaptation.get("adaptation_score", 0))
        timeline = generate_timeline(payload.analyses)

        return {
            "evolution": evolution,
            "consistency": consistency,
            "adaptation": adaptation,
            "advanced_injury": injury_insights,
            "forecast": forecast,
            "talent": talent_flags,
            "timeline": timeline,
        }
    except Exception as e:
        print(f"[AI INTEL ERR] Exception in generate_intelligence: {e}", file=sys.stderr, flush=True)
        traceback.print_exc(file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"AI Engine Error: {str(e)}")
