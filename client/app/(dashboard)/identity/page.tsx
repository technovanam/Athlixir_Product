'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, useAuth } from '../../context/AuthContext';
import {
  Activity, Trophy, Zap, Shield, Target, Award, Calendar, 
  Settings, Bell, Lock, Download, Watch, HeartPulse, ChevronRight, MapPin, 
  TrendingUp, Star, Medal, Edit2, Plus, X, Save
} from 'lucide-react';
import { 
  AreaChart, Area, ResponsiveContainer, XAxis, Tooltip 
} from 'recharts';

export default function AthleteProfilePage() {
  const { user, refreshUser } = useAuth();
  const [data, setData] = useState<any>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [physicalProfile, setPhysicalProfile] = useState<any>(null);

  const [isEditingBody, setIsEditingBody] = useState(false);
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [isSavingBody, setIsSavingBody] = useState(false);

  const [isEditingPB, setIsEditingPB] = useState(false);
  const [pbList, setPbList] = useState<Record<string, string>>({});
  const [newPbEvent, setNewPbEvent] = useState('');
  const [newPbTime, setNewPbTime] = useState('');
  const [isSavingPB, setIsSavingPB] = useState(false);

  const [isEditingAchiev, setIsEditingAchiev] = useState(false);
  const [achievList, setAchievList] = useState<{title: string, desc: string}[]>([]);
  const [newAchievTitle, setNewAchievTitle] = useState('');
  const [newAchievDesc, setNewAchievDesc] = useState('');
  const [isSavingAchiev, setIsSavingAchiev] = useState(false);

  useEffect(() => {
    const profileToUse = physicalProfile || user?.physicalProfile;
    if (profileToUse) {
      setEditHeight(profileToUse.height_cm?.toString() || '');
      setEditWeight(profileToUse.weight_kg?.toString() || '');
      try {
        if (profileToUse.personal_best) {
          const pbTrim = profileToUse.personal_best.trim();
          if (pbTrim.startsWith('{')) {
             const parsed = JSON.parse(pbTrim);
             if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
               setPbList(parsed);
             } else {
               setPbList({ 'Event': pbTrim });
             }
          } else {
             const parts = pbTrim.split('->');
             if (parts.length === 2) {
               setPbList({ [parts[0].trim()]: parts[1].trim() });
             } else {
               setPbList({ 'Event': pbTrim });
             }
          }
        } else {
          setPbList({});
        }
      } catch (e) {
        console.error("Failed parsing PB", e);
        setPbList({ 'Event': String(profileToUse.personal_best) });
      }

      try {
        if (profileToUse.achievements) {
          const achTrim = profileToUse.achievements.trim();
          if (achTrim.startsWith('[')) {
            const parsed = JSON.parse(achTrim);
            if (Array.isArray(parsed)) {
              setAchievList(parsed);
            } else {
              setAchievList([{ title: 'Achievement', desc: achTrim }]);
            }
          } else {
            setAchievList([{ title: 'Achievement', desc: achTrim }]);
          }
        } else {
          setAchievList([]);
        }
      } catch (e) {
        console.error("Failed parsing achievements", e);
        setAchievList([{ title: 'Achievement', desc: String(profileToUse.achievements) }]);
      }
    }
  }, [user, physicalProfile]);

  const handleSaveBody = async () => {
    setIsSavingBody(true);
    try {
      await api.post('/onboarding/body-metrics', {
        heightCm: Number(editHeight),
        weightKg: Number(editWeight)
      });
      await refreshUser();
      fetchData();
      setIsEditingBody(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingBody(false);
    }
  };

  const handleSavePB = async (updatedPbList: Record<string, string>) => {
    setIsSavingPB(true);
    const profileToUse = physicalProfile || user?.physicalProfile;
    try {
      await api.post('/onboarding/training-profile', {
        trainingDays: Number(profileToUse?.training_days) || 5,
        trainingDuration: Number(profileToUse?.training_duration) || 90,
        experienceYears: Number(profileToUse?.experience_years) || 3,
        personalBest: JSON.stringify(updatedPbList),
        achievements: JSON.stringify(achievList)
      });
      await refreshUser();
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingPB(false);
    }
  };

  const handleSaveAchiev = async (updatedAchievList: {title: string, desc: string}[]) => {
    setIsSavingAchiev(true);
    const profileToUse = physicalProfile || user?.physicalProfile;
    try {
      await api.post('/onboarding/training-profile', {
        trainingDays: Number(profileToUse?.training_days) || 5,
        trainingDuration: Number(profileToUse?.training_duration) || 90,
        experienceYears: Number(profileToUse?.experience_years) || 3,
        personalBest: profileToUse?.personal_best || '',
        achievements: JSON.stringify(updatedAchievList)
      });
      await refreshUser();
      fetchData();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingAchiev(false);
    }
  };

  const addPB = () => {
    if (newPbEvent && newPbTime) {
      const newList = { ...pbList, [newPbEvent]: newPbTime };
      setPbList(newList);
      handleSavePB(newList);
      setNewPbEvent('');
      setNewPbTime('');
      setIsEditingPB(false);
    }
  };

  const removePB = (event: string) => {
    const newList = { ...pbList };
    delete newList[event];
    setPbList(newList);
    handleSavePB(newList);
  };

  const addAchiev = () => {
    if (newAchievTitle && newAchievDesc) {
      const newList = [...achievList, { title: newAchievTitle, desc: newAchievDesc }];
      setAchievList(newList);
      handleSaveAchiev(newList);
      setNewAchievTitle('');
      setNewAchievDesc('');
      setIsEditingAchiev(false);
    }
  };

  const removeAchiev = (index: number) => {
    const newList = [...achievList];
    newList.splice(index, 1);
    setAchievList(newList);
    handleSaveAchiev(newList);
  };

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
      console.error('Failed to load analysis profile data', err);
    }

    try {
      const statusRes = await api.get('/onboarding/status');
      let pData = statusRes.data;
      // Dynamically unwrap nested NestJS/Axios "data" wrappers until we reach the actual profile object
      while (pData && pData.data && typeof pData.data === 'object' && !pData.height_cm) {
        pData = pData.data;
      }
      if (pData && Object.keys(pData).length > 0) {
        setPhysicalProfile(pData);
      }
    } catch (err) {
      console.error('Failed to load onboarding status data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-[#FF4F21]"><Activity className="h-8 w-8" /></div>
      </div>
    );
  }

  const athleteName = user?.physicalProfile?.full_name || user?.name || user?.username || 'Athlete';
  const initial = athleteName.substring(0, 2).toUpperCase();
  const tier = user?.physicalProfile?.competition_level || user?.classification?.athleteLevel || 'U18 Sprinter';
  const currentProfile = physicalProfile || user?.physicalProfile;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-10 animate-fadeIn text-white pb-24">
      
      {/* 1. ATHLETE HEADER SECTION (Banner Card) */}
      <div className="relative rounded-2xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md overflow-hidden p-6 md:p-8">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#FF4F21]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative px-4 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 pb-2">
          <div className="flex flex-col md:flex-row items-end gap-6 w-full md:w-auto">
            <div className="relative group mx-auto md:mx-0 shrink-0">
              <div className="h-28 w-28 rounded-2xl bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_rgba(255,79,33,0.35)] relative z-10 border-2 border-black">
                {initial}
              </div>
              <div className="absolute inset-[-6px] rounded-3xl border border-[#FF4F21]/30 animate-[spin_8s_linear_infinite] group-hover:border-[#FF4F21]/60 transition duration-700 pointer-events-none" />
              <div className="absolute inset-[-12px] rounded-3xl border border-[#FF4F21]/10 animate-[spin_12s_linear_infinite_reverse] group-hover:border-[#FF4F21]/30 transition duration-700 pointer-events-none" />
            </div>

            <div className="text-center md:text-left space-y-2 mt-4 md:mt-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight uppercase">{athleteName}</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">
                  <Activity className="h-3.5 w-3.5 text-[#FF4F21]" /> {user?.physicalProfile?.primary_event || '100m'} {user?.physicalProfile?.running_type || 'Sprint'}
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-white/[0.02] border border-white/[0.04] px-2.5 py-1 rounded-lg">
                  <MapPin className="h-3.5 w-3.5 text-blue-400" /> {user?.physicalProfile?.city || 'Global Track Club'}
                </span>
                <span className="text-[9px] font-black uppercase tracking-[0.1em] px-2.5 py-1 rounded-lg bg-[#FF4F21]/10 text-[#FF4F21] border border-[#FF4F21]/20 shadow-[0_0_10px_rgba(255,79,33,0.1)]">
                  ATHLIXIR: {tier}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0">
            <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-white text-black font-extrabold text-[10px] uppercase tracking-widest hover:bg-zinc-200 transition duration-200 cursor-pointer shadow-[0_4px_12px_rgba(255,255,255,0.05)]">
              Share Profile
            </button>
            <Link href="/settings" className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-zinc-900/60 border border-white/[0.05] hover:border-white/[0.1] hover:bg-zinc-900 flex items-center justify-center transition duration-200 cursor-pointer text-zinc-300 hover:text-white">
              <Settings className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (Main Feed) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 2. ATHLETE STATS OVERVIEW */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
              <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition duration-500 text-[#FF4F21] pointer-events-none">
                <Activity className="h-28 w-28" />
              </div>
              <div className="flex items-center gap-2 text-zinc-500 mb-4">
                <Activity className="h-3.5 w-3.5 text-[#FF4F21]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Total Analyses</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white tracking-tight">{historyList.length}</div>
                <div className="text-[9px] font-bold text-zinc-500 mt-2 uppercase tracking-wider">Completed scans</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
              <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition duration-500 text-emerald-400 pointer-events-none">
                <Trophy className="h-28 w-28" />
              </div>
              <div className="flex items-center gap-2 text-zinc-500 mb-4">
                <Trophy className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Best Score</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">{data?.bestPerformanceScore || '—'}</div>
                <div className="text-[9px] font-bold text-zinc-500 mt-2 uppercase tracking-wider">Peak efficiency</div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
              <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition duration-500 text-blue-400 pointer-events-none">
                <Zap className="h-28 w-28" />
              </div>
              <div className="flex items-center gap-2 text-zinc-500 mb-4">
                <Zap className="h-3.5 w-3.5 text-blue-400" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Avg Cadence</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-white tracking-tight">
                  {historyList.length ? Math.round(historyList.reduce((acc, curr) => acc + (curr.metrics?.cadence || 0), 0) / historyList.length) : '—'}
                </div>
                <div className="text-[9px] font-bold text-zinc-500 mt-2 uppercase tracking-wider">Average SPM</div>
              </div>
            </div>

            <div className="rounded-xl border border-[#FF4F21]/20 bg-[#FF4F21]/5 shadow-[inset_0_1px_1px_rgba(255,79,33,0.03)] backdrop-blur-md p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#FF4F21]/30 hover:bg-[#FF4F21]/10 hover:shadow-[0_4px_20px_rgba(255,79,33,0.1)] transition-all duration-300">
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition duration-500 text-[#FF4F21] pointer-events-none">
                <TrendingUp className="h-28 w-28" />
              </div>
              <div className="flex items-center gap-2 text-[#FF4F21] mb-4">
                <TrendingUp className="h-3.5 w-3.5 text-[#FF4F21]" />
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Improvement</span>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-[#FF4F21] tracking-tight">{data?.overallProgress || '—'}</div>
                <div className="text-[9px] font-bold text-[#FF4F21]/60 mt-2 uppercase tracking-wider">Progress trend</div>
              </div>
            </div>
          </section>

          {/* 3. PERSONAL RECORDS */}
          <section className="space-y-4">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
              <Medal className="h-4 w-4 text-[#FF4F21]" /> Personal Records
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(pbList).map(([event, time]) => (
                <div key={event} className="relative rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-4 hover:border-white/[0.1] hover:bg-[#08080C]/50 transition-all duration-300 group">
                  <button onClick={() => removePB(event)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><X className="h-3 w-3" /></button>
                  <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">{event}</p>
                  <p className="text-xl font-extrabold text-white mt-1.5 tracking-tight">{time}</p>
                  <p className="text-[9px] text-emerald-400 font-bold mt-2 uppercase tracking-wider">PB Set</p>
                </div>
              ))}
              
              {!isEditingPB ? (
                <div onClick={() => setIsEditingPB(true)} className="rounded-xl border border-dashed border-zinc-800 bg-transparent p-4 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 hover:border-[#FF4F21]/40 hover:bg-[#FF4F21]/5 hover:shadow-[0_0_15px_rgba(255,79,33,0.05)] transition duration-300 cursor-pointer group min-h-[96px]">
                  <p className="text-[9px] font-bold text-zinc-400 group-hover:text-[#FF4F21] uppercase tracking-widest">+ Add New</p>
                </div>
              ) : (
                <div className="rounded-xl border border-white/[0.1] bg-black/40 p-4 flex flex-col gap-2 min-h-[96px] justify-center">
                  <input type="text" placeholder="e.g. 100m" value={newPbEvent} onChange={e => setNewPbEvent(e.target.value)} className="w-full bg-black/50 border border-white/[0.1] rounded px-2 py-1 text-[10px] text-white focus:outline-none" />
                  <input type="text" placeholder="e.g. 10.8s" value={newPbTime} onChange={e => setNewPbTime(e.target.value)} className="w-full bg-black/50 border border-white/[0.1] rounded px-2 py-1 text-[10px] text-white focus:outline-none" />
                  <div className="flex gap-2 mt-1">
                    <button onClick={addPB} disabled={isSavingPB} className="flex-1 bg-[#FF4F21] text-white rounded text-[10px] py-1 font-bold disabled:opacity-50">Save</button>
                    <button onClick={() => setIsEditingPB(false)} className="flex-1 bg-zinc-800 text-zinc-300 rounded text-[10px] py-1 font-bold">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* 5. GOALS SECTION */}
          <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-400" /> Active Goals
            </h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-zinc-200">Reach 180 SPM Cadence</span>
                  <span className="text-[#FF4F21] font-extrabold">85%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.03] p-[1px]">
                  <div className="h-full bg-gradient-to-r from-[#FF4F21] to-[#FF8433] rounded-full shadow-[0_0_8px_rgba(255,79,33,0.5)] w-[85%]" />
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Currently at 173 SPM. Est. completion: 2 weeks.</p>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold mb-2">
                  <span className="text-zinc-200">Reduce GCT below 200ms</span>
                  <span className="text-blue-400 font-extrabold">40%</span>
                </div>
                <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-white/[0.03] p-[1px]">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] w-[40%]" />
                </div>
                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Currently at 224ms. Needs more plyometric work.</p>
              </div>
            </div>
          </section>

          {/* 6. MINI EVOLUTION SUMMARY */}
          <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" /> Recent Evolution
              </h2>
              <Link href="/evolution" className="text-[10px] font-bold text-[#FF4F21] hover:underline flex items-center gap-1 uppercase tracking-wider">
                View Full Trends <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/[0.03] flex flex-col justify-center">
                <p className="text-[10px] text-[#FF4F21] font-bold uppercase tracking-wider mb-2">AI Progression Insight</p>
                <p className="text-xs font-medium text-zinc-300 leading-relaxed">
                  Cadence improved 7% in the last 30 days. Acceleration mechanics are normalizing towards State-level benchmarks.
                </p>
              </div>
              
              <div className="h-28 w-full relative">
                {data?.performanceSeries && data.performanceSeries.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.performanceSeries}>
                      <defs>
                        <linearGradient id="colorMiniPerf" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#08080C', 
                          borderColor: 'rgba(255,255,255,0.08)', 
                          borderRadius: '8px', 
                          fontSize: '10px', 
                          backdropFilter: 'blur(10px)' 
                        }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorMiniPerf)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full bg-black/20 rounded-xl border border-white/[0.03] flex items-center justify-center">
                    <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Not enough data</span>
                  </div>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN (Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* 4. BODY & PERFORMANCE PROFILE */}
          <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em]">Body Profile</h2>
              <button onClick={() => isEditingBody ? handleSaveBody() : setIsEditingBody(true)} className="text-zinc-500 hover:text-white transition" disabled={isSavingBody}>
                {isSavingBody ? <Activity className="h-4 w-4 animate-spin" /> : isEditingBody ? <Save className="h-4 w-4 text-emerald-400" /> : <Edit2 className="h-4 w-4" />}
              </button>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs py-2.5 border-b border-white/[0.03]">
                <span className="text-zinc-400 font-medium">Height</span>
                {isEditingBody ? (
                   <input type="number" value={editHeight} onChange={e => setEditHeight(e.target.value)} className="w-20 bg-black/50 border border-white/[0.1] rounded px-2 py-1 text-right focus:outline-none" />
                ) : (
                   <span className="text-white font-bold">{currentProfile?.height_cm || '—'} cm</span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs py-2.5 border-b border-white/[0.03]">
                <span className="text-zinc-400 font-medium">Weight</span>
                {isEditingBody ? (
                   <input type="number" value={editWeight} onChange={e => setEditWeight(e.target.value)} className="w-20 bg-black/50 border border-white/[0.1] rounded px-2 py-1 text-right focus:outline-none" />
                ) : (
                   <span className="text-white font-bold">{currentProfile?.weight_kg || '—'} kg</span>
                )}
              </div>
              <div className="flex justify-between items-center text-xs py-2.5 border-b border-white/[0.03]">
                <span className="text-zinc-400 font-medium">Dominant Leg</span>
                <span className="text-white font-bold">Right</span>
              </div>
              <div className="flex justify-between items-center text-xs py-2.5">
                <span className="text-zinc-400 font-medium">Training Freq.</span>
                <span className="text-white font-bold">{currentProfile?.training_days || 5} days / week</span>
              </div>
            </div>
          </section>

          {/* 7. ACHIEVEMENTS / BADGES */}
          <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] flex items-center gap-2">
                <Award className="h-4 w-4 text-[#FF4F21]" /> Achievements
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {achievList.map((ach, i) => (
                <div key={i} className="relative rounded-xl border border-white/[0.05] bg-black/40 p-3 hover:border-white/[0.1] transition-all duration-300 group">
                  <button onClick={() => removeAchiev(i)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><X className="h-3 w-3" /></button>
                  <p className="text-xs font-bold text-white uppercase tracking-wider">{ach.title}</p>
                  <p className="text-[9px] text-zinc-500 font-medium mt-1 leading-relaxed">{ach.desc}</p>
                </div>
              ))}
            </div>

            {!isEditingAchiev ? (
              <button onClick={() => setIsEditingAchiev(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-zinc-800 bg-transparent opacity-50 hover:opacity-100 hover:border-[#FF4F21]/40 hover:bg-[#FF4F21]/5 hover:shadow-[0_0_15px_rgba(255,79,33,0.05)] transition duration-300 text-[10px] font-bold text-zinc-400 hover:text-[#FF4F21] uppercase tracking-widest cursor-pointer">
                <Plus className="h-4 w-4" /> Add Custom Achievement
              </button>
            ) : (
              <div className="rounded-xl border border-white/[0.1] bg-black/40 p-4 flex flex-col gap-2">
                <input type="text" placeholder="e.g. State Finalist" value={newAchievTitle} onChange={e => setNewAchievTitle(e.target.value)} className="w-full bg-black/50 border border-white/[0.1] rounded px-2 py-1.5 text-[10px] text-white focus:outline-none" />
                <input type="text" placeholder="e.g. Placed 3rd in U18 100m sprint" value={newAchievDesc} onChange={e => setNewAchievDesc(e.target.value)} className="w-full bg-black/50 border border-white/[0.1] rounded px-2 py-1.5 text-[10px] text-white focus:outline-none" />
                <div className="flex gap-2 mt-2">
                  <button onClick={addAchiev} disabled={isSavingAchiev} className="flex-1 bg-[#FF4F21] text-white rounded text-[10px] py-1.5 font-bold disabled:opacity-50">Save Achievement</button>
                  <button onClick={() => setIsEditingAchiev(false)} className="flex-1 bg-zinc-800 text-zinc-300 rounded text-[10px] py-1.5 font-bold">Cancel</button>
                </div>
              </div>
            )}
          </section>

          {/* 8. CONNECTED DATA SECTION */}
          <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
              <Watch className="h-4 w-4 text-blue-400" /> Integrations
            </h2>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.03] bg-black/20 hover:bg-[#08080C]/60 hover:border-white/[0.08] transition duration-300 group cursor-pointer text-left">
                <div className="flex items-center gap-3">
                  <HeartPulse className="h-5 w-5 text-zinc-500 group-hover:text-[#FF4F21] transition duration-300" />
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition">Garmin Connect</span>
                </div>
                <span className="text-[8px] font-extrabold text-zinc-400 group-hover:text-white uppercase bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 rounded-lg tracking-wider transition">Connect</span>
              </button>
              <button className="w-full flex items-center justify-between p-3 rounded-xl border border-white/[0.03] bg-black/20 hover:bg-[#08080C]/60 hover:border-white/[0.08] transition duration-300 group cursor-pointer text-left">
                <div className="flex items-center gap-3">
                  <Watch className="h-5 w-5 text-zinc-500 group-hover:text-blue-400 transition duration-300" />
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition">Apple Health</span>
                </div>
                <span className="text-[8px] font-extrabold text-zinc-400 group-hover:text-white uppercase bg-white/[0.03] border border-white/[0.05] px-2.5 py-1 rounded-lg tracking-wider transition">Connect</span>
              </button>
            </div>
          </section>

          {/* 9. Account & Settings shortcuts */}
          <section className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-5 hover:border-white/[0.08] hover:bg-[#08080C]/50 transition-all duration-300">
            <h2 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.25em] mb-4">Account</h2>
            <div className="space-y-1.5">
              <Link href="/settings" className="flex items-center gap-3 p-2.5 hover:bg-white/[0.02] border border-transparent hover:border-white/[0.03] rounded-xl transition duration-300 text-xs font-bold text-zinc-400 hover:text-white group">
                <Settings className="h-4 w-4 text-zinc-500 group-hover:text-[#FF4F21] transition duration-300" /> Profile Settings
              </Link>
              <Link href="/settings" className="flex items-center gap-3 p-2.5 hover:bg-white/[0.02] border border-transparent hover:border-white/[0.03] rounded-xl transition duration-300 text-xs font-bold text-zinc-400 hover:text-white group">
                <Bell className="h-4 w-4 text-zinc-500 group-hover:text-blue-400 transition duration-300" /> Notifications
              </Link>
              <button className="w-full flex items-center gap-3 p-2.5 hover:bg-white/[0.02] border border-transparent hover:border-white/[0.03] rounded-xl transition duration-300 text-left text-xs font-bold text-zinc-400 hover:text-white group cursor-pointer">
                <Download className="h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition duration-300" /> Export Data
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
