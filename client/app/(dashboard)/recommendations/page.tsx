'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Zap, Target, Shield, Activity, ArrowRight, CheckCircle, ChevronRight, AlertTriangle, Trophy, Clock, Loader2, ArrowLeft, ChevronDown, Lightbulb, CheckCircle2
} from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';
import { useAuth, api } from '../../context/AuthContext';
import MobileDropdownModal from '../../components/ui/MobileDropdownModal';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';

const PLAN_VARIANTS = [
  { value: 'balanced', label: 'Balanced Progression', subtext: 'Equal focus across power, technique & recovery' },
  { value: 'speed', label: 'Speed & Power', subtext: 'Intensive block for maximal sprint velocity' },
  { value: 'recovery', label: 'Recovery & Mobility', subtext: 'Kinetic chain reset & joint protection' },
];

export default function RecommendationsPage() {
  const router = useRouter();
  const { dateRange } = useDateFilter();
  const { user, refreshUser } = useAuth();

  const physicalProfile = user?.physicalProfile;
  const preferredDays = physicalProfile?.training_days || 5;

  const [targetDays, setTargetDays] = useState(preferredDays);
  const [planVariant, setPlanVariant] = useState('balanced');
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isEditingDays, setIsEditingDays] = useState(false);
  const [isSavingDays, setIsSavingDays] = useState(false);

  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);

  const loadLatest = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/list');
      setFetchError(null);
      const list = res.data?.data ?? res.data ?? [];
      if (Array.isArray(list) && list.length > 0) {
        const completed = list.filter((a: any) => a.status === 'COMPLETED');
        if (completed.length > 0) {
          completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setLatestAnalysis(completed[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load analysis for recommendations', err);
      setFetchError(classifyFetchError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } },
  };

  const getWeeklyIcon = (type: string) => {
    switch (type) {
      case 'Power': return <Zap size={14} color="#FF4F21" />;
      case 'Mobility': return <Shield size={14} className="text-blue-600" />;
      case 'Technique': return <Activity size={14} className="text-emerald-600" />;
      case 'Performance': return <Trophy size={14} className="text-purple-600" />;
      case 'Rest': return <Clock size={14} className="text-[#8C8C8C]" />;
      default: return <Activity size={14} className="text-[#8C8C8C]" />;
    }
  };

  const getWeeklyChipStyle = (type: string) => {
    switch (type) {
      case 'Power': return 'bg-[#FFF2EE] text-[#FF4F21] border border-[#FFE0D6]';
      case 'Mobility': return 'bg-blue-50 text-blue-700 border border-blue-200/60';
      case 'Technique': return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      case 'Performance': return 'bg-purple-50 text-purple-700 border border-purple-200/60';
      case 'Rest': return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
      default: return 'bg-zinc-100 text-zinc-600 border border-zinc-200';
    }
  };

  const handleSaveTargetDays = async () => {
    setIsSavingDays(true);
    try {
      await api.post('/onboarding/training-profile', {
        trainingDays: Number(targetDays),
        trainingDuration: Number(physicalProfile?.training_duration) || 90,
        experienceYears: Number(physicalProfile?.experience_years) || 3,
        personalBest: physicalProfile?.personal_best || '',
        achievements: physicalProfile?.achievements || ''
      });
      await refreshUser();
      setIsEditingDays(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingDays(false);
    }
  };

  const generatePlan = (daysCount: number, variant: string) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const plan = [];

    const trainingPatterns: Record<string, string[]> = {
      speed: ['Power', 'Technique', 'Power', 'Mobility', 'Performance', 'Power', 'Technique'],
      recovery: ['Mobility', 'Technique', 'Mobility', 'Power', 'Mobility', 'Technique', 'Mobility'],
      balanced: ['Power', 'Technique', 'Mobility', 'Power', 'Technique', 'Mobility', 'Performance'],
    };

    const pattern = trainingPatterns[variant] || trainingPatterns.balanced;

    for (let i = 0; i < 7; i++) {
      const isTraining = i < daysCount;
      const type = isTraining ? pattern[i % pattern.length] : 'Rest';

      let focus = 'Active Recovery & Tissue Reset';
      if (type === 'Power') focus = 'A-Skips & Explosive Blocks';
      if (type === 'Technique') focus = 'Stride Frequency & Hip Drive';
      if (type === 'Mobility') focus = 'Hamstring & Hip Flexor Alignment';
      if (type === 'Performance') focus = 'Max Velocity & Time Trial';

      plan.push({ day: days[i], type, focus });
    }
    return plan;
  };

  const schedulePlan = generatePlan(targetDays, planVariant);

  const rawRisk = latestAnalysis?.injuryRisk?.level || (physicalProfile?.injury_history?.injuries?.length > 0 ? 'MODERATE' : 'LOW');
  const injuryArea: string | null =
    latestAnalysis?.injuryRisk?.riskArea || physicalProfile?.injury_history?.injuries?.[0] || null;

  const extractText = (item: any): string | null => {
    if (!item) return null;
    if (typeof item === 'string') return item;
    if (typeof item === 'object') {
      return item.weakness || item.observation || item.insight || item.text || item.title || item.name || null;
    }
    return String(item);
  };
  const weakness: string | null = extractText(latestAnalysis?.insights?.weaknesses?.[0]);
  const observation: string | null = extractText(latestAnalysis?.insights?.observations?.[0]);

  // AI Insights (strengths / focus areas) — real data only. Previously this
  // fell back to two hardcoded fabricated bullet points per list when no
  // analysis existed; now the section is simply not rendered without data.
  const activeInsights = latestAnalysis?.aiInsights || latestAnalysis?.insights || {};
  const strengths: string[] = activeInsights.strengths?.length ? activeInsights.strengths : [];
  const focusAreas: string[] = activeInsights.weaknesses?.length ? activeInsights.weaknesses : [];

  // Benchmark comparison vs competitive levels — real data only. Previously
  // this fell back to the exact same fabricated 178 SPM / 184 ms / 2.14 m
  // values used (and since removed) on the dashboard Home fallback, plus an
  // invented competitive tier ("State"/"District") with no backing data.
  const benchmarkMetrics = latestAnalysis?.metrics || {};
  const benchmarks = latestAnalysis?.benchmarks || {};
  const BENCHMARK_LEVELS = ['Beginner', 'District', 'State', 'National', 'Elite'];
  const levelToPct = (level: string | null) => {
    switch (level) {
      case 'Elite': return '95%';
      case 'National': return '80%';
      case 'State': return '65%';
      case 'District': return '40%';
      case 'Beginner': return '25%';
      default: return '0%';
    }
  };
  const BENCHMARK_ROWS: { label: string; value: string; level: string | null }[] = [
    { label: 'Cadence (Turnover)', value: benchmarkMetrics.cadence ? `${benchmarkMetrics.cadence} SPM` : '—', level: benchmarks.cadenceLevel || null },
    { label: 'Ground Contact Time', value: benchmarkMetrics.gct ? `${benchmarkMetrics.gct} ms` : '—', level: benchmarks.gctLevel || null },
    { label: 'Stride Length', value: benchmarkMetrics.strideLength ? `${benchmarkMetrics.strideLength} m` : '—', level: benchmarks.strideLevel || null },
  ];

  const DIRECTIVE_CARDS = [
    {
      title: 'Technique Protocols',
      desc: 'Immediate form modifications to maximize stride efficiency.',
      icon: Target,
      color: 'text-[#FF4F21]',
      bg: 'bg-[#FFF2EE]',
      items: [
        { title: 'Drive Knees to 90°', sub: 'Reduces overstride and ground contact braking.' },
        { title: 'Dorsiflex Foot Before Strike', sub: 'Pre-tensions Achilles tendon for energy return.' },
      ],
    },
    {
      title: 'Injury Prevention',
      desc: injuryArea
        ? `Targeted reinforcement for ${injuryArea} kinetic chain.`
        : 'General injury-prevention conditioning.',
      icon: Shield,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      items: [
        { title: 'Nordic Hamstring Curls', sub: '3 sets of 6 reps, 3x / week eccentric loading.' },
        { title: 'Tibialis Raises', sub: 'Reduces shin splints and stabilizes ankle joint.' },
      ],
    },
    {
      title: 'Power Development',
      desc: 'Explosive plyometrics to decrease ground contact time.',
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      items: [
        { title: 'Depth Jumps (30cm Box)', sub: '3 sets of 5 reps. Focus on immediate rebound.' },
        { title: 'Pogo Hops', sub: 'Stiff ankle springs, 3 x 20 sec.' },
      ],
    },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-24 space-y-7 animate-fadeIn font-poppins relative z-10 text-[#1C1C1E]">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase block">
            {currentDate} · SPRINT NORMS & COLLEGIATE BENCHMARKS
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight mt-0.5 flex items-center gap-2">
            Norm Benchmarks <Target size={24} className="text-[#FF4F21]" />
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPlanModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#1C1C1E] text-xs font-bold hover:bg-zinc-50 active:scale-95 transition shadow-2xs cursor-pointer"
          >
            <span>Focus: {PLAN_VARIANTS.find(p => p.value === planVariant)?.label.split(' ')[0]}</span>
            <ChevronDown size={14} className="text-[#8E8E93]" />
          </button>

          <Link
            href="/dashboard?tab=biomechanics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition cursor-pointer"
          >
            <Zap size={15} />
            <span>Upload Sprint Video</span>
          </Link>
        </div>
      </div>

      {fetchError && <DataFetchError error={fetchError} onRetry={loadLatest} />}

      {/* 2. COMPETITIVE BENCHMARK CALIBRATION CARD */}
      <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center shadow-xs">
              <Trophy size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-[#1C1C1E]">
                Collegiate & International Norm Calibration
              </h2>
              <p className="text-xs text-[#8E8E93] font-medium">
                Comparative tier percentiles across kinematic variables
              </p>
            </div>
          </div>
          {benchmarks.profileLabel && (
            <span className="self-start sm:self-auto text-xs font-bold bg-[#FFF5F2] text-[#FF4F21] border border-[#FF4F21]/20 px-3.5 py-1 rounded-full uppercase tracking-wider">
              {benchmarks.profileLabel}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1">
          {BENCHMARK_ROWS.map((row) => (
            <div key={row.label} className="p-5 rounded-2xl bg-[#F8F8FA] border border-black/[0.03] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                    {row.label}
                  </span>
                  <span className="text-2xl font-black text-[#1C1C1E] mt-1 block">
                    {row.value}
                  </span>
                </div>
                {row.level && (
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FF4F21]/10 text-[#FF4F21]">
                    {row.level}
                  </span>
                )}
              </div>
              <div className="h-2 w-full bg-black/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#FF4F21] transition-all duration-700 rounded-full"
                  style={{ width: levelToPct(row.level) }}
                />
              </div>
              <div className="flex justify-between text-[9px] font-bold text-[#8E8E93] uppercase pt-0.5">
                {BENCHMARK_LEVELS.map((lvl) => <span key={lvl}>{lvl.slice(0, 3)}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. 2-COLUMN SECTION: STRENGTHS & DIRECTIVES + WEEKLY PROTOCOL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        
        {/* Left Column: Strengths & Prescribed Directives */}
        <div className="w-full min-w-0 space-y-6">
          
          {/* Biomechanical Observations */}
          <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-black/[0.06] pb-4">
              <div className="h-9 w-9 rounded-2xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center">
                <Lightbulb size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C1C1E]">
                  Kinematic Observations
                </h3>
                <p className="text-xs text-[#8E8E93] font-medium">
                  AI diagnostic evaluation from latest sprint scan
                </p>
              </div>
            </div>

            {strengths.length === 0 && focusAreas.length === 0 ? (
              <p className="text-xs text-[#8E8E93] font-medium py-2">
                Upload and complete a sprint analysis on the dashboard to generate biomechanical focus areas.
              </p>
            ) : (
              <div className="space-y-3">
                {strengths.length > 0 && (
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Identified Strengths</h4>
                    </div>
                    <ul className="space-y-1.5 text-xs text-emerald-800">
                      {strengths.map((s: any, idx: number) => {
                        const text = typeof s === 'object' ? s.observation || s.insight || s.text || JSON.stringify(s) : String(s);
                        return (
                          <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-emerald-600 font-bold">•</span>
                            <span>{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}

                {focusAreas.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-100/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <AlertTriangle size={15} className="text-amber-600" />
                      <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">Calibration Focus</h4>
                    </div>
                    <ul className="space-y-1.5 text-xs text-amber-800">
                      {focusAreas.map((w: any, idx: number) => {
                        const text = typeof w === 'object' ? w.observation || w.insight || w.text || JSON.stringify(w) : String(w);
                        return (
                          <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                            <span className="text-amber-600 font-bold">•</span>
                            <span>{text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prescribed Training Directives */}
          <div className="space-y-4">
            {DIRECTIVE_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="rounded-[28px] bg-white border border-black/[0.06] p-6 shadow-xs space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-9 w-9 rounded-2xl ${card.bg} flex items-center justify-center`}>
                      <Icon size={18} className={card.color} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-[#1C1C1E]">
                        {card.title}
                      </h3>
                      <p className="text-xs text-[#8E8E93] font-medium">
                        {card.desc}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    {card.items.map((item, i) => (
                      <div key={i} className="flex gap-2.5 bg-[#F8F8FA] border border-black/[0.03] p-3 rounded-2xl">
                        <CheckCircle size={15} className={`shrink-0 mt-0.5 ${card.color}`} />
                        <div>
                          <p className="text-xs font-bold text-[#1C1C1E]">{item.title}</p>
                          <p className="text-[11px] text-[#8E8E93] mt-0.5">{item.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Weekly Microcycle Schedule */}
        <div className="w-full min-w-0 rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C1C1E]">
                  Weekly Prescribed Microcycle
                </h3>
                <p className="text-xs text-[#8E8E93] font-medium">
                  {targetDays} days / week · {PLAN_VARIANTS.find(p => p.value === planVariant)?.label}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditingDays ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1" max="7"
                    value={targetDays}
                    onChange={e => setTargetDays(Number(e.target.value))}
                    className="w-14 bg-[#F8F8FA] border border-black/[0.08] rounded-xl px-2 py-1 text-center text-xs font-bold outline-none focus:border-[#FF4F21]"
                  />
                  <button onClick={handleSaveTargetDays} disabled={isSavingDays} className="bg-[#FF4F21] text-white rounded-full px-3 py-1 text-xs font-bold cursor-pointer">
                    {isSavingDays ? <Loader2 size={12} className="animate-spin" /> : 'Save'}
                  </button>
                  <button onClick={() => { setIsEditingDays(false); setTargetDays(preferredDays); }} className="bg-[#F8F8FA] text-[#636366] border border-black/[0.06] rounded-full px-3 py-1 text-xs font-bold cursor-pointer">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setIsEditingDays(true)} className="text-xs text-[#FF4F21] font-bold hover:underline cursor-pointer">
                  Adjust Days
                </button>
              )}
            </div>
          </div>

          <div className="space-y-2.5">
            {schedulePlan.map((schedule, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-black/[0.04] overflow-hidden bg-[#F8F8FA] transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white transition text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-bold text-[#8E8E93] w-14 shrink-0">{schedule.day.slice(0, 3)}</span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${getWeeklyChipStyle(schedule.type)} shrink-0`}>
                      {getWeeklyIcon(schedule.type)} {schedule.type}
                    </span>
                    <span className="text-xs font-semibold text-[#1C1C1E] truncate">{schedule.focus}</span>
                  </div>
                  <ChevronRight size={15} className={`text-[#8E8E93] shrink-0 transition-transform ${expandedDay === idx ? 'rotate-90 text-[#FF4F21]' : ''}`} />
                </button>
                {expandedDay === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-[#636366] bg-white border-t border-black/[0.04]">
                    <p className="font-bold text-[#1C1C1E] pt-2">
                      <span className="text-[#FF4F21] mr-1">{schedule.type} Protocol</span>
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-[#636366]">
                      {schedule.type === 'Rest'
                        ? 'Active recovery protocol: Prioritize joint mobility, light stretching, and adequate sleep hydration.'
                        : `Targeted session designed for ${schedule.day}. Focus on strict mechanical execution to reinforce correct motor patterns.`}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      <MobileDropdownModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        title="Training Focus"
        options={PLAN_VARIANTS}
        selectedValue={planVariant}
        onSelect={(val) => setPlanVariant(val)}
      />
    </div>
  );
}
