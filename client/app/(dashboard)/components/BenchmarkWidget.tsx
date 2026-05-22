'use client';

import React from 'react';
import { Target, Trophy } from 'lucide-react';

export default function BenchmarkWidget({ analysis }: { analysis: any }) {
  if (!analysis || !analysis.benchmarks) {
    return (
      <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px] hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
        <Target className="h-8 w-8 text-zinc-700 mb-3" />
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Awaiting Benchmark Data</p>
      </div>
    );
  }

  const b = analysis.benchmarks;
  const metrics = analysis.metrics || {};

  const renderComparison = (label: string, value: number | string, level: string) => {
    // Determine bar fill based on level
    let pct = '50%';
    let color = 'bg-zinc-500';
    if (level === 'Elite') { pct = '95%'; color = 'bg-[#FF4F21] shadow-[0_0_8px_rgba(255,79,33,0.5)]'; }
    else if (level === 'National') { pct = '80%'; color = 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'; }
    else if (level === 'State') { pct = '65%'; color = 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'; }
    else if (level === 'District') { pct = '40%'; color = 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'; }
    else { pct = '20%'; color = 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'; }

    return (
      <div className="mb-5">
        <div className="flex justify-between text-[11px] font-bold mb-1.5">
          <span className="text-zinc-400 uppercase tracking-[0.1em]">{label}</span>
          <span className="text-white font-semibold">
            {value} <span className="text-zinc-500 font-medium ml-1">({level})</span>
          </span>
        </div>
        <div className="h-1.5 w-full bg-zinc-950/80 rounded-full overflow-hidden border border-white/[0.02]">
          <div className={`h-full ${color} transition-all duration-1000`} style={{ width: pct }} />
        </div>
        <div className="flex justify-between text-[8px] font-bold text-zinc-600 uppercase mt-1 tracking-wider">
          <span>Beginner</span>
          <span>District</span>
          <span>State</span>
          <span>National</span>
          <span>Elite</span>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col h-full hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <Trophy className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Norm Comparison</h3>
        </div>
        <span className="text-[9px] bg-white/[0.04] border border-white/[0.06] text-zinc-300 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
          {b.profileLabel || 'U18 Sprinter'}
        </span>
      </div>

      <div className="flex-1 mt-2">
        {renderComparison('Cadence', metrics.cadence || '—', b.cadenceLevel || '—')}
        {renderComparison('Ground Contact', metrics.gct ? `${metrics.gct}ms` : '—', b.gctLevel || '—')}
        {renderComparison('Stride Length', metrics.strideLength ? `${metrics.strideLength}m` : '—', b.strideLevel || '—')}
      </div>
    </div>
  );
}
