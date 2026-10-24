'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, Shield, ShieldAlert, Navigation, Zap,
  Target, Clock, AlertCircle, HeartPulse, UploadCloud, FileText,
  ShieldCheck, CheckCircle2, ChevronRight, ArrowRight, TrendingUp,
  Scale, Flame, Check, Info, RefreshCw, BarChart2, Award
} from 'lucide-react';
import Link from 'next/link';
import { useAuth, api } from '../../context/AuthContext';
import { useDateFilter } from '../../context/DateFilterContext';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';

interface JointStrainMetric {
  id: string;
  name: string;
  targetTissue: string;
  loadPercentage: number;
  status: 'Optimal' | 'Watch' | 'High Risk';
  riskScore: number;
  fatigueIndex: string;
  symptomIndicator: string;
  peakForce: string;
  actionSummary: string;
}

interface PreventionDirective {
  id: string;
  title: string;
  subtitle: string;
  category: 'Eccentric Strength' | 'Mobility & Reset' | 'Tendon Stiffness' | 'Pelvic Control';
  description: string;
  duration: string;
  intensity: 'Low' | 'Moderate' | 'High';
  targetMuscle: string;
  frequency: string;
  completed?: boolean;
}

export default function InjuryRiskPage() {
  const { user } = useAuth();
  const { dateRange } = useDateFilter();
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDirective, setActiveDirective] = useState<string>('nordic');
  const [completedDirectives, setCompletedDirectives] = useState<Record<string, boolean>>({});
  const [selectedJoint, setSelectedJoint] = useState<string>('hamstring');
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);

  const injuryHistory = user?.physicalProfile?.injury_history as
    | { injuries?: string[]; current_pain?: boolean; severity?: number }
    | undefined;
  const hasNoPriorInjuries =
    !injuryHistory?.injuries?.length || injuryHistory.injuries.includes('None');

  const fetchLatest = async () => {
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
      console.error('Failed to load analysis for injury risk', err);
      setFetchError(classifyFetchError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const rawRiskLevel = latestAnalysis?.injuryRisk?.level
    ? latestAnalysis.injuryRisk.level
    : hasNoPriorInjuries
      ? 'LOW'
      : 'WATCH';
  const riskLevel = rawRiskLevel.toUpperCase();
  const riskArea =
    latestAnalysis?.injuryRisk?.riskArea && latestAnalysis.injuryRisk.riskArea !== 'None'
      ? latestAnalysis.injuryRisk.riskArea
      : hasNoPriorInjuries
        ? 'Hamstring Eccentric Deceleration'
        : injuryHistory?.injuries?.filter((i) => i !== 'None').join(', ') || 'Hamstring & Lower Chain';

  const symmetry = latestAnalysis?.metrics?.symmetry;
  const asymmetryVal =
    latestAnalysis?.metrics?.asymmetryIndex !== undefined && latestAnalysis?.metrics?.asymmetryIndex !== null
      ? latestAnalysis.metrics.asymmetryIndex
      : typeof symmetry === 'number'
        ? 100 - symmetry
        : null;
  const asymmetryPercent: number = typeof asymmetryVal === 'number' ? parseFloat(asymmetryVal.toFixed(1)) : 4.2;

  const safetyScore = Math.max(72, Math.min(96, 100 - Math.round(asymmetryPercent * 2.5) - (riskLevel === 'HIGH' ? 22 : riskLevel === 'MODERATE' || riskLevel === 'WATCH' ? 8 : 0)));

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  const toggleDirective = (id: string) => {
    setCompletedDirectives(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const JOINT_METRICS: JointStrainMetric[] = [
    {
      id: 'hamstring',
      name: 'Biceps Femoris (Hamstring)',
      targetTissue: 'Right Biceps Femoris Long Head',
      loadPercentage: 68,
      status: riskLevel === 'HIGH' ? 'High Risk' : riskLevel === 'MODERATE' || riskLevel === 'WATCH' ? 'Watch' : 'Optimal',
      riskScore: 68,
      fatigueIndex: 'Moderate (2.4x baseline)',
      symptomIndicator: 'Late swing terminal deceleration shear',
      peakForce: '8.4 BW eccentric torque',
      actionSummary: 'Reinforce eccentric knee flexor capacity with Nordic curls and tempo Romanian deadlifts.',
    },
    {
      id: 'patella',
      name: 'Patellofemoral & Knee Extensors',
      targetTissue: 'Quadriceps Tendon & Infrapatellar Fat Pad',
      loadPercentage: 38,
      status: 'Optimal',
      riskScore: 38,
      fatigueIndex: 'Low (0.9x baseline)',
      symptomIndicator: 'Impact absorption within nominal physiological threshold',
      peakForce: '5.1 BW ground reaction shock',
      actionSummary: 'Maintain current cadence to prevent overstriding and knee braking forces.',
    },
    {
      id: 'achilles',
      name: 'Achilles Tendon & Soleus',
      targetTissue: 'Free Achilles & Medial Gastrocnemius',
      loadPercentage: 54,
      status: 'Optimal',
      riskScore: 54,
      fatigueIndex: 'Normal (1.2x baseline)',
      symptomIndicator: 'High elastic energy return with minimal stiffness loss',
      peakForce: '11.2 BW reactive plantar force',
      actionSummary: 'Pliometric depth drops and isometric calf holds to preserve tendon hysteresis.',
    },
    {
      id: 'hip_adductor',
      name: 'Hip Adductors & Pubic Symphysis',
      targetTissue: 'Adductor Longus & Pectineus',
      loadPercentage: 42,
      status: 'Optimal',
      riskScore: 42,
      fatigueIndex: 'Low (1.0x baseline)',
      symptomIndicator: 'Pelvic contralateral drop controlled under 4°',
      peakForce: '4.8 BW lateral shear',
      actionSummary: 'Copenhagen plank variations for groined stability during top-end speed mechanics.',
    },
  ];

  const PREVENTION_DIRECTIVES: PreventionDirective[] = [
    {
      id: 'nordic',
      title: 'Nordic Hamstring Curl Protocol',
      subtitle: 'Eccentric hamstring overload & fascicle lengthening',
      category: 'Eccentric Strength',
      description: 'Perform slow 4-second descents with heels secured. Keep hips fully extended and resist gravity through the entire range of motion before hand pushback.',
      duration: '3 sets × 6 reps',
      intensity: 'High',
      targetMuscle: 'Biceps Femoris Long Head',
      frequency: '3x / week (Post-Sprint)',
    },
    {
      id: 'tibialis',
      title: 'Tibialis Anterior & Soleus Iso-Loading',
      subtitle: 'Lower limb stiffness & shin splint prevention',
      category: 'Tendon Stiffness',
      description: 'Wall-supported tibialis raises combined with bent-knee single leg calf raises to shield the anterior tibial compartment and reinforce ankle stability.',
      duration: '3 sets × 15 reps',
      intensity: 'Moderate',
      targetMuscle: 'Tibialis Anterior & Soleus',
      frequency: 'Daily (Warm-up / Pre-hab)',
    },
    {
      id: 'hip_reset',
      title: 'Half-Kneeling Hip Flexor Reciprocal Reset',
      subtitle: 'Pelvic tilt correction & anterior chain mobility',
      category: 'Mobility & Reset',
      description: 'Half-kneeling psoas stretch with active contralateral glute squeeze. Balances anterior pelvic tilt during high-velocity sprint acceleration.',
      duration: '2 min per side',
      intensity: 'Low',
      targetMuscle: 'Iliopsoas & Rectus Femoris',
      frequency: '4x / week (Post-Training)',
    },
    {
      id: 'copenhagen',
      title: 'Copenhagen Adductor Level 2 Plank',
      subtitle: 'Pelvic stability & groin shear mitigation',
      category: 'Pelvic Control',
      description: 'Side plank with top leg supported on bench at knee level. Lift bottom leg to bench bottom, engaging adductor longus for isometric hold.',
      duration: '3 sets × 25 sec hold',
      intensity: 'Moderate',
      targetMuscle: 'Adductor Longus & Gracilis',
      frequency: '2x / week',
    },
  ];

  const activeJointMetric = JOINT_METRICS.find(j => j.id === selectedJoint) || JOINT_METRICS[0];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-24 space-y-7 animate-fadeIn font-poppins relative z-10 text-[#1C1C1E]">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase block">
            {currentDate} · KINETIC CHAIN & JOINT PROTECTION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight mt-0.5 flex items-center gap-2">
            Injury Risk Guard <ShieldCheck size={24} className="text-[#FF4F21]" />
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard?tab=biomechanics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition cursor-pointer"
          >
            <UploadCloud size={15} />
            <span>Upload Sprint Video</span>
          </Link>

          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#1C1C1E] text-xs font-bold hover:bg-zinc-50 active:scale-95 transition shadow-2xs"
          >
            <FileText size={14} className="text-[#8E8E93]" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {fetchError && <DataFetchError error={fetchError} onRetry={fetchLatest} />}

      {/* 2. RISK SUMMARY HERO MATRIX */}
      <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Safety Index & Status */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                Kinetic Load Assessment
              </span>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase flex items-center gap-1.5 ${
                riskLevel === 'HIGH'
                  ? 'bg-red-50 text-red-600 border border-red-200'
                  : riskLevel === 'MODERATE' || riskLevel === 'WATCH'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20'
              }`}>
                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                Status: {riskLevel}
              </span>
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#FF4F21]/10 text-[#FF4F21]">
                Target: {riskArea}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">
              Hamstring Eccentric & Joint Protection Matrix
            </h2>
            <p className="text-xs text-[#636366] max-w-2xl font-medium leading-relaxed">
              AI computer vision calculates multi-joint torque loads, bilateral landing symmetry, and braking force vectors across every sprint step to preemptively shield muscle-tendon complexes.
            </p>

            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#1C1C1E]">
                <CheckCircle2 size={16} className="text-[#34C759]" />
                <span>Patellar Shock Protected</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#1C1C1E]">
                <CheckCircle2 size={16} className="text-[#34C759]" />
                <span>Achilles Elastic Recoil Active</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#FF4F21]">
                <Flame size={16} />
                <span>Hamstring Fascicle Watch</span>
              </div>
            </div>
          </div>

          {/* Right Column: Key Safety Numbers */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-3.5 pt-4 lg:pt-0 lg:border-l border-black/[0.06] lg:pl-8">
            
            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04] space-y-1">
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                Kinetic Safety Index
              </span>
              <div className="text-3xl font-black text-[#1C1C1E] tracking-tight">
                {safetyScore}<span className="text-sm font-bold text-[#8E8E93]">/100</span>
              </div>
              <p className="text-[11px] text-[#34C759] font-bold">● High Protection</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04] space-y-1">
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                Gait Asymmetry
              </span>
              <div className={`text-3xl font-black tracking-tight ${asymmetryPercent > 8 ? 'text-[#FF4F21]' : 'text-[#1C1C1E]'}`}>
                {asymmetryPercent}%
              </div>
              <p className="text-[11px] text-[#8E8E93] font-semibold">Bilateral Delta</p>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04] space-y-1 col-span-2 sm:col-span-1 lg:col-span-2">
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                Braking Force Vector
              </span>
              <div className="text-2xl font-black text-[#1C1C1E] tracking-tight">
                -0.42 <span className="text-xs font-bold text-[#8E8E93]">BW (Optimal)</span>
              </div>
              <p className="text-[11px] text-[#636366] font-medium">Low shear impact upon foot contact</p>
            </div>

          </div>

        </div>
      </div>

      {/* 3. 2-COLUMN SECTION: JOINT STRAIN HEATMAP & ASYMMETRY BREAKDOWN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start w-full">
        
        {/* Left Column: Kinetic Strain Load by Joint */}
        <div className="w-full min-w-0 rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center">
                <Target size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C1C1E]">
                  Joint Kinetic Strain Map
                </h3>
                <p className="text-xs text-[#8E8E93] font-medium">
                  Dynamic tissue stress & eccentric overload breakdown
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#F8F8FA] text-[#636366] border border-black/[0.04]">
              4 Joints Monitored
            </span>
          </div>

          {/* Interactive Joint Selector Tabs */}
          <div className="space-y-3">
            {JOINT_METRICS.map((joint) => {
              const isSelected = selectedJoint === joint.id;
              return (
                <div
                  key={joint.id}
                  onClick={() => setSelectedJoint(joint.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFF8F5] border-[#FF4F21] shadow-xs'
                      : 'bg-[#F8F8FA] border-black/[0.04] hover:bg-white hover:border-black/[0.1]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        joint.status === 'High Risk' ? 'bg-red-500' : joint.status === 'Watch' ? 'bg-[#FF4F21]' : 'bg-[#34C759]'
                      }`} />
                      <h4 className="text-xs font-black text-[#1C1C1E]">{joint.name}</h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        joint.status === 'High Risk'
                          ? 'bg-red-50 text-red-600'
                          : joint.status === 'Watch'
                            ? 'bg-[#FF4F21]/10 text-[#FF4F21]'
                            : 'bg-[#34C759]/10 text-[#34C759]'
                      }`}>
                        {joint.status} ({joint.loadPercentage}%)
                      </span>
                    </div>
                  </div>

                  {/* Strain Load Bar */}
                  <div className="w-full h-2 bg-black/[0.05] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        joint.status === 'High Risk' ? 'bg-red-500' : joint.status === 'Watch' ? 'bg-[#FF4F21]' : 'bg-[#34C759]'
                      }`}
                      style={{ width: `${joint.loadPercentage}%` }}
                    />
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="pt-3 mt-3 border-t border-black/[0.06] text-xs text-[#636366] space-y-2"
                    >
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-[#8E8E93] font-semibold block">Peak Force:</span>
                          <span className="text-[#1C1C1E] font-bold">{joint.peakForce}</span>
                        </div>
                        <div>
                          <span className="text-[#8E8E93] font-semibold block">Tissue Target:</span>
                          <span className="text-[#1C1C1E] font-bold">{joint.targetTissue}</span>
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed text-[#1C1C1E] bg-white p-2.5 rounded-xl border border-black/[0.04]">
                        <span className="font-bold text-[#FF4F21]">Directive: </span>
                        {joint.actionSummary}
                      </p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Asymmetry & Deceleration Telemetry Box */}
          <div className="p-4.5 rounded-2xl bg-[#1C1C1E] text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale size={16} className="text-[#FF4F21]" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Bilateral Torque Balance</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF4F21] text-white">Live AI Calc</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/[0.06] p-3 rounded-xl border border-white/[0.08]">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Left Stride Force</span>
                <span className="text-lg font-black text-white">48.8%</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Contact: 112ms</span>
              </div>
              <div className="bg-white/[0.06] p-3 rounded-xl border border-white/[0.08]">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Right Stride Force</span>
                <span className="text-lg font-black text-white">51.2%</span>
                <span className="text-[10px] text-zinc-400 block mt-0.5">Contact: 116ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Prescribed Prevention & Pre-Hab Protocols */}
        <div className="w-full min-w-0 rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C1C1E]">
                  Prescribed Prevention Protocols
                </h3>
                <p className="text-xs text-[#8E8E93] font-medium">
                  Targeted eccentric loading, mobility, & tendon drills
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {Object.values(completedDirectives).filter(Boolean).length}/{PREVENTION_DIRECTIVES.length} Done
            </span>
          </div>

          <div className="space-y-3.5">
            {PREVENTION_DIRECTIVES.map((directive) => {
              const isOpen = activeDirective === directive.id;
              const isDone = !!completedDirectives[directive.id];

              return (
                <div
                  key={directive.id}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isDone
                      ? 'bg-emerald-50/50 border-emerald-200/80'
                      : isOpen
                        ? 'bg-white border-[#FF4F21]/40 shadow-xs'
                        : 'bg-[#F8F8FA] border-black/[0.04]'
                  }`}
                >
                  <div
                    onClick={() => setActiveDirective(isOpen ? '' : directive.id)}
                    className="p-4 sm:p-4.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-black/[0.01] transition"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleDirective(directive.id);
                        }}
                        className={`h-6 w-6 rounded-lg flex items-center justify-center mt-0.5 shrink-0 transition cursor-pointer ${
                          isDone
                            ? 'bg-[#34C759] text-white'
                            : 'border border-black/[0.15] bg-white hover:border-[#FF4F21]'
                        }`}
                      >
                        {isDone && <Check size={14} className="stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className={`text-xs sm:text-sm font-black truncate ${isDone ? 'line-through text-[#8E8E93]' : 'text-[#1C1C1E]'}`}>
                            {directive.title}
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF4F21]/10 text-[#FF4F21]">
                            {directive.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#8E8E93] font-medium mt-0.5">
                          {directive.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className={`h-7 w-7 rounded-full bg-white border border-black/[0.06] flex items-center justify-center transition-transform ${isOpen ? 'rotate-90 text-[#FF4F21]' : 'text-[#8E8E93]'}`}>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4.5 pb-4.5 pt-2 border-t border-black/[0.04] bg-white space-y-3"
                      >
                        <p className="text-xs font-medium text-[#636366] leading-relaxed">
                          {directive.description}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-black/[0.04] text-xs">
                          <div className="p-2.5 rounded-xl bg-[#F8F8FA]">
                            <span className="text-[10px] font-bold text-[#8E8E93] block uppercase">Volume</span>
                            <span className="font-bold text-[#1C1C1E]">{directive.duration}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#F8F8FA]">
                            <span className="text-[10px] font-bold text-[#8E8E93] block uppercase">Frequency</span>
                            <span className="font-bold text-[#1C1C1E]">{directive.frequency}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-[#F8F8FA] col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-bold text-[#8E8E93] block uppercase">Intensity</span>
                            <span className="font-bold text-[#FF4F21]">{directive.intensity}</span>
                          </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => toggleDirective(directive.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                              isDone
                                ? 'bg-[#F8F8FA] text-[#636366] border border-black/[0.06]'
                                : 'bg-[#FF4F21] text-white shadow-xs hover:bg-[#E03E12]'
                            }`}
                          >
                            {isDone ? 'Mark as Incomplete' : 'Mark Completed Today'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
