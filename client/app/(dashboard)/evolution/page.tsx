'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import {
  TrendingUp, Activity, Target, ArrowUp, ArrowDown, Minus,
  Zap, Trophy, Compass, Lock, CheckCircle2, UploadCloud,
  FileText, ArrowRight, Sparkles, Flame, Timer, Footprints
} from 'lucide-react';
import Link from 'next/link';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';

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
  aiInsights?: {
    progressSummary?: string;
    highlights?: string[];
    trendAnalysis?: string;
    progressCommentary?: string;
  } | null;
};

const TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  borderColor: '#EBEBEB',
  borderRadius: '16px',
  fontSize: '12px',
  boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
  padding: '8px 12px',
};
const AXIS_STYLE = { fontSize: 11, fill: '#8E8E93', fontWeight: 600 };

export default function EvolutionPage() {
  const { user } = useAuth();
  const [evolution, setEvolution] = useState<EvolutionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const evoRes = await api.get('/analysis/evolution');
      setFetchError(null);
      const evoData = evoRes.data?.data?.evolution || evoRes.data?.evolution || evoRes.data?.data;
      if (evoData) setEvolution(evoData);
    } catch (err) {
      console.error('Failed to load progress data', err);
      setFetchError(classifyFetchError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getDeltaValue = (series: any[], key: string = 'value') => {
    if (!series || series.length < 2) return null;
    const first = series[0][key];
    const last = series[series.length - 1][key];
    if (first === undefined || last === undefined) return null;
    const diff = last - first;
    const pct = first !== 0 ? ((diff / first) * 100).toFixed(1) : '0.0';
    return { diff, pct: parseFloat(pct) };
  };

  const perfDelta = useMemo(() => evolution ? getDeltaValue(evolution.performanceSeries) : null, [evolution]);
  const cadenceDelta = useMemo(() => evolution ? getDeltaValue(evolution.cadenceSeries) : null, [evolution]);
  const gctDelta = useMemo(() => evolution ? getDeltaValue(evolution.gctSeries) : null, [evolution]);

  const athleteName = user?.physicalProfile?.full_name || user?.name || user?.username || 'Athlete';
  const firstName = athleteName.split(' ')[0];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  const deltaCards = [
    {
      label: 'Sprint Readiness Gain',
      icon: Target,
      color: 'text-[#FF4F21]',
      bg: 'bg-[#FF4F21]/10',
      delta: perfDelta,
      unit: '%',
      suffix: 'pct',
      sub: 'Cumulative Score Delta'
    },
    {
      label: 'Step Cadence Drift',
      icon: Timer,
      color: 'text-[#FF4F21]',
      bg: 'bg-[#FF4F21]/10',
      delta: cadenceDelta,
      unit: '%',
      suffix: 'pct',
      sub: 'Target: 180+ SPM'
    },
    {
      label: 'Ground Contact Decay',
      icon: Footprints,
      color: 'text-[#34C759]',
      bg: 'bg-[#34C759]/10',
      delta: gctDelta,
      unit: 'ms',
      suffix: 'diff',
      inverseGood: true,
      sub: 'Optimal: < 100ms'
    },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-24 space-y-7 animate-fadeIn font-poppins relative z-10 text-[#1C1C1E]">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase block">
            {currentDate} · PERFORMANCE TELEMETRY ARCHIVE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight mt-0.5">
            Progress & Evolution
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard?tab=biomechanics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition cursor-pointer"
          >
            <UploadCloud size={15} />
            <span>Upload Sprint Video</span>
          </Link>

          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#1C1C1E] text-xs font-bold hover:bg-zinc-50 active:scale-95 transition shadow-2xs"
          >
            <FileText size={14} className="text-[#8E8E93]" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Activity className="h-7 w-7 animate-spin text-[#FF4F21]" />
        </div>
      ) : fetchError ? (
        <DataFetchError error={fetchError} onRetry={fetchData} />
      ) : !evolution || evolution.sessionCount < 1 ? (
        <div className="rounded-[28px] bg-white border border-black/[0.06] p-12 text-center shadow-xs">
          <Activity size={40} className="text-[#FF4F21] mx-auto mb-3" />
          <h2 className="text-lg font-black text-[#1C1C1E]">No Evolution Trajectory Yet</h2>
          <p className="text-xs text-[#8E8E93] font-medium mt-1 max-w-sm mx-auto">
            Upload and analyze your sprint sessions to unlock longitudinal AI telemetry and trend curves.
          </p>
          <Link
            href="/dashboard?tab=biomechanics"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition mt-5"
          >
            <UploadCloud size={16} />
            <span>Upload First Sprint Clip</span>
          </Link>
        </div>
      ) : (
        <>
          {/* 2. HERO PROGRESS CARD */}
          <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                    Biomechanical Performance Curve
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF4F21]/10 text-[#FF4F21] uppercase">
                    {user?.physicalProfile?.primary_event || '100m'} · {user?.physicalProfile?.competition_level || 'Sprinter'}
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#1C1C1E] tracking-tight">
                  {athleteName}&apos;s Velocity Trajectory
                </h2>
                {evolution.aiInsights?.progressSummary && (
                  <p className="text-xs text-[#636366] max-w-2xl leading-relaxed italic border-l-2 border-[#FF4F21] pl-3">
                    &quot;{evolution.aiInsights.progressSummary}&quot;
                  </p>
                )}
              </div>

              {/* Stat Pillars */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-black/[0.06] lg:pl-6">
                <div className="flex-1 min-w-[120px] p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
                  <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                    Total Runs
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#1C1C1E] mt-1">
                    {evolution.sessionCount}
                  </div>
                </div>

                <div className="flex-1 min-w-[120px] p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
                  <span className="text-[11px] font-bold text-[#34C759] uppercase tracking-wider flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#34C759]" /> Growth Index
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-[#34C759] mt-1 flex items-center gap-1">
                    {evolution.overallProgress || 'Active'} <TrendingUp size={20} />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 3. THREE DELTA KPI TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {deltaCards.map((c) => {
              const Icon = c.icon;
              const value = !c.delta
                ? '—'
                : c.suffix === 'pct'
                  ? `${c.delta.diff > 0 ? '+' : ''}${c.delta.pct}%`
                  : `${c.delta.diff > 0 ? '+' : ''}${c.delta.diff}${c.unit}`;
              const isPositive = c.delta ? (c.inverseGood ? c.delta.diff < 0 : c.delta.diff > 0) : false;

              return (
                <div
                  key={c.label}
                  className="rounded-3xl bg-white border border-black/[0.06] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                      {c.label}
                    </span>
                    <div className={`h-8 w-8 rounded-xl ${c.bg} ${c.color} flex items-center justify-center font-bold`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">
                        {value}
                      </span>
                      {c.delta && (
                        <div className={`text-xs font-bold flex items-center gap-0.5 ${isPositive ? 'text-[#34C759]' : 'text-[#FF4F21]'}`}>
                          {isPositive ? <ArrowUp size={13} /> : <ArrowDown size={13} />}
                          <span>{Math.abs(c.delta.pct)}%</span>
                        </div>
                      )}
                    </div>
                    <div className="text-[11px] font-semibold text-[#8E8E93] mt-1">
                      {c.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 4. CHARTS SECTION (2 COLUMNS) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Performance Trajectory */}
            <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1C1C1E]">
                      Sprint Score Progression
                    </h3>
                    <p className="text-xs text-[#8E8E93] font-medium">
                      Normalized 0–100 kinetic rating
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[240px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={evolution.performanceSeries}>
                    <defs>
                      <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF4F21" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#FF4F21" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" stroke="#8E8E93" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={AXIS_STYLE} tickLine={false} axisLine={false} width={28} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#1C1C1E', fontWeight: 'bold' }} />
                    <Area type="monotone" dataKey="value" stroke="#FF4F21" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Ground Contact Time */}
            <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-2xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#1C1C1E]">
                      Ground Contact Time (GCT)
                    </h3>
                    <p className="text-xs text-[#8E8E93] font-medium">
                      Millisecond foot-strike ground interaction
                    </p>
                  </div>
                </div>
              </div>
              <div className="h-[240px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolution.gctSeries}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis dataKey="date" stroke="#8E8E93" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} tick={AXIS_STYLE} tickLine={false} axisLine={false} width={30} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} itemStyle={{ color: '#FF4F21', fontWeight: 'bold' }} />
                    <Line type="monotone" dataKey="value" stroke="#FF4F21" strokeWidth={3} dot={{ r: 4, fill: '#FF4F21', strokeWidth: 0 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* 5. COMPETITIVE BENCHMARK LADDER */}
          <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-2xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center">
                  <Trophy size={18} />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#1C1C1E]">
                    Competitive Benchmark Ladder
                  </h3>
                  <p className="text-xs text-[#8E8E93] font-medium">
                    Collegiate and international athletics classification tiers
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
              {['Beginner', 'District', 'State', 'National', 'Elite'].map((tier, i) => {
                const currentTier = user?.physicalProfile?.competition_level || 'National';
                const isCurrent = currentTier.toLowerCase().includes(tier.toLowerCase());
                const tierRank = ['Beginner', 'District', 'State', 'National', 'Elite'].indexOf(tier);
                const currentRank = ['Beginner', 'District', 'State', 'National', 'Elite'].findIndex(t => currentTier.toLowerCase().includes(t.toLowerCase()));
                const isPast = tierRank < (currentRank === -1 ? 3 : currentRank);

                return (
                  <div
                    key={tier}
                    className={`rounded-2xl p-4 border transition-all ${
                      isCurrent
                        ? 'bg-[#FFF5F2] border-[#FF4F21] shadow-xs'
                        : isPast
                          ? 'bg-[#F8F8FA] border-black/[0.06]'
                          : 'bg-white border-black/[0.03] opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-[#FF4F21]' : 'text-[#8E8E93]'}`}>
                        Tier {i + 1}
                      </span>
                      {isCurrent ? (
                        <div className="h-6 w-6 rounded-full bg-[#FF4F21] text-white flex items-center justify-center">
                          <CheckCircle2 size={13} />
                        </div>
                      ) : isPast ? (
                        <div className="h-6 w-6 rounded-full bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                          <CheckCircle2 size={13} />
                        </div>
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center">
                          <Lock size={11} />
                        </div>
                      )}
                    </div>
                    <h4 className={`text-base font-black ${isCurrent ? 'text-[#FF4F21]' : 'text-[#1C1C1E]'}`}>
                      {tier}
                    </h4>
                    <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">
                      {isCurrent ? 'Current Level' : isPast ? 'Completed Tier' : 'Upcoming Target'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

    </div>
  );
}

