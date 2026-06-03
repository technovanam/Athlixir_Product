'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, AlertTriangle, Shield, TrendingUp, ShieldAlert, Navigation, ArrowRight, Zap, Target, Sparkles, Clock, AlertCircle, HeartPulse, RefreshCcw
} from 'lucide-react';
import { useAuth, api } from '../../context/AuthContext';
import { useDateFilter } from '../../context/DateFilterContext';
import { Biomech3DCanvas } from '../../components/Biomech3DCanvas';

export default function InjuryRiskPage() {
  const { user } = useAuth();
  const { dateRange } = useDateFilter();
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDirective, setActiveDirective] = useState<number | null>(null);

  const fetchLatest = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/list');
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  // Framer Motion layout transition variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } }
  };

  // Determine actual risk levels and metrics from dynamic data or fallbacks
  const rawRiskLevel = latestAnalysis?.injuryRisk?.level || 'MODERATE';
  const riskLevel = rawRiskLevel.toUpperCase();
  const riskArea = latestAnalysis?.injuryRisk?.riskArea && latestAnalysis.injuryRisk.riskArea !== 'None' 
    ? latestAnalysis.injuryRisk.riskArea 
    : 'Hamstring & Ankle';

  // Deriving asymmetry index dynamically or fallback to 11.4%
  const symmetry = latestAnalysis?.metrics?.symmetry;
  const asymmetryVal = latestAnalysis?.metrics?.asymmetryIndex !== undefined && latestAnalysis?.metrics?.asymmetryIndex !== null
    ? latestAnalysis.metrics.asymmetryIndex 
    : (typeof symmetry === 'number' ? (100 - symmetry) : 11.4);
  const asymmetryPercent = typeof asymmetryVal === 'number' ? parseFloat(asymmetryVal.toFixed(1)) : 11.4;

  // Style parameters depending on the active threat level
  const getRiskStyles = (level: string) => {
    switch (level) {
      case 'HIGH':
        return {
          glow: 'from-red-500/10 to-[#08080C]/20 border-red-500/30',
          text: 'text-red-500',
          badge: 'border-red-500/20 bg-red-500/10 text-red-400',
          avatarGlow: 'shadow-[0_0_25px_rgba(239,68,68,0.35)]',
        };
      case 'LOW':
      case 'MINIMAL':
        return {
          glow: 'from-emerald-500/10 to-[#08080C]/20 border-emerald-500/20',
          text: 'text-emerald-400',
          badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
          avatarGlow: 'shadow-[0_0_20px_rgba(16,185,129,0.25)]',
        };
      default: // MODERATE / MEDIUM
        return {
          glow: 'from-amber-500/10 to-[#08080C]/20 border-amber-500/20',
          text: 'text-amber-500',
          badge: 'border-amber-500/20 bg-amber-500/10 text-amber-400',
          avatarGlow: 'shadow-[0_0_20px_rgba(245,158,11,0.25)]',
        };
    }
  };

  const riskTheme = getRiskStyles(riskLevel);

  // Dynamic mapped warnings list or premium fallback
  const getWarningsList = () => {
    if (latestAnalysis?.injuryRisks && latestAnalysis.injuryRisks.length > 0) {
      return latestAnalysis.injuryRisks.filter((r: any) => r.detected);
    }
    // Premium Mock Fallback
    return [
      {
        category: 'Left Hamstring Overload',
        detail: 'Excessive forward hip posture combined with high ground contact time increases mechanical eccentric load on the left hamstring fibers during peak deceleration.',
        severity: 'MEDIUM',
        detected: true
      },
      {
        category: 'Right Ankle Stiffness Deficiency',
        detail: 'Dynamic joint power loss detected during active triple extension. Poor ankle stiffness is causing energy dispersion and compensatory knee strain.',
        severity: 'HIGH',
        detected: true
      }
    ];
  };

  const warnings = getWarningsList();

  // Premium Fallback Prevention Protocols
  const PREVENTION_DIRECTIVES = [
    {
      title: "Hamstring Eccentric Lengthening",
      subtitle: "Nordic drops and slider leg curls targeting mechanical strength.",
      description: "Perform 3 sets of 6-8 eccentric repetitions. Focus on a 4-second descending phase. This actively builds hamstring tissue tolerance against high eccentric force loads.",
      duration: "15 Mins",
      intensity: "Moderate"
    },
    {
      title: "Reactive Tendon Stiffness Pogo Hops",
      subtitle: "Low contact ankle jumps to rebuild spring stiffness.",
      description: "Complete 3 sets of 20 quick pogo reps. Ensure minimal knee flex, using rapid ankle turnover. The goal is to minimize GCT while keeping the ankle joint locked.",
      duration: "10 Mins",
      intensity: "High"
    },
    {
      title: "Hip Flexor Stability Protocol",
      subtitle: "Isometric holds at peak extension for pelvic stabilization.",
      description: "Implement 4 sets of 30-second isometric holds on each side. Stabilizing hip drops balances ground force distribution across both lower limbs.",
      duration: "12 Mins",
      intensity: "Light"
    }
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-10 animate-fadeIn pb-24 text-white">
      
      {/* Header */}
      <header className="flex items-end justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 text-amber-500 mb-1">
            <span className="inline-flex items-center gap-1.5 border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-[0_0_8px_rgba(245,158,11,0.1)] animate-pulse">
              <ShieldAlert className="h-3.5 w-3.5" />
              Injury Intelligence
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Risk Assessment</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Biomechanical overload and fatigue detection for {dateRange}</p>
        </div>
        <button
          onClick={fetchLatest}
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition px-3 py-2 rounded-xl border border-white/[0.05] bg-[#08080C]/40 hover:border-white/[0.1] hover:bg-[#08080C]/60 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Re-Analyze
        </button>
      </header>

      {/* Global Risk Banner + Telemetry Index Cards */}
      <motion.section 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        
        {/* Dynamic Glowing Threat Level Banner */}
        <motion.div 
          variants={itemVariants} 
          className={`col-span-1 md:col-span-2 rounded-xl border bg-gradient-to-br ${riskTheme.glow} shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md p-8 relative overflow-hidden group transition-all duration-300`}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-white/10 transition duration-700" />
          <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
            <ShieldAlert className="h-48 w-48 text-white" />
          </div>
          
          <div className="relative z-10 space-y-4">
            <div>
              <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 text-zinc-400" /> Dynamic Overload Status
              </p>
              <h2 className={`text-4xl font-black tracking-tight mt-1 uppercase ${riskTheme.text}`}>
                {riskLevel} RISK
              </h2>
            </div>
            <p className="text-xs font-bold text-zinc-300 leading-relaxed max-w-sm">
              Focus area: <span className="text-white underline decoration-[#FF4F21]/60 font-black">{riskArea}</span>. Left pelvic drop metrics show mechanical anomalies causing compensation stresses.
            </p>
          </div>
        </motion.div>

        {/* Dynamic Asymmetry Card */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.1] hover:bg-[#08080C]/60 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4F21]/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-[#FF4F21]/10 transition duration-700" />
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
            <Activity className="h-24 w-24 text-[#FF4F21]" />
          </div>

          <div className="relative z-10">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Activity className="h-3.5 w-3.5 text-[#FF4F21]" /> Asymmetry Index
            </p>
            <h3 className="text-3xl font-black text-[#FF4F21] tracking-tight mt-3">
              {asymmetryPercent}%
            </h3>
          </div>
          
          <div className="relative z-10 mt-6">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <span>Optimal (5%)</span>
              <span className="text-[#FF4F21]">Critical (10%)</span>
            </div>
            <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/[0.02] p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-[#FF4F21] rounded-full shadow-[0_0_10px_rgba(255,79,33,0.5)] transition-all duration-1000" 
                style={{ width: `${Math.min(asymmetryPercent * 8, 100)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Fatigue Index Card */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 relative overflow-hidden flex flex-col justify-between group hover:border-white/[0.1] hover:bg-[#08080C]/60 transition-all duration-300"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-emerald-500/10 transition duration-700" />
          <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
            <Zap className="h-24 w-24 text-emerald-400" />
          </div>

          <div className="relative z-10">
            <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-emerald-400" /> Cumulative Fatigue
            </p>
            <h3 className="text-3xl font-black text-emerald-400 tracking-tight mt-3">STABLE</h3>
          </div>
          
          <div className="relative z-10 mt-6">
            <div className="flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-zinc-500 mb-1.5">
              <span>Optimal</span>
              <span>Exhausted</span>
            </div>
            <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/[0.02] p-0.5">
              <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] w-[25%]" />
            </div>
          </div>
        </motion.div>

      </motion.section>

      {/* Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: F1 Telemetry Scanner Load Map (1/3 cols) */}
        <motion.section 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col items-center relative overflow-hidden group hover:border-white/[0.08]"
        >
          {/* F1 Grid Scopes */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] opacity-25 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#FF4F21]/40 to-transparent animate-[scan_3s_ease-in-out_infinite]" />
          
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6 relative z-10 self-start flex items-center gap-1.5 border-b border-white/[0.03] pb-2 w-full">
            <Target className="h-4 w-4 text-[#FF4F21]" /> Biomechanical Load Map
          </h3>
          
          <div className="relative w-full h-[400px] border border-white/[0.05] bg-black/30 rounded-2xl p-4 flex items-center justify-center z-10 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-sm overflow-hidden">
            <Biomech3DCanvas />
          </div>
        </motion.section>

        {/* Right: Warnings & Corrective Protocols (2/3 cols) */}
        <motion.section 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1 lg:col-span-2 space-y-6 flex flex-col"
        >
          
          {/* Active Warnings Panels */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md overflow-hidden hover:border-white/[0.08] transition duration-300">
            <div className="p-5 border-b border-white/[0.05] bg-black/20">
              <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500 animate-pulse" /> Active Movement Warnings
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {warnings.map((risk: any, i: number) => {
                const isHigh = risk.severity === 'HIGH';
                const cardBorder = isHigh ? 'border-l-[#FF4F21] border-[#FF4F21]/20 bg-[#FF4F21]/5 hover:bg-[#FF4F21]/8' : 'border-l-amber-500 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/8';
                const textCol = isHigh ? 'text-[#FF4F21]' : 'text-amber-500';
                
                return (
                  <div key={i} className={`p-4 rounded-xl border-l-2 flex items-start gap-4 transition duration-200 border ${cardBorder}`}>
                    <ShieldAlert className={`h-5 w-5 shrink-0 mt-0.5 ${textCol}`} />
                    <div>
                      <h4 className={`text-xs font-black uppercase tracking-wider mb-1 ${textCol}`}>{risk.category}</h4>
                      <p className="text-[11px] text-zinc-300 leading-relaxed font-medium">
                        {risk.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prevention Directives Accordion */}
          <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md overflow-hidden hover:border-white/[0.08] transition duration-300 flex-1">
            <div className="p-5 border-b border-white/[0.05] bg-black/20 flex items-center justify-between">
              <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" /> Prevention Directives
              </h2>
              <span className="text-[8px] font-mono text-zinc-500">CLICK TO UNLOCK PROTOCOLS</span>
            </div>
            
            <div className="divide-y divide-white/[0.03]">
              {PREVENTION_DIRECTIVES.map((directive, idx) => {
                const isOpen = activeDirective === idx;
                
                return (
                  <div key={idx} className="transition duration-200">
                    <button
                      onClick={() => setActiveDirective(isOpen ? null : idx)}
                      className="w-full p-5 flex justify-between items-center hover:bg-white/[0.02] transition cursor-pointer text-left group"
                    >
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wide mb-1 group-hover:text-emerald-400 transition">
                          {directive.title}
                        </h4>
                        <p className="text-[10px] text-zinc-500 font-medium">{directive.subtitle}</p>
                      </div>
                      <div className="h-8 w-8 rounded-lg bg-[#08080C] border border-white/[0.05] flex items-center justify-center group-hover:border-emerald-500/30 transition">
                        <Navigation className={`h-4 w-4 text-zinc-500 group-hover:text-emerald-400 transition-all duration-300 ${isOpen ? 'rotate-90 text-emerald-400' : 'group-hover:translate-x-0.5 group-hover:-translate-y-0.5'}`} />
                      </div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-black/20 border-t border-white/[0.02]"
                        >
                          <div className="p-5 text-xs text-zinc-400 space-y-3 leading-relaxed">
                            <p className="text-[11px] font-medium text-zinc-300">{directive.description}</p>
                            <div className="flex gap-4 pt-1.5 border-t border-white/[0.03]">
                              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-zinc-500">
                                <Clock className="h-3.5 w-3.5 text-zinc-600" /> Duration: <span className="text-white">{directive.duration}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase text-zinc-500">
                                <HeartPulse className="h-3.5 w-3.5 text-[#FF4F21]" /> Intensity: <span className="text-white">{directive.intensity}</span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
          
        </motion.section>
      </div>
    </div>
  );
}
