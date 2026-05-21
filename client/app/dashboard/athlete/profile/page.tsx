'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, useAuth } from '../../../context/AuthContext';
import {
  ArrowLeft, Activity, Trophy, Zap, Shield, TrendingUp, Compass, Flag, Target, Award, Calendar, AlertTriangle
} from 'lucide-react';

type IntelligenceData = {
  evolution: any;
  consistency: any;
  adaptation: any;
  advanced_injury: string[];
  forecast: any;
  talent: string[];
  timeline: any[];
};

export default function AthleteProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<IntelligenceData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchIntelligence = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/evolution');
      const intelligence = res.data?.data ?? res.data;
      if (intelligence && intelligence.evolution) {
        setData(intelligence);
      }
    } catch (err) {
      console.error('Failed to load athlete intelligence', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntelligence();
  }, [fetchIntelligence]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-pulse text-[#FF4F21] font-bold tracking-widest uppercase text-xs">
          Loading Athlete Intelligence...
        </div>
      </div>
    );
  }

  if (!data || !data.evolution?.hasHistory) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4">
        <Activity className="h-12 w-12 text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Insufficient Data</h2>
        <p className="text-zinc-500 text-sm mb-6 text-center max-w-md">
          The Athlete Evolution Engine requires at least two completed biomechanics analyses to generate longitudinal intelligence.
        </p>
        <Link href="/dashboard" className="rounded-xl bg-[#FF4F21] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110">
          Upload Video
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF4F21]/30">
      <div className="fixed top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#FF4F21]/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 py-10 space-y-10 relative z-10">
        
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
              <h1 className="text-3xl font-extrabold tracking-tight text-white uppercase">Athlete Digital Profile</h1>
              <p className="text-sm text-[#FF4F21] font-bold mt-1 tracking-widest">{user?.name || 'Athlete'} · Evolution Ecosystem</p>
            </div>
          </div>
        </div>

        {/* Talent & Forecast Banner */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="col-span-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Trophy className="h-32 w-32" />
            </div>
            <h2 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Performance Forecast</h2>
            <div className="flex items-end gap-4 mb-4">
              <span className="text-5xl font-black text-white">{data.forecast?.future_tier || 'Unknown'}</span>
            </div>
            <p className="text-emerald-300/80 text-sm font-medium">Projected 100m Improvement: <span className="font-bold text-white">{data.forecast?.projected_100m_improvement || '0.00s'}</span></p>
            
            {data.talent?.length > 0 && (
              <div className="mt-6 space-y-2">
                {data.talent.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                    <Award className="h-4 w-4" />
                    {t}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
             <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Core Intelligence</h2>
             <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800/60">
                  <span className="text-sm text-zinc-400">Consistency Score</span>
                  <div className="text-right">
                    <span className="block text-xl font-black text-white">{data.consistency?.consistency_score || 0}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">{data.consistency?.training_stability || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-800/60">
                  <span className="text-sm text-zinc-400">Adaptation Score</span>
                  <div className="text-right">
                    <span className="block text-xl font-black text-white">{data.adaptation?.adaptation_score || 0}</span>
                    <span className="text-[10px] text-zinc-500 uppercase">{data.adaptation?.adaptation_rate || 'Unknown'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-zinc-400">Total Sessions</span>
                  <span className="block text-xl font-black text-white">{data.evolution?.sessionCount || 0}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Biomechanics Evolution Strip */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6">Longitudinal Biomechanics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Cadence Growth</p>
                <p className="text-2xl font-black text-[#FF4F21]">{data.evolution?.cadence_growth || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">GCT Reduction</p>
                <p className="text-2xl font-black text-[#FF4F21]">{data.evolution?.gct_reduction || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Efficiency Shift</p>
                <p className="text-2xl font-black text-emerald-400">{data.evolution?.efficiency_improvement || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Overall Progress</p>
                <p className="text-2xl font-black text-white">{data.evolution?.overallProgress || '—'}</p>
              </div>
            </div>
        </div>

        {/* Deep Insights & Timeline */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Timeline Engine */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
            <div className="flex items-center gap-2 mb-6">
              <Calendar className="h-4 w-4 text-zinc-400" />
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Career Timeline</h2>
            </div>
            
            <div className="space-y-5 border-l-2 border-zinc-800 ml-2 pl-4">
              {data.timeline && data.timeline.length > 0 ? (
                data.timeline.map((event, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-[#FF4F21] border-2 border-black" />
                    <p className="text-[10px] text-zinc-500 font-mono mb-0.5">{new Date(event.date).toLocaleDateString()}</p>
                    <p className="text-sm font-bold text-zinc-200">{event.milestone}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500 italic">No major milestones detected yet.</p>
              )}
            </div>
          </div>

          {/* Advanced Injury Engine */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
            <div className="flex items-center gap-2 mb-6">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <h2 className="text-xs font-black text-red-400 uppercase tracking-widest">Advanced Movement Risks</h2>
            </div>
            
            {data.advanced_injury && data.advanced_injury.length > 0 ? (
              <ul className="space-y-4">
                {data.advanced_injury.map((insight, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-lg bg-black/40 border border-red-500/10 p-3">
                    <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    <span className="text-xs text-zinc-300 leading-relaxed">{insight}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center gap-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-4">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold text-emerald-300">No longitudinal fatigue or degradation patterns detected.</span>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
