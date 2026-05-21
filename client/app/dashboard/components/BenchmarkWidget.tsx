'use client';

import React from 'react';
import { Target, Trophy } from 'lucide-react';

export default function BenchmarkWidget({ analysis }: { analysis: any }) {
  if (!analysis || !analysis.benchmarks) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <Target className="h-8 w-8 text-zinc-700 mb-3" />
        <p className="text-sm font-bold text-zinc-500">Awaiting Benchmark Data</p>
      </div>
    );
  }

  const b = analysis.benchmarks;
  const metrics = analysis.metrics || {};

  const renderComparison = (label: string, value: number | string, level: string) => {
    // Determine bar fill based on level
    let pct = '50%';
    let color = 'bg-zinc-500';
    if (level === 'Elite') { pct = '95%'; color = 'bg-[#FF4F21]'; }
    else if (level === 'National') { pct = '80%'; color = 'bg-emerald-500'; }
    else if (level === 'State') { pct = '65%'; color = 'bg-blue-500'; }
    else if (level === 'District') { pct = '40%'; color = 'bg-amber-500'; }
    else { pct = '20%'; color = 'bg-red-500'; }

    return (
      <div className="mb-5">
        <div className="flex justify-between text-xs font-bold mb-1.5">
          <span className="text-zinc-400 uppercase tracking-widest">{label}</span>
          <span className="text-white">{value} <span className="text-zinc-600 font-medium ml-1">({level})</span></span>
        </div>
        <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden flex">
          <div className={`h-full ${color} transition-all duration-1000`} style={{ width: pct }} />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-zinc-600 uppercase mt-1">
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
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Norm Comparison</h3>
        </div>
        <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-bold uppercase">
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
