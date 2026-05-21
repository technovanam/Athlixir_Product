'use client';

import React from 'react';
import { Lightbulb, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function InsightsWidget({ analysis }: { analysis: any }) {
  if (!analysis || !analysis.insights) {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
        <Lightbulb className="h-8 w-8 text-zinc-700 mb-3" />
        <p className="text-sm font-bold text-zinc-500">Awaiting AI Insights</p>
      </div>
    );
  }

  const { strengths = [], weaknesses = [], observations = [] } = analysis.insights;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Lightbulb className="h-5 w-5 text-amber-400" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Performance Insights</h3>
      </div>

      <div className="flex-1 space-y-4">
        {weaknesses.map((w: string, i: number) => (
          <div key={`w-${i}`} className="flex items-start gap-3 p-3 rounded-xl border border-amber-500/20 bg-amber-500/5">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-200/90 font-medium leading-relaxed">{w}</p>
          </div>
        ))}
        {strengths.map((s: string, i: number) => (
          <div key={`s-${i}`} className="flex items-start gap-3 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs text-emerald-200/90 font-medium leading-relaxed">{s}</p>
          </div>
        ))}
        {observations.map((o: string, i: number) => (
          <div key={`o-${i}`} className="flex items-start gap-3 p-3 rounded-xl border border-zinc-700 bg-zinc-800/40">
            <TrendingUp className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-300 font-medium leading-relaxed">{o}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
