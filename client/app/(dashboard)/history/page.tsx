'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import {
  Trophy, Gauge, Zap, Compass, Activity,
  ExternalLink, TrendingUp, TrendingDown,
  Minus, RefreshCcw, ChevronRight, Loader2, Calendar,
  Sparkles, ArrowLeft, ShieldAlert, Film, Target,
} from 'lucide-react';
import TrendCharts from './TrendCharts';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';

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
  Minimal: 'text-emerald-600',
  Low: 'text-emerald-600',
  Moderate: 'text-amber-600',
  High: 'text-red-600',
};

const LEVEL_COLORS: Record<string, string> = {
  'Elite Prospect': 'text-purple-700 border-purple-200 bg-purple-50',
  'State Potential': 'text-blue-700 border-blue-200 bg-blue-50',
  'District Athlete': 'text-amber-700 border-amber-200 bg-amber-50',
};

function TrendIcon({ direction }: { direction: string }) {
  if (direction === 'improving') return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />;
  if (direction === 'declining') return <TrendingDown className="h-3.5 w-3.5 text-red-600" />;
  return <Minus className="h-3.5 w-3.5 text-zinc-400" />;
}

function ProgressBadge({ value, type }: { value: string | null | undefined; type: 'cadence' | 'gct' | 'stride' }) {
  if (!value) return null;
  const isPositive = value.startsWith('+');
  const isNegativeDelta = value.startsWith('-') && value.includes('ms');

  let good = false;
  if (type === 'gct') {
    good = isNegativeDelta;
  } else {
    good = isPositive;
  }

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
      good ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
    }`}>
      {good ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      <span className="uppercase text-[9px] opacity-70 mr-0.5">{type}:</span>
      {value}
    </span>
  );
}

export default function HistoryPage() {
  const router = useRouter();
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [evolution, setEvolution] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [evolutionLoading, setEvolutionLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [overlayUrls, setOverlayUrls] = useState<Record<string, string>>({});
  const [overlayLoading, setOverlayLoading] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/list');
      setFetchError(null);
      const list = res.data?.data ?? res.data ?? [];
      if (Array.isArray(list)) {
        setAnalyses(list.filter((a: AnalysisRecord) => a.status === 'COMPLETED'));
      }
    } catch (err) {
      console.error('Failed to load history', err);
      setFetchError(classifyFetchError(err));
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
      // Evolution is a secondary summary strip on this page — a failure here
      // just means the strip doesn't render; the session cards below (the
      // page's primary content) have their own independent error state.
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
    } catch (err) {
      console.error('Failed to load overlay video', err);
    } finally {
      setOverlayLoading(null);
    }
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const evolutionCards = evolution ? [
    { label: 'Sessions', value: evolution.sessionCount, icon: Calendar, color: 'text-blue-600' },
    { label: 'Best Score', value: evolution.bestPerformanceScore ?? '—', icon: Trophy, color: 'text-[#FF4F21]' },
    { label: 'Latest Score', value: evolution.latestPerformanceScore ?? '—', icon: Target, color: 'text-cyan-600' },
    { label: 'Consistency', value: evolution.consistencyIndex != null ? `${evolution.consistencyIndex}%` : '—', icon: Zap, color: 'text-amber-600' },
  ] : [];

  return (
    <div className="bg-[#F2F2F7] min-h-screen font-poppins pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 sm:px-8 pt-4 pb-2 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-9 w-9 rounded-full bg-white border border-black/[0.04] flex items-center justify-center text-[#1C1C1E] active:scale-95 transition shrink-0 cursor-pointer shadow-xs"
            aria-label="Back"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1E] tracking-tight">History</h1>
            <p className="text-xs text-[#8E8E93] font-medium">Completed biomechanics sprint sessions</p>
          </div>
        </div>
        <button
          onClick={() => { fetchData(); fetchEvolution(); }}
          className="h-9 w-9 rounded-full bg-white border border-black/[0.04] flex items-center justify-center text-[#8E8E93] hover:text-[#1C1C1E] active:scale-95 transition shrink-0 cursor-pointer shadow-xs"
          aria-label="Refresh"
          title="Refresh history"
        >
          <RefreshCcw className="h-4 w-4" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 space-y-5">

        {/* Evolution Summary Strip */}
        {!evolutionLoading && evolution && (
          <section className="bg-white rounded-[24px] border border-black/[0.04] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#FF4F21]" />
                Evolution Summary
              </h2>
              {evolution.overallProgress && (
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  evolution.overallProgress.startsWith('+') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {evolution.overallProgress} overall
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {evolutionCards.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.label} className="rounded-2xl bg-[#F2F2F7] border border-black/[0.03] p-3.5">
                    <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Icon className={`h-3 w-3 ${c.color}`} /> {c.label}
                    </p>
                    <p className="text-xl font-extrabold text-[#1C1C1E]">{c.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="rounded-2xl bg-[#F2F2F7] border border-black/[0.03] p-3.5 flex items-center justify-between">
                <span className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider">Performance Trend</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#1C1C1E] capitalize">
                  <TrendIcon direction={evolution.trend} /> {evolution.trend}
                </span>
              </div>
              <div className="rounded-2xl bg-[#F2F2F7] border border-black/[0.03] p-3.5 flex items-center justify-between">
                <span className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider">GCT Trajectory</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#1C1C1E] capitalize">
                  <TrendIcon direction={evolution.gctTrend} /> {evolution.gctTrend}
                </span>
              </div>
            </div>
          </section>
        )}

        {/* Trend Charts */}
        {!evolutionLoading && evolution && evolution.sessionCount >= 2 && (
          <div className="bg-white rounded-[24px] border border-black/[0.04] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <TrendCharts evolution={evolution} />
          </div>
        )}

        {evolution && evolution.sessionCount === 1 && (
          <div className="bg-white rounded-[24px] border border-dashed border-black/[0.1] p-6 text-center text-[#8E8E93] text-xs font-medium">
            Upload another sprint analysis to unlock continuous trend curves and progression analytics.
          </div>
        )}

        {/* Video Overlay Modal */}
        {selectedId && overlayUrls[selectedId] && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedId(null)}>
            <div className="relative w-full max-w-lg rounded-2xl bg-[#08080C] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08]">
                <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <Film className="h-3.5 w-3.5 text-[#FF4F21]" />
                  Overlay · {selectedId.slice(0, 8)}
                </span>
                <button onClick={() => setSelectedId(null)} className="text-zinc-400 hover:text-white text-xs font-bold cursor-pointer">✕</button>
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

        {/* Analysis Cards */}
        <section>
          <h2 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-3 flex items-center gap-1.5 px-1">
            <Activity className="h-3.5 w-3.5 text-[#FF4F21]" />
            {fetchError ? 'Unable to load sessions' : analyses.length > 0 ? `${analyses.length} completed session${analyses.length > 1 ? 's' : ''}` : 'No completed sessions'}
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-40 rounded-[24px] bg-white border border-black/[0.04] animate-pulse" />
              ))}
            </div>
          ) : fetchError ? (
            <DataFetchError error={fetchError} onRetry={fetchData} />
          ) : analyses.length === 0 ? (
            <div className="bg-white rounded-[24px] border border-dashed border-black/[0.1] p-10 text-center">
              <Activity className="h-9 w-9 text-[#8E8E93] mx-auto mb-3" />
              <p className="text-base font-bold text-[#1C1C1E]">No sprint records yet</p>
              <p className="text-xs text-[#8E8E93] mt-1">Upload a sprint video from the dashboard studio to start building your record book.</p>
              <Link href="/dashboard?tab=biomechanics" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-xs hover:bg-[#E03E12] transition">
                Analyze Video <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {analyses.map(item => {
                const id = item.analysisId || item.id || '';
                const athleteLevel = item.classification?.athleteLevel;
                const levelStyle = athleteLevel ? LEVEL_COLORS[athleteLevel] || 'text-zinc-600 border-zinc-200 bg-zinc-50' : '';
                const injLevel = item.injuryRisk?.level || '';
                const injColor = INJURY_COLORS[injLevel] || 'text-zinc-500';

                return (
                  <div key={id} className="bg-white rounded-[24px] border border-black/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 flex flex-col gap-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-xs text-[#8E8E93] font-semibold flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-[#FF4F21]" /> {formatDate(item.createdAt)}
                        </p>
                        <p className="text-[10px] text-[#8E8E93] font-mono mt-0.5">{id.slice(0, 16)}…</p>
                      </div>
                      {athleteLevel && (
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${levelStyle}`}>
                          {athleteLevel}
                        </span>
                      )}
                    </div>

                    {/* Main Scores */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#F2F2F7] border border-black/[0.03] p-3.5 text-center">
                        <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                          <Trophy className="h-3 w-3 text-[#FF4F21]" /> Performance
                        </p>
                        <p className="text-2xl font-extrabold text-[#1C1C1E]">{item.scores?.performanceScore ?? '—'}</p>
                      </div>
                      <div className="rounded-2xl bg-[#F2F2F7] border border-black/[0.03] p-3.5 text-center">
                        <p className="text-[10px] text-[#8E8E93] font-bold uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                          <Target className="h-3 w-3 text-cyan-600" /> Efficiency
                        </p>
                        <p className="text-2xl font-extrabold text-[#1C1C1E]">{item.scores?.efficiencyScore ?? '—'}</p>
                      </div>
                    </div>

                    {/* Telemetry row */}
                    <div className="grid grid-cols-3 gap-2.5">
                      <div className="rounded-xl bg-[#F2F2F7] p-2.5 text-center">
                        <Gauge className="h-3.5 w-3.5 text-purple-500 mx-auto mb-1" />
                        <p className="text-xs font-extrabold text-[#1C1C1E]">{item.metrics?.cadence ?? '—'}</p>
                        <p className="text-[9px] text-[#8E8E93] font-bold uppercase">SPM</p>
                      </div>
                      <div className="rounded-xl bg-[#F2F2F7] p-2.5 text-center">
                        <Zap className="h-3.5 w-3.5 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs font-extrabold text-[#1C1C1E]">{item.metrics?.gct ?? '—'}</p>
                        <p className="text-[9px] text-[#8E8E93] font-bold uppercase">ms GCT</p>
                      </div>
                      <div className="rounded-xl bg-[#F2F2F7] p-2.5 text-center">
                        <Compass className="h-3.5 w-3.5 text-emerald-500 mx-auto mb-1" />
                        <p className="text-xs font-extrabold text-[#1C1C1E]">{item.metrics?.strideLength ?? '—'}</p>
                        <p className="text-[9px] text-[#8E8E93] font-bold uppercase">m Stride</p>
                      </div>
                    </div>

                    {/* Injury + symmetry */}
                    <div className="flex items-center justify-between text-xs py-2 border-t border-black/[0.04]">
                      <div className="flex items-center gap-1.5">
                        <ShieldAlert className={`h-3.5 w-3.5 ${injColor}`} />
                        <span className={`font-bold text-[11px] ${injColor}`}>{injLevel || 'Stable'}</span>
                        {item.injuryRisk?.riskArea && item.injuryRisk.riskArea !== 'None' && (
                          <span className="text-[#8E8E93] text-[10px]">· {item.injuryRisk.riskArea}</span>
                        )}
                      </div>
                      {item.metrics?.symmetry && (
                        <span className="text-[#8E8E93] text-[11px] font-semibold">{item.metrics.symmetry}% Symmetry</span>
                      )}
                    </div>

                    {/* Progress deltas */}
                    {item.progressData?.hasPrevious && (
                      <div className="flex items-center gap-1.5 flex-wrap -mt-1">
                        <ProgressBadge value={item.progressData.cadenceProgress} type="cadence" />
                        <ProgressBadge value={item.progressData.gctProgress} type="gct" />
                        <ProgressBadge value={item.progressData.strideProgress} type="stride" />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      <Link
                        href={`/analysis/${id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#1C1C1E] text-white py-2.5 text-xs font-bold active:scale-[0.98] transition hover:bg-black"
                      >
                        Telemetry
                      </Link>

                      {(item.hasOverlay || item.skeletonOverlayReady) && (
                        <button
                          onClick={() => loadOverlay(id)}
                          disabled={overlayLoading === id}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#FFF2EE] text-[#FF4F21] border border-[#FFE0D6] py-2.5 text-xs font-bold disabled:opacity-50 active:scale-[0.98] transition cursor-pointer"
                        >
                          {overlayLoading === id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Film className="h-3.5 w-3.5" />}
                          Overlay
                        </button>
                      )}

                      {item.reportReady && (
                        <Link
                          href={`/report/${id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#F2F2F7] text-[#1C1C1E] border border-black/[0.04] py-2.5 text-xs font-bold active:scale-[0.98] transition hover:bg-slate-200"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Report
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
