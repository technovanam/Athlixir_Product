'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { api, useAuth } from '../../context/AuthContext';
import {
  Activity, Trophy, Zap, Target, Award,
  Settings, Bell, Download, Watch, HeartPulse, ChevronRight, MapPin,
  TrendingUp, Medal, Edit2, Plus, X, Save, Star, ShieldCheck,
} from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
} from 'recharts';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';

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
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);

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
               setPbList({ '100m': pbTrim });
             }
          } else {
             const parts = pbTrim.split('->');
             if (parts.length === 2) {
               setPbList({ [parts[0].trim()]: parts[1].trim() });
             } else {
               setPbList({ '100m': pbTrim });
             }
          }
        } else {
          setPbList({});
        }
      } catch (e) {
        console.error("Failed parsing PB", e);
        setPbList({ '100m': String(profileToUse.personal_best) });
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
      setFetchError(null);
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
      setFetchError(classifyFetchError(err));
    }

    try {
      const statusRes = await api.get('/onboarding/status');
      let pData = statusRes.data;
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
      <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#FBFBFB]">
        <Activity className="h-7 w-7 animate-spin text-[#FF4F21]" />
      </div>
    );
  }

  const athleteName = user?.physicalProfile?.full_name || user?.name || user?.username || 'Athlete';
  const initial = athleteName.substring(0, 2).toUpperCase();
  const tier = user?.physicalProfile?.competition_level || user?.classification?.athleteLevel || 'Sprinter';
  const currentProfile = physicalProfile || user?.physicalProfile;

  return (
    <div className="bg-[#F2F2F7] min-h-screen font-poppins pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4 space-y-5 animate-fadeIn">

        {fetchError && (
          <DataFetchError error={fetchError} onRetry={fetchData} />
        )}

        {/* 1. ATHLETE HEADER CARD */}
        <div className="bg-white rounded-[24px] border border-black/[0.04] p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col items-center text-center relative">
          <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-[#FF4F21] to-[#FFA233] flex items-center justify-center text-2xl font-extrabold text-white mb-3.5 shadow-md shadow-[#FF4F21]/20">
            {initial}
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#1C1C1E] tracking-tight">
            {athleteName}
          </h1>
          <div className="flex flex-wrap justify-center items-center gap-2 mt-2.5">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FFF2EE] text-[#FF4F21] border border-[#FFE0D6]">
              <Activity size={13} /> {user?.physicalProfile?.primary_event || '100m'} {user?.physicalProfile?.running_type || 'Sprint'}
            </span>
            <span className="flex items-center gap-1.5 text-[#636366] bg-[#F2F2F7] border border-black/[0.04] px-3 py-1 rounded-full text-xs font-medium">
              <MapPin size={13} className="text-[#8E8E93]" /> {user?.physicalProfile?.city || 'Track Club'}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1C1C1E] text-white">
              {tier}
            </span>
          </div>
          <div className="flex gap-3 w-full max-w-sm mt-6">
            <Link
              href="/settings"
              className="flex-1 h-11 rounded-2xl bg-[#FF4F21] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-[0.98] transition hover:bg-[#E03E12] shadow-xs cursor-pointer"
            >
              <Edit2 size={15} /> Edit Profile
            </Link>
            <Link
              href="/settings"
              className="h-11 w-11 rounded-2xl bg-[#F2F2F7] border border-black/[0.04] text-[#1C1C1E] flex items-center justify-center active:scale-95 transition hover:border-[#FF4F21] cursor-pointer"
            >
              <Settings size={17} />
            </Link>
          </div>
        </div>

        {/* 2. STATS OVERVIEW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-[22px] border border-black/[0.04] p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-1.5 mb-2">
              <Activity size={14} className="text-[#FF4F21]" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">Total Runs</span>
            </div>
            <div className="text-2xl font-extrabold text-[#1C1C1E]">
              {historyList.length}
            </div>
          </div>
          <div className="bg-white rounded-[22px] border border-black/[0.04] p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-1.5 mb-2">
              <Trophy size={14} className="text-emerald-600" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">Best Score</span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-600">
              {data?.bestPerformanceScore || '—'}
            </div>
          </div>
          <div className="bg-white rounded-[22px] border border-black/[0.04] p-4 sm:p-5 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={14} className="text-blue-600" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#8E8E93]">Avg Cadence</span>
            </div>
            <div className="text-2xl font-extrabold text-[#1C1C1E]">
              {(() => {
                const withCadence = historyList.filter((h) => typeof h.metrics?.cadence === 'number');
                return withCadence.length
                  ? Math.round(withCadence.reduce((acc, curr) => acc + curr.metrics.cadence, 0) / withCadence.length)
                  : '—';
              })()}
            </div>
          </div>
          <div className="bg-[#FFF8F6] rounded-[22px] border border-[#FFE0D6] p-4 sm:p-5 shadow-[0_2px_8px_rgba(255,79,33,0.05)]">
            <div className="flex items-center gap-1.5 text-[#FF4F21] mb-2">
              <TrendingUp size={14} />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#FF4F21]">Growth Trend</span>
            </div>
            <div className="text-2xl font-extrabold text-[#FF4F21]">
              {data?.overallProgress || 'Active'}
            </div>
          </div>
        </div>

        {/* 3. BODY PROFILE */}
        <section className="bg-white rounded-[24px] border border-black/[0.04] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm sm:text-base font-bold text-[#1C1C1E]">
              Body Metrics
            </h2>
            <button
              onClick={() => isEditingBody ? handleSaveBody() : setIsEditingBody(true)}
              className="text-[#8E8E93] hover:text-[#FF4F21] active:scale-95 transition cursor-pointer"
              disabled={isSavingBody}
            >
              {isSavingBody ? <Activity size={16} className="animate-spin text-[#FF4F21]" /> : isEditingBody ? <Save size={18} className="text-emerald-600" /> : <Edit2 size={16} />}
            </button>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center text-xs sm:text-sm py-3 border-b border-black/[0.04]">
              <span className="text-[#8E8E93] font-medium">Height</span>
              {isEditingBody ? (
                <input type="number" value={editHeight} onChange={e => setEditHeight(e.target.value)} className="w-24 bg-[#F2F2F7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-right text-xs outline-none focus:border-[#FF4F21]" />
              ) : (
                <span className="text-[#1C1C1E] font-bold">{currentProfile?.height_cm || '—'} cm</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm py-3 border-b border-black/[0.04]">
              <span className="text-[#8E8E93] font-medium">Weight</span>
              {isEditingBody ? (
                <input type="number" value={editWeight} onChange={e => setEditWeight(e.target.value)} className="w-24 bg-[#F2F2F7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-right text-xs outline-none focus:border-[#FF4F21]" />
              ) : (
                <span className="text-[#1C1C1E] font-bold">{currentProfile?.weight_kg || '—'} kg</span>
              )}
            </div>
            <div className="flex justify-between items-center text-xs sm:text-sm py-3">
              <span className="text-[#8E8E93] font-medium">Training Frequency</span>
              <span className="text-[#1C1C1E] font-bold">{currentProfile?.training_days || 4} days / week</span>
            </div>
          </div>
        </section>

        {/* 4. PERSONAL RECORDS */}
        <section className="bg-white rounded-[24px] border border-black/[0.04] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h2 className="text-sm sm:text-base font-bold text-[#1C1C1E] mb-4 flex items-center gap-2">
            <Medal size={18} className="text-[#FF4F21]" /> Personal Bests
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {Object.entries(pbList).map(([event, time]) => (
              <div
                key={event}
                className="relative bg-[#F2F2F7] rounded-2xl border border-black/[0.03] p-4"
              >
                <button onClick={() => removePB(event)} className="absolute top-2.5 right-2.5 text-[#8E8E93] hover:text-red-500 transition cursor-pointer"><X size={14} /></button>
                <p className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">{event}</p>
                <p className="text-xl font-extrabold text-[#1C1C1E] mt-1">
                  {time}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1">Official PB</p>
              </div>
            ))}

            {!isEditingPB ? (
              <button
                onClick={() => setIsEditingPB(true)}
                className="bg-white rounded-2xl border border-dashed border-black/[0.1] p-4 flex flex-col items-center justify-center text-center active:bg-[#F2F2F7] hover:border-[#FF4F21] transition min-h-[100px] cursor-pointer"
              >
                <Plus size={18} className="text-[#FF4F21]" />
                <p className="text-xs font-bold text-[#1C1C1E] mt-1">Add PB Time</p>
              </button>
            ) : (
              <div className="bg-white rounded-2xl border border-[#FF4F21] p-3.5 flex flex-col gap-2 min-h-[100px] justify-center shadow-xs">
                <input type="text" placeholder="e.g. 100m" value={newPbEvent} onChange={e => setNewPbEvent(e.target.value)} className="w-full bg-[#F2F2F7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1C1C1E] outline-none focus:border-[#FF4F21]" />
                <input type="text" placeholder="e.g. 10.85s" value={newPbTime} onChange={e => setNewPbTime(e.target.value)} className="w-full bg-[#F2F2F7] border border-black/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#1C1C1E] outline-none focus:border-[#FF4F21]" />
                <div className="flex gap-2 mt-1">
                  <button onClick={addPB} disabled={isSavingPB} className="flex-1 bg-[#FF4F21] text-white rounded-full text-xs py-1.5 font-bold cursor-pointer">Save</button>
                  <button onClick={() => setIsEditingPB(false)} className="flex-1 bg-[#F2F2F7] text-[#636366] border border-black/[0.04] rounded-full text-xs py-1.5 font-bold cursor-pointer">Cancel</button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 4b. MILESTONES */}
        <section className="bg-white rounded-[24px] border border-black/[0.04] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h2 className="text-sm sm:text-base font-bold text-[#1C1C1E] mb-4 flex items-center gap-2">
            <Medal size={18} className="text-[#FF4F21]" /> Milestones
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { title: 'First Sprint Scan', desc: 'Initial kinematics baseline', icon: Star, unlocked: historyList.length >= 1 },
              { title: 'Consistency', desc: '3+ Sprint Scans', icon: Medal, unlocked: historyList.length >= 3 },
              { title: 'High-Velocity Profile', desc: '5+ Longitudinal Scans', icon: ShieldCheck, unlocked: historyList.length >= 5 },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.title}
                  className={`p-4 rounded-2xl flex items-center gap-3 border ${
                    m.unlocked ? 'bg-[#FFF8F6] border-[#FFE0D6]' : 'bg-[#F2F2F7] border-black/[0.04] opacity-50 grayscale'
                  }`}
                >
                  <div className="h-9 w-9 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-black/[0.04]">
                    <Icon size={16} className="text-[#FF4F21]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1C1C1E] truncate">{m.title}</p>
                    <p className="text-[11px] text-[#8E8E93] font-medium truncate">{m.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. ACHIEVEMENTS */}
        <section className="bg-white rounded-[24px] border border-black/[0.04] p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
          <h2 className="text-sm sm:text-base font-bold text-[#1C1C1E] mb-4 flex items-center gap-2">
            <Award size={18} className="text-[#FF4F21]" /> Career Achievements
          </h2>
          <div className="grid grid-cols-1 gap-2.5 mb-3">
            {achievList.map((ach, i) => (
              <div key={i} className="relative rounded-2xl bg-[#F2F2F7] border border-black/[0.03] p-3.5">
                <button onClick={() => removeAchiev(i)} className="absolute top-2.5 right-2.5 text-[#8E8E93] hover:text-red-500 transition cursor-pointer"><X size={14} /></button>
                <p className="text-xs sm:text-sm font-bold text-[#1C1C1E]">{ach.title}</p>
                <p className="text-xs text-[#636366] mt-0.5 leading-relaxed font-medium">{ach.desc}</p>
              </div>
            ))}
          </div>

          {!isEditingAchiev ? (
            <button
              onClick={() => setIsEditingAchiev(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-black/[0.1] text-xs font-bold text-[#636366] active:bg-[#F2F2F7] hover:border-[#FF4F21] transition cursor-pointer"
            >
              <Plus size={16} className="text-[#FF4F21]" /> Add Achievement
            </button>
          ) : (
            <div className="rounded-2xl border border-black/[0.06] p-4 flex flex-col gap-2.5 bg-[#F2F2F7]">
              <input type="text" placeholder="Title (e.g. State Finalist)" value={newAchievTitle} onChange={e => setNewAchievTitle(e.target.value)} className="w-full bg-white border border-black/[0.08] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF4F21]" />
              <input type="text" placeholder="Description (e.g. Bronze in 100m Sprint)" value={newAchievDesc} onChange={e => setNewAchievDesc(e.target.value)} className="w-full bg-white border border-black/[0.08] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#FF4F21]" />
              <div className="flex gap-2">
                <button onClick={addAchiev} disabled={isSavingAchiev} className="flex-1 bg-[#FF4F21] text-white rounded-full text-xs py-2 font-bold cursor-pointer">Save</button>
                <button onClick={() => setIsEditingAchiev(false)} className="flex-1 bg-white border border-black/[0.04] text-[#636366] rounded-full text-xs py-2 font-bold cursor-pointer">Cancel</button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
