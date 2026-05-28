'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Target, Shield, Activity, ArrowRight, CheckCircle, ChevronRight, PlayCircle, AlertTriangle, Trophy, Clock
} from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';
import { useAuth, api } from '../../context/AuthContext';

export default function RecommendationsPage() {
  const { dateRange } = useDateFilter();
  const { user, refreshUser } = useAuth();
  
  const physicalProfile = user?.physicalProfile;
  const preferredDays = physicalProfile?.training_days || 5;

  const [targetDays, setTargetDays] = React.useState(preferredDays);
  const [planVariant, setPlanVariant] = React.useState('balanced'); // balanced, speed, recovery
  const [isEditingDays, setIsEditingDays] = React.useState(false);
  const [isSavingDays, setIsSavingDays] = React.useState(false);

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

  // Maps weekly days to dynamic icons for elite layout
  const getWeeklyIcon = (type: string) => {
    switch (type) {
      case 'Power': return <Zap className="h-3.5 w-3.5 text-[#FF4F21]" />;
      case 'Mobility': return <Shield className="h-3.5 w-3.5 text-blue-500" />;
      case 'Technique': return <Activity className="h-3.5 w-3.5 text-emerald-500" />;
      case 'Performance': return <Trophy className="h-3.5 w-3.5 text-purple-500" />;
      case 'Rest': return <Clock className="h-3.5 w-3.5 text-zinc-500" />;
      default: return <Activity className="h-3.5 w-3.5 text-zinc-500" />;
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
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const activeDays = daysOfWeek.slice(0, daysCount);
    
    return activeDays.map((day, i) => {
      if (variant === 'speed') {
        if (i === 0) return { day, focus: 'Acceleration Mechanics', type: 'Power', color: 'text-[#FF4F21]', bg: 'bg-[#FF4F21]/10 border-[#FF4F21]/20' };
        if (i === 1) return { day, focus: 'Active Recovery', type: 'Rest', color: 'text-zinc-400', bg: 'bg-zinc-800/10 border-zinc-700/20' };
        if (i === 2) return { day, focus: 'Max Velocity', type: 'Technique', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
        if (i === 3) return { day, focus: 'Recovery & Mobility', type: 'Mobility', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
        if (i === 4) return { day, focus: 'Speed Endurance', type: 'Performance', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
        if (i === 5) return { day, focus: 'Block Starts', type: 'Power', color: 'text-[#FF4F21]', bg: 'bg-[#FF4F21]/10 border-[#FF4F21]/20' };
        return { day, focus: 'Light Jog', type: 'Rest', color: 'text-zinc-400', bg: 'bg-zinc-800/10 border-zinc-700/20' };
      } else if (variant === 'recovery') {
        if (i % 2 === 0) return { day, focus: 'Recovery & Mobility', type: 'Mobility', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
        return { day, focus: 'Light Technique', type: 'Technique', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
      } else {
        // Balanced
        if (i === 0) return { day, focus: 'Acceleration Mechanics', type: 'Power', color: 'text-[#FF4F21]', bg: 'bg-[#FF4F21]/10 border-[#FF4F21]/20' };
        if (i === 1) return { day, focus: 'Recovery & Mobility', type: 'Mobility', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
        if (i === 2) return { day, focus: 'Max Velocity (Wickets)', type: 'Technique', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' };
        if (i === 3) return { day, focus: 'Active Recovery', type: 'Rest', color: 'text-zinc-400', bg: 'bg-zinc-800/10 border-zinc-700/20' };
        if (i === 4) return { day, focus: 'Race Pace Simulation', type: 'Performance', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' };
        if (i === 5) return { day, focus: 'Strength & Conditioning', type: 'Power', color: 'text-[#FF4F21]', bg: 'bg-[#FF4F21]/10 border-[#FF4F21]/20' };
        return { day, focus: 'Long Easy Run', type: 'Mobility', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' };
      }
    });
  };

  const schedulePlan = generatePlan(targetDays, planVariant);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 py-8 space-y-10 animate-fadeIn pb-24 text-white">
      
      {/* Header - Aligned to exact dashboard parameters */}
      <header className="flex items-end justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 text-[#FF4F21] mb-1">
            <span className="inline-flex items-center gap-1.5 border border-[#FF4F21]/20 bg-[#FF4F21]/10 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider shadow-[0_0_8px_rgba(255,79,33,0.1)]">
              <Zap className="h-3.5 w-3.5" />
              AI Sports Coach
            </span>
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">Training Directives</h1>
          <p className="text-zinc-500 text-xs mt-0.5">Personalized biomechanics interventions for {dateRange}</p>
        </div>
      </header>

      {/* High Priority Alert - Re-designed as a premium glowing billboard */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        className="rounded-xl border border-[#FF4F21]/30 bg-gradient-to-br from-[#FF4F21]/10 to-[#08080C]/20 shadow-[0_4px_30px_rgba(0,0,0,0.5)] backdrop-blur-md p-6 relative overflow-hidden group hover:border-[#FF4F21]/50 transition-all duration-300"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4F21]/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#FF4F21]/10 transition duration-700" />
        <div className="absolute -right-8 -bottom-8 opacity-5 group-hover:opacity-10 transition duration-500 pointer-events-none">
          <Target className="h-48 w-48 text-[#FF4F21]" />
        </div>
        
        <div className="relative z-10 flex items-start gap-5">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF4F21]/20 to-black/40 border border-[#FF4F21]/45 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,79,33,0.25)]">
            <AlertTriangle className="h-5 w-5 text-[#FF4F21]" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 border border-red-500/20 bg-red-500/10 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest text-red-400 shadow-sm animate-pulse">
              CRITICAL OVERLOAD
            </span>
            <h2 className="text-lg font-black text-white uppercase tracking-tight">Fix Overstride Mechanics</h2>
            <p className="text-zinc-300 text-xs max-w-3xl leading-relaxed font-medium">
              Your recent analyses indicate persistent overstriding during the acceleration phase. This is increasing braking forces by 14% and elevating your ground contact time to 210ms. Immediate corrective action is required to prevent hamstring overload.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Grid of Directives */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Sprint Technique - Emerald Theme */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-emerald-500/10 transition duration-700" />
          <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition duration-500 pointer-events-none">
            <Activity className="h-32 w-32 text-white" />
          </div>

          <div className="relative z-10">
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Activity className="h-5 w-5 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">Sprint Technique</h3>
            <p className="text-[11px] text-zinc-400 mb-6 leading-relaxed font-medium">Targeted drills to improve turnover and mid-foot striking.</p>
            
            <ul className="space-y-4">
              <li className="flex gap-3 bg-black/20 p-3 rounded-lg border border-white/[0.02]">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-wide">A-Skips (Focus on stiffness)</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">3x 20m • Pre-workout</p>
                </div>
              </li>
              <li className="flex gap-3 bg-black/20 p-3 rounded-lg border border-white/[0.02]">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Wicket Runs</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">5x 30m • Max Velocity Day</p>
                </div>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Power Generation - Red Theme */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF4F21]/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-[#FF4F21]/10 transition duration-700" />
          <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition duration-500 pointer-events-none">
            <Zap className="h-32 w-32 text-white" />
          </div>

          <div className="relative z-10">
            <div className="h-10 w-10 rounded-lg bg-[#FF4F21]/10 flex items-center justify-center mb-6 border border-[#FF4F21]/20 group-hover:bg-[#FF4F21]/20 transition-colors shadow-[0_0_15px_rgba(255,79,33,0.15)]">
              <Zap className="h-5 w-5 text-[#FF4F21] animate-pulse" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">Power Generation</h3>
            <p className="text-[11px] text-zinc-400 mb-6 leading-relaxed font-medium">Increase force production during the critical acceleration phase.</p>
            
            <ul className="space-y-4">
              <li className="flex gap-3 bg-black/20 p-3 rounded-lg border border-white/[0.02]">
                <CheckCircle className="h-4 w-4 text-[#FF4F21] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Heavy Sled Pushes</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">4x 15m • 70% BW</p>
                </div>
              </li>
              <li className="flex gap-3 bg-black/20 p-3 rounded-lg border border-white/[0.02]">
                <CheckCircle className="h-4 w-4 text-[#FF4F21] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Drop Jumps</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">3x 5 • Focus on minimal GCT</p>
                </div>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Mobility - Blue Theme */}
        <motion.div 
          variants={itemVariants} 
          className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 relative overflow-hidden group hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 flex flex-col justify-between"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-[50px] pointer-events-none group-hover:bg-blue-500/10 transition duration-700" />
          <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition duration-500 pointer-events-none">
            <Shield className="h-32 w-32 text-white" />
          </div>

          <div className="relative z-10">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Shield className="h-5 w-5 text-blue-400 animate-pulse" />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-tight mb-2">Mobility & Recovery</h3>
            <p className="text-[11px] text-zinc-400 mb-6 leading-relaxed font-medium">Corrective work to improve left-leg stability and reduce injury risk.</p>
            
            <ul className="space-y-4">
              <li className="flex gap-3 bg-black/20 p-3 rounded-lg border border-white/[0.02]">
                <CheckCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Hip Flexor Isometrics</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">3x 30s holds (Left side)</p>
                </div>
              </li>
              <li className="flex gap-3 bg-black/20 p-3 rounded-lg border border-white/[0.02]">
                <CheckCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-200 uppercase tracking-wide">Ankle Dorsiflexion</p>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5 tracking-wider">2x Daily • 2 mins per side</p>
                </div>
              </li>
            </ul>
          </div>
        </motion.div>
      </motion.div>

      {/* Weekly AI Plan - Re-designed to matches evolution history lists */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="show"
        className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md overflow-hidden hover:border-white/[0.08] transition duration-300"
      >
        <div className="p-5 border-b border-white/[0.05] bg-black/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xs font-black text-white uppercase tracking-widest">Weekly Prescribed Plan</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Plan Focus:</span>
              <select 
                value={planVariant} 
                onChange={(e) => setPlanVariant(e.target.value)}
                className="bg-black/50 border border-white/[0.1] rounded px-2 py-1 text-[10px] text-white focus:outline-none"
              >
                <option value="balanced">Balanced</option>
                <option value="speed">Speed & Power</option>
                <option value="recovery">Recovery & Mobility</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Training Days:</span>
              {isEditingDays ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    min="1" max="7" 
                    value={targetDays} 
                    onChange={e => setTargetDays(Number(e.target.value))} 
                    className="w-16 bg-black/50 border border-white/[0.1] rounded px-2 py-1 text-[10px] text-white focus:outline-none" 
                  />
                  <button onClick={handleSaveTargetDays} disabled={isSavingDays} className="bg-[#FF4F21] text-white rounded px-2 py-1 text-[10px] font-bold">Save</button>
                  <button onClick={() => { setIsEditingDays(false); setTargetDays(preferredDays); }} className="bg-zinc-800 text-white rounded px-2 py-1 text-[10px] font-bold">Cancel</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-white font-bold">{targetDays} days / week</span>
                  <button onClick={() => setIsEditingDays(true)} className="text-[10px] text-[#FF4F21] font-bold uppercase tracking-widest hover:underline">Edit</button>
                </div>
              )}
            </div>
          </div>
          <button className="flex items-center gap-1.5 text-[#FF4F21] text-[10px] font-black uppercase tracking-widest hover:text-white transition duration-200 cursor-pointer border border-[#FF4F21]/20 bg-[#FF4F21]/10 px-3 py-1.5 rounded-lg shadow-[0_0_8px_rgba(255,79,33,0.1)]">
            Sync to Calendar <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {schedulePlan.map((schedule, idx) => (
            <div key={idx} className="flex items-center justify-between p-5 hover:bg-white/[0.02] transition duration-200 group cursor-pointer">
              <div className="flex items-center gap-6">
                <div className="w-20 text-[10px] font-black text-zinc-500 uppercase tracking-widest">{schedule.day}</div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center gap-1.5 border px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${schedule.bg}`}>
                    {getWeeklyIcon(schedule.type)}
                    <span className={schedule.color}>{schedule.type}</span>
                  </span>
                  <div className="h-1 w-1 rounded-full bg-zinc-700"></div>
                  <span className="text-xs font-bold text-zinc-300 group-hover:text-white transition duration-200 uppercase tracking-wider">{schedule.focus}</span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-lg bg-[#08080C] border border-white/[0.05] flex items-center justify-center group-hover:border-[#FF4F21]/30 transition">
                <ChevronRight className="h-4 w-4 text-zinc-500 group-hover:text-[#FF4F21] group-hover:translate-x-0.5 transition duration-300" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}
