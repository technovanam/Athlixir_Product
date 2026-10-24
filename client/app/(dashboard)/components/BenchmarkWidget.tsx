'use client';

import React from 'react';
import { Target, Trophy } from 'lucide-react';

export default function BenchmarkWidget({ analysis }: { analysis: any }) {
  if (!analysis || !analysis.benchmarks) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col items-center justify-center text-center h-full min-h-[180px] shadow-sm">
        <Target className="h-7 w-7 text-slate-400 mb-2" />
        <p className="text-xs font-semibold text-slate-500">Benchmark comparison available after sprint analysis</p>
      </div>
    );
  }

  const b = analysis.benchmarks;
  const metrics = analysis.metrics || {};

  const renderComparison = (label: string, value: string | null, level: string | null) => {
    let pct = '0%';
    let color = 'bg-slate-300';
    if (level === 'Elite') { pct = '95%'; color = 'bg-[#FF4F21]'; }
    else if (level === 'National') { pct = '80%'; color = 'bg-emerald-500'; }
    else if (level === 'State') { pct = '65%'; color = 'bg-blue-500'; }
    else if (level === 'District') { pct = '40%'; color = 'bg-amber-500'; }
    else if (level === 'Beginner') { pct = '25%'; color = 'bg-slate-400'; }

    return (
      <div className="mb-4">
        <div className="flex justify-between text-xs font-semibold mb-1.5">
          <span className="text-slate-600 uppercase tracking-wider">{label}</span>
          <span className="text-slate-900 font-bold">
            {value ?? '—'}
            {level && <span className="text-[#FF4F21] font-semibold ml-1">({level})</span>}
          </span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
          <div className={`h-full ${color} transition-all duration-700`} style={{ width: pct }} />
        </div>
        <div className="flex justify-between text-[9px] font-semibold text-slate-400 uppercase mt-1">
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Competitive Benchmark Calibration</h3>
        </div>
        <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold">
          {b.profileLabel || 'Sprinter Benchmark'}
        </span>
      </div>

      <div className="flex-1">
        {renderComparison('Cadence (Turnover)', metrics.cadence ? `${metrics.cadence} SPM` : null, b.cadenceLevel || null)}
        {renderComparison('Ground Contact Time', metrics.gct ? `${metrics.gct} ms` : null, b.gctLevel || null)}
        {renderComparison('Stride Length', metrics.strideLength ? `${metrics.strideLength} m` : null, b.strideLevel || null)}
      </div>
    </div>
  );
}
