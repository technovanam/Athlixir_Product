'use client';

import React from 'react';
import { History, Target, Zap, Activity, Trophy } from 'lucide-react';

export default function EvolutionTimeline({ history }: { history: any[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col items-center justify-center text-center h-full min-h-[160px] shadow-sm">
        <History className="h-6 w-6 text-slate-400 mb-2" />
        <p className="text-xs font-semibold text-slate-500">Timeline events will appear as sprint sessions are completed</p>
      </div>
    );
  }

  const timelineEvents = history.slice(0, 4).map((h, i) => {
    const isFirst = i === history.length - 1;
    const isRecent = i === 0;
    
    let icon = <Activity size={14} />;
    let color = 'text-blue-600 bg-blue-50 border-blue-200';
    let title = 'Standard Telemetry Scan';

    if (isFirst) {
      icon = <Target size={14} />;
      color = 'text-amber-600 bg-amber-50 border-amber-200';
      title = 'Baseline Established';
    } else if (isRecent && (h.scores?.performanceScore || 0) > 85) {
      icon = <Trophy size={14} />;
      color = 'text-[#FF4F21] bg-[#FFF2EE] border-[#FFE0D6]';
      title = 'Personal Performance Peak';
    } else if ((h.scores?.efficiencyScore || 0) > 85) {
      icon = <Zap size={14} />;
      color = 'text-emerald-600 bg-emerald-50 border-emerald-200';
      title = 'Kinetic Efficiency Breakthrough';
    }

    return {
      id: h.id || h.analysisId,
      date: new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      title,
      color,
      icon,
      // Previously fell back to a hardcoded 88 when performanceScore was
      // missing, presenting a fabricated score as real.
      score: typeof h.scores?.performanceScore === 'number' ? h.scores.performanceScore : null,
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3">
        <History size={18} className="text-[#FF4F21]" />
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Session Progression</h3>
      </div>

      <div className="relative flex-1 pl-4 border-l border-slate-200 space-y-5 ml-2">
        {timelineEvents.map((event, i) => (
          <div key={i} className="relative">
            <div className={`absolute -left-[25px] top-0 h-6 w-6 rounded-full border flex items-center justify-center ${event.color}`}>
              {event.icon}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{event.date}</span>
              <h4 className="text-xs font-bold text-slate-900 mt-0.5">{event.title}</h4>
              <p className="text-xs text-slate-500 mt-0.5">Performance Score: <span className="text-slate-900 font-bold">{event.score ?? 'Not available'}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
