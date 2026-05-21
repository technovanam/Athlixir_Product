'use client';

import React from 'react';
import { History, Target, Zap, Activity, Trophy } from 'lucide-react';

export default function EvolutionTimeline({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <History className="h-8 w-8 text-zinc-700 mb-3" />
        <p className="text-sm font-bold text-zinc-500">No Timeline Data</p>
      </div>
    );
  }

  // Generate fake timeline events from real history for visual F1 effect
  const timelineEvents = history.slice(0, 4).map((h, i) => {
    const isFirst = i === history.length - 1;
    const isRecent = i === 0;
    
    let icon = <Activity className="h-4 w-4" />;
    let color = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    let title = 'Routine Analysis';

    if (isFirst) {
      icon = <Target className="h-4 w-4" />;
      color = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      title = 'Baseline Established';
    } else if (isRecent && h.scores?.performanceScore > 80) {
      icon = <Trophy className="h-4 w-4" />;
      color = 'text-[#FF4F21] bg-[#FF4F21]/10 border-[#FF4F21]/20';
      title = 'Performance Peak';
    } else if (h.scores?.efficiencyScore > 85) {
      icon = <Zap className="h-4 w-4" />;
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-zinc-400" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Athlete Evolution</h3>
      </div>

      <div className="relative flex-1 pl-4 border-l border-zinc-800 space-y-6 mt-2">
        {timelineEvents.map((event, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-[25px] top-0.5 h-6 w-6 rounded-full border flex items-center justify-center ${event.color}`}>
              {event.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{event.date}</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{event.title}</h4>
              <p className="text-xs text-zinc-400 mt-1">Score logged: <span className="text-white font-bold">{event.score}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
