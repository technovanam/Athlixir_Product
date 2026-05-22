'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../context/AuthContext';
import { io, Socket } from 'socket.io-client';
import {
  UploadCloud,
  FileVideo,
  Gauge,
  Zap,
  Compass,
  TrendingUp,
  AlertTriangle,
  Trophy,
  Shield,
  Activity,
  Target,
  CheckCircle,
  ExternalLink,
  BookOpen,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

type AnalysisRecord = {
  id?: string;
  analysisId?: string;
  status?: string;
  progress?: number;
  createdAt?: string;
  metrics?: {
    cadence?: number;
    gct?: number;
    strideLength?: number;
    asymmetryIndex?: number;
    symmetry?: number;
    oscillation?: number;
    overstrideAngle?: number;
    postureAngle?: number;
  };
  benchmarks?: {
    profileLabel?: string;
    cadenceLevel?: string;
    gctLevel?: string;
    strideLevel?: string;
    levels?: { cadence?: string; gct?: string; strideLength?: string };
  };
  scores?: {
    performanceScore?: number;
    efficiencyScore?: number;
    biomechanicsScore?: number;
    injuryRiskScore?: number;
    athleteLevel?: string;
  };
  classification?: { athleteLevel?: string; classification?: string };
  injuryRisk?: { level?: string; riskArea?: string; score?: number };
  injuryRisks?: Array<{
    category?: string;
    detected?: boolean;
    severity?: string;
    riskArea?: string;
    detail?: string;
  }>;
  insights?: {
    strengths?: string[];
    weaknesses?: string[];
    observations?: string[];
  };
  recommendations?: string[];
  progressData?: {
    hasPrevious?: boolean;
    cadenceProgress?: string | null;
    gctProgress?: string | null;
    strideProgress?: string | null;
    symmetryProgress?: string | null;
  };
  reportReady?: boolean;
  videoReady?: boolean;
  hasOverlay?: boolean;
  skeletonOverlayReady?: boolean;
  errorMessage?: string;
};

const NORM_LEVEL_SCORE: Record<string, number> = {
  'Below District': 20,
  District: 45,
  State: 65,
  National: 82,
  Elite: 98,
};

export default function BiomechanicsPanel() {
  const [analysesList, setAnalysesList] = useState<AnalysisRecord[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [socketStatus, setSocketStatus] = useState<string | null>(null);
  const [socketProgress, setSocketProgress] = useState(0);
  const [videoTab, setVideoTab] = useState<'original' | 'overlay'>('overlay');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [originalBlobUrl, setOriginalBlobUrl] = useState<string | null>(null);
  const [overlayBlobUrl, setOverlayBlobUrl] = useState<string | null>(null);
  const [overlayLoading, setOverlayLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const localPreviewForId = useRef<string | null>(null);
  const analysisId =
    currentAnalysis?.analysisId || currentAnalysis?.id || '';
  const effectiveStatus = currentAnalysis?.status || socketStatus;
  const isProcessing =
    Boolean(effectiveStatus && !['COMPLETED', 'FAILED'].includes(effectiveStatus));

  const fetchAnalyses = useCallback(async () => {
    try {
      const response = await api.get('/analysis/list');
      const list = response.data?.data ?? response.data ?? [];
      if (Array.isArray(list)) {
        setAnalysesList(list);
      }
    } catch (err) {
      console.error('Failed to load analyses', err);
    }
  }, []);

  const fetchSingleAnalysis = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/analysis/${id}`);
      const data = response.data?.data ?? response.data;
      if (data) {
        setCurrentAnalysis(data);
        setVideoError(null);
        if (data.hasOverlay || data.skeletonOverlayReady) {
          setVideoTab('overlay');
        }
      }
    } catch (err) {
      console.error('Failed to fetch analysis', err);
    }
  }, []);

  useEffect(() => {
    fetchAnalyses();
  }, [fetchAnalyses]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const loadVideoBlob = useCallback(
    async (id: string, type: 'original' | 'overlay') => {
      try {
        const response = await api.get(`/analysis/${id}/video/${type}`, {
          responseType: 'blob',
        });
        const blob =
          response.data instanceof Blob
            ? response.data
            : new Blob([response.data], { type: 'video/mp4' });
        return URL.createObjectURL(blob);
      } catch {
        return null;
      }
    },
    [],
  );

  useEffect(() => {
    setOverlayBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId) return;
    if (localPreviewForId.current === analysisId && originalBlobUrl) return;
    if (currentAnalysis?.videoReady === false) return;

    let cancelled = false;

    (async () => {
      const original = await loadVideoBlob(analysisId, 'original');
      if (cancelled || !original) return;
      setOriginalBlobUrl((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return original;
      });
      setVideoError(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [analysisId, currentAnalysis?.videoReady, loadVideoBlob]);

  useEffect(() => {
    if (
      !analysisId ||
      (!currentAnalysis?.skeletonOverlayReady && !currentAnalysis?.hasOverlay)
    ) {
      return;
    }

    let cancelled = false;
    setOverlayLoading(true);

    (async () => {
      const overlay = await loadVideoBlob(analysisId, 'overlay');
      if (!cancelled) {
        setOverlayLoading(false);
        if (overlay) {
          setOverlayBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return overlay;
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [
    analysisId,
    currentAnalysis?.skeletonOverlayReady,
    currentAnalysis?.hasOverlay,
    loadVideoBlob,
  ]);

  // Robust polling fallback for state recovery if websocket fails or disconnects
  useEffect(() => {
    if (!analysisId || !isProcessing) return;

    const timer = setInterval(async () => {
      try {
        const response = await api.get(`/analysis/${analysisId}`);
        const data = response.data?.data ?? response.data;
        if (data) {
          // If the status has changed on backend, update both current and history sidebar state!
          if (
            data.status !== effectiveStatus ||
            data.progress !== (currentAnalysis?.progress ?? 0)
          ) {
            setCurrentAnalysis((prev) => {
              if (!prev || (prev.analysisId || prev.id) !== analysisId) return prev;
              return {
                ...prev,
                ...data,
              };
            });

            setAnalysesList((prevList) => {
              const index = prevList.findIndex(
                (item) => (item.analysisId || item.id) === analysisId
              );
              if (index === -1) return prevList;
              const updatedList = [...prevList];
              updatedList[index] = {
                ...updatedList[index],
                ...data,
              };
              return updatedList;
            });

            if (data.status === 'COMPLETED' || data.status === 'FAILED') {
              fetchAnalyses();
            }
          }
        }
      } catch (err) {
        console.error('Polling status fallback error:', err);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [
    analysisId,
    isProcessing,
    effectiveStatus,
    currentAnalysis?.progress,
    fetchAnalyses,
  ]);

  useEffect(() => {
    return () => {
      if (originalBlobUrl) URL.revokeObjectURL(originalBlobUrl);
      if (overlayBlobUrl) URL.revokeObjectURL(overlayBlobUrl);
    };
  }, [originalBlobUrl, overlayBlobUrl]);

  const startSocketConnection = (analysisId: string) => {
    socketRef.current?.disconnect();

    setSocketStatus('PROCESSING_POSE');
    setSocketProgress(10);

    const socket = io('http://localhost:3001');
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('subscribeToAnalysis', { analysisId });
    });

    socket.on('analysisStatus', (payload: {
      status: string;
      progress: number;
      data?: AnalysisRecord & { metrics?: AnalysisRecord['metrics']; errorMessage?: string };
    }) => {
      setSocketStatus(payload.status);
      setSocketProgress(payload.progress ?? 0);

      if (payload.data) {
        setCurrentAnalysis((prev) => ({
          ...prev,
          ...payload.data,
          analysisId,
          id: analysisId,
          status: payload.status,
          videoReady: payload.data?.videoReady ?? prev?.videoReady,
          hasOverlay:
            payload.data?.hasOverlay ??
            payload.data?.skeletonOverlayReady ??
            prev?.hasOverlay,
          skeletonOverlayReady:
            payload.data?.skeletonOverlayReady ?? prev?.skeletonOverlayReady,
          benchmarks: payload.data?.benchmarks ?? prev?.benchmarks,
          scores: payload.data?.scores ?? prev?.scores,
          classification: payload.data?.classification ?? prev?.classification,
          injuryRisk: payload.data?.injuryRisk ?? prev?.injuryRisk,
          injuryRisks: payload.data?.injuryRisks ?? prev?.injuryRisks,
          metrics: payload.data?.metrics ?? prev?.metrics,
          insights: payload.data?.insights ?? prev?.insights,
          recommendations: payload.data?.recommendations ?? prev?.recommendations,
          progressData: payload.data?.progressData ?? prev?.progressData,
          progress: payload.data?.progress ?? payload.progress ?? prev?.progress,
          reportReady: payload.data?.reportReady ?? prev?.reportReady,
        }));
      } else {
        setCurrentAnalysis((prev) =>
          prev
            ? { ...prev, status: payload.status, progress: payload.progress }
            : prev,
        );
      }

      // Sync WebSocket updates to the history sidebar list in real time
      setAnalysesList((prevList) => {
        const index = prevList.findIndex(
          (item) => (item.analysisId || item.id) === analysisId
        );
        if (index === -1) {
          fetchAnalyses();
          return prevList;
        }
        const updatedList = [...prevList];
        updatedList[index] = {
          ...updatedList[index],
          status: payload.status,
          progress: payload.progress,
          ...(payload.data || {}),
        };
        return updatedList;
      });

      if (
        payload.status === 'COMPLETED' ||
        payload.data?.skeletonOverlayReady ||
        payload.data?.hasOverlay
      ) {
        fetchAnalyses();
        fetchSingleAnalysis(analysisId);
      }

      if (payload.status === 'FAILED') {
        setErrorMsg(
          payload.data?.errorMessage ||
            'Analysis failed. Use stable side-view sprint footage at 60+ FPS.',
        );
      }
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setErrorMsg(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/analysis/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const result = response.data?.data ?? response.data;
      const analysisId = result?.analysisId;

      if (!analysisId) {
        throw new Error('No analysis ID returned from server');
      }

      // Populate sidebar history list immediately so the new upload shows up as active
      await fetchAnalyses();

      const localPreview = URL.createObjectURL(selectedFile);
      localPreviewForId.current = analysisId;
      setOriginalBlobUrl((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return localPreview;
      });

      setCurrentAnalysis({
        analysisId,
        id: analysisId,
        status: result.status || 'PROCESSING_POSE',
        progress: result.progress ?? 10,
        videoReady: result.videoReady ?? true,
      });

      startSocketConnection(analysisId);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : null;
      setErrorMsg(message || 'Upload failed. Check that NestJS and the AI engine are running.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
    setErrorMsg(null);
  };

  const displayVideoUrl =
    videoTab === 'overlay' ? overlayBlobUrl : originalBlobUrl;

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT: Upload + history */}
        <div className="lg:col-span-1 space-y-6">
          {/* Upload */}
          <div
            className={`rounded-2xl border-2 border-dashed p-8 text-center transition ${
              dragOver
                ? 'border-[#FF4F21] bg-[#FF4F21]/5'
                : 'border-zinc-700 bg-zinc-950/40'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files?.[0];
              if (file?.type.startsWith('video/')) handleFileSelect(file);
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo"
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />
            <UploadCloud className="h-10 w-10 text-[#FF4F21] mx-auto mb-4" />
            <p className="text-sm font-semibold text-white mb-1">
              Upload running video
            </p>
            <p className="text-[10px] text-zinc-500 mb-4">
              Side-view sprint · MP4/MOV · 60+ FPS recommended
            </p>
            {selectedFile ? (
              <p className="text-xs text-[#FF4F21] mb-3 truncate">
                {selectedFile.name}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs text-zinc-400 hover:text-white underline mb-3 block mx-auto"
            >
              Choose file
            </button>
            <button
              type="button"
              disabled={!selectedFile || uploading}
              onClick={handleUpload}
              className="w-full rounded-xl bg-[#FF4F21] hover:bg-[#FF4F21]/80 disabled:opacity-40 disabled:cursor-not-allowed py-2.5 text-xs font-bold text-white transition"
            >
              {uploading ? 'Uploading…' : 'Analyze biomechanics'}
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex gap-2 text-xs text-red-400">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* History */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
              Analysis history
            </h3>
            {analysesList.length === 0 ? (
              <p className="text-xs text-zinc-600 italic">No scans yet</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {analysesList.map((item) => {
                  const id = item.analysisId || item.id || '';
                  const isSelected =
                    (currentAnalysis?.analysisId || currentAnalysis?.id) === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        localPreviewForId.current = null;
                        setCurrentAnalysis(item);
                        fetchSingleAnalysis(id);
                        if (item.status && !['COMPLETED', 'FAILED'].includes(item.status)) {
                           startSocketConnection(id);
                        }
                      }}
                      className={`w-full text-left rounded-lg px-3 py-2.5 text-xs transition ${
                        isSelected
                          ? 'bg-[#FF4F21]/20 border border-[#FF4F21]/30 text-white'
                          : 'bg-zinc-900/50 border border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900'
                      }`}
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="font-mono truncate">{id.slice(0, 8)}…</span>
                        <span
                          className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : item.status === 'FAILED'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-yellow-500/10 text-yellow-400'
                          }`}
                        >
                          {item.status || '—'}
                        </span>
                      </div>
                      {item.createdAt && (
                        <span className="text-[10px] text-zinc-600 mt-1 block">
                          {new Date(item.createdAt).toLocaleString()}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Results + video */}
        <div className="lg:col-span-2 space-y-6">
          {!currentAnalysis ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-12 text-center">
              <FileVideo className="h-10 w-10 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-sm font-bold text-white">No analysis selected</h3>
              <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto">
                Upload a video or pick a past scan from the list to view metrics and playback.
              </p>
            </div>
          ) : isProcessing || (socketStatus && !['COMPLETED', 'FAILED'].includes(socketStatus)) ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-8 text-center space-y-4">
                <TrendingUp className="h-10 w-10 text-[#FF4F21] mx-auto animate-pulse" />
                <h3 className="text-sm font-bold text-white">Processing biomechanics</h3>
                <p className="text-xs text-zinc-500">{socketStatus || currentAnalysis.status}</p>
                <div className="w-full max-w-xs mx-auto h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#FF4F21] transition-all duration-500"
                    style={{ width: `${socketProgress || currentAnalysis.progress || 0}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-600">
                  Metrics in ~5s · skeleton overlay follows
                </p>
              </div>
              {originalBlobUrl && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
                  <video
                    src={originalBlobUrl}
                    controls
                    className="w-full max-h-[320px] rounded-lg bg-black"
                    playsInline
                  />
                </div>
              )}
            </div>
          ) : currentAnalysis.status === 'FAILED' ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-8 text-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-3" />
              <p className="text-sm text-red-400">
                {currentAnalysis.errorMessage || 'Analysis failed'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-black text-white">Live Telemetry Overview</h2>
                <Link href={`/analysis/${currentAnalysis.analysisId || currentAnalysis.id}`} className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-700 hover:border-[#FF4F21] hover:text-[#FF4F21] text-xs font-bold text-white transition flex items-center gap-2 group">
                  View Full Analysis <ExternalLink className="h-3 w-3 group-hover:translate-x-1 transition" />
                </Link>
              </div>

              {currentAnalysis.scores && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-2xl border border-[#FF4F21]/30 bg-[#FF4F21]/5 p-5">
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                      <span className="text-[10px] font-bold uppercase">Performance</span>
                      <Trophy className="h-4 w-4 text-[#FF4F21]" />
                    </div>
                    <span className="text-3xl font-black text-white">
                      {currentAnalysis.scores.performanceScore ?? '—'}
                    </span>
                    <p className="text-[10px] text-[#FF4F21] mt-2">
                      {currentAnalysis.classification?.athleteLevel ||
                        currentAnalysis.scores.athleteLevel ||
                        '—'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                      <span className="text-[10px] font-bold uppercase">Efficiency</span>
                      <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-3xl font-black text-white">
                      {currentAnalysis.scores.efficiencyScore ?? '—'}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                      <span className="text-[10px] font-bold uppercase">Biomechanics</span>
                      <Target className="h-4 w-4 text-[#FF4F21]" />
                    </div>
                    <span className="text-3xl font-black text-white">
                      {currentAnalysis.scores.biomechanicsScore ?? '—'}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                    <div className="flex items-center justify-between text-zinc-500 mb-2">
                      <span className="text-[10px] font-bold uppercase">Injury risk</span>
                      <Shield className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="text-3xl font-black text-white">
                      {currentAnalysis.injuryRisk?.level ?? '—'}
                    </span>
                    <p className="text-[10px] text-amber-400/80 mt-2">
                      {currentAnalysis.injuryRisk?.riskArea &&
                      currentAnalysis.injuryRisk.riskArea !== 'None'
                        ? `Watch: ${currentAnalysis.injuryRisk.riskArea}`
                        : 'Low concern'}
                    </p>
                  </div>
                </div>
              )}

              {currentAnalysis.benchmarks && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
                    Norm comparison
                    {currentAnalysis.benchmarks.profileLabel && (
                      <span className="text-zinc-600 font-normal ml-2">
                        · {currentAnalysis.benchmarks.profileLabel}
                      </span>
                    )}
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-3 text-sm">
                    <div className="flex justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
                      <span className="text-zinc-400">Cadence</span>
                      <span className="font-bold text-[#FF4F21]">
                        {currentAnalysis.benchmarks.cadenceLevel ?? '—'}
                      </span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
                      <span className="text-zinc-400">Ground contact</span>
                      <span className="font-bold text-[#FF4F21]">
                        {currentAnalysis.benchmarks.gctLevel ?? '—'}
                      </span>
                    </div>
                    <div className="flex justify-between rounded-lg bg-zinc-900/60 px-3 py-2">
                      <span className="text-zinc-400">Stride length</span>
                      <span className="font-bold text-[#FF4F21]">
                        {currentAnalysis.benchmarks.strideLevel ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {currentAnalysis.injuryRisks && currentAnalysis.injuryRisks.length > 0 && (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">
                    Injury intelligence
                  </h3>
                  <ul className="space-y-2">
                    {currentAnalysis.injuryRisks.map((risk, i) => (
                      <li
                        key={i}
                        className={`text-xs rounded-lg px-3 py-2 border ${
                          risk.detected
                            ? 'border-amber-500/30 bg-amber-500/5 text-amber-200'
                            : 'border-zinc-800 bg-zinc-900/40 text-zinc-500'
                        }`}
                      >
                        <span className="font-semibold">{risk.category}</span>
                        {risk.detail && (
                          <span className="block text-[10px] mt-0.5 opacity-80">
                            {risk.detail}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {currentAnalysis.progressData?.hasPrevious && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
                    Progress vs last scan
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-3 text-sm">
                    <div className="rounded-lg bg-zinc-900/50 px-3 py-2">
                      <span className="text-zinc-500 text-[10px] block">Cadence</span>
                      <span className="font-bold text-white">
                        {currentAnalysis.progressData.cadenceProgress ?? '—'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-zinc-900/50 px-3 py-2">
                      <span className="text-zinc-500 text-[10px] block">GCT</span>
                      <span className="font-bold text-white">
                        {currentAnalysis.progressData.gctProgress ?? '—'}
                      </span>
                    </div>
                    <div className="rounded-lg bg-zinc-900/50 px-3 py-2">
                      <span className="text-zinc-500 text-[10px] block">Stride</span>
                      <span className="font-bold text-white">
                        {currentAnalysis.progressData.strideProgress ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ── AI INSIGHTS ── */}
              {currentAnalysis.insights && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">AI Insights</h3>
                  <div className="grid gap-3 lg:grid-cols-3">
                    {/* Strengths */}
                    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Strengths</h4>
                      </div>
                      <ul className="space-y-2">
                        {(currentAnalysis.insights.strengths ?? []).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Weaknesses */}
                    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/5 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-amber-400">Areas to Improve</h4>
                      </div>
                      <ul className="space-y-2">
                        {(currentAnalysis.insights.weaknesses ?? []).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Observations */}
                    <div className="rounded-2xl border border-zinc-700/50 bg-zinc-900/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <BookOpen className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Observations</h4>
                      </div>
                      <ul className="space-y-2">
                        {(currentAnalysis.insights.observations ?? []).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-zinc-400">
                            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-zinc-600" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TRAINING RECOMMENDATIONS ── */}
              {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
                <div className="rounded-2xl border border-[#FF4F21]/20 bg-[#FF4F21]/5 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#FF4F21] mb-4">Training Recommendations</h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {currentAnalysis.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-xl bg-black/20 border border-[#FF4F21]/10 px-3 py-2.5">
                        <ChevronRight className="h-3.5 w-3.5 text-[#FF4F21] shrink-0 mt-0.5" />
                        <span className="text-xs text-zinc-300 leading-relaxed">{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── REPORT + HISTORY ACTIONS ── */}
              <div className="flex flex-wrap gap-3">
                {currentAnalysis.reportReady && analysisId && (
                  <a
                    href={`http://localhost:3001/api/analysis/${analysisId}/report`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#FF4F21] px-4 py-2.5 text-xs font-bold text-white hover:brightness-110 transition shadow-lg shadow-[#FF4F21]/20"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    View Full Report
                  </a>
                )}
                <Link
                  href="/history"
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-xs font-bold text-zinc-300 hover:text-white hover:border-zinc-600 transition"
                >
                  <Activity className="h-3.5 w-3.5" />
                  View History
                </Link>
              </div>

              {/* Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                  <div className="flex items-center justify-between text-zinc-500 mb-2">
                    <span className="text-[10px] font-bold uppercase">Cadence</span>
                    <Gauge className="h-4 w-4 text-[#FF4F21]" />
                  </div>
                  <span className="text-3xl font-black text-white">
                    {currentAnalysis.metrics?.cadence ?? '—'}
                  </span>
                  <span className="text-xs text-zinc-500 ml-1">SPM</span>
                  <p className="text-[10px] text-emerald-400 mt-2">Target 170–190</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                  <div className="flex items-center justify-between text-zinc-500 mb-2">
                    <span className="text-[10px] font-bold uppercase">Ground contact</span>
                    <Zap className="h-4 w-4 text-[#FF4F21]" />
                  </div>
                  <span className="text-3xl font-black text-white">
                    {currentAnalysis.metrics?.gct ?? '—'}
                  </span>
                  <span className="text-xs text-zinc-500 ml-1">ms</span>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                  <div className="flex items-center justify-between text-zinc-500 mb-2">
                    <span className="text-[10px] font-bold uppercase">Stride length</span>
                    <Compass className="h-4 w-4 text-[#FF4F21]" />
                  </div>
                  <span className="text-3xl font-black text-white">
                    {currentAnalysis.metrics?.strideLength ?? '—'}
                  </span>
                  <span className="text-xs text-zinc-500 ml-1">m</span>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                  <div className="flex items-center justify-between text-zinc-500 mb-2">
                    <span className="text-[10px] font-bold uppercase">Symmetry</span>
                    <Activity className="h-4 w-4 text-[#FF4F21]" />
                  </div>
                  <span className="text-3xl font-black text-white">
                    {currentAnalysis.metrics?.symmetry ?? '—'}
                  </span>
                  <span className="text-xs text-zinc-500 ml-1">index</span>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5">
                  <div className="flex items-center justify-between text-zinc-500 mb-2">
                    <span className="text-[10px] font-bold uppercase">Oscillation</span>
                    <TrendingUp className="h-4 w-4 text-[#FF4F21]" />
                  </div>
                  <span className="text-3xl font-black text-white">
                    {currentAnalysis.metrics?.oscillation ?? '—'}
                  </span>
                  <span className="text-xs text-zinc-500 ml-1">cm</span>
                </div>
              </div>

              {/* Video player */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 overflow-hidden">
                <div className="flex border-b border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setVideoTab('original')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
                      videoTab === 'original'
                        ? 'bg-[#FF4F21]/10 text-[#FF4F21]'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Original video
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoTab('overlay')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
                      videoTab === 'overlay'
                        ? 'bg-[#FF4F21]/10 text-[#FF4F21]'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    Skeleton overlay
                  </button>
                </div>
                <div className="p-4 bg-black">
                  {displayVideoUrl ? (
                    <>
                      <video
                        key={displayVideoUrl}
                        src={displayVideoUrl}
                        controls
                        className="w-full max-h-[420px] rounded-lg bg-black"
                        playsInline
                        onError={() =>
                          setVideoError(
                            'Video failed to load. Ensure NestJS (port 3001) is running.',
                          )
                        }
                        onLoadedData={() => setVideoError(null)}
                      />
                      {videoError && (
                        <p className="text-xs text-amber-400 mt-2">{videoError}</p>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
                      <FileVideo className="h-12 w-12 mb-3" />
                      <p className="text-xs text-center max-w-xs">
                        {videoTab === 'overlay'
                          ? overlayLoading
                            ? 'Generating skeleton overlay…'
                            : currentAnalysis?.status === 'COMPLETED'
                              ? 'Overlay processing — will appear automatically.'
                              : 'Skeleton overlay appears after analysis completes (AI engine on port 8000).'
                          : analysisId
                            ? 'Loading original video…'
                            : 'Original video unavailable'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
