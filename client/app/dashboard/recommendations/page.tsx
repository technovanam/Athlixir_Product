'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Target, Shield, Activity, ArrowRight, CheckCircle, ChevronRight, PlayCircle
} from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';

export default function RecommendationsPage() {
  const { dateRange } = useDateFilter();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-8 pb-24 max-w-6xl mx-auto w-full">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <div className="flex items-center gap-2 text-[#FF4F21] mb-2">
            <Zap className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">AI Sports Coach</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">Training Directives</h1>
          <p className="text-zinc-400 text-sm">Personalized biomechanics interventions for {dateRange}</p>
        </div>
      </motion.div>

      {/* High Priority Alert */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-[#FF4F21]/20 to-transparent border border-[#FF4F21]/30 rounded-2xl p-6 mb-12 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
          <Target className="h-32 w-32 text-[#FF4F21]" />
        </div>
        <div className="relative z-10 flex items-start gap-4">
          <div className="h-12 w-12 rounded-full bg-[#FF4F21] flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(255,79,33,0.4)]">
            <AlertTriangleIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="inline-block px-2 py-1 rounded bg-[#FF4F21] text-white text-[10px] font-black uppercase tracking-widest mb-2">High Priority</span>
            <h2 className="text-2xl font-black text-white mb-2">Fix Overstride Mechanics</h2>
            <p className="text-zinc-300 text-sm max-w-2xl leading-relaxed">
              Your recent analyses indicate persistent overstriding during the acceleration phase. This is increasing braking forces by 14% and elevating your ground contact time to 210ms. Immediate corrective action is required to prevent hamstring overload.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
      >
        {/* Sprint Technique */}
        <motion.div variants={itemVariants} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 transition group cursor-pointer">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition">
            <Activity className="h-5 w-5 text-emerald-500" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Sprint Technique</h3>
          <p className="text-xs text-zinc-400 mb-6 line-clamp-2">Targeted drills to improve turnover and mid-foot striking.</p>
          
          <ul className="space-y-4">
            <li className="flex gap-3">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-200">A-Skips (Focus on stiffness)</p>
                <p className="text-[10px] text-zinc-500">3x 20m • Pre-workout</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-200">Wicket Runs</p>
                <p className="text-[10px] text-zinc-500">5x 30m • Max Velocity Day</p>
              </div>
            </li>
          </ul>
        </motion.div>

        {/* Power */}
        <motion.div variants={itemVariants} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 transition group cursor-pointer">
          <div className="h-10 w-10 rounded-lg bg-[#FF4F21]/10 flex items-center justify-center mb-6 border border-[#FF4F21]/20 group-hover:bg-[#FF4F21]/20 transition">
            <Zap className="h-5 w-5 text-[#FF4F21]" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Power Generation</h3>
          <p className="text-xs text-zinc-400 mb-6 line-clamp-2">Increase force production during the critical acceleration phase.</p>
          
          <ul className="space-y-4">
            <li className="flex gap-3">
              <CheckCircle className="h-4 w-4 text-[#FF4F21] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-200">Heavy Sled Pushes</p>
                <p className="text-[10px] text-zinc-500">4x 15m • 70% BW</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-4 w-4 text-[#FF4F21] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-200">Drop Jumps</p>
                <p className="text-[10px] text-zinc-500">3x 5 • Focus on minimal GCT</p>
              </div>
            </li>
          </ul>
        </motion.div>

        {/* Mobility */}
        <motion.div variants={itemVariants} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 hover:bg-zinc-900 transition group cursor-pointer">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20 group-hover:bg-blue-500/20 transition">
            <Shield className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">Mobility & Recovery</h3>
          <p className="text-xs text-zinc-400 mb-6 line-clamp-2">Corrective work to improve left-leg stability and reduce injury risk.</p>
          
          <ul className="space-y-4">
            <li className="flex gap-3">
              <CheckCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-200">Hip Flexor Isometrics</p>
                <p className="text-[10px] text-zinc-500">3x 30s holds (Left side)</p>
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-zinc-200">Ankle Dorsiflexion</p>
                <p className="text-[10px] text-zinc-500">2x Daily • 2 mins per side</p>
              </div>
            </li>
          </ul>
        </motion.div>
      </motion.div>

      {/* Weekly AI Plan */}
      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="show"
        className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Weekly Prescribed Plan</h2>
          <button className="flex items-center gap-1 text-[#FF4F21] text-xs font-bold hover:text-white transition">
            Sync to Calendar <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        <div className="divide-y divide-zinc-800/50">
          {[
            { day: 'Monday', focus: 'Acceleration Mechanics', type: 'Power', color: 'text-[#FF4F21]' },
            { day: 'Tuesday', focus: 'Recovery & Mobility', type: 'Mobility', color: 'text-blue-500' },
            { day: 'Wednesday', focus: 'Max Velocity (Wickets)', type: 'Technique', color: 'text-emerald-500' },
            { day: 'Thursday', focus: 'Active Recovery', type: 'Rest', color: 'text-zinc-500' },
            { day: 'Friday', focus: 'Race Pace Simulation', type: 'Performance', color: 'text-purple-500' },
          ].map((schedule, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 hover:bg-zinc-900 transition group cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-24 text-xs font-bold text-zinc-500 uppercase tracking-widest">{schedule.day}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${schedule.color}`}>{schedule.type}</span>
                  <div className="h-1 w-1 rounded-full bg-zinc-700"></div>
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition">{schedule.focus}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white transition transform group-hover:translate-x-1" />
            </div>
          ))}
        </div>
      </motion.div>

    </div>
  );
}

// Inline Icon to fix missing import easily
function AlertTriangleIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  )
}
