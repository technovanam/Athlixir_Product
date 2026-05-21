'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { api, useAuth } from '../../context/AuthContext';
import { 
  TrendingUp, Activity, Target, Shield, ArrowUp, ArrowDown, Minus,
  History, Medal, Star, ChevronRight, Scale, Zap, Trophy
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
};

export default function ProgressPage() {
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
    if (series.length < 2) return null;
    const first = series[0][key];
    const last = series[series.length - 1][key];
    if (!first || !last) return null;
    const diff = last - first;
    const pct = ((diff / first) * 100).toFixed(1);
    return { diff, pct: parseFloat(pct) };
  };

  const perfDelta = useMemo(() => evolution ? getDeltaValue(evolution.performanceSeries) : null, [evolution]);
  const cadenceDelta = useMemo(() => evolution ? getDeltaValue(evolution.cadenceSeries) : null, [evolution]);
  const gctDelta = useMemo(() => evolution ? getDeltaValue(evolution.gctSeries) : null, [evolution]);

  const renderTrendIcon = (diff: number, inverseGood = false) => {
    if (diff === 0) return <Minus className="h-4 w-4 text-zinc-500" />;
    const isGood = inverseGood ? diff < 0 : diff > 0;
    if (isGood) return <ArrowUp className={`h-4 w-4 text-emerald-400 ${inverseGood ? 'rotate-180' : ''}`} />;
    return <ArrowDown className={`h-4 w-4 text-red-400 ${inverseGood ? '' : 'rotate-180'}`} />;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin text-[#FF4F21]"><Activity /></div>
      </div>
    );
  }

  if (!evolution || evolution.sessionCount < 1) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Activity className="h-12 w-12 text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Evolution Data Yet</h2>
        <p className="text-sm text-zinc-500 max-w-sm">Upload at least one sprint analysis to start tracking your long-term athletic progression.</p>
      </div>
    );
  }

  const sAData = historyList.find(h => (h.id || h.analysisId) === sessionA);
  const sBData = historyList.find(h => (h.id || h.analysisId) === sessionB);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-8 animate-fadeIn pb-24">
      {/* 1. HERO EVOLUTION SUMMARY */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Core Identity */}
        <div className="lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-[#FF4F21]/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#FF4F21]/20 transition duration-700" />
          
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center font-bold text-sm text-white shadow-[0_0_15px_rgba(255,79,33,0.3)]">
              {user?.username?.substring(0,2).toUpperCase() || 'AT'}
            </div>
            <div>
              <h2 className="text-lg font-black text-white">{user?.name || user?.username || 'Athlete'}</h2>
              <p className="text-[10px] font-bold text-[#FF4F21] uppercase tracking-widest">{user?.classification?.athleteLevel || 'U18 Sprinter'}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-zinc-800/80">
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-1">Overall Evolution</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-white">{evolution.overallProgress || '+0.0%'}</span>
              <TrendingUp className="h-5 w-5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-zinc-400 mt-2">Across {evolution.sessionCount} total sessions</p>
          </div>
        </div>

        {/* Dynamic Delta Cards */}
        <div className="lg:col-span-3 grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Target className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sprint Efficiency</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white flex items-center gap-2">
                {perfDelta && perfDelta.diff > 0 ? '+' : ''}{perfDelta?.pct || 0}% 
                {perfDelta && renderTrendIcon(perfDelta.diff)}
              </div>
              <div className="text-[10px] font-bold text-zinc-500 mt-1">Since first scan</div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Cadence</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white flex items-center gap-2">
                {cadenceDelta && cadenceDelta.diff > 0 ? '+' : ''}{cadenceDelta?.pct || 0}% 
                {cadenceDelta && renderTrendIcon(cadenceDelta.diff)}
              </div>
              <div className="text-[10px] font-bold text-zinc-500 mt-1">Since first scan</div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col justify-between">
            <div className="flex items-center gap-2 text-zinc-500 mb-2">
              <Zap className="h-4 w-4 text-[#FF4F21]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Ground Contact</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white flex items-center gap-2">
                {gctDelta && gctDelta.diff > 0 ? '+' : ''}{gctDelta?.diff || 0}ms 
                {gctDelta && renderTrendIcon(gctDelta.diff, true)}
              </div>
              <div className="text-[10px] font-bold text-zinc-500 mt-1">Lower is better</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PERFORMANCE TREND CHARTS */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Activity className="h-5 w-5 text-[#FF4F21]" /> Longitudinal Trends
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Performance Trend */}
          <div className="h-[250px] w-full">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Performance Score</p>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolution.performanceSeries}>
                <defs>
                  <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4F21" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#FF4F21" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} width={30} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#FF4F21" strokeWidth={3} fillOpacity={1} fill="url(#colorPerf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* GCT Trend (Lower is better) */}
          <div className="h-[250px] w-full">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Ground Contact Time (ms)</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolution.gctSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={['auto', 'auto']} stroke="#52525b" fontSize={10} tickLine={false} axisLine={false} width={35} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#000', borderColor: '#333', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#60a5fa', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. BENCHMARK PROGRESSION */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" /> Benchmark Ladder
          </h3>
          <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-0.5 before:bg-zinc-800">
            {['Elite', 'National', 'State', 'District', 'Beginner'].map((tier, i) => {
              const currentTier = user?.classification?.athleteLevel || 'District Athlete';
              const isCurrent = currentTier.includes(tier);
              const isPast = ['Elite', 'National', 'State', 'District', 'Beginner'].indexOf(currentTier.split(' ')[0] || 'District') < i;

              return (
                <div key={tier} className={`relative pl-8 transition-opacity ${isCurrent ? 'opacity-100' : isPast ? 'opacity-50' : 'opacity-20'}`}>
                  <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-4 border-zinc-950 flex items-center justify-center ${isCurrent ? 'bg-[#FF4F21]' : isPast ? 'bg-zinc-600' : 'bg-zinc-800'}`}>
                    {isCurrent && <span className="h-2 w-2 rounded-full bg-white animate-pulse" />}
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isCurrent ? 'text-[#FF4F21]' : 'text-white'}`}>{tier} Tier</h4>
                    {isCurrent && (
                      <div className="mt-2 h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FF4F21] to-[#FF8433] w-[45%]" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. IMPROVEMENT AI INSIGHTS */}
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-emerald-400" /> Progression Intelligence
          </h3>
          <div className="flex-1 space-y-4">
            <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
              <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">
                Your acceleration mechanics improved significantly in the last 3 sessions. GCT has consistently trended downwards.
              </p>
            </div>
            {cadenceDelta && cadenceDelta.diff > 0 && (
              <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                <p className="text-xs text-blue-200/90 font-medium leading-relaxed">
                  Turnover rate (Cadence) is up {cadenceDelta.pct}%. You are successfully transitioning to a mid-foot strike pattern.
                </p>
              </div>
            )}
            <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
              <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                At your current progression rate, your Cadence may reach the **State Benchmark** within the next 4 sessions.
              </p>
            </div>
          </div>
        </section>

      </div>

      {/* 5. SESSION COMPARISON TOOL */}
      {historyList.length >= 2 && (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-400" /> Biomechanics Comparison
            </h3>
            <div className="flex items-center gap-2">
              <select 
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                value={sessionA || ''}
                onChange={e => setSessionA(e.target.value)}
              >
                {historyList.map(h => <option key={h.id || h.analysisId} value={h.id || h.analysisId}>{new Date(h.createdAt).toLocaleDateString()}</option>)}
              </select>
              <span className="text-zinc-600 font-bold text-[10px] uppercase">VS</span>
              <select 
                className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                value={sessionB || ''}
                onChange={e => setSessionB(e.target.value)}
              >
                {historyList.map(h => <option key={h.id || h.analysisId} value={h.id || h.analysisId}>{new Date(h.createdAt).toLocaleDateString()}</option>)}
              </select>
            </div>
          </div>

          {sAData && sBData ? (
            <div className="grid grid-cols-3 gap-0 border border-zinc-800 rounded-xl overflow-hidden bg-black text-center">
              {/* Header */}
              <div className="p-3 bg-zinc-900/50 border-r border-b border-zinc-800 text-xs font-bold text-zinc-400">Metric</div>
              <div className="p-3 bg-zinc-900/50 border-r border-b border-zinc-800 text-xs font-bold text-white">Session A</div>
              <div className="p-3 bg-zinc-900/50 border-b border-zinc-800 text-xs font-bold text-white">Session B</div>

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
                    <div className="p-4 border-r border-b border-zinc-800 text-xs font-bold text-zinc-500 flex items-center justify-center">{row.label}</div>
                    <div className="p-4 border-r border-b border-zinc-800 text-sm font-black text-zinc-300 flex items-center justify-center">{valA}</div>
                    <div className="p-4 border-b border-zinc-800 text-sm font-black text-white flex items-center justify-center gap-2">
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
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Medal className="h-5 w-5 text-amber-500" /> Retention & Consistency
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-center">
            <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Active Streak</p>
            <p className="text-2xl font-black text-white">4 Weeks</p>
          </div>
          <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-center">
            <p className="text-[10px] text-blue-400 font-bold uppercase mb-1">Total Scans</p>
            <p className="text-2xl font-black text-white">{historyList.length}</p>
          </div>
          <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
            <p className="text-[10px] text-amber-400 font-bold uppercase mb-1">Evolution Score</p>
            <p className="text-2xl font-black text-white">{evolution.consistencyIndex || 85}</p>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-center flex flex-col items-center justify-center">
            <Star className="h-5 w-5 text-zinc-500 mb-1" />
            <p className="text-[10px] text-zinc-500 font-bold uppercase">Next Reward at 10 Scans</p>
          </div>
        </div>
      </section>

    </div>
  );
}
