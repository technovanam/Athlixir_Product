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
  const profileUser = user as any;
  const [data, setData] = useState<any>(null);
  const [bodyMetrics, setBodyMetrics] = useState<{ heightCm?: number; weightKg?: number }>({});
  const [profileDetails, setProfileDetails] = useState<{
    primaryEvent?: string;
    secondaryEvent?: string;
    runningType?: string;
    personalBest?: string;
    goals?: string[];
    trainingDays?: number;
    trainingDuration?: number;
    experienceYears?: number;
  }>({});
  const [personalBestRecords, setPersonalBestRecords] = useState<Record<string, string>>({});
  const [recordEvent, setRecordEvent] = useState('100m');
  const [recordTime, setRecordTime] = useState('');
  const [savingPersonalBest, setSavingPersonalBest] = useState(false);
  const [personalBestMessage, setPersonalBestMessage] = useState<string | null>(null);
  const [personalBestError, setPersonalBestError] = useState<string | null>(null);
  const [editBodyMetrics, setEditBodyMetrics] = useState(false);
  const [heightDraft, setHeightDraft] = useState('');
  const [weightDraft, setWeightDraft] = useState('');
  const [savingBodyMetrics, setSavingBodyMetrics] = useState(false);
  const [bodyMetricsMessage, setBodyMetricsMessage] = useState<string | null>(null);
  const [bodyMetricsError, setBodyMetricsError] = useState<string | null>(null);
  const [goalsDraft, setGoalsDraft] = useState<string[]>([]);
  const [newGoalDraft, setNewGoalDraft] = useState('');
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null);
  const [editingGoalDraft, setEditingGoalDraft] = useState('');
  const [savingGoals, setSavingGoals] = useState(false);
  const [goalsMessage, setGoalsMessage] = useState<string | null>(null);
  const [goalsError, setGoalsError] = useState<string | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const recordOrder = ['100m', '200m', '400m', '5K'];
  const personalBestStorageKey = 'athlixir-personal-best-records';
  const bodyMetricsStorageKey = 'athlixir-body-metrics';
  const goalsStorageKey = 'athlixir-goals';

  const extractBodyMetrics = (source: any) => {
    if (!source) return {};

    const metricsSource = source.bodyMetrics || source.body_metrics || source;
    const heightCm = metricsSource.height_cm ?? metricsSource.heightCm ?? metricsSource.height;
    const weightKg = metricsSource.weight_kg ?? metricsSource.weightKg ?? metricsSource.weight;

    return {
      heightCm: heightCm !== undefined && heightCm !== null ? Number(heightCm) : undefined,
      weightKg: weightKg !== undefined && weightKg !== null ? Number(weightKg) : undefined,
    };
  };

  const extractProfileDetails = (source: any) => {
    if (!source) return {};

    return {
      primaryEvent: source.primary_event ?? source.primaryEvent,
      secondaryEvent: source.secondary_event ?? source.secondaryEvent,
      runningType: source.running_type ?? source.runningType,
      personalBest: source.personal_best ?? source.personalBest,
      goals: Array.isArray(source.goals) ? source.goals : undefined,
      trainingDays: source.training_days ?? source.trainingDays,
      trainingDuration: source.training_duration ?? source.trainingDuration,
      experienceYears: source.experience_years ?? source.experienceYears,
    };
  };

  const normalizeGoalText = (value: string) => value.trim().replace(/\s+/g, ' ');

  const normalizeEventName = (value: string) => {
    const trimmed = value.trim();
    const lowered = trimmed.toLowerCase();
    if (lowered === '5k' || lowered === '5km') return '5K';
    if (lowered === '100m') return '100m';
    if (lowered === '200m') return '200m';
    if (lowered === '400m') return '400m';
    return trimmed;
  };

  const parsePersonalBestRecords = (rawValue: any) => {
    if (!rawValue || typeof rawValue !== 'string') return {};

    try {
      const parsed = JSON.parse(rawValue);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return Object.entries(parsed).reduce<Record<string, string>>((acc, [key, value]) => {
          if (typeof value === 'string' && value.trim()) {
            acc[normalizeEventName(key)] = value.trim();
          }
          return acc;
        }, {});
      }
    } catch {
      // Fall back to legacy single-entry formats below.
    }

    const match = rawValue.match(/^(100m|200m|400m|5k|5km)\s*[-:]\s*(.+)$/i);
    if (!match) return {};

    return {
      [normalizeEventName(match[1])]: match[2].trim(),
    };
  };

  const readStoredPersonalBestRecords = () => {
    if (typeof window === 'undefined') return {};

    try {
      return parsePersonalBestRecords(window.localStorage.getItem(personalBestStorageKey));
    } catch {
      return {};
    }
  };

  const readStoredBodyMetrics = () => {
    if (typeof window === 'undefined') return {};

    try {
      const parsed = JSON.parse(window.localStorage.getItem(bodyMetricsStorageKey) || '{}');
      return {
        heightCm: parsed?.heightCm != null ? Number(parsed.heightCm) : undefined,
        weightKg: parsed?.weightKg != null ? Number(parsed.weightKg) : undefined,
      } as { heightCm?: number; weightKg?: number };
    } catch {
      return {};
    }
  };

  const readStoredGoals = () => {
    if (typeof window === 'undefined') return [] as string[];

    try {
      const parsed = JSON.parse(window.localStorage.getItem(goalsStorageKey) || '[]');
      return Array.isArray(parsed) ? parsed.filter((g) => typeof g === 'string') : [];
    } catch {
      return [];
    }
  };

  const syncBodyMetricDrafts = (source: { heightCm?: number; weightKg?: number }) => {
    setHeightDraft(source.heightCm != null ? String(source.heightCm) : '');
    setWeightDraft(source.weightKg != null ? String(source.weightKg) : '');
  };

  const formatRecordLabel = (event: string) => {
    if (event === '5K') return '5K';
    return event;
  };

  const getRecordDisplay = (event: string) => {
    const value = personalBestRecords[event];
    if (!value) {
      return {
        title: `Add ${formatRecordLabel(event)}`,
        value: undefined,
        subtitle: undefined,
        empty: true,
      };
    }

    return {
      title: event,
      value,
      subtitle: 'Saved from profile data',
      empty: false,
    };
  };

  const renderRecordCard = (title: string, value?: string, subtitle?: string) => {
    const isEmptySlot = title.startsWith('Add ');

    if (isEmptySlot) {
      return (
        <div className="rounded-xl border border-dashed border-zinc-700 bg-transparent p-4 flex flex-col items-center justify-center text-center opacity-50 hover:opacity-100 transition cursor-pointer min-h-[126px]">
          <p className="text-[10px] font-bold text-zinc-400 uppercase">{title}</p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 min-h-[126px]">
        <p className="text-[10px] font-bold text-zinc-500 uppercase">{title}</p>
        <p className="text-xl font-black text-white mt-1">{value || '—'}</p>
        <p className="text-[9px] text-emerald-400 font-bold mt-1">{subtitle || 'PB not set yet'}</p>
      </div>
    );
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [evoResult, listResult, statusRes, profileRes] = await Promise.allSettled([
        api.get('/analysis/evolution'),
        api.get('/analysis/list'),
        api.get('/onboarding/status'),
        api.get('/users/profile'),
      ]);

      const evoRes = evoResult.status === 'fulfilled' ? evoResult.value : null;
      const listRes = listResult.status === 'fulfilled' ? listResult.value : null;
      const statusValue = statusRes.status === 'fulfilled' ? statusRes.value : null;
      const profileValue = profileRes.status === 'fulfilled' ? profileRes.value : null;

      const intelligence = evoRes?.data?.data?.evolution || evoRes?.data?.evolution || evoRes?.data?.data;
      if (intelligence) setData(intelligence);

      const statusData = statusValue?.data?.data?.data || statusValue?.data?.data || statusValue?.data || {};
      const profileData = profileValue?.data?.data || profileValue?.data || {};
      const mergedProfileDetails = {
        ...extractProfileDetails(profileData),
        ...extractProfileDetails(statusData),
        ...extractProfileDetails(profileUser),
      };
      setProfileDetails(mergedProfileDetails);
      const backendGoals = Array.isArray(mergedProfileDetails.goals) ? mergedProfileDetails.goals : undefined;
      const storedGoals = readStoredGoals();
      const mergedGoals = backendGoals ?? storedGoals;
      setGoalsDraft(mergedGoals);
      const backendRecords = parsePersonalBestRecords(mergedProfileDetails.personalBest);
      const storedRecords = readStoredPersonalBestRecords();
      setPersonalBestRecords({
        ...storedRecords,
        ...backendRecords,
      });
      setRecordTime('');
      const backendBody = {
        ...extractBodyMetrics(profileData),
        ...extractBodyMetrics(statusData),
        ...extractBodyMetrics(profileUser),
      };
      const storedBody = readStoredBodyMetrics();
      const mergedBody = {
        heightCm: backendBody.heightCm ?? storedBody.heightCm,
        weightKg: backendBody.weightKg ?? storedBody.weightKg,
      };
      setBodyMetrics(mergedBody);
      if (!editBodyMetrics) {
        syncBodyMetricDrafts(mergedBody);
      }

      const list = listRes?.data?.data ?? listRes?.data ?? [];
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
  }, [profileUser]);

  useEffect(() => {
    const storedRecords = readStoredPersonalBestRecords();
    if (Object.keys(storedRecords).length > 0) {
      setPersonalBestRecords(storedRecords);
    }

    const storedBody = readStoredBodyMetrics();
    if (storedBody.heightCm != null || storedBody.weightKg != null) {
      setBodyMetrics(storedBody);
      syncBodyMetricDrafts(storedBody);
    }

    const storedGoals = readStoredGoals();
    if (storedGoals.length > 0) {
      setGoalsDraft(storedGoals);
    }

    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin text-[#FF4F21]"><Activity className="h-8 w-8" /></div>
      </div>
    );
  }

  const athleteName = profileUser?.name || profileUser?.username || 'Athlete';
  const initial = athleteName.substring(0, 2).toUpperCase();
  const tier = profileUser?.classification?.athleteLevel || 'U18 Sprinter';

  const handleSavePersonalBest = async () => {
    const event = normalizeEventName(recordEvent);
    const time = recordTime.trim();

    if (!event || !time) {
      setPersonalBestError('Enter a personal best before saving.');
      setPersonalBestMessage(null);
      return;
    }

    setSavingPersonalBest(true);
    setPersonalBestError(null);
    setPersonalBestMessage(null);
    try {
      const nextRecords = {
        ...personalBestRecords,
        [event]: time,
      };
      const serializedRecords = JSON.stringify(nextRecords);

      await api.post('/onboarding/training-profile', {
        trainingDays: Number(profileDetails.trainingDays ?? 4),
        trainingDuration: Number(profileDetails.trainingDuration ?? 90),
        experienceYears: Number(profileDetails.experienceYears ?? 0),
        personalBest: serializedRecords,
      });

      setProfileDetails((current) => ({
        ...current,
        personalBest: serializedRecords,
      }));
      setPersonalBestRecords(nextRecords);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(personalBestStorageKey, serializedRecords);
      }
      setRecordTime('');
      setPersonalBestMessage(`${event} saved.`);
    } catch (err) {
      setPersonalBestError('Could not save personal best. Please try again.');
      console.error('Failed to save personal best', err);
    } finally {
      setSavingPersonalBest(false);
    }
  };

  const handleSaveBodyMetrics = async () => {
    const heightCm = Number(heightDraft);
    const weightKg = Number(weightDraft);

    if (!Number.isFinite(heightCm) || !Number.isFinite(weightKg)) {
      setBodyMetricsError('Enter both height and weight before saving.');
      setBodyMetricsMessage(null);
      return;
    }

    setSavingBodyMetrics(true);
    setBodyMetricsError(null);
    setBodyMetricsMessage(null);

    try {
      await api.post('/onboarding/body-metrics', {
        heightCm,
        weightKg,
      });

      setBodyMetrics({ heightCm, weightKg });
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(bodyMetricsStorageKey, JSON.stringify({ heightCm, weightKg }));
      }
      setEditBodyMetrics(false);
      setBodyMetricsMessage('Body profile updated.');
    } catch (err) {
      setBodyMetricsError('Could not update body profile. Please try again.');
      console.error('Failed to save body metrics', err);
    } finally {
      setSavingBodyMetrics(false);
    }
  };

  const handleSaveGoals = async (nextGoals: string[]) => {
    const normalizedGoals = nextGoals.map(normalizeGoalText).filter(Boolean);

    if (normalizedGoals.length === 0) {
      setGoalsError('Add at least one goal before saving.');
      setGoalsMessage(null);
      return;
    }

    setSavingGoals(true);
    setGoalsError(null);
    setGoalsMessage(null);

    try {
      await api.post('/onboarding/goals', {
        goals: normalizedGoals,
      });

      setGoalsDraft(normalizedGoals);
      setProfileDetails((current) => ({
        ...current,
        goals: normalizedGoals,
      }));
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(goalsStorageKey, JSON.stringify(normalizedGoals));
      }
      setGoalsMessage('Goals updated.');
    } catch (err) {
      setGoalsError('Could not save goals. Please try again.');
      console.error('Failed to save goals', err);
    } finally {
      setSavingGoals(false);
    }
  };

  const handleAddGoal = async () => {
    const nextGoal = normalizeGoalText(newGoalDraft);
    if (!nextGoal) return;

    const nextGoals = [...goalsDraft, nextGoal];
    setNewGoalDraft('');
    await handleSaveGoals(nextGoals);
  };

  const handleDeleteGoal = async (goalIndex: number) => {
    const nextGoals = goalsDraft.filter((_, index) => index !== goalIndex);
    setEditingGoalIndex(null);
    setEditingGoalDraft('');
    await handleSaveGoals(nextGoals);
  };

  const beginEditGoal = (goalIndex: number) => {
    setEditingGoalIndex(goalIndex);
    setEditingGoalDraft(goalsDraft[goalIndex] || '');
  };

  const commitEditGoal = async () => {
    if (editingGoalIndex === null) return;

    const nextGoal = normalizeGoalText(editingGoalDraft);
    if (!nextGoal) return;

    const nextGoals = goalsDraft.map((goal, index) => (index === editingGoalIndex ? nextGoal : goal));
    setEditingGoalIndex(null);
    setEditingGoalDraft('');
    await handleSaveGoals(nextGoals);
  };

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
                {recordOrder.map((event) => {
                  const record = getRecordDisplay(event);
                  return (
                    <React.Fragment key={event}>
                      {renderRecordCard(record.title, record.value, record.subtitle)}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Add Personal Best</p>
                  <p className="text-xs text-zinc-400">Choose the event, enter the time, and it will fill the matching box.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-[160px_1fr_auto]">
                  <select
                    value={recordEvent}
                    onChange={(e) => setRecordEvent(e.target.value)}
                    className="rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-xs text-white outline-none transition focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
                  >
                    {recordOrder.map((event) => (
                      <option key={event} value={event}>{event}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={recordTime}
                    onChange={(e) => setRecordTime(e.target.value)}
                    placeholder="12.4s"
                    className="flex-1 rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
                  />
                  <button
                    type="button"
                    onClick={handleSavePersonalBest}
                    disabled={savingPersonalBest}
                    className="rounded-xl bg-[#FF4F21] px-5 py-3 text-xs font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingPersonalBest ? 'Saving...' : 'Save PB'}
                  </button>
                </div>
                {personalBestError && <p className="text-[10px] font-bold text-red-400">{personalBestError}</p>}
                {personalBestMessage && <p className="text-[10px] font-bold text-emerald-400">{personalBestMessage}</p>}
              </div>
            </section>

            {/* 5. GOALS SECTION */}
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
              <div className="flex items-center justify-between gap-3 mb-6">
                <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                  <Target className="h-4 w-4" /> Active Goals
                </h2>
                {/* <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">CRUD</span> */}
              </div>

              <div className="space-y-3">
                {goalsDraft.length > 0 ? (
                  goalsDraft.map((goal, index) => {
                    const isEditing = editingGoalIndex === index;
                    return (
                      <div key={`${goal}-${index}`} className="rounded-2xl border border-zinc-800 bg-black/30 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingGoalDraft}
                              onChange={(e) => setEditingGoalDraft(e.target.value)}
                              className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
                            />
                          ) : (
                            <div>
                              <p className="text-sm font-bold text-white">{goal}</p>
                              <p className="text-[10px] text-zinc-500 mt-1">Saved goal from your profile creation</p>
                            </div>
                          )}

                          <div className="flex items-center gap-2 shrink-0">
                            {isEditing ? (
                              <button
                                type="button"
                                onClick={commitEditGoal}
                                className="text-[10px] font-bold uppercase tracking-widest text-[#FF4F21] hover:text-[#FF8433] transition"
                              >
                                Save
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => beginEditGoal(index)}
                                className="text-[10px] font-bold uppercase tracking-widest text-blue-400 hover:text-blue-300 transition"
                              >
                                Edit
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteGoal(index)}
                              className="text-[10px] font-bold uppercase tracking-widest text-red-400 hover:text-red-300 transition"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-zinc-800 bg-black/20 p-4 text-xs text-zinc-500">
                    No goals saved yet. Add one below.
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-3">
                <div className="flex flex-col gap-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Add Goal</p>
                  <p className="text-xs text-zinc-400">Create, edit, and remove goals from your profile.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-3">
                  <input
                    type="text"
                    value={newGoalDraft}
                    onChange={(e) => setNewGoalDraft(e.target.value)}
                    placeholder="Improve Sprint Mechanics"
                    className="flex-1 rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    disabled={savingGoals}
                    className="rounded-xl bg-[#FF4F21] px-5 py-3 text-xs font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {savingGoals ? 'Saving...' : 'Add Goal'}
                  </button>
                </div>
                {goalsError && <p className="text-[10px] font-bold text-red-400">{goalsError}</p>}
                {goalsMessage && <p className="text-[10px] font-bold text-emerald-400">{goalsMessage}</p>}
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
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Body Profile</h2>
                {!editBodyMetrics ? (
                  <button
                    type="button"
                    onClick={() => {
                      syncBodyMetricDrafts(bodyMetrics);
                      setBodyMetricsError(null);
                      setBodyMetricsMessage(null);
                      setEditBodyMetrics(true);
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-[#FF4F21] hover:text-[#FF8433] transition"
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      syncBodyMetricDrafts(bodyMetrics);
                      setBodyMetricsError(null);
                      setBodyMetricsMessage(null);
                      setEditBodyMetrics(false);
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {!editBodyMetrics ? (
                  <>
                    <div className="flex justify-between text-xs pb-3 border-b border-zinc-800/50">
                      <span className="text-zinc-500 font-bold">Height</span>
                      <span className="text-white font-bold">
                        {bodyMetrics.heightCm != null ? `${bodyMetrics.heightCm} cm` : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs pb-3 border-b border-zinc-800/50">
                      <span className="text-zinc-500 font-bold">Weight</span>
                      <span className="text-white font-bold">
                        {bodyMetrics.weightKg != null ? `${bodyMetrics.weightKg} kg` : '—'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="space-y-2">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Height (cm)</span>
                        <input
                          type="number"
                          min="50"
                          max="300"
                          value={heightDraft}
                          onChange={(e) => setHeightDraft(e.target.value)}
                          placeholder="178"
                          className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500">Weight (kg)</span>
                        <input
                          type="number"
                          min="10"
                          max="500"
                          value={weightDraft}
                          onChange={(e) => setWeightDraft(e.target.value)}
                          placeholder="70"
                          className="w-full rounded-xl border border-zinc-800 bg-black/40 px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleSaveBodyMetrics}
                        disabled={savingBodyMetrics}
                        className="rounded-xl bg-[#FF4F21] px-5 py-3 text-xs font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {savingBodyMetrics ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          syncBodyMetricDrafts(bodyMetrics);
                          setBodyMetricsError(null);
                          setBodyMetricsMessage(null);
                          setEditBodyMetrics(false);
                        }}
                        className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition"
                      >
                        Keep Existing
                      </button>
                    </div>
                  </div>
                )}

                {bodyMetricsError && <p className="text-[10px] font-bold text-red-400">{bodyMetricsError}</p>}
                {bodyMetricsMessage && <p className="text-[10px] font-bold text-emerald-400">{bodyMetricsMessage}</p>}
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
