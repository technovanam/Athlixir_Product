'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../../context/AuthContext';
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward,
  Settings2, Activity, Target, Download, Share2, AlertTriangle, FileText,
} from 'lucide-react';
import InsightsWidget from '../../components/InsightsWidget';
import BenchmarkWidget from '../../components/BenchmarkWidget';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../../components/DataFetchError';

export default function AnalysisDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);

  const handleDownloadReport = async () => {
    setDownloading(true);
    try {
      const response = await api.get(`/analysis/${id}/report`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/html' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `athlixir_sports_science_report_${id}.html`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to download report', err);
      alert('AI Sports Science Report is generating in the background. Please give it 5-10 seconds and try again!');
    } finally {
      setDownloading(false);
    }
  };

  // Video Controls State
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLVideoElement>(null);

  const fetchAnalysis = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/analysis/${id}`);
      setFetchError(null);
      setAnalysis(res.data?.data || res.data);
    } catch (err) {
      console.error('Failed to load analysis', err);
      // A 404 here already means "not found or not yours" per the ownership
      // check on the backend — that's the existing honest "Analysis not
      // found" screen below, not a DataFetchError. Only genuinely
      // unexpected failures (500, network, etc.) get the retry UI.
      const presentation = classifyFetchError(err);
      if (presentation.status !== 404) {
        setFetchError(presentation);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      if (overlayRef.current && Math.abs(overlayRef.current.currentTime - videoRef.current.currentTime) > 0.1) {
        overlayRef.current.currentTime = videoRef.current.currentTime;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        overlayRef.current?.pause();
      } else {
        videoRef.current.play();
        overlayRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeSpeed = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    if (overlayRef.current) overlayRef.current.playbackRate = rate;
  };

  const stepFrame = (forward: boolean) => {
    if (videoRef.current) {
      videoRef.current.pause();
      overlayRef.current?.pause();
      setIsPlaying(false);
      const step = forward ? 0.033 : -0.033;
      videoRef.current.currentTime += step;
      if (overlayRef.current) overlayRef.current.currentTime += step;
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      if (overlayRef.current) overlayRef.current.currentTime = time;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F7F7F8]">
        <Activity className="h-7 w-7 animate-spin text-[#FF4F21]" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-[#F7F7F8] px-6">
        <DataFetchError error={fetchError} onRetry={fetchAnalysis} className="max-w-sm" />
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#F7F7F8] text-center px-6">
        <AlertTriangle className="h-10 w-10 mb-4 text-amber-500" />
        <h2 className="text-lg font-black text-zinc-900">Analysis not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-[#FF4F21] text-sm font-bold">Go Back</button>
      </div>
    );
  }

  const metrics = analysis.metrics || {};

  // kneeDrive previously fell back to efficiencyScore (an unrelated metric)
  // and then to a hardcoded 62 when neither existed — both fabricated.
  // Now: real kneeDrive field only, or null (rendered as "Not assessed").
  const kneeDrive: number | null = typeof metrics.kneeDrive === 'number' ? metrics.kneeDrive : null;
  let kneeDriveStatus = 'Not assessed';
  let kneeDriveColor = 'text-zinc-400';
  let kneeDriveBg = 'bg-zinc-300';
  if (kneeDrive !== null) {
    if (kneeDrive >= 75) {
      kneeDriveStatus = 'Optimal'; kneeDriveColor = 'text-emerald-600'; kneeDriveBg = 'bg-emerald-500';
    } else if (kneeDrive < 60) {
      kneeDriveStatus = 'Restricted'; kneeDriveColor = 'text-red-600'; kneeDriveBg = 'bg-red-500';
    } else {
      kneeDriveStatus = 'Moderate'; kneeDriveColor = 'text-amber-600'; kneeDriveBg = 'bg-amber-500';
    }
  }

  const postureAngle: number | null = typeof metrics.postureAngle === 'number' ? metrics.postureAngle : null;
  let postureStatus = 'Not assessed';
  let postureColor = 'text-zinc-400';
  let postureBg = 'bg-zinc-300';
  const postureProgress = postureAngle !== null ? Math.min(100, Math.max(10, (postureAngle / 15) * 100)) : 0;
  if (postureAngle !== null) {
    if (postureAngle < 4) {
      postureStatus = 'Upright'; postureColor = 'text-amber-600'; postureBg = 'bg-amber-500';
    } else if (postureAngle > 12) {
      postureStatus = 'Excessive Lean'; postureColor = 'text-red-600'; postureBg = 'bg-red-500';
    } else {
      postureStatus = 'Optimal'; postureColor = 'text-emerald-600'; postureBg = 'bg-emerald-500';
    }
  }

  const overstrideAngle: number | null = typeof metrics.overstrideAngle === 'number' ? metrics.overstrideAngle : null;
  let strikeStatus = 'Not assessed';
  let strikeColor = 'text-zinc-400';
  let strikeBg = 'bg-zinc-300';
  const strikeProgress = overstrideAngle !== null ? Math.min(100, Math.max(10, 100 - (overstrideAngle / 10) * 100)) : 0;
  if (overstrideAngle !== null) {
    if (overstrideAngle <= 3) {
      strikeStatus = 'Optimal'; strikeColor = 'text-emerald-600'; strikeBg = 'bg-emerald-500';
    } else if (overstrideAngle > 6) {
      strikeStatus = 'Severe Overstride'; strikeColor = 'text-red-600'; strikeBg = 'bg-red-500';
    } else {
      strikeStatus = 'Mild Overstride'; strikeColor = 'text-amber-600'; strikeBg = 'bg-amber-500';
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 rounded-full bg-white border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-zinc-700 hover:text-[#FF4F21] active:scale-95 transition shrink-0 cursor-pointer"
              aria-label="Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <h1
                style={{
                  fontFamily: "'Mazzard', sans-serif",
                  fontWeight: 600,
                  fontSize: '20px',
                  color: '#1D1B20',
                }}
                className="leading-tight"
              >
                Analysis Details
              </h1>
              <p
                style={{
                  fontFamily: "'Mazzard', sans-serif",
                  fontSize: '12px',
                  color: '#8C8C8C',
                }}
              >
                {new Date(analysis.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              className="h-10 w-10 rounded-full bg-white border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-zinc-700 hover:text-[#FF4F21] active:scale-95 transition cursor-pointer"
              title="Share"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <Link
              href={`/report/${id}`}
              className="h-10 w-10 rounded-full bg-white border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center justify-center text-zinc-700 hover:text-[#FF4F21] active:scale-95 transition cursor-pointer"
              title="View printable report"
            >
              <FileText className="h-4 w-4" />
            </Link>
            <button
              onClick={handleDownloadReport}
              disabled={downloading}
              className="h-10 w-10 rounded-full bg-[#FF4F21] shadow-[0_4px_14px_rgba(255,79,33,0.3)] flex items-center justify-center text-white active:scale-95 transition disabled:opacity-50 cursor-pointer"
              title="Download report"
            >
              <Download className={`h-4 w-4 ${downloading ? 'animate-bounce' : ''}`} />
            </button>
          </div>
        </div>

        {/* Video Player — dark cinema theme */}
        <div className="rounded-[24px] bg-[#08080C] overflow-hidden relative shadow-[0_2px_12px_rgba(0,0,0,0.05)] border border-black/10">
          <div className="absolute top-3.5 left-3.5 z-10 flex gap-2">
            <span className="bg-black/60 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-white flex items-center gap-1.5" style={{ fontFamily: "'Mazzard', sans-serif" }}>
              <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> RAW
            </span>
            {analysis.overlayVideoUrl && (
              <span className="bg-blue-500/20 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-bold text-blue-300 flex items-center gap-1.5" style={{ fontFamily: "'Mazzard', sans-serif" }}>
                <Activity className="h-3.5 w-3.5" /> TRACKING
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 bg-black">
            <div className="relative aspect-video">
              <video
                ref={videoRef}
                src={analysis.videoUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
              />
            </div>
            <div className="relative aspect-video border-t border-white/[0.05]">
              {analysis.overlayVideoUrl ? (
                <video ref={overlayRef} src={analysis.overlayVideoUrl} className="w-full h-full object-contain" muted />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50">
                  <Settings2 className="h-7 w-7 mb-2 opacity-50 animate-spin" />
                  <span className="text-[11px] font-semibold" style={{ fontFamily: "'Mazzard', sans-serif" }}>Processing Pose Overlay...</span>
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="p-4 bg-black/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[11px] font-mono text-zinc-400 w-10 text-right">{currentTime.toFixed(1)}s</span>
              <input
                type="range" min={0} max={duration} step="0.01" value={currentTime} onChange={seek}
                className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FF4F21]"
              />
              <span className="text-[11px] font-mono text-zinc-400 w-10">{duration.toFixed(1)}s</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => stepFrame(false)} className="h-9 w-9 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center active:scale-95 transition cursor-pointer">
                  <SkipBack className="h-4 w-4 text-zinc-300" />
                </button>
                <button onClick={togglePlay} className="h-10 w-10 rounded-full bg-[#FF4F21] shadow-[0_2px_10px_rgba(255,79,33,0.4)] flex items-center justify-center active:scale-95 transition cursor-pointer">
                  {isPlaying ? <Pause className="h-4.5 w-4.5 text-white" /> : <Play className="h-4.5 w-4.5 text-white ml-0.5" />}
                </button>
                <button onClick={() => stepFrame(true)} className="h-9 w-9 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 flex items-center justify-center active:scale-95 transition cursor-pointer">
                  <SkipForward className="h-4 w-4 text-zinc-300" />
                </button>
              </div>

              <div className="flex items-center gap-1 bg-zinc-900/80 rounded-xl p-1">
                {[1, 0.5, 0.25].map(rate => (
                  <button
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    style={{ fontFamily: "'Mazzard', sans-serif" }}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${playbackRate === rate ? 'bg-[#FF4F21] text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Running Metrics */}
        <div className="rounded-[24px] bg-white border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
          <h3 className="text-xs font-bold text-[#FF4F21] mb-4 uppercase tracking-wider" style={{ fontFamily: "'Mazzard', sans-serif" }}>Running Metrics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="bg-[#F8F8FA] p-4 rounded-2xl border border-[#F0F0F2]">
              <div className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-wider mb-1" style={{ fontFamily: "'Mazzard', sans-serif" }}>Cadence</div>
              <div className="text-xl font-bold text-[#1D1B20]" style={{ fontFamily: "'Mazzard', sans-serif" }}>{metrics.cadence || '—'} <span className="text-[11px] font-normal text-[#8C8C8C]">spm</span></div>
            </div>
            <div className="bg-[#F8F8FA] p-4 rounded-2xl border border-[#F0F0F2]">
              <div className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-wider mb-1" style={{ fontFamily: "'Mazzard', sans-serif" }}>GCT</div>
              <div className="text-xl font-bold text-[#FF4F21]" style={{ fontFamily: "'Mazzard', sans-serif" }}>{metrics.gct || '—'} <span className="text-[11px] font-normal text-[#FF4F21]/70">ms</span></div>
            </div>
            <div className="bg-[#F8F8FA] p-4 rounded-2xl border border-[#F0F0F2]">
              <div className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-wider mb-1" style={{ fontFamily: "'Mazzard', sans-serif" }}>Stride Length</div>
              <div className="text-xl font-bold text-[#1D1B20]" style={{ fontFamily: "'Mazzard', sans-serif" }}>{metrics.strideLength || '—'} <span className="text-[11px] font-normal text-[#8C8C8C]">m</span></div>
            </div>
            <div className="bg-[#F8F8FA] p-4 rounded-2xl border border-[#F0F0F2]">
              <div className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-wider mb-1" style={{ fontFamily: "'Mazzard', sans-serif" }}>Symmetry</div>
              <div className="text-xl font-bold text-emerald-600" style={{ fontFamily: "'Mazzard', sans-serif" }}>
                {metrics.symmetry !== undefined && metrics.symmetry !== null ? (
                  <>{metrics.symmetry}<span className="text-[11px] font-normal text-[#8C8C8C]">%</span></>
                ) : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Biomechanical Form */}
        <div className="rounded-[24px] bg-white border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
          <h3 className="text-xs font-bold text-[#1D1B20] mb-4 uppercase tracking-wider" style={{ fontFamily: "'Mazzard', sans-serif" }}>Biomechanical Form</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#1D1B20] mb-2" style={{ fontFamily: "'Mazzard', sans-serif" }}>
                <span>Knee Drive</span>
                <span className={kneeDriveColor}>{kneeDriveStatus}</span>
              </div>
              <div className="h-2 w-full bg-[#F2F2F7] rounded-full overflow-hidden">
                <div className={`h-full ${kneeDriveBg}`} style={{ width: `${kneeDrive ?? 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#1D1B20] mb-2" style={{ fontFamily: "'Mazzard', sans-serif" }}>
                <span>Posture Angle</span>
                <span className={postureColor}>{postureStatus}</span>
              </div>
              <div className="h-2 w-full bg-[#F2F2F7] rounded-full overflow-hidden">
                <div className={`h-full ${postureBg}`} style={{ width: `${postureProgress}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-[#1D1B20] mb-2" style={{ fontFamily: "'Mazzard', sans-serif" }}>
                <span>Foot Strike</span>
                <span className={strikeColor}>{strikeStatus}</span>
              </div>
              <div className="h-2 w-full bg-[#F2F2F7] rounded-full overflow-hidden">
                <div className={`h-full ${strikeBg}`} style={{ width: `${strikeProgress}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Biomechanical Events Timeline */}
        {analysis.aiTimeline?.length > 0 && (
          <div className="rounded-[24px] bg-white border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
            <h3 className="text-xs font-bold text-[#8C8C8C] mb-4 flex items-center gap-1.5 uppercase tracking-wider" style={{ fontFamily: "'Mazzard', sans-serif" }}>
              <Activity className="h-4 w-4 text-[#FF4F21]" /> Biomechanical Events Timeline
            </h3>
            <div className="relative pl-5 border-l-2 border-[#EBEBEB] space-y-4">
              {analysis.aiTimeline.map((item: any, idx: number) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[27px] top-1 h-3 w-3 rounded-full ring-2 ring-white ${
                    item.severity === 'warning' ? 'bg-[#FF4F21]' : item.severity === 'optimal' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex gap-3 items-start">
                    <span className="text-xs font-mono font-bold text-[#8C8C8C] w-12 mt-0.5 shrink-0">{item.time}</span>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1D1B20]" style={{ fontFamily: "'Mazzard', sans-serif" }}>{item.phase}</h4>
                      <p className="text-xs text-[#6E6D6D] mt-0.5" style={{ fontFamily: "'Mazzard', sans-serif" }}>{item.event}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Benchmark Widget */}
        <BenchmarkWidget analysis={analysis} />

        {/* Insights Widget */}
        <InsightsWidget analysis={analysis} />

        {/* Targeted Recommendations */}
        <div className="rounded-[24px] bg-white border border-[#EBEBEB] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-4 w-4 text-[#FF4F21]" />
            <h3 className="text-sm font-semibold text-[#1D1B20]" style={{ fontFamily: "'Mazzard', sans-serif" }}>Targeted Recommendations</h3>
          </div>
          <div className="space-y-3">
            {analysis.aiRecommendations ? (
              <>
                <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-[#F0F0F2]">
                  <h4 className="text-xs font-bold text-[#1D1B20] mb-2.5" style={{ fontFamily: "'Mazzard', sans-serif" }}>Coaching Drills Focus</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.aiRecommendations.drills?.map((d: any, idx: number) => {
                      const text = typeof d === 'object' ? d.name || d.drill || d.title || d.text || JSON.stringify(d) : String(d);
                      return (
                        <span key={idx} className="px-3 py-1 rounded-xl bg-[#FFF2EE] text-[#FF4F21] text-xs font-semibold border border-[#FFE0D6]" style={{ fontFamily: "'Mazzard', sans-serif" }}>{text}</span>
                      );
                    })}
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-[#F0F0F2]">
                  <h4 className="text-xs font-bold text-[#1D1B20] mb-2.5" style={{ fontFamily: "'Mazzard', sans-serif" }}>Corrective Exercises</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysis.aiRecommendations.correctiveExercises?.map((e: any, idx: number) => {
                      const text = typeof e === 'object' ? e.name || e.exercise || e.title || e.text || JSON.stringify(e) : String(e);
                      return (
                        <span key={idx} className="px-3 py-1 rounded-xl bg-cyan-50 text-cyan-700 text-xs font-semibold border border-cyan-200/60" style={{ fontFamily: "'Mazzard', sans-serif" }}>{text}</span>
                      );
                    })}
                  </div>
                </div>
                {analysis.aiRecommendations.recovery?.length > 0 && (
                  <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-[#F0F0F2]">
                    <h4 className="text-xs font-bold text-[#1D1B20] mb-2" style={{ fontFamily: "'Mazzard', sans-serif" }}>Load Management & Recovery</h4>
                    <p className="text-xs text-[#6E6D6D] leading-relaxed" style={{ fontFamily: "'Mazzard', sans-serif" }}>
                      {Array.isArray(analysis.aiRecommendations.recovery)
                        ? analysis.aiRecommendations.recovery.map((r: any) => typeof r === 'object' ? r.item || r.text || JSON.stringify(r) : String(r)).join(', ')
                        : String(analysis.aiRecommendations.recovery)}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-[#8C8C8C] font-medium py-1" style={{ fontFamily: "'Mazzard', sans-serif" }}>
                AI recommendations are not available for this analysis yet.
              </p>
            )}
          </div>
          {analysis.aiRecommendations?.trainingPlan && (
            <div className="mt-3 p-4 rounded-2xl bg-[#F8F8FA] border border-[#F0F0F2]">
              <span className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-wider block mb-1.5" style={{ fontFamily: "'Mazzard', sans-serif" }}>Focus Training Block</span>
              <p className="text-xs text-[#1D1B20] font-medium leading-relaxed" style={{ fontFamily: "'Mazzard', sans-serif" }}>{analysis.aiRecommendations.trainingPlan.join(' • ')}</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
