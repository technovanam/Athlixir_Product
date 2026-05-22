'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../../context/AuthContext';
import {
  Trophy, Gauge, Zap, Compass, Shield, Activity,
  ExternalLink, Play, TrendingUp, TrendingDown,
  Minus, RefreshCcw, ChevronRight, Loader2, Calendar, 
  Award, Sparkles, Clock, AlertTriangle, Eye, ShieldAlert, Film, Target
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
  'Elite Prospect': 'text-purple-400 border-purple-500/20 bg-purple-500/10',
  'State Potential': 'text-blue-400 border-blue-500/20 bg-blue-500/10',
  'District Athlete': 'text-amber-400 border-amber-500/20 bg-amber-500/10',
};

function TrendIcon({ direction }: { direction: string }) {
  if (direction === 'improving') return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (direction === 'declining') return <TrendingDown className="h-3.5 w-3.5 text-red-400" />;
  return <Minus className="h-3.5 w-3.5 text-zinc-500" />;
}

function ProgressBadge({ value, type }: { value: string | null | undefined; type: 'cadence' | 'gct' | 'stride' }) {
  if (!value) return null;
  const isPositive = value.startsWith('+');
  const isNegativeDelta = value.startsWith('-') && value.includes('ms');
  
  // GCT: shorter is better (negative delta), cadence/stride: larger is better (positive delta)
  let good = false;
  if (type === 'gct') {
    good = isNegativeDelta;
  } else {
    good = isPositive;
  }
  
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full border ${
      good 
        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
        : 'bg-red-500/10 border-red-500/20 text-red-400'
    }`}>
      {good ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      <span className="uppercase text-[8px] opacity-60 mr-0.5">{type}:</span>
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

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-10 animate-fadeIn pb-24">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase">Analysis History</h1>
            <p className="text-xs text-zinc-500 mt-0.5">All completed biomechanics sessions</p>
          </div>
        </div>
        <button
          onClick={() => { fetchData(); fetchEvolution(); }}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition px-3 py-2 rounded-xl border border-white/[0.05] bg-[#08080C]/40 hover:border-white/[0.1] hover:bg-[#08080C]/60"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </header>

      {/* Evolution Summary Strip */}
      {!evolutionLoading && evolution && (
        <section className="relative overflow-hidden rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4F21]/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="flex items-center justify-between mb-5 relative z-10">
            <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#FF4F21] animate-pulse" />
              Athlete Evolution metrics
            </h2>
            {evolution.overallProgress && (
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                evolution.overallProgress.startsWith('+') 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}>
                {evolution.overallProgress} overall
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 relative z-10">
            {/* Card 1: Sessions */}
            <div className="relative overflow-hidden rounded-xl bg-[#08080C]/60 border border-white/[0.05] p-4 hover:border-white/[0.1] hover:bg-[#08080C]/80 transition-all group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-[20px] pointer-events-none group-hover:bg-blue-500/10 transition duration-500" />
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
                <Calendar className="h-16 w-16 text-blue-400" />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-blue-400" /> Sessions
              </p>
              <p className="text-2xl font-black text-white">{evolution.sessionCount}</p>
            </div>

            {/* Card 2: Best Score */}
            <div className="relative overflow-hidden rounded-xl bg-[#08080C]/60 border border-white/[0.05] p-4 hover:border-white/[0.1] hover:bg-[#08080C]/80 transition-all group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#FF4F21]/5 rounded-full blur-[20px] pointer-events-none group-hover:bg-[#FF4F21]/10 transition duration-500" />
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
                <Trophy className="h-16 w-16 text-[#FF4F21]" />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Trophy className="h-3 w-3 text-[#FF4F21]" /> Best Score
              </p>
              <p className="text-2xl font-black text-[#FF4F21]">{evolution.bestPerformanceScore ?? '—'}</p>
            </div>

            {/* Card 3: Latest Score */}
            <div className="relative overflow-hidden rounded-xl bg-[#08080C]/60 border border-white/[0.05] p-4 hover:border-white/[0.1] hover:bg-[#08080C]/80 transition-all group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-cyan-500/5 rounded-full blur-[20px] pointer-events-none group-hover:bg-cyan-500/10 transition duration-500" />
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
                <Target className="h-16 w-16 text-cyan-400" />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Target className="h-3 w-3 text-cyan-400" /> Latest Score
              </p>
              <p className="text-2xl font-black text-white">{evolution.latestPerformanceScore ?? '—'}</p>
            </div>

            {/* Card 4: Consistency */}
            <div className="relative overflow-hidden rounded-xl bg-[#08080C]/60 border border-white/[0.05] p-4 hover:border-white/[0.1] hover:bg-[#08080C]/80 transition-all group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-[20px] pointer-events-none group-hover:bg-amber-500/10 transition duration-500" />
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
                <Zap className="h-16 w-16 text-amber-400" />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                <Zap className="h-3 w-3 text-amber-400" /> Consistency
              </p>
              <p className="text-2xl font-black text-white">
                {evolution.consistencyIndex ?? '—'}
                <span className="text-xs text-zinc-500 ml-0.5">%</span>
              </p>
            </div>

            {/* Card 5: Performance Trend */}
            <div className="relative overflow-hidden rounded-xl bg-[#08080C]/60 border border-white/[0.05] p-4 hover:border-white/[0.1] hover:bg-[#08080C]/80 transition-all group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-[20px] pointer-events-none group-hover:bg-purple-500/10 transition duration-500" />
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
                <TrendingUp className="h-16 w-16 text-purple-400" />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-purple-400" /> Performance
              </p>
              <div className="flex items-center gap-1.5">
                <TrendIcon direction={evolution.trend} />
                <span className="text-xs font-bold capitalize text-white">{evolution.trend}</span>
              </div>
            </div>

            {/* Card 6: GCT Trend */}
            <div className="relative overflow-hidden rounded-xl bg-[#08080C]/60 border border-white/[0.05] p-4 hover:border-white/[0.1] hover:bg-[#08080C]/80 transition-all group">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-[20px] pointer-events-none group-hover:bg-emerald-500/10 transition duration-500" />
              <div className="absolute -right-2 -bottom-2 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
                <Gauge className="h-16 w-16 text-emerald-400" />
              </div>
              <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-2 flex items-center gap-1">
                <Gauge className="h-3 w-3 text-emerald-400" /> GCT Trend
              </p>
              <div className="flex items-center gap-1.5">
                <TrendIcon direction={evolution.gctTrend} />
                <span className="text-xs font-bold capitalize text-white">{evolution.gctTrend}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Trend Charts */}
      {!evolutionLoading && evolution && evolution.sessionCount >= 2 && (
        <TrendCharts evolution={evolution} />
      )}

      {evolution && evolution.sessionCount === 1 && (
        <div className="rounded-xl border border-dashed border-white/[0.05] bg-[#08080C]/20 p-6 text-center text-zinc-500 text-xs">
          Upload another session to unlock trend charts and progression analytics.
        </div>
      )}

      {/* Video Overlay Modal */}
      {selectedId && overlayUrls[selectedId] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setSelectedId(null)}>
          <div className="relative w-full max-w-3xl mx-4 rounded-xl border border-white/[0.05] bg-[#08080C] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05] bg-[#08080C]/80">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-[#FF4F21]" />
                Skeleton Overlay Video · {selectedId.slice(0, 8)}
              </span>
              <button onClick={() => setSelectedId(null)} className="text-zinc-500 hover:text-white text-xs font-bold uppercase">✕ Close</button>
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
      <section>
        <h2 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#FF4F21]" />
          {analyses.length > 0 ? `${analyses.length} completed session${analyses.length > 1 ? 's' : ''}` : 'No completed sessions'}
        </h2>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl border border-white/[0.05] bg-[#08080C]/40 animate-pulse" />
            ))}
          </div>
        ) : analyses.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.05] bg-[#08080C]/20 p-16 text-center">
            <Activity className="h-10 w-10 text-zinc-700 mx-auto mb-4 animate-pulse" />
            <p className="text-sm font-bold text-white uppercase">No analyses yet</p>
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

              // Dynamic glow themes based on performance score
              const score = item.scores?.performanceScore ?? 0;
              let glowColor = 'bg-[#FF4F21]/5 group-hover:bg-[#FF4F21]/10';
              let lightColor = 'bg-[#FF4F21]';
              if (score >= 80) {
                glowColor = 'bg-purple-500/5 group-hover:bg-purple-500/10';
                lightColor = 'bg-purple-400';
              } else if (score >= 65) {
                glowColor = 'bg-cyan-500/5 group-hover:bg-cyan-500/10';
                lightColor = 'bg-cyan-400';
              }

              return (
                <div key={id} className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col gap-4 hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 group relative overflow-hidden">
                  {/* Dynamic Gradient Blur Overlay */}
                  <div className={`absolute top-0 right-0 w-32 h-32 ${glowColor} rounded-full blur-[50px] pointer-events-none transition duration-700`} />
                  
                  {/* Subtle watermark in background */}
                  <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition duration-500 pointer-events-none">
                    <Activity className="h-32 w-32 text-white" />
                  </div>

                  {/* Header */}
                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-1">
                      <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-md w-fit">
                        <Clock className="h-2.5 w-2.5 text-zinc-500" />
                        {id.slice(0, 12)}…
                      </p>
                      <p className="text-[10px] text-zinc-500 font-medium flex items-center gap-1.5 px-0.5">
                        <Calendar className="h-2.5 w-2.5 text-zinc-600" />
                        {formatDate(item.createdAt)}
                      </p>
                    </div>
                    {athleteLevel && (
                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border tracking-wider shadow-[0_2px_8px_rgba(0,0,0,0.2)] ${levelStyle}`}>
                        {athleteLevel}
                      </span>
                    )}
                  </div>

                  {/* Main Scores Details */}
                  <div className="grid grid-cols-2 gap-3 relative z-10">
                    <div className="rounded-xl bg-[#08080C]/60 border border-white/[0.05] p-3 text-center hover:border-white/[0.1] transition">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Trophy className="h-2.5 w-2.5 text-[#FF4F21]" /> Performance
                      </p>
                      <div className="relative inline-block">
                        <p className="text-3xl font-black text-white tracking-tighter">{item.scores?.performanceScore ?? '—'}</p>
                        <span className={`absolute -top-1 -right-2 h-1.5 w-1.5 rounded-full ${lightColor} shadow-sm animate-pulse`} />
                      </div>
                    </div>
                    <div className="rounded-xl bg-[#08080C]/60 border border-white/[0.05] p-3 text-center hover:border-white/[0.1] transition">
                      <p className="text-[9px] text-zinc-500 uppercase font-black tracking-wider mb-1 flex items-center justify-center gap-1">
                        <Target className="h-2.5 w-2.5 text-cyan-400" /> Efficiency
                      </p>
                      <div className="relative inline-block">
                        <p className="text-3xl font-black text-white tracking-tighter">{item.scores?.efficiencyScore ?? '—'}</p>
                        <span className="absolute -top-1 -right-2 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-sm animate-pulse" />
                      </div>
                    </div>
                  </div>

                  {/* Telemetry metrics row */}
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="rounded-xl bg-[#08080C]/60 border border-white/[0.03] p-2.5 text-center group/metric hover:border-purple-500/20 transition-all duration-300">
                      <Gauge className="h-3.5 w-3.5 text-purple-400 mx-auto mb-1 group-hover/metric:scale-110 transition duration-300" />
                      <p className="text-xs font-black text-white">{item.metrics?.cadence ?? '—'}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">SPM</p>
                    </div>
                    <div className="rounded-xl bg-[#08080C]/60 border border-white/[0.03] p-2.5 text-center group/metric hover:border-blue-500/20 transition-all duration-300">
                      <Zap className="h-3.5 w-3.5 text-blue-400 mx-auto mb-1 group-hover/metric:scale-110 transition duration-300" />
                      <p className="text-xs font-black text-white">{item.metrics?.gct ?? '—'}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">ms GCT</p>
                    </div>
                    <div className="rounded-xl bg-[#08080C]/60 border border-white/[0.03] p-2.5 text-center group/metric hover:border-emerald-500/20 transition-all duration-300">
                      <Compass className="h-3.5 w-3.5 text-emerald-400 mx-auto mb-1 group-hover/metric:scale-110 transition duration-300" />
                      <p className="text-xs font-black text-white">{item.metrics?.strideLength ?? '—'}</p>
                      <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">m Stride</p>
                    </div>
                  </div>

                  {/* Injury and Symmetry details */}
                  <div className="flex items-center justify-between text-xs py-1 border-t border-b border-white/[0.03] relative z-10 bg-black/10 px-2 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <ShieldAlert className={`h-3.5 w-3.5 ${injColor}`} />
                      <span className={`font-black uppercase tracking-wider text-[10px] ${injColor}`}>{injLevel || 'STABLE'}</span>
                      {item.injuryRisk?.riskArea && item.injuryRisk.riskArea !== 'None' && (
                        <span className="text-zinc-500 text-[9px] font-bold">· {item.injuryRisk.riskArea}</span>
                      )}
                    </div>
                    {item.metrics?.symmetry && (
                      <div className="flex items-center gap-1.5">
                        <Activity className="h-3 w-3 text-emerald-400" />
                        <span className="text-zinc-400 text-[9px] font-black uppercase tracking-wider">{item.metrics.symmetry}% Symmetry</span>
                      </div>
                    )}
                  </div>

                  {/* Progress deltas */}
                  {item.progressData?.hasPrevious && (
                    <div className="flex flex-col gap-1.5 relative z-10">
                      <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.1em] px-0.5">Evolution Comparison</p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <ProgressBadge value={item.progressData.cadenceProgress} type="cadence" />
                        <ProgressBadge value={item.progressData.gctProgress} type="gct" />
                        <ProgressBadge value={item.progressData.strideProgress} type="stride" />
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 pt-2 border-t border-white/[0.05] mt-auto relative z-10">
                    <Link
                      href={`/analysis/${id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-black hover:bg-zinc-900 border border-white/[0.05] py-2 text-[10px] font-bold text-zinc-300 hover:text-white transition duration-200"
                    >
                      <Eye className="h-3 w-3 text-zinc-400" />
                      Telemetry
                    </Link>

                    {(item.hasOverlay || item.skeletonOverlayReady) && (
                      <button
                        onClick={() => loadOverlay(id)}
                        disabled={overlayLoading === id}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[#FF4F21]/10 hover:bg-[#FF4F21]/20 border border-[#FF4F21]/20 py-2 text-[10px] font-bold text-[#FF4F21] disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                      >
                        {overlayLoading === id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Film className="h-3 w-3" />
                        )}
                        Play Overlay
                      </button>
                    )}

                    {item.reportReady && (
                      <Link
                        href={`/report/${id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] py-2 text-[10px] font-bold text-zinc-300 hover:text-white transition duration-200"
                      >
                        <ExternalLink className="h-3 w-3 text-zinc-400" />
                        Report
                      </Link>
                    )}

                    {!item.hasOverlay && !item.skeletonOverlayReady && !item.reportReady && (
                      <div className="flex-1 flex items-center justify-center text-[9px] text-zinc-500 italic py-2">
                        No report media
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
