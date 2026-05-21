'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, api } from '../context/AuthContext';
import BiomechanicsPanel from './BiomechanicsPanel';
import { 
  Activity, Zap, Target, Shield, UploadCloud, 
  FileText, TrendingUp, Compass, ArrowRight, PlayCircle, Trophy
} from 'lucide-react';
import InsightsWidget from './components/InsightsWidget';
import BenchmarkWidget from './components/BenchmarkWidget';
import ProgressWidget from './components/ProgressWidget';
import InjuryIntelligence from './components/InjuryIntelligence';
import EvolutionTimeline from './components/EvolutionTimeline';
import AchievementsWidget from './components/AchievementsWidget';

function DashboardPageContent() {
  const { user } = useAuth();
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/analysis/list');
        const list = res.data?.data ?? res.data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          const completed = list.filter((a: any) => a.status === 'COMPLETED');
          setHistoryList(completed);
          if (completed.length > 0) {
            completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLatestAnalysis(completed[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load analysis for hero', err);
      }
    };
    fetchLatest();
  }, []);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-10 animate-fadeIn">
      
      {/* 1. HERO ATHLETE OVERVIEW */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Athlete Identity & AI Summary */}
        <div className="lg:col-span-1 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 relative overflow-hidden group hover:border-zinc-700 transition">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4F21]/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-[#FF4F21]/20 transition duration-700" />
          
          <h2 className="text-2xl font-black text-white mb-1 tracking-tight">{user?.name || user?.username || 'Athlete'}</h2>
          <div className="flex flex-col gap-1 mb-6">
            <span className="text-xs font-bold text-[#FF4F21] uppercase tracking-widest">{user?.classification?.primaryEvent || '100m Sprint'}</span>
            <span className="text-xs font-semibold text-zinc-500">{user?.classification?.athleteLevel || 'U18 District Level'}</span>
          </div>

          <div className="border-t border-zinc-800/80 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Compass className="h-3 w-3 text-blue-400" /> AI Summary
              </span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            </div>
            
            {latestAnalysis ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg border border-zinc-800/50">
                  <span className="text-xs text-zinc-400">Sprint Efficiency</span>
                  <span className="text-xs font-bold text-white">{latestAnalysis.scores?.efficiencyScore || 'N/A'}%</span>
                </div>
                <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg border border-zinc-800/50">
                  <span className="text-xs text-zinc-400">Main Weakness</span>
                  <span className="text-[10px] font-bold text-amber-400 uppercase">{latestAnalysis.insights?.weaknesses?.[0]?.substring(0, 15) || 'OVERSTRIDE'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic">No completed analysis yet. Upload a video to generate your AI profile.</p>
            )}
          </div>
        </div>

        {/* Big KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500">
              <Trophy className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Trophy className="h-4 w-4 text-[#FF4F21]" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Perf Score</span>
            </div>
            <div>
              <div className="text-4xl font-black text-white tracking-tighter">{latestAnalysis?.scores?.performanceScore || '—'}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] font-bold text-emerald-400">+2 from last</span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500">
              <Target className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Biomechanics</span>
            </div>
            <div>
              <div className="text-4xl font-black text-white tracking-tighter">{latestAnalysis?.scores?.biomechanicsScore || '—'}</div>
              <div className="text-[10px] font-bold text-zinc-500 mt-2">State Level Average</div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500">
              <Activity className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Efficiency</span>
            </div>
            <div>
              <div className="text-4xl font-black text-white tracking-tighter">{latestAnalysis?.scores?.efficiencyScore || '—'}</div>
              <div className="text-[10px] font-bold text-zinc-500 mt-2">Optimal range</div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500">
              <Shield className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Shield className="h-4 w-4 text-amber-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Injury Risk</span>
            </div>
            <div>
              <div className="text-3xl font-black text-white tracking-tighter uppercase">{latestAnalysis?.injuryRisk?.level || 'LOW'}</div>
              <div className="text-[10px] font-bold text-amber-500 mt-2 truncate">
                {latestAnalysis?.injuryRisk?.riskArea !== 'None' ? `Watch: ${latestAnalysis?.injuryRisk?.riskArea}` : 'Stable mechanics'}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. QUICK ACTIONS */}
      <section>
        <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap className="h-3 w-3" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3 p-4 rounded-xl border border-[#FF4F21]/30 bg-[#FF4F21]/10 hover:bg-[#FF4F21]/20 transition group">
            <div className="h-8 w-8 rounded-lg bg-[#FF4F21] flex items-center justify-center">
              <UploadCloud className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white group-hover:text-[#FF4F21] transition">Upload New</div>
              <div className="text-[10px] text-zinc-400">Analyze sprint</div>
            </div>
          </button>

          <Link href="/dashboard/reports" className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 transition group">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <FileText className="h-4 w-4 text-zinc-400 group-hover:text-white transition" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">View Reports</div>
              <div className="text-[10px] text-zinc-500">PDF summaries</div>
            </div>
          </Link>

          <Link href="/dashboard/recommendations" className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 transition group">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <Target className="h-4 w-4 text-zinc-400 group-hover:text-emerald-400 transition" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">AI Drills</div>
              <div className="text-[10px] text-zinc-500">Corrections</div>
            </div>
          </Link>

          <Link href="/dashboard/history" className="flex items-center gap-3 p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 hover:bg-zinc-900 transition group">
            <div className="h-8 w-8 rounded-lg bg-zinc-800 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-zinc-400 group-hover:text-blue-400 transition" />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-white">Compare</div>
              <div className="text-[10px] text-zinc-500">History graphs</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. LATEST ANALYSIS PANEL (Biomechanics Engine) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
            <PlayCircle className="h-3 w-3" /> Latest Analysis Feed
          </h3>
          <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1.5 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry
          </span>
        </div>
        
        {/* We use the existing BiomechanicsPanel component here. It acts as our Video Player + Metrics system. */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-1">
          <BiomechanicsPanel />
        </div>
      </section>

      {/* 4. INTELLIGENCE & BENCHMARKING (Phase 2) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InsightsWidget analysis={latestAnalysis} />
        <BenchmarkWidget analysis={latestAnalysis} />
        <ProgressWidget />
      </section>

      {/* 5. PREMIUM EXPERIENCE & LONG-TERM EVOLUTION (Phase 3) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InjuryIntelligence analysis={latestAnalysis} />
        <EvolutionTimeline history={historyList} />
        <AchievementsWidget historyCount={historyList.length} />
      </section>

    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400 text-sm font-mono uppercase tracking-widest">
      <Activity className="h-4 w-4 animate-spin mr-3 text-[#FF4F21]" /> Loading Telemetry...
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardPageContent />
    </Suspense>
  );
}
