'use client';

import React from 'react';
import { History, Target, Zap, Activity, Trophy } from 'lucide-react';

export default function EvolutionTimeline({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px] hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
        <History className="h-8 w-8 text-zinc-700 mb-3" />
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">No Timeline Data</p>
      </div>
    );
  }

  // Generate timeline events from real history for visual F1 effect
  const timelineEvents = history.slice(0, 4).map((h, i) => {
    const isFirst = i === history.length - 1;
    const isRecent = i === 0;
    
    let icon = <Activity className="h-3.5 w-3.5" />;
    let color = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    let title = 'Routine Analysis';

    if (isFirst) {
      icon = <Target className="h-3.5 w-3.5" />;
      color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      title = 'Baseline Established';
    } else if (isRecent && h.scores?.performanceScore > 80) {
      icon = <Trophy className="h-3.5 w-3.5" />;
      color = 'text-[#FF4F21] bg-[#FF4F21]/10 border-[#FF4F21]/20 shadow-[0_0_8px_rgba(255,79,33,0.3)]';
      title = 'Performance Peak';
    } else if (h.scores?.efficiencyScore > 85) {
      icon = <Zap className="h-3.5 w-3.5" />;
      color = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      title = 'Efficiency Breakthrough';
    }

    return {
      id: h.id || h.analysisId,
      date: new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      title,
      color,
      icon,
      score: h.scores?.performanceScore || 'N/A'
    };
  });

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col h-full overflow-hidden hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
      <div className="flex items-center gap-2.5 mb-6">
        <History className="h-4 w-4 text-zinc-400" />
        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Athlete Evolution</h3>
      </div>

      <div className="relative flex-1 pl-4 border-l border-white/[0.05] space-y-6 mt-2 ml-1.5">
        {timelineEvents.map((event, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-[27px] top-0.5 h-5 w-5 rounded-full border flex items-center justify-center ${event.color}`}>
              {event.icon}
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{event.date}</span>
              <h4 className="text-xs font-bold text-white mt-0.5">{event.title}</h4>
              <p className="text-[10px] text-zinc-400 mt-1">Score logged: <span className="text-white font-bold">{event.score}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
