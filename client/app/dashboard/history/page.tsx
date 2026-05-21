'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../context/AuthContext';
import {
  Trophy, Gauge, Zap, Compass, Shield, Activity,
  ArrowLeft, ExternalLink, Play, TrendingUp, TrendingDown,
  Minus, RefreshCcw, ChevronRight,
} from 'lucide-react';
import TrendCharts from './TrendCharts';

type AnalysisRecord = {
  id?: string;
  analysisId?: string;
  status?: string;
  createdAt?: string;
  metrics?: {
    cadence?: number;
    gct?: number;
    strideLength?: number;
    symmetry?: number;
    asymmetryIndex?: number;
    oscillation?: number;
  };
  scores?: {
    performanceScore?: number;
    efficiencyScore?: number;
    biomechanicsScore?: number;
  };
  classification?: { athleteLevel?: string };
  injuryRisk?: { level?: string; riskArea?: string };
  progressData?: {
    hasPrevious?: boolean;
    cadenceProgress?: string | null;
    gctProgress?: string | null;
    strideProgress?: string | null;
  };
  reportReady?: boolean;
  hasOverlay?: boolean;
  skeletonOverlayReady?: boolean;
};

type EvolutionData = {
  hasHistory: boolean;
  sessionCount: number;
  trend: string;
  bestPerformanceScore: number | null;
  latestPerformanceScore: number | null;
  consistencyIndex: number | null;
  cadenceTrend: string;
  gctTrend: string;
  symmetryTrend: string;
  overallProgress: string | null;
  performanceSeries: { date: string; value: number }[];
  cadenceSeries: { date: string; value: number }[];
  gctSeries: { date: string; value: number }[];
  symmetrySeries: { date: string; value: number }[];
};

const INJURY_COLORS: Record<string, string> = {
  Minimal: 'text-emerald-400',
  Low: 'text-green-400',
  Moderate: 'text-amber-400',
  High: 'text-red-400',
};

const LEVEL_COLORS: Record<string, string> = {
  'Elite Prospect': 'text-purple-400 border-purple-500/30 bg-purple-500/10',
  'State Potential': 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  'District Athlete': 'text-amber-400 border-amber-500/30 bg-amber-500/10',
};

function TrendIcon({ direction }: { direction: string }) {
  if (direction === 'improving') return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (direction === 'declining') return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-zinc-500" />;
}

function ProgressBadge({ value }: { value: string | null | undefined }) {
  if (!value) return null;
  const isPositive = value.startsWith('+');
  const isNegativeDelta = value.startsWith('-') && value.includes('ms');
  const good = isPositive || isNegativeDelta;
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${good ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
      {value}
    </span>
  );
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [evolution, setEvolution] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [evolutionLoading, setEvolutionLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overlayUrls, setOverlayUrls] = useState<Record<string, string>>({});
  const [overlayLoading, setOverlayLoading] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/list');
      const list = res.data?.data ?? res.data ?? [];
      if (Array.isArray(list)) {
        setAnalyses(list.filter((a: AnalysisRecord) => a.status === 'COMPLETED'));
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEvolution = useCallback(async () => {
    setEvolutionLoading(true);
    try {
      const res = await api.get('/analysis/evolution');
      const data = res.data?.data ?? res.data;
      if (data) setEvolution(data.evolution || data);
    } catch (err) {
      console.error('Failed to load evolution', err);
    } finally {
      setEvolutionLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchEvolution();
  }, [fetchData, fetchEvolution]);

  const loadOverlay = async (analysisId: string) => {
    if (overlayUrls[analysisId]) {
      setSelectedId(analysisId);
      return;
    }
    setOverlayLoading(analysisId);
    try {
      const res = await api.get(`/analysis/${analysisId}/video/overlay`, { responseType: 'blob' });
      const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setOverlayUrls(prev => ({ ...prev, [analysisId]: url }));
      setSelectedId(analysisId);
    } catch {
      // fallback — overlay not ready
    } finally {
      setOverlayLoading(null);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF4F21]/30">
      {/* Ambient blur */}
      <div className="fixed top-0 right-1/4 h-[400px] w-[400px] rounded-full bg-[#FF4F21]/4 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition rounded-lg border border-zinc-800 px-3 py-2 hover:border-zinc-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Dashboard
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">Analysis History</h1>
              <p className="text-xs text-zinc-500 mt-0.5">All completed biomechanics sessions</p>
            </div>
          </div>
          <button
            onClick={() => { fetchData(); fetchEvolution(); }}
            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition px-3 py-2 rounded-lg border border-zinc-800 hover:border-zinc-600"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* Evolution Summary Strip */}
        {!evolutionLoading && evolution && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Athlete Evolution</h2>
              {evolution.overallProgress && (
                <span className={`text-sm font-black px-3 py-1 rounded-full ${
                  evolution.overallProgress.startsWith('+') ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {evolution.overallProgress} overall
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Sessions</p>
                <p className="text-2xl font-black text-white">{evolution.sessionCount}</p>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Best Score</p>
                <p className="text-2xl font-black text-[#FF4F21]">{evolution.bestPerformanceScore ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Latest Score</p>
                <p className="text-2xl font-black text-white">{evolution.latestPerformanceScore ?? '—'}</p>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Consistency</p>
                <p className="text-2xl font-black text-white">{evolution.consistencyIndex ?? '—'}<span className="text-xs text-zinc-500 ml-0.5">%</span></p>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2">Performance</p>
                <div className="flex items-center gap-1.5">
                  <TrendIcon direction={evolution.trend} />
                  <span className="text-xs font-bold capitalize text-white">{evolution.trend}</span>
                </div>
              </div>
              <div className="rounded-xl bg-zinc-900/60 border border-zinc-800 p-4">
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-2">GCT</p>
                <div className="flex items-center gap-1.5">
                  <TrendIcon direction={evolution.gctTrend} />
                  <span className="text-xs font-bold capitalize text-white">{evolution.gctTrend}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trend Charts */}
        {!evolutionLoading && evolution && evolution.sessionCount >= 2 && (
          <TrendCharts evolution={evolution} />
        )}

        {evolution && evolution.sessionCount === 1 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-6 text-center text-zinc-500 text-sm">
            Upload another session to unlock trend charts and progression analytics.
          </div>
        )}

        {/* Video Overlay Modal */}
        {selectedId && overlayUrls[selectedId] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedId(null)}>
            <div className="relative w-full max-w-3xl mx-4 rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <span className="text-xs font-bold text-zinc-300">Skeleton Overlay · {selectedId.slice(0, 8)}</span>
                <button onClick={() => setSelectedId(null)} className="text-zinc-500 hover:text-white text-xs">✕ Close</button>
              </div>
              <video
                src={overlayUrls[selectedId]}
                controls
                autoPlay
                className="w-full max-h-[60vh] bg-black"
                playsInline
              />
            </div>
          </div>
        )}

        {/* Analysis Cards Grid */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-4">
            {analyses.length > 0 ? `${analyses.length} completed session${analyses.length > 1 ? 's' : ''}` : 'No completed sessions'}
          </h2>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 rounded-2xl border border-zinc-800 bg-zinc-900/30 animate-pulse" />
              ))}
            </div>
          ) : analyses.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 p-16 text-center">
              <Activity className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
              <p className="text-sm font-bold text-white">No analyses yet</p>
              <p className="text-xs text-zinc-500 mt-2">Upload a sprint video from the dashboard to get started.</p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-[#FF4F21] hover:text-[#FF8433] transition">
                Go to Dashboard <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {analyses.map(item => {
                const id = item.analysisId || item.id || '';
                const athleteLevel = item.classification?.athleteLevel;
                const levelStyle = athleteLevel ? LEVEL_COLORS[athleteLevel] || 'text-zinc-400 border-zinc-700 bg-zinc-800/30' : '';
                const injLevel = item.injuryRisk?.level || '';
                const injColor = INJURY_COLORS[injLevel] || 'text-zinc-400';

                return (
                  <div key={id} className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 flex flex-col gap-4 hover:border-zinc-700 transition group">

                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] text-zinc-500 font-mono">{id.slice(0, 12)}…</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{formatDate(item.createdAt)}</p>
                      </div>
                      {athleteLevel && (
                        <span className={`text-[9px] font-bold uppercase px-2 py-1 rounded-full border ${levelStyle}`}>
                          {athleteLevel}
                        </span>
                      )}
                    </div>

                    {/* Main score */}
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-xl bg-[#FF4F21]/5 border border-[#FF4F21]/20 p-3 text-center">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Performance</p>
                        <p className="text-3xl font-black text-white">{item.scores?.performanceScore ?? '—'}</p>
                      </div>
                      <div className="flex-1 rounded-xl bg-zinc-900/60 border border-zinc-800 p-3 text-center">
                        <p className="text-[9px] text-zinc-500 uppercase font-bold mb-0.5">Efficiency</p>
                        <p className="text-3xl font-black text-white">{item.scores?.efficiencyScore ?? '—'}</p>
                      </div>
                    </div>

                    {/* Metrics row */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center">
                        <Gauge className="h-3.5 w-3.5 text-[#FF4F21] mx-auto mb-0.5" />
                        <p className="text-xs font-black text-white">{item.metrics?.cadence ?? '—'}</p>
                        <p className="text-[9px] text-zinc-500">SPM</p>
                      </div>
                      <div className="text-center">
                        <Zap className="h-3.5 w-3.5 text-[#FF4F21] mx-auto mb-0.5" />
                        <p className="text-xs font-black text-white">{item.metrics?.gct ?? '—'}</p>
                        <p className="text-[9px] text-zinc-500">ms GCT</p>
                      </div>
                      <div className="text-center">
                        <Compass className="h-3.5 w-3.5 text-[#FF4F21] mx-auto mb-0.5" />
                        <p className="text-xs font-black text-white">{item.metrics?.strideLength ?? '—'}</p>
                        <p className="text-[9px] text-zinc-500">m stride</p>
                      </div>
                    </div>

                    {/* Injury + symmetry */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-zinc-600" />
                        <span className={`font-bold ${injColor}`}>{injLevel || '—'}</span>
                        {item.injuryRisk?.riskArea && item.injuryRisk.riskArea !== 'None' && (
                          <span className="text-zinc-600 text-[10px]">· {item.injuryRisk.riskArea}</span>
                        )}
                      </div>
                      {item.metrics?.symmetry && (
                        <div className="flex items-center gap-1">
                          <Activity className="h-3 w-3 text-zinc-600" />
                          <span className="text-zinc-400 text-[10px]">{item.metrics.symmetry} sym</span>
                        </div>
                      )}
                    </div>

                    {/* Progress deltas */}
                    {item.progressData?.hasPrevious && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] text-zinc-600 font-bold uppercase">vs prev:</span>
                        <ProgressBadge value={item.progressData.cadenceProgress} />
                        <ProgressBadge value={item.progressData.gctProgress} />
                        <ProgressBadge value={item.progressData.strideProgress} />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1 border-t border-zinc-800/50 mt-auto">
                      {(item.hasOverlay || item.skeletonOverlayReady) && (
                        <button
                          onClick={() => loadOverlay(id)}
                          disabled={overlayLoading === id}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 py-2 text-[10px] font-bold text-zinc-300 hover:text-white transition disabled:opacity-50"
                        >
                          {overlayLoading === id ? (
                            <span className="animate-pulse">Loading…</span>
                          ) : (
                            <><Play className="h-3 w-3" />Overlay</>
                          )}
                        </button>
                      )}
                      {item.reportReady && (
                        <a
                          href={`http://localhost:3001/api/analysis/${id}/report`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#FF4F21]/10 hover:bg-[#FF4F21]/20 border border-[#FF4F21]/20 py-2 text-[10px] font-bold text-[#FF4F21] transition"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Report
                        </a>
                      )}
                      {!item.hasOverlay && !item.skeletonOverlayReady && !item.reportReady && (
                        <span className="text-[10px] text-zinc-600 italic py-2">No media available</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
