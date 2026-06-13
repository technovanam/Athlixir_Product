'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, Activity, Target, Shield, ArrowUp, ArrowDown, Minus,
  History, Medal, Star, ChevronRight, Scale, Zap, Trophy, Compass,
  Lock, CheckCircle2, AlertTriangle, Lightbulb, Calendar, Award
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

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

export default function EvolutionPage() {
  const { user } = useAuth();
  const [evolution, setEvolution] = useState<EvolutionData | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Comparison State
  const [sessionA, setSessionA] = useState<string | null>(null);
  const [sessionB, setSessionB] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evoRes, listRes] = await Promise.all([
          api.get('/analysis/evolution'),
          api.get('/analysis/list')
        ]);
        
        const evoData = evoRes.data?.data?.evolution || evoRes.data?.evolution || evoRes.data?.data;
        if (evoData) setEvolution(evoData);

        const list = listRes.data?.data ?? listRes.data ?? [];
        if (Array.isArray(list)) {
          const completed = list.filter((a: any) => a.status === 'COMPLETED');
          completed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
          setHistoryList(completed);
          
          if (completed.length >= 2) {
            setSessionA(completed[0].id || completed[0].analysisId); // Oldest
            setSessionB(completed[completed.length - 1].id || completed[completed.length - 1].analysisId); // Newest
          }
        }
      } catch (err) {
        console.error('Failed to load progress data', err);
      } finally {
        setLoading(false);
      }
    };
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

  const renderTrendIcon = (diff: number, inverseGood = false) => {
    if (diff === 0) return <Minus className="h-3 w-3 text-zinc-500" />;
    const isGood = inverseGood ? diff < 0 : diff > 0;
    if (isGood) return <ArrowUp className={`h-3 w-3 text-emerald-400 ${inverseGood ? 'rotate-180' : ''}`} />;
    return <ArrowDown className={`h-3 w-3 text-red-400 ${inverseGood ? '' : 'rotate-180'}`} />;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-[#FF4F21]"><Activity className="h-8 w-8" /></div>
      </div>
    );
  }

  if (!evolution || evolution.sessionCount < 1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-4 rounded-full bg-[#08080C]/40 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md mb-4 text-[#FF4F21]/70">
          <Activity className="h-10 w-10 animate-pulse" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Evolution Data Yet</h2>
        <p className="text-sm text-zinc-500 max-w-sm">Upload at least one sprint analysis to start tracking your long-term athletic progression.</p>
      </div>
    );
  }

  const sAData = historyList.find(h => (h.id || h.analysisId) === sessionA);
  const sBData = historyList.find(h => (h.id || h.analysisId) === sessionB);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-10 animate-fadeIn pb-24">
      
      {/* 1. HERO EVOLUTION SUMMARY */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Core Athlete Identity Card */}
        <div className="lg:col-span-1 rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4F21]/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-[#FF4F21]/10 transition duration-700" />
          
          <h2 className="text-xl font-bold text-white mb-1 tracking-tight">{user?.name || user?.username || 'Athlete'}</h2>
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-[10px] font-bold text-[#FF4F21] uppercase tracking-[0.15em]">{user?.classification?.primaryEvent || '100m Sprint'}</span>
            <span className="text-[10px] font-semibold text-zinc-500 tracking-wider">{user?.classification?.athleteLevel || 'U18 District Level'}</span>
          </div>

          <div className="border-t border-white/[0.03] pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-1.5">
                <Compass className="h-3 w-3 text-blue-400" /> Evolution Summary
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F21] shadow-[0_0_8px_rgba(255,79,33,0.8)] animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg border border-white/[0.02]">
                <span className="text-[11px] text-zinc-400">Total Sessions</span>
                <span className="text-[11px] font-bold text-white">{evolution.sessionCount}</span>
              </div>
              <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg border border-white/[0.02]">
                <span className="text-[11px] text-zinc-400">Overall Progress</span>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  {evolution.overallProgress || '+0.0%'} <TrendingUp className="h-3 w-3" />
                </span>
              </div>
            </div>
            {evolution.aiInsights?.progressSummary && (
              <p className="text-[10px] text-zinc-400 italic mt-3 border-t border-white/[0.03] pt-3 leading-relaxed">
                &quot;{evolution.aiInsights.progressSummary}&quot;
              </p>
            )}
          </div>
        </div>

        {/* Dynamic Delta Cards (Styled precisely like dashboard KPI widgets) */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Sprint Efficiency */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500 text-emerald-400">
              <Target className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Target className="h-4 w-4 text-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Sprint Efficiency</span>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tighter">
                {perfDelta && perfDelta.diff > 0 ? '+' : ''}{perfDelta?.pct || 0}% 
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {perfDelta && renderTrendIcon(perfDelta.diff)}
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Since first scan</span>
              </div>
            </div>
          </div>

          {/* Card 2: Cadence */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500 text-blue-400">
              <Activity className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Cadence Progression</span>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tighter">
                {cadenceDelta && cadenceDelta.diff > 0 ? '+' : ''}{cadenceDelta?.pct || 0}% 
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {cadenceDelta && renderTrendIcon(cadenceDelta.diff)}
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Since first scan</span>
              </div>
            </div>
          </div>

          {/* Card 3: Ground Contact Time */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500 text-[#FF4F21]">
              <Zap className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Zap className="h-4 w-4 text-[#FF4F21]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Ground Contact Time</span>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tighter">
                {gctDelta && gctDelta.diff > 0 ? '+' : ''}{gctDelta?.diff || 0}ms 
              </div>
              <div className="flex items-center gap-1.5 mt-2">
                {gctDelta && renderTrendIcon(gctDelta.diff, true)}
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Lower is better</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. PERFORMANCE TREND CHARTS */}
      <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
          <Activity className="h-4 w-4 text-[#FF4F21]" /> Longitudinal Trends
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Performance Trend */}
          <div className="h-[250px] w-full">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5">
              <Trophy className="h-3.5 w-3.5 text-amber-500" /> Performance Score
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolution.performanceSeries}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4F21" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF4F21" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#52525b" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} width={30} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#08080C', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#FF4F21" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPerf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* GCT Trend (Lower is better) */}
          <div className="h-[250px] w-full">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-blue-400" /> Ground Contact Time (ms)
            </p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolution.gctSeries}>
                <defs>
                  <linearGradient id="colorGct" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#60a5fa" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#52525b" fontSize={9} fontWeight="bold" tickLine={false} axisLine={false} width={35} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#08080C', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px', backdropFilter: 'blur(10px)' }}
                  itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2.5} dot={{ r: 3, fill: '#60a5fa', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. BENCHMARK PROGRESSION */}
        <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-400" /> Benchmark Ladder
          </h3>
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-white/[0.05]">
            {['Elite', 'National', 'State', 'District', 'Beginner'].map((tier, i) => {
              const currentTier = user?.classification?.athleteLevel || 'District Athlete';
              const isCurrent = currentTier.includes(tier);
              const isPast = ['Elite', 'National', 'State', 'District', 'Beginner'].indexOf(currentTier.split(' ')[0] || 'District') < i;

              return (
                <div key={tier} className={`relative pl-8 transition-opacity duration-300 ${isCurrent ? 'opacity-100' : isPast ? 'opacity-70' : 'opacity-30'}`}>
                  <div className={`absolute left-0 top-1 h-6 w-6 rounded-full border-2 flex items-center justify-center transition duration-300 ${isCurrent ? 'bg-[#FF4F21]/20 border-[#FF4F21] text-[#FF4F21]' : isPast ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-950 border-zinc-800 text-zinc-600'}`}>
                    {isCurrent ? (
                      <Compass className="h-3 w-3 animate-spin-slow" />
                    ) : isPast ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Lock className="h-2.5 w-2.5" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold transition duration-300 ${isCurrent ? 'text-[#FF4F21] text-sm' : isPast ? 'text-zinc-200' : 'text-zinc-500'}`}>{tier} Tier</h4>
                    {isCurrent && (
                      <div className="mt-2.5 h-1.5 w-full bg-[#08080C]/60 rounded-full overflow-hidden border border-white/[0.03]">
                        <div className="h-full bg-gradient-to-r from-[#FF4F21] to-[#FF8433] w-[45%] shadow-[0_0_8px_rgba(255,79,33,0.5)]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. IMPROVEMENT AI INSIGHTS */}
        <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" /> Progression Intelligence
          </h3>
          <div className="flex-1 space-y-4">
            
            {evolution.aiInsights ? (
              <>
                {evolution.aiInsights.highlights?.map((highlight: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">
                      {highlight}
                    </p>
                  </div>
                ))}
                
                {evolution.aiInsights.trendAnalysis && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5">
                    <TrendingUp className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-200/90 font-medium leading-relaxed">
                      {evolution.aiInsights.trendAnalysis}
                    </p>
                  </div>
                )}

                {evolution.aiInsights.progressCommentary && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                      {evolution.aiInsights.progressCommentary}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">
                    Your acceleration mechanics improved significantly in the last 3 sessions. GCT has consistently trended downwards.
                  </p>
                </div>
                
                {cadenceDelta && cadenceDelta.diff > 0 && (
                  <div className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-500/20 bg-blue-500/5">
                    <TrendingUp className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-200/90 font-medium leading-relaxed">
                      Turnover rate (Cadence) is up {cadenceDelta.pct}%. You are successfully transitioning to a mid-foot strike pattern.
                    </p>
                  </div>
                )}
                
                <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                  <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                    At your current progression rate, your Cadence may reach the **State Benchmark** within the next 4 sessions.
                  </p>
                </div>
              </>
            )}

          </div>
        </section>

      </div>

      {/* 5. SESSION COMPARISON TOOL */}
      {historyList.length >= 2 && (
        <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
              <Scale className="h-4 w-4 text-blue-400" /> Biomechanics Comparison
            </h3>
            <div className="flex items-center gap-2">
              <select 
                className="bg-[#08080C] border border-white/[0.05] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF4F21]/80 backdrop-blur-xl transition duration-300"
                value={sessionA || ''}
                onChange={e => setSessionA(e.target.value)}
              >
                {historyList.map(h => <option key={h.id || h.analysisId} value={h.id || h.analysisId}>{new Date(h.createdAt).toLocaleDateString()}</option>)}
              </select>
              <span className="text-zinc-500 font-bold text-[9px] uppercase px-2">VS</span>
              <select 
                className="bg-[#08080C] border border-white/[0.05] rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#FF4F21]/80 backdrop-blur-xl transition duration-300"
                value={sessionB || ''}
                onChange={e => setSessionB(e.target.value)}
              >
                {historyList.map(h => <option key={h.id || h.analysisId} value={h.id || h.analysisId}>{new Date(h.createdAt).toLocaleDateString()}</option>)}
              </select>
            </div>
          </div>

          {sAData && sBData ? (
            <div className="grid grid-cols-3 gap-0 border border-white/[0.05] rounded-xl overflow-hidden bg-[#08080C]/20 text-center">
              {/* Header */}
              <div className="p-3 bg-[#08080C]/80 border-r border-b border-white/[0.05] text-xs font-bold text-zinc-400">Metric</div>
              <div className="p-3 bg-[#08080C]/80 border-r border-b border-white/[0.05] text-xs font-bold text-white">Session A</div>
              <div className="p-3 bg-[#08080C]/80 border-b border-white/[0.05] text-xs font-bold text-white">Session B</div>

              {/* Rows */}
              {[
                { label: 'Performance Score', key: 'performanceScore', parent: 'scores' },
                { label: 'Cadence (spm)', key: 'cadence', parent: 'metrics' },
                { label: 'GCT (ms)', key: 'gct', parent: 'metrics' },
                { label: 'Symmetry (%)', key: 'symmetry', parent: 'metrics' },
              ].map((row, i) => {
                const valA = sAData[row.parent]?.[row.key] || 0;
                const valB = sBData[row.parent]?.[row.key] || 0;
                const diff = valB - valA;
                const isGood = row.key === 'gct' ? diff < 0 : diff > 0;
                const diffColor = diff === 0 ? 'text-zinc-500' : isGood ? 'text-emerald-400' : 'text-red-400';

                return (
                  <React.Fragment key={i}>
                    <div className="p-4 border-r border-b border-white/[0.05] text-xs font-bold text-zinc-400 flex items-center justify-center bg-[#08080C]/20">{row.label}</div>
                    <div className="p-4 border-r border-b border-white/[0.05] text-sm font-black text-zinc-300 flex items-center justify-center">{valA}</div>
                    <div className="p-4 border-b border-white/[0.05] text-sm font-black text-white flex items-center justify-center gap-2">
                      {valB}
                      <span className={`text-[10px] ${diffColor}`}>
                        ({diff > 0 ? '+' : ''}{diff.toFixed(1)})
                      </span>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-zinc-500 text-center">Select two sessions to compare metrics.</p>
          )}
        </section>
      )}

      {/* 6. CONSISTENCY TRACKER */}
      <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
          <Medal className="h-4 w-4 text-amber-500" /> Retention & Consistency
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* Streak Card */}
          <div className="p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center flex flex-col justify-between hover:border-emerald-500/40 hover:bg-emerald-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500 text-emerald-400">
              <Calendar className="h-24 w-24" />
            </div>
            <p className="text-[9px] text-emerald-400 font-bold uppercase mb-2 tracking-widest relative z-10">Active Streak</p>
            <p className="text-2xl font-black text-white relative z-10">4 Weeks</p>
          </div>

          {/* Scans Card */}
          <div className="p-5 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center flex flex-col justify-between hover:border-blue-500/40 hover:bg-blue-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500 text-blue-400">
              <History className="h-24 w-24" />
            </div>
            <p className="text-[9px] text-blue-400 font-bold uppercase mb-2 tracking-widest relative z-10">Total Scans</p>
            <p className="text-2xl font-black text-white relative z-10">{historyList.length}</p>
          </div>

          {/* Index Card */}
          <div className="p-5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center flex flex-col justify-between hover:border-amber-500/40 hover:bg-amber-500/10 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500 text-amber-500">
              <Award className="h-24 w-24" />
            </div>
            <p className="text-[9px] text-amber-400 font-bold uppercase mb-2 tracking-widest relative z-10">Consistency Index</p>
            <p className="text-2xl font-black text-white relative z-10">{evolution.consistencyIndex || 85}</p>
          </div>

          {/* Reward Card */}
          <div className="p-5 rounded-xl border border-white/[0.05] bg-[#08080C]/20 text-center flex flex-col items-center justify-center hover:border-white/[0.1] hover:bg-[#08080C]/40 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500 text-zinc-500">
              <Star className="h-24 w-24" />
            </div>
            <Star className="h-5 w-5 text-[#FF4F21] mb-1.5 animate-pulse relative z-10" />
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest relative z-10">Next Reward</p>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase relative z-10">at 10 scans</p>
          </div>

        </div>
      </section>

    </div>
  );
}
