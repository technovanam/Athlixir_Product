'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, Activity, Zap, ShieldAlert, Target, CheckCircle, Clock
} from 'lucide-react';
import { useDateFilter } from '../../context/DateFilterContext';

export default function NotificationsPage() {
  const { dateRange } = useDateFilter();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-8 pb-24 max-w-4xl mx-auto w-full text-white">
      
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between mb-8"
      >
        <div>
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Bell className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-widest">System Activity</span>
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-white mb-2">Notifications</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Realtime telemetry and analysis alerts for {dateRange}</p>
        </div>
      </motion.div>

      {/* Activity Timeline */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="relative border-l border-white/[0.05] ml-6 pl-8 space-y-12"
      >
        {/* Event 1 */}
        <motion.div variants={itemVariants} className="relative group">
          <div className="absolute -left-[45px] top-1 h-6 w-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center ring-4 ring-[#08080C]">
            <CheckCircle className="h-3 w-3 text-emerald-500" />
          </div>
          <div className="bg-[#08080C]/40 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md rounded-xl p-6 hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Clock className="h-3 w-3" /> Just now
              </span>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Analysis Ready</span>
            </div>
            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Sprint Analysis Completed</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Your recent 100m sprint analysis has finished processing. The full biomechanics report is now available.</p>
          </div>
        </motion.div>

        {/* Event 2 */}
        <motion.div variants={itemVariants} className="relative group">
          <div className="absolute -left-[45px] top-1 h-6 w-6 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center ring-4 ring-[#08080C]">
            <ShieldAlert className="h-3 w-3 text-amber-500" />
          </div>
          <div className="bg-amber-500/5 border border-amber-500/20 backdrop-blur-md rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Clock className="h-3 w-3" /> 2 hours ago
              </span>
              <span className="text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Warning</span>
            </div>
            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Moderate Asymmetry Detected</h3>
            <p className="text-xs text-amber-500/80 leading-relaxed">AI engine detected an 11.4% asymmetry in ground contact time between left and right foot strikes.</p>
          </div>
        </motion.div>

        {/* Event 3 */}
        <motion.div variants={itemVariants} className="relative group">
          <div className="absolute -left-[45px] top-1 h-6 w-6 rounded-full bg-[#FF4F21]/20 border border-[#FF4F21] flex items-center justify-center ring-4 ring-[#08080C]">
            <Target className="h-3 w-3 text-[#FF4F21]" />
          </div>
          <div className="bg-[#08080C]/40 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md rounded-xl p-6 hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Clock className="h-3 w-3" /> Yesterday
              </span>
              <span className="text-[10px] font-black text-[#FF4F21] bg-[#FF4F21]/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Goal Reached</span>
            </div>
            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Target GCT Reached</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Congratulations! You successfully lowered your ground contact time below 220ms (210ms recorded).</p>
          </div>
        </motion.div>

        {/* Event 4 */}
        <motion.div variants={itemVariants} className="relative group">
          <div className="absolute -left-[45px] top-1 h-6 w-6 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center ring-4 ring-[#08080C]">
            <Zap className="h-3 w-3 text-blue-500" />
          </div>
          <div className="bg-[#08080C]/40 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md rounded-xl p-6 hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                <Clock className="h-3 w-3" /> 2 days ago
              </span>
              <span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest">AI Insight</span>
            </div>
            <h3 className="text-lg font-black text-white mb-2 uppercase tracking-tight">Cadence Improved by 5%</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">Your average cadence increased from 164 SPM to 172 SPM. Keep pushing towards the 185 SPM state benchmark.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
