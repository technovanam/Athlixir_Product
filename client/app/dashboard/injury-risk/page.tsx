'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, AlertTriangle, Shield, TrendingUp, ShieldAlert, Navigation, ArrowRight
} from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';

export default function InjuryRiskPage() {
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
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <ShieldAlert className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Injury Intelligence</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">Risk Assessment</h1>
          <p className="text-zinc-400 text-sm">Biomechanical overload and fatigue detection for {dateRange}</p>
        </div>
      </motion.div>

      {/* Global Risk Overview */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12"
      >
        <motion.div variants={itemVariants} className="col-span-1 md:col-span-2 bg-gradient-to-br from-amber-500/20 to-transparent border border-amber-500/30 rounded-2xl p-8 relative overflow-hidden flex items-center justify-between">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert className="h-48 w-48 text-amber-500" /></div>
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Overall Risk Level</p>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black text-amber-500">MODERATE</span>
            </div>
            <p className="text-sm font-bold text-amber-500/80 mt-2">Elevated hamstring load detected.</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Asymmetry Risk</p>
            <span className="text-3xl font-black text-[#FF4F21]">11.4%</span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-[#FF4F21] w-[75%]" />
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Fatigue Index</p>
            <span className="text-3xl font-black text-emerald-500">Low</span>
          </div>
          <div className="h-2 w-full bg-zinc-800 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-emerald-500 w-[20%]" />
          </div>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Body Risk Map (Telemetry Style) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden"
        >
          {/* F1 Telemetry Scanlines */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FF4F21]/50 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
          
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8 relative z-10 self-start">Biomechanical Load Map</h3>
          
          <div className="relative w-48 h-96 border border-zinc-800/50 rounded-full p-4 flex items-center justify-center relative z-10">
            {/* Abstract Body Representation */}
            <div className="w-12 h-12 rounded-full border-2 border-zinc-700 absolute top-8" />
            <div className="w-16 h-32 border-2 border-zinc-700 rounded-2xl absolute top-24" />
            <div className="w-4 h-32 border-2 border-zinc-700 rounded-full absolute top-56 left-12" />
            
            {/* Heatmap Overlays */}
            {/* Right Leg - Safe */}
            <div className="w-4 h-32 border-2 border-emerald-500/50 rounded-full absolute top-56 right-12 bg-emerald-500/10" />
            
            {/* Left Hamstring - Danger */}
            <div className="w-8 h-8 rounded-full bg-amber-500/30 absolute top-[260px] left-10 flex items-center justify-center animate-pulse">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
            </div>
            
            {/* Right Ankle - Warning */}
            <div className="w-6 h-6 rounded-full bg-[#FF4F21]/30 absolute bottom-[40px] right-[44px] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#FF4F21]" />
            </div>
          </div>
        </motion.div>

        {/* Right: Warnings & History */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-1 lg:col-span-2 space-y-6"
        >
          {/* Active Warnings */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" /> Movement Warnings
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-start gap-4">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-500 mb-1">Left Hamstring Overload</h4>
                  <p className="text-xs text-zinc-300">Excessive forward lean combined with high ground contact time is increasing deceleration stress on the left hamstring.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-[#FF4F21]/20 bg-[#FF4F21]/5 flex items-start gap-4">
                <Activity className="h-5 w-5 text-[#FF4F21] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-[#FF4F21] mb-1">Right Ankle Stiffness Deficiency</h4>
                  <p className="text-xs text-zinc-300">Energy leak detected during toe-off phase. Poor ankle stiffness is causing force dissipation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Prevention Plan */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
              <h2 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Shield className="h-4 w-4 text-emerald-500" /> Prevention Directives
              </h2>
              <button className="text-[10px] font-bold text-[#FF4F21] uppercase tracking-widest flex items-center gap-1 hover:text-white transition">
                View All <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <div className="divide-y divide-zinc-800/50">
              <div className="p-5 flex justify-between items-center hover:bg-zinc-900/50 transition cursor-pointer group">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Hamstring Mobility Protocol</h4>
                  <p className="text-xs text-zinc-500">Targeted isometric holds and active stretching.</p>
                </div>
                <Navigation className="h-4 w-4 text-zinc-600 group-hover:text-emerald-500 transition" />
              </div>
              <div className="p-5 flex justify-between items-center hover:bg-zinc-900/50 transition cursor-pointer group">
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Ankle Pogo Jumps</h4>
                  <p className="text-xs text-zinc-500">3 sets of 20 to increase tendon stiffness.</p>
                </div>
                <Navigation className="h-4 w-4 text-zinc-600 group-hover:text-emerald-500 transition" />
              </div>
            </div>
          </div>
          
        </motion.div>
      </div>
    </div>
  );
}
