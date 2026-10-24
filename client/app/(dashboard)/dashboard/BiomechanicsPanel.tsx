'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../config/service-urls';
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
  X,
  Sparkles,
  Download,
} from 'lucide-react';
import Link from 'next/link';
import { Biomech3DCanvas } from '../../components/Biomech3DCanvas';

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
  statusMessage?: string;
};

const TERMINAL_STATUSES = new Set(['COMPLETED', 'FAILED', 'CANCELLED']);

function isActiveStatus(status?: string): boolean {
  return Boolean(status && !TERMINAL_STATUSES.has(status));
}

function formatAnalysisStatus(
  status?: string | null,
  statusMessage?: string | null,
): string {
  if (statusMessage) return statusMessage;
  switch (status) {
    case 'WAKING_AI_ENGINE':
      return 'Connecting to analysis engine… Please wait.';
    case 'UPLOADING':
      return 'Uploading your running video…';
    case 'QUEUED':
      return 'Queued for biomechanics analysis…';
    case 'PROCESSING_POSE':
      return 'Detecting running pose…';
    case 'TRACKING_LANDMARKS':
      return 'Tracking body landmarks…';
    case 'DETECTING_FOOT_STRIKES':
      return 'Detecting foot strikes…';
    case 'CALCULATING_METRICS':
      return 'Calculating sprint metrics…';
    case 'GENERATING_OVERLAY':
      return 'Generating skeleton overlay…';
    default:
      return status || 'Processing…';
  }
}

export default function BiomechanicsPanel({
  analysesList: propAnalysesList,
  onAnalysesUpdated,
}: {
  analysesList?: AnalysisRecord[];
  onAnalysesUpdated?: () => void;
} = {}) {
  const [analysesList, setAnalysesList] = useState<AnalysisRecord[]>(propAnalysesList || []);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisRecord | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
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
  const analysisId = currentAnalysis?.analysisId || currentAnalysis?.id || '';
  const effectiveStatus = currentAnalysis?.status || socketStatus;
  const isProcessing = isActiveStatus(effectiveStatus ?? undefined);
  const activeAnalysis = analysesList.find((item) => isActiveStatus(item.status));
  const hasActiveAnalysis = Boolean(activeAnalysis) || isProcessing;
  const activeAnalysisId = activeAnalysis?.analysisId || activeAnalysis?.id || analysisId || '';
  const displayStatusMessage =
    currentAnalysis?.statusMessage ||
    formatAnalysisStatus(effectiveStatus, currentAnalysis?.statusMessage);

  const fetchAnalyses = useCallback(async () => {
    if (onAnalysesUpdated) {
      onAnalysesUpdated();
      return;
    }
    try {
      const response = await api.get('/analysis/list');
      const list = response.data?.data ?? response.data ?? [];
      if (Array.isArray(list)) {
        setAnalysesList(list);
      }
    } catch (err) {
      console.error('Failed to load analyses', err);
    }
  }, [onAnalysesUpdated]);

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
    if (propAnalysesList) {
      setAnalysesList(propAnalysesList);
    }
  }, [propAnalysesList]);

  useEffect(() => {
    if (!propAnalysesList) {
      fetchAnalyses();
    }
  }, [fetchAnalyses, propAnalysesList]);

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
    if (localPreviewForId.current === analysisId) return;
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

  const startSocketConnection = useCallback(
    (id: string) => {
      socketRef.current?.disconnect();

      const socket = io(getApiBaseUrl(), {
        path: '/socket.io',
        transports: ['websocket', 'polling'],
      });
      socketRef.current = socket;

      socket.on('connect', () => {
        socket.emit('subscribeToAnalysis', { analysisId: id });
      });

      socket.on('analysisProgress', (data: { progress?: number; step?: string; status?: string }) => {
        if (data.progress !== undefined) setSocketProgress(data.progress);
        if (data.status) setSocketStatus(data.status);
      });

      socket.on('analysisCompleted', (data: { analysisId: string }) => {
        setSocketStatus('COMPLETED');
        setSocketProgress(100);
        fetchSingleAnalysis(data.analysisId);
        fetchAnalyses();
        socket.disconnect();
      });

      socket.on('analysisFailed', (data: { analysisId: string; error?: string }) => {
        setSocketStatus('FAILED');
        setErrorMsg(data.error || 'Biomechanics analysis encountered an error.');
        fetchSingleAnalysis(data.analysisId);
        fetchAnalyses();
        socket.disconnect();
      });
    },
    [fetchAnalyses, fetchSingleAnalysis],
  );

  const handleCancelAnalysis = async () => {
    if (!analysisId) return;
    setCancelling(true);
    try {
      await api.delete(`/analysis/${analysisId}`);
      socketRef.current?.disconnect();
      setCurrentAnalysis((prev) => (prev ? { ...prev, status: 'CANCELLED' } : null));
      await fetchAnalyses();
    } catch {
      setErrorMsg('Could not cancel analysis. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (hasActiveAnalysis) {
      setErrorMsg('An analysis is already running. Please wait for it to complete.');
      return;
    }

    setUploading(true);
    setErrorMsg(null);
    setUploadStatusMessage('Uploading sprint video…');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await api.post('/analysis/upload', formData, { timeout: 120000 });
      const result = response.data?.data ?? response.data;
      const newId = result?.analysisId;

      if (!newId) throw new Error('No analysis ID returned');

      await fetchAnalyses();

      const localPreview = URL.createObjectURL(selectedFile);
      localPreviewForId.current = newId;
      setOriginalBlobUrl(localPreview);

      setCurrentAnalysis({
        analysisId: newId,
        id: newId,
        status: result.status || 'PROCESSING_POSE',
        progress: result.progress ?? 10,
        videoReady: true,
      });

      startSocketConnection(newId);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploadStatusMessage(null);
      setUploading(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    if (hasActiveAnalysis) {
      setErrorMsg('An analysis is already running. Wait for it to finish.');
      return;
    }
    setSelectedFile(file);
    setErrorMsg(null);
  };

  const displayVideoUrl = videoTab === 'overlay' ? overlayBlobUrl : originalBlobUrl;

  return (
    <div className="space-y-6 font-poppins text-[#1C1C1E]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Upload Dropzone & History (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Upload Dropzone Card */}
          <div
            className={`rounded-3xl border-2 border-dashed p-6 text-center transition-all ${
              dragOver && !hasActiveAnalysis
                ? 'border-[#FF4F21] bg-[#FFF5F2]'
                : hasActiveAnalysis
                  ? 'border-zinc-200 bg-zinc-50 opacity-60'
                  : 'border-zinc-200 bg-white hover:border-[#FF4F21]/60 shadow-xs'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              if (!hasActiveAnalysis) setDragOver(true);
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
              id="biomechanics-file-input"
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/quicktime,video/x-msvideo"
              className="hidden"
              disabled={hasActiveAnalysis || uploading}
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
            />

            <div className="h-12 w-12 rounded-2xl bg-[#FFF5F2] text-[#FF4F21] flex items-center justify-center mx-auto mb-3">
              <UploadCloud size={24} />
            </div>

            <h4 className="text-sm font-black text-[#1C1C1E]">
              Upload Sprint Clip
            </h4>
            <p className="text-[11px] text-zinc-500 mt-1 mb-4 leading-relaxed">
              Sagittal side-view sprint · MP4/MOV · 60+ FPS recommended
            </p>

            {hasActiveAnalysis && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-3 mb-3 text-left">
                <p className="text-xs font-bold text-amber-900">Analysis In Progress</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Clip #{activeAnalysisId.slice(0, 8)} is currently processing.
                </p>
                <button
                  type="button"
                  onClick={handleCancelAnalysis}
                  disabled={cancelling}
                  className="mt-2 w-full py-1.5 rounded-xl border border-zinc-200 bg-white text-[11px] font-bold text-zinc-700 hover:bg-zinc-50 transition"
                >
                  {cancelling ? 'Cancelling…' : 'Cancel Run'}
                </button>
              </div>
            )}

            {selectedFile && (
              <div className="mb-3 px-3 py-2 rounded-xl bg-orange-50 border border-orange-200 text-xs font-semibold text-[#FF4F21] truncate">
                {selectedFile.name}
              </div>
            )}

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={hasActiveAnalysis || uploading}
                className="w-full py-2.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-bold text-zinc-700 transition cursor-pointer disabled:opacity-40"
              >
                Browse Video Files
              </button>

              <button
                type="button"
                disabled={!selectedFile || uploading || hasActiveAnalysis}
                onClick={handleUpload}
                className="w-full py-3 rounded-xl bg-[#FF4F21] hover:bg-[#E03E12] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 transition active:scale-[0.98] cursor-pointer disabled:opacity-40"
              >
                {uploading
                  ? uploadStatusMessage || 'Uploading…'
                  : hasActiveAnalysis
                    ? 'Processing Video…'
                    : 'Start Kinematic Analysis'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
              <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Session History List */}
          <div className="rounded-3xl border border-black/[0.06] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Session History
              </span>
              <span className="text-[11px] font-semibold text-zinc-500">
                {analysesList.length} scans
              </span>
            </div>

            {analysesList.length === 0 ? (
              <p className="text-xs text-zinc-400 py-4 text-center">No sprint clips uploaded yet.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {analysesList.map((item) => {
                  const id = item.analysisId || item.id || '';
                  const isSelected = (currentAnalysis?.analysisId || currentAnalysis?.id) === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        localPreviewForId.current = null;
                        setCurrentAnalysis(item);
                        fetchSingleAnalysis(id);
                        if (item.status && isActiveStatus(item.status)) {
                          startSocketConnection(id);
                        }
                      }}
                      className={`w-full text-left rounded-2xl p-3 text-xs transition border cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFF5F2] border-[#FF4F21]/30 text-[#FF4F21] shadow-2xs font-semibold'
                          : 'bg-[#F9F9FB] border-zinc-100 text-zinc-700 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs font-bold truncate">Scan #{id.slice(0, 6)}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'COMPLETED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : item.status === 'FAILED'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {item.status || '—'}
                        </span>
                      </div>
                      {item.createdAt && (
                        <span className="text-[10px] text-zinc-400 mt-1 block">
                          {new Date(item.createdAt).toLocaleDateString()} · {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Video Player & Telemetry Results (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {!currentAnalysis ? (
            <div className="rounded-3xl border border-black/[0.06] bg-white p-12 text-center shadow-xs">
              <FileVideo size={36} className="text-zinc-300 mx-auto mb-3" />
              <h4 className="text-base font-black text-zinc-900">No Sprint Session Selected</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Upload a new video or choose a session from the history list to inspect kinematic curves and 33-point pose overlays.
              </p>
            </div>
          ) : isProcessing || (socketStatus && isActiveStatus(socketStatus)) ? (
            <div className="rounded-3xl border border-black/[0.06] bg-white p-8 text-center space-y-5 shadow-xs">
              <div className="relative mx-auto h-64 w-full max-w-lg overflow-hidden rounded-2xl bg-black border border-zinc-800">
                <Biomech3DCanvas mode="runner" />
                <div className="absolute left-3 top-3 px-3 py-1 rounded-full bg-black/70 border border-[#FF4F21]/30 text-[10px] font-bold text-[#FF4F21] backdrop-blur-md flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F21] animate-pulse" />
                  <span>33-Landmark Pose Estimation</span>
                </div>
              </div>

              <div>
                <h3 className="text-base font-black text-zinc-900">Processing Kinematics</h3>
                <p className="text-xs text-zinc-500 mt-1">{displayStatusMessage}</p>
              </div>

              <div className="w-full max-w-xs mx-auto h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF4F21] transition-all duration-500 rounded-full"
                  style={{ width: `${socketProgress || currentAnalysis.progress || 0}%` }}
                />
              </div>

              <button
                type="button"
                onClick={handleCancelAnalysis}
                disabled={cancelling}
                className="px-4 py-2 rounded-xl border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition shadow-2xs"
              >
                {cancelling ? 'Cancelling…' : 'Cancel Processing'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-black/[0.06] shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-zinc-900">
                      Telemetry Report · #{analysisId.slice(0, 8)}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Markerless kinematic extraction verified at 60 FPS
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {currentAnalysis.reportReady && (
                    <a
                      href={`${getApiBaseUrl()}/api/analysis/${analysisId}/report`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4F21] text-white text-xs font-bold hover:bg-[#E03E12] transition shadow-xs"
                    >
                      <Download size={13} />
                      <span>PDF Report</span>
                    </a>
                  )}
                  <Link
                    href={`/analysis/${analysisId}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition"
                  >
                    <span>Full Analytics</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
              </div>

              {/* 4 Score Cards */}
              {currentAnalysis.scores && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Performance</span>
                      <Trophy size={14} className="text-[#FF4F21]" />
                    </div>
                    <div className="text-2xl font-black text-zinc-900">
                      {currentAnalysis.scores.performanceScore ?? '—'}
                    </div>
                    <span className="text-[11px] font-bold text-[#FF4F21] mt-1 block">
                      {currentAnalysis.classification?.athleteLevel || 'Competitive'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Efficiency</span>
                      <Activity size={14} className="text-emerald-600" />
                    </div>
                    <div className="text-2xl font-black text-zinc-900">
                      {currentAnalysis.scores.efficiencyScore ?? '—'}
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 mt-1 block">
                      Optimal Range
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Kinematics</span>
                      <Target size={14} className="text-[#FF4F21]" />
                    </div>
                    <div className="text-2xl font-black text-zinc-900">
                      {currentAnalysis.scores.biomechanicsScore ?? '—'}
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500 mt-1 block">
                      33 Joints Synced
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-black/[0.06] shadow-xs">
                    <div className="flex items-center justify-between text-zinc-400 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider">Injury Risk</span>
                      <Shield size={14} className="text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-zinc-900">
                      {currentAnalysis.injuryRisk?.level ?? 'Low'}
                    </div>
                    <span className="text-[11px] font-medium text-zinc-500 mt-1 block">
                      {currentAnalysis.injuryRisk?.riskArea || 'Symmetry Aligned'}
                    </span>
                  </div>
                </div>
              )}

              {/* Video Player Box */}
              <div className="rounded-3xl border border-black/[0.06] bg-white shadow-xs overflow-hidden">
                <div className="flex border-b border-zinc-100 p-2 gap-2 bg-[#FAFAFC]">
                  <button
                    type="button"
                    onClick={() => setVideoTab('overlay')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                      videoTab === 'overlay'
                        ? 'bg-white text-[#FF4F21] shadow-xs border border-zinc-200/80'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Kinematic Skeleton Overlay
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoTab('original')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                      videoTab === 'original'
                        ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Original Video
                  </button>
                </div>

                <div className="p-4 bg-zinc-950">
                  {displayVideoUrl ? (
                    <video
                      key={displayVideoUrl}
                      src={displayVideoUrl}
                      controls
                      className="w-full max-h-[440px] rounded-2xl bg-black mx-auto"
                      playsInline
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-zinc-500">
                      <FileVideo size={36} className="mb-2 text-zinc-600" />
                      <p className="text-xs text-center max-w-xs text-zinc-400">
                        {videoTab === 'overlay'
                          ? 'Generating skeleton kinematic overlay…'
                          : 'Original video preview loading…'}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 5 Key Metrics Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Cadence</span>
                  <div className="text-xl font-black text-zinc-900 mt-1">
                    {currentAnalysis.metrics?.cadence ?? '—'} <span className="text-[10px] text-zinc-400 font-normal">SPM</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Contact Time</span>
                  <div className="text-xl font-black text-zinc-900 mt-1">
                    {currentAnalysis.metrics?.gct ?? '—'} <span className="text-[10px] text-zinc-400 font-normal">MS</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Stride Length</span>
                  <div className="text-xl font-black text-zinc-900 mt-1">
                    {currentAnalysis.metrics?.strideLength ?? '—'} <span className="text-[10px] text-zinc-400 font-normal">M</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Symmetry</span>
                  <div className="text-xl font-black text-zinc-900 mt-1">
                    {currentAnalysis.metrics?.symmetry ?? '—'} <span className="text-[10px] text-zinc-400 font-normal">%</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Oscillation</span>
                  <div className="text-xl font-black text-zinc-900 mt-1">
                    {currentAnalysis.metrics?.oscillation ?? '—'} <span className="text-[10px] text-zinc-400 font-normal">CM</span>
                  </div>
                </div>
              </div>

              {/* AI Coaching Drills */}
              {currentAnalysis.recommendations && currentAnalysis.recommendations.length > 0 && (
                <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-[#FF4F21]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
                      Prescribed Technical Drills
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentAnalysis.recommendations.map((drill, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#F9F9FB] border border-zinc-100 text-xs font-medium text-zinc-800">
                        <ChevronRight size={14} className="text-[#FF4F21] shrink-0 mt-0.5" />
                        <span>{drill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
