'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, api } from '../../context/AuthContext';
import BiomechanicsPanel from './BiomechanicsPanel';
import { 
  Activity, Zap, Target, Shield, UploadCloud, 
  FileText, TrendingUp, Compass, ArrowRight, PlayCircle, Trophy
} from 'lucide-react';
import InsightsWidget from '../components/InsightsWidget';
import BenchmarkWidget from '../components/BenchmarkWidget';
import ProgressWidget from '../components/ProgressWidget';
import InjuryIntelligence from '../components/InjuryIntelligence';
import EvolutionTimeline from '../components/EvolutionTimeline';
import AchievementsWidget from '../components/AchievementsWidget';

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
                <Compass className="h-3 w-3 text-blue-400" /> AI Summary
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
            </div>
            
            {latestAnalysis ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg border border-white/[0.02]">
                  <span className="text-[11px] text-zinc-400">Sprint Efficiency</span>
                  <span className="text-[11px] font-bold text-white">{latestAnalysis.scores?.efficiencyScore || 'N/A'}%</span>
                </div>
                <div className="flex justify-between items-center bg-black/40 px-3 py-2 rounded-lg border border-white/[0.02]">
                  <span className="text-[11px] text-zinc-400">Main Weakness</span>
                  <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">{latestAnalysis.insights?.weaknesses?.[0]?.substring(0, 15) || 'OVERSTRIDE'}</span>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500 italic">No completed analysis yet. Upload a video to generate your AI profile.</p>
            )}
          </div>
        </div>

        {/* Big KPI Cards */}
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
          
          {/* KPI 1 */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500">
              <Trophy className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Trophy className="h-4 w-4 text-[#FF4F21]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Perf Score</span>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tighter">{latestAnalysis?.scores?.performanceScore || '—'}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-[9px] font-bold text-emerald-400">+2 from last</span>
              </div>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500">
              <Target className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Biomechanics</span>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tighter">{latestAnalysis?.scores?.biomechanicsScore || '—'}</div>
              <div className="text-[9px] font-bold text-zinc-500 mt-2 uppercase tracking-wider">State Average</div>
            </div>
          </div>

          {/* KPI 3 */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500">
              <Activity className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Efficiency</span>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-white tracking-tighter">{latestAnalysis?.scores?.efficiencyScore || '—'}</div>
              <div className="text-[9px] font-bold text-zinc-500 mt-2 uppercase tracking-wider">Optimal range</div>
            </div>
          </div>

          {/* KPI 4 */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500">
              <Shield className="h-32 w-32" />
            </div>
            <div className="flex items-center gap-2 text-zinc-500 mb-4">
              <Shield className="h-4 w-4 text-amber-500" />
              <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Injury Risk</span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-white tracking-tighter uppercase">{latestAnalysis?.injuryRisk?.level || 'LOW'}</div>
              <div className="text-[9px] font-bold text-amber-500 mt-2 truncate uppercase tracking-wider">
                {latestAnalysis?.injuryRisk?.riskArea !== 'None' ? `Watch: ${latestAnalysis?.injuryRisk?.riskArea}` : 'Stable'}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. QUICK ACTIONS */}
      <section>
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
          <Zap className="h-3.5 w-3.5" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex items-center gap-3.5 p-4 rounded-xl border border-[#FF4F21]/30 bg-[#FF4F21]/10 hover:bg-[#FF4F21]/20 transition-all duration-300 group shadow-[0_0_15px_rgba(255,79,33,0.05)] cursor-pointer">
            <div className="h-8 w-8 rounded-lg bg-[#FF4F21] flex items-center justify-center shadow-[0_2px_8px_rgba(255,79,33,0.3)]">
              <UploadCloud className="h-4 w-4 text-white" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white group-hover:text-[#FF4F21] transition duration-200 uppercase tracking-wider">Upload New</div>
              <div className="text-[9px] text-zinc-400 tracking-wider">Analyze sprint</div>
            </div>
          </button>

          <Link href="/reports" className="flex items-center gap-3.5 p-4 rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/[0.05] flex items-center justify-center">
              <FileText className="h-4 w-4 text-zinc-400 group-hover:text-white transition duration-200" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white uppercase tracking-wider">View Reports</div>
              <div className="text-[9px] text-zinc-500 tracking-wider">PDF summaries</div>
            </div>
          </Link>

          <Link href="/recommendations" className="flex items-center gap-3.5 p-4 rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/[0.05] flex items-center justify-center">
              <Target className="h-4 w-4 text-zinc-400 group-hover:text-emerald-400 transition duration-200" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white uppercase tracking-wider">AI Drills</div>
              <div className="text-[9px] text-zinc-500 tracking-wider">Corrections</div>
            </div>
          </Link>

          <Link href="/history" className="flex items-center gap-3.5 p-4 rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 group">
            <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-white/[0.05] flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-zinc-400 group-hover:text-blue-400 transition duration-200" />
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-white uppercase tracking-wider">Compare</div>
              <div className="text-[9px] text-zinc-500 tracking-wider">History graphs</div>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. LATEST ANALYSIS PANEL (Biomechanics Engine) */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
            <PlayCircle className="h-3.5 w-3.5" /> Latest Analysis Feed
          </h3>
          <span className="text-[9px] font-bold text-[#FF4F21] flex items-center gap-1.5 border border-[#FF4F21]/20 bg-[#FF4F21]/10 px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-[0_0_8px_rgba(255,79,33,0.1)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF4F21] animate-pulse" /> Live Telemetry
          </span>
        </div>
        
        <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-1">
          <BiomechanicsPanel />
        </div>
      </section>

      {/* 4. INTELLIGENCE & BENCHMARKING */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <InsightsWidget analysis={latestAnalysis} />
        <BenchmarkWidget analysis={latestAnalysis} />
        <ProgressWidget />
      </section>

      {/* 5. PREMIUM EXPERIENCE & LONG-TERM EVOLUTION */}
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
    <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400 text-xs font-mono uppercase tracking-[0.2em]">
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
