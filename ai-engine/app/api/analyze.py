import os
import threading
import time
import requests
import tempfile
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Any, Optional
from urllib.parse import urlparse

from app.api.security import check_internal_secret
from app.env import get_internal_secret

from app.config import DOWNLOAD_CHUNK_SIZE
from app.pipelines.biomechanics_pipeline import run_biomechanics_extraction_pipeline
from app.pipelines.scoring_pipeline import run_intelligence_pipeline
from app.pose.skeleton_overlay import render_skeleton_overlay_video

router = APIRouter()

_active_analyses: set[str] = set()
_cancelled_analyses: set[str] = set()
_active_lock = threading.Lock()


class AnalysisCancelledError(Exception):
    """Raised when a user cancels an in-flight analysis."""


def _mark_cancelled(analysis_id: str) -> None:
    with _active_lock:
        _cancelled_analyses.add(analysis_id)
        _active_analyses.discard(analysis_id)


def _is_cancelled(analysis_id: str) -> bool:
    with _active_lock:
        return analysis_id in _cancelled_analyses


def _ensure_not_cancelled(analysis_id: str) -> None:
    if _is_cancelled(analysis_id):
        raise AnalysisCancelledError(f"Analysis {analysis_id} was cancelled")

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


class CancelAnalysisRequest(BaseModel):
    analysisId: str

_IS_RENDER = os.environ.get('RENDER') == 'true'
_DEFAULT_BACKEND_URL = (
    'https://backend-n0z5.onrender.com' if _IS_RENDER else 'http://127.0.0.1:3001'
)
_DEFAULT_AI_ENGINE_URL = (
    'https://ai-engine-4dn5.onrender.com' if _IS_RENDER else 'http://127.0.0.1:8000'
)

BACKEND_BASE_URL = os.environ.get('BACKEND_URL', _DEFAULT_BACKEND_URL).rstrip('/')
NESTJS_CALLBACK_URL = f"{os.environ.get('BACKEND_URL', _DEFAULT_BACKEND_URL)}/api/analysis/callback"
NESTJS_OVERLAY_URL = f"{os.environ.get('BACKEND_URL', _DEFAULT_BACKEND_URL)}/api/analysis/overlay"
NESTJS_REPORT_URL = f"{os.environ.get('BACKEND_URL', _DEFAULT_BACKEND_URL)}/api/analysis/report"
AI_ENGINE_URL = os.environ.get('AI_ENGINE_URL', _DEFAULT_AI_ENGINE_URL)

OUTPUTS_DIR = "outputs"
# Overlays are only served from local disk when the Firebase upload failed;
# anything older than this is pruned so the disk cannot fill up.
OUTPUT_RETENTION_SEC = int(os.environ.get("OUTPUT_RETENTION_HOURS", "24")) * 3600

DEFAULT_ATHLETE_HEIGHT_M = 1.75


def _auth_headers() -> dict:
    return {"Authorization": f"Bearer {get_internal_secret()}"}


def _is_backend_url(url: str) -> bool:
    """True when url points at our backend, so the internal secret may be sent.

    localhost and 127.0.0.1 are treated as the same host so local development
    works whichever spelling each service is configured with.
    """
    target, backend = urlparse(url), urlparse(BACKEND_BASE_URL)
    local = {"localhost", "127.0.0.1"}
    same_host = target.hostname == backend.hostname or (
        target.hostname in local and backend.hostname in local
    )
    return (
        target.scheme == backend.scheme
        and same_host
        and (target.port or None) == (backend.port or None)
    )


def _video_download_headers(video_url: str) -> dict:
    # Firebase signed URLs need no auth; the backend's fallback source route
    # requires the internal secret, which must never be sent anywhere else.
    return _auth_headers() if _is_backend_url(video_url) else {}


def _athlete_height_m(ctx: AthleteContext | None) -> float:
    height_cm = ctx.heightCm if ctx else None
    if height_cm and 100 <= height_cm <= 250:
        return height_cm / 100.0
    return DEFAULT_ATHLETE_HEIGHT_M


def _prune_old_outputs() -> None:
    cutoff = time.time() - OUTPUT_RETENTION_SEC
    try:
        entries = os.scandir(OUTPUTS_DIR)
    except FileNotFoundError:
        return
    with entries:
        for entry in entries:
            if not entry.is_file() or not entry.name.endswith("_overlay.mp4"):
                continue
            try:
                if entry.stat().st_mtime < cutoff:
                    os.remove(entry.path)
            except OSError:
                pass


def _send_update(analysis_id: str, status: str, progress: int, payload: dict = None):
    if _is_cancelled(analysis_id):
        return
    data = {"analysisId": analysis_id, "status": status, "progress": progress}
    if payload:
        data.update(payload)
    headers = _auth_headers()
    retry_delays_sec = (0, 1, 2, 4, 8, 12)

    for attempt, delay in enumerate(retry_delays_sec):
        if delay:
            time.sleep(delay)
        try:
            response = requests.post(
                NESTJS_CALLBACK_URL,
                json=data,
                headers=headers,
                timeout=20,
            )
            if response.ok:
                return
            print(
                f"[AI CALLBACK] HTTP {response.status_code} for {analysis_id} "
                f"({status}) attempt {attempt + 1}"
            )
            # A 4xx (bad payload, auth) fails identically on every retry.
            if 400 <= response.status_code < 500 and response.status_code not in (408, 429):
                print(f"[AI CALLBACK] Giving up on {analysis_id}: {response.text[:300]}")
                return
        except Exception as e:
            print(f"[AI CALLBACK ERR] {analysis_id} attempt {attempt + 1}: {e}")


def _upload_overlay(analysis_id: str, user_id: str, overlay_path: str) -> bool:
    if not os.path.exists(overlay_path) or os.path.getsize(overlay_path) < 1024:
        return False
    try:
        with open(overlay_path, "rb") as f:
            r = requests.post(
                NESTJS_OVERLAY_URL,
                headers=_auth_headers(),
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
            headers=_auth_headers(),
            files={"file": ("report.html", html.encode("utf-8"), "text/html")},
            data={"analysisId": analysis_id, "userId": user_id},
            timeout=60,
        )
        return r.ok
    except Exception as e:
        print(f"[AI REPORT ERR] {e}")
    return False


def _run_intelligence(
    metrics: dict,
    analysis_id: str,
    athlete_context: AthleteContext | None,
    previous_metrics: dict | None,
    metric_flags: list[str] | None = None,
) -> dict:
    ctx = athlete_context or AthleteContext()
    return run_intelligence_pipeline(
        metrics,
        analysis_id=analysis_id,
        age_group=ctx.ageGroup,
        gender=ctx.gender,
        event=ctx.event,
        previous_metrics=previous_metrics,
        metric_flags=metric_flags,
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
        _prune_old_outputs()
        _ensure_not_cancelled(analysis_id)
        _send_update(analysis_id, "PROCESSING_POSE", 20)
        _ensure_not_cancelled(analysis_id)
        _send_update(analysis_id, "TRACKING_LANDMARKS", 40)

        result = run_biomechanics_extraction_pipeline(
            video_path, athlete_height_m=_athlete_height_m(athlete_context)
        )
        _ensure_not_cancelled(analysis_id)
        foot_strikes = result.get("footStrikes")
        result.pop("landmarkHistory", None)
        result.pop("footStrikes", None)
        metrics = result.get("metrics", {})

        # Validate biomechanical metrics (V3 scientific validation layer)
        from app.validation.biomechanics_validator import validate_biomechanics_metrics
        validated_metrics, metric_flags = validate_biomechanics_metrics(
            metrics, fps=result.get("fps")
        )

        _send_update(analysis_id, "DETECTING_FOOT_STRIKES", 55)

        _send_update(analysis_id, "CALCULATING_METRICS", 70)
        intelligence = _run_intelligence(
            validated_metrics, analysis_id, athlete_context, previous_metrics, metric_flags
        )
        print(f"[AI PIPELINE] Intelligence ready in {time.perf_counter() - t0:.2f}s")

        if intelligence.get("reportHtml"):
            _upload_report(analysis_id, user_id, intelligence["reportHtml"])

        _ensure_not_cancelled(analysis_id)
        _send_update(analysis_id, "GENERATING_OVERLAY", 85)

        os.makedirs(OUTPUTS_DIR, exist_ok=True)
        overlay_path = f"{OUTPUTS_DIR}/{analysis_id}_overlay.mp4"
        # None = keep the durable storage path the backend already recorded.
        overlay_url: str | None = None
        try:
            render_skeleton_overlay_video(video_path, overlay_path, foot_strikes=foot_strikes)
            skeleton_overlay_ready = True

            # Upload to Firebase via the backend before reporting completion. On
            # success the backend has stored the storage path, which must not be
            # overwritten with this instance's ephemeral disk URL.
            if _upload_overlay(analysis_id, user_id, overlay_path):
                try:
                    os.remove(overlay_path)
                except OSError:
                    pass
            else:
                print(f"[AI OVERLAY] Upload failed for {analysis_id}; serving from local disk")
                overlay_url = f"{AI_ENGINE_URL}/{OUTPUTS_DIR}/{analysis_id}_overlay.mp4"
        except Exception as e:
            print(f"[AI OVERLAY ERR] {e}")
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

    except AnalysisCancelledError:
        print(f"[AI PIPELINE] Cancelled by user: {analysis_id}")
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
        _ensure_not_cancelled(analysis_id)
        with requests.get(
            video_url,
            headers=_video_download_headers(video_url),
            stream=True,
            timeout=60,
        ) as response:
            response.raise_for_status()
            for chunk in response.iter_content(chunk_size=DOWNLOAD_CHUNK_SIZE):
                if chunk:
                    _ensure_not_cancelled(analysis_id)
                    temp_video.write(chunk)
        temp_video.close()
        run_analysis_from_path(
            analysis_id,
            temp_video.name,
            user_id,
            athlete_context,
            previous_metrics,
        )
    except AnalysisCancelledError:
        print(f"[AI PIPELINE] Cancelled by user: {analysis_id}")
    except Exception as err:
        _send_update(analysis_id, "FAILED", 0, {"errorMessage": str(err)})
    finally:
        # The overlay is rendered synchronously, so nothing reads the
        # downloaded video once run_analysis_from_path has returned.
        temp_video.close()
        try:
            os.unlink(temp_video.name)
        except OSError:
            pass


def _start_analysis_background(
    analysis_id: str,
    video_url: str,
    user_id: str,
    athlete_context: AthleteContext | None = None,
    previous_metrics: dict | None = None,
) -> bool:
    with _active_lock:
        if analysis_id in _active_analyses:
            print(f"[AI PIPELINE] Duplicate trigger ignored for {analysis_id}")
            return False
        _active_analyses.add(analysis_id)

    def _run():
        try:
            _ensure_not_cancelled(analysis_id)
            _send_update(
                analysis_id,
                "PROCESSING_POSE",
                12,
                {"statusMessage": "Analysis engine received your running video."},
            )
            run_analysis_pipeline(
                analysis_id,
                video_url,
                user_id,
                athlete_context,
                previous_metrics,
            )
        except AnalysisCancelledError:
            print(f"[AI PIPELINE] Cancelled by user: {analysis_id}")
        finally:
            with _active_lock:
                _active_analyses.discard(analysis_id)
                _cancelled_analyses.discard(analysis_id)

    threading.Thread(target=_run, daemon=True, name=f"analysis-{analysis_id}").start()
    return True


@router.post("/analyze/cancel", dependencies=[Depends(check_internal_secret)])
def cancel_analysis(payload: CancelAnalysisRequest):
    _mark_cancelled(payload.analysisId)
    print(f"[AI PIPELINE] Cancel requested for {payload.analysisId}")
    return {
        "success": True,
        "status": "CANCELLED",
        "analysisId": payload.analysisId,
    }


@router.post("/analyze", status_code=202, dependencies=[Depends(check_internal_secret)])
def trigger_analysis(payload: AnalysisRequest):
    started = _start_analysis_background(
        payload.analysisId,
        payload.videoUrl,
        payload.userId,
        payload.athleteContext,
        payload.previousMetrics,
    )
    return {
        "success": True,
        "status": "ACCEPTED" if started else "ALREADY_RUNNING",
        "analysisId": payload.analysisId,
    }


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
