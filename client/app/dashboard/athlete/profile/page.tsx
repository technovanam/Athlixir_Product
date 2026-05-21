'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, useAuth } from '../../../context/AuthContext';
import {
  ArrowLeft, Activity, Trophy, Zap, Shield, Target, Award, Calendar, 
  Settings, Bell, Lock, Download, Watch, HeartPulse, ChevronRight, MapPin, 
  TrendingUp, Star, Medal
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, Tooltip 
} from 'recharts';

export default function AthleteProfilePage() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [evoRes, listRes] = await Promise.all([
        api.get('/analysis/evolution'),
        api.get('/analysis/list')
      ]);
      const intelligence = evoRes.data?.data?.evolution || evoRes.data?.evolution || evoRes.data?.data;
      if (intelligence) setData(intelligence);

      const list = listRes.data?.data ?? listRes.data ?? [];
      if (Array.isArray(list)) {
        const completed = list.filter((a: any) => a.status === 'COMPLETED');
        completed.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        setHistoryList(completed);
      }
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin text-[#FF4F21]"><Activity className="h-8 w-8" /></div>
      </div>
    );
  }

  const athleteName = user?.name || user?.username || 'Athlete';
  const initial = athleteName.substring(0, 2).toUpperCase();
  const tier = user?.classification?.athleteLevel || 'U18 Sprinter';

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF4F21]/30 pb-24 font-sans">
      <div className="fixed top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#FF4F21]/5 blur-[150px] pointer-events-none" />

      {/* 1. ATHLETE HEADER SECTION (Banner) */}
      <div className="relative border-b border-zinc-800 bg-zinc-950/80">
        <div className="h-48 w-full bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay" />
          <div className="absolute right-0 bottom-0 p-10 opacity-10"><Trophy className="h-64 w-64" /></div>
          <div className="absolute top-6 left-6 z-10">
            <Link href="/dashboard" className="flex items-center gap-2 text-xs font-semibold text-zinc-300 hover:text-white transition bg-black/40 backdrop-blur px-3 py-1.5 rounded-lg border border-zinc-800">
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
          </div>
        </div>
        
        <div className="max-w-[1400px] mx-auto px-6 relative -mt-16 pb-8 flex flex-col md:flex-row items-end gap-6">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full border-4 border-black bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center text-4xl font-black text-white shadow-[0_0_30px_rgba(255,79,33,0.3)] relative z-10">
              {initial}
            </div>
            {/* Glowing animated ring */}
            <div className="absolute inset-0 rounded-full border-2 border-[#FF4F21]/50 animate-[spin_4s_linear_infinite] group-hover:border-[#FF4F21] transition duration-700" style={{ transform: 'scale(1.1)' }} />
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">{athleteName}</h1>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="flex items-center gap-1 text-xs font-bold text-zinc-400"><Activity className="h-3.5 w-3.5" /> Sprint Athlete</span>
              <span className="flex items-center gap-1 text-xs font-bold text-zinc-400"><MapPin className="h-3.5 w-3.5" /> Global Track Club</span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-sm bg-[#FF4F21]/20 text-[#FF4F21] border border-[#FF4F21]/30">ATHLIXIR: {tier}</span>
            </div>
          </div>

          <div className="flex gap-3 pb-2 w-full md:w-auto">
            <button className="flex-1 md:flex-none px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-zinc-200 transition">Share Profile</button>
            <button className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 font-bold text-xs transition"><Settings className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN (Main Feed) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 2. ATHLETE STATS OVERVIEW */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition"><Activity className="h-6 w-6 text-[#FF4F21]" /></div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Total Analyses</p>
                <p className="text-3xl font-black text-white">{historyList.length}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition"><Trophy className="h-6 w-6 text-emerald-400" /></div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Best Score</p>
                <p className="text-3xl font-black text-emerald-400">{data?.bestPerformanceScore || '—'}</p>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition"><Zap className="h-6 w-6 text-blue-400" /></div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Avg Cadence</p>
                <p className="text-3xl font-black text-white">{historyList.length ? Math.round(historyList.reduce((acc, curr) => acc + (curr.metrics?.cadence || 0), 0) / historyList.length) : '—'}</p>
              </div>
              <div className="rounded-2xl border border-[#FF4F21]/20 bg-[#FF4F21]/5 p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition"><TrendingUp className="h-6 w-6 text-[#FF4F21]" /></div>
                <p className="text-[10px] text-[#FF4F21] font-bold uppercase mb-1">Improvement</p>
                <p className="text-3xl font-black text-[#FF4F21]">{data?.overallProgress || '—'}</p>
              </div>
            </section>

            {/* 3. PERSONAL RECORDS */}
            <section>
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Medal className="h-4 w-4" /> Personal Records
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">100m Dash</p>
                  <p className="text-xl font-black text-white mt-1">10.82s</p>
                  <p className="text-[9px] text-emerald-400 font-bold mt-1">PB Set: Aug 2025</p>
                </div>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">200m Dash</p>
                  <p className="text-xl font-black text-white mt-1">21.45s</p>
                  <p className="text-[9px] text-emerald-400 font-bold mt-1">PB Set: Sep 2025</p>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-700 bg-transparent p-4 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition cursor-pointer">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">+ Add 400m</p>
                </div>
                <div className="rounded-xl border border-dashed border-zinc-700 bg-transparent p-4 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition cursor-pointer">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">+ Add 5K</p>
                </div>
              </div>
            </section>

            {/* 5. GOALS SECTION */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Target className="h-4 w-4" /> Active Goals
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-white">Reach 180 SPM Cadence</span>
                    <span className="text-[#FF4F21]">85%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#FF4F21] to-[#FF8433] w-[85%]" />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">Currently at 173 SPM. Est. completion: 2 weeks.</p>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-white">Reduce GCT below 200ms</span>
                    <span className="text-blue-400">40%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[40%]" />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-2">Currently at 224ms. Needs more plyometric work.</p>
                </div>
              </div>
            </section>

            {/* 6. MINI EVOLUTION SUMMARY */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Recent Evolution
                </h2>
                <Link href="/dashboard/progress" className="text-[10px] font-bold text-[#FF4F21] hover:underline flex items-center gap-1">
                  View Full Trends <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800">
                  <p className="text-xs text-zinc-400 font-bold mb-1">AI Progression Insight</p>
                  <p className="text-sm font-medium text-white leading-relaxed">
                    Cadence improved 7% in the last 30 days. Acceleration mechanics are normalizing towards State-level benchmarks.
                  </p>
                </div>
                <div className="h-24 w-full">
                  {data?.performanceSeries && data.performanceSeries.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.performanceSeries}>
                        <defs>
                          <linearGradient id="colorMiniPerf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '10px' }} />
                        <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fill="url(#colorMiniPerf)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full w-full bg-zinc-900/50 rounded-xl border border-zinc-800 flex items-center justify-center">
                      <span className="text-[10px] text-zinc-600 font-bold uppercase">Not enough data</span>
                    </div>
                  )}
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN (Sidebar) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 4. BODY & PERFORMANCE PROFILE */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Body Profile</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-xs pb-3 border-b border-zinc-800/50">
                  <span className="text-zinc-500 font-bold">Height</span>
                  <span className="text-white font-bold">182 cm</span>
                </div>
                <div className="flex justify-between text-xs pb-3 border-b border-zinc-800/50">
                  <span className="text-zinc-500 font-bold">Weight</span>
                  <span className="text-white font-bold">75 kg</span>
                </div>
                <div className="flex justify-between text-xs pb-3 border-b border-zinc-800/50">
                  <span className="text-zinc-500 font-bold">Dominant Leg</span>
                  <span className="text-white font-bold">Right</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500 font-bold">Training Freq.</span>
                  <span className="text-white font-bold">5 days / week</span>
                </div>
              </div>
            </section>

            {/* 7. ACHIEVEMENTS / BADGES */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Award className="h-4 w-4" /> Achievements
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="aspect-square rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-center p-2 group hover:bg-emerald-500/20 transition">
                  <Activity className="h-6 w-6 text-emerald-400 mb-1 group-hover:scale-110 transition" />
                  <span className="text-[8px] font-bold text-emerald-300 uppercase">10 Scans</span>
                </div>
                <div className="aspect-square rounded-xl bg-blue-500/10 border border-blue-500/30 flex flex-col items-center justify-center text-center p-2 group hover:bg-blue-500/20 transition">
                  <Shield className="h-6 w-6 text-blue-400 mb-1 group-hover:scale-110 transition" />
                  <span className="text-[8px] font-bold text-blue-300 uppercase">Elite Sym.</span>
                </div>
                <div className="aspect-square rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col items-center justify-center text-center p-2 group hover:bg-amber-500/20 transition">
                  <Star className="h-6 w-6 text-amber-400 mb-1 group-hover:scale-110 transition" />
                  <span className="text-[8px] font-bold text-amber-300 uppercase">3wk Streak</span>
                </div>
                <div className="aspect-square rounded-xl border border-dashed border-zinc-800 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-zinc-700" />
                </div>
                <div className="aspect-square rounded-xl border border-dashed border-zinc-800 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-zinc-700" />
                </div>
              </div>
            </section>

            {/* 8. CONNECTED DATA SECTION (Future) */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Watch className="h-4 w-4" /> Integrations
              </h2>
              <div className="space-y-3">
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition">
                  <div className="flex items-center gap-3">
                    <HeartPulse className="h-5 w-5 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-300">Garmin Connect</span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase bg-zinc-900 px-2 py-1 rounded">Connect</span>
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition">
                  <div className="flex items-center gap-3">
                    <Watch className="h-5 w-5 text-zinc-500" />
                    <span className="text-xs font-bold text-zinc-300">Apple Health</span>
                  </div>
                  <span className="text-[9px] font-bold text-zinc-600 uppercase bg-zinc-900 px-2 py-1 rounded">Connect</span>
                </button>
              </div>
            </section>

            {/* 9. SETTINGS SHORTCUTS */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-4">Account</h2>
              <div className="space-y-2">
                <Link href="/dashboard/settings" className="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg transition text-xs font-bold text-zinc-300">
                  <Settings className="h-4 w-4 text-zinc-500" /> Profile Settings
                </Link>
                <Link href="/dashboard/settings" className="flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg transition text-xs font-bold text-zinc-300">
                  <Bell className="h-4 w-4 text-zinc-500" /> Notifications
                </Link>
                <button className="w-full flex items-center gap-3 p-2 hover:bg-zinc-900 rounded-lg transition text-xs font-bold text-zinc-300">
                  <Download className="h-4 w-4 text-zinc-500" /> Export Data
                </button>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
