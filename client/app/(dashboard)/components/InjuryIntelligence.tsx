'use client';

import React from 'react';
import { ShieldAlert, Activity } from 'lucide-react';

export default function InjuryIntelligence({ analysis }: { analysis: any }) {
  if (!analysis || !analysis.injuryRisks) {
    return (
      <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px] hover:border-white/[0.1] hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
        <ShieldAlert className="h-8 w-8 text-zinc-700 mb-3" />
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Awaiting Injury Scan</p>
      </div>
    );
  }

  const { injuryRisk, injuryRisks } = analysis;

  const getLevelColor = (level: string) => {
    if (level === 'HIGH') return 'text-red-500';
    if (level === 'MEDIUM') return 'text-amber-500';
    return 'text-emerald-500';
  };

  const getBorderColor = (level: string) => {
    if (level === 'HIGH') return 'border-red-500/30 bg-red-500/5';
    if (level === 'MEDIUM') return 'border-amber-500/30 bg-amber-500/5';
    return 'border-emerald-500/30 bg-emerald-500/5';
  };

  return (
    <div className={`rounded-xl border bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 flex flex-col h-full hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300 ${injuryRisk?.level === 'HIGH' ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : 'border-white/[0.05]'}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className={`h-4 w-4 ${getLevelColor(injuryRisk?.level)}`} />
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em]">Injury Intelligence</h3>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-lg border ${getBorderColor(injuryRisk?.level)} ${getLevelColor(injuryRisk?.level)}`}>
          {injuryRisk?.level || 'LOW'} RISK
        </span>
      </div>

      {injuryRisks.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Activity className="h-6 w-6 text-emerald-500/50 mb-2" />
          <p className="text-xs font-bold text-emerald-400">Biomechanics Stable</p>
          <p className="text-[10px] text-zinc-500 text-center mt-1">No significant overuse or asymmetry risks detected in the current loading pattern.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-3">
          {injuryRisks.map((risk: any, i: number) => (
            <div key={i} className={`p-3 rounded-xl border ${risk.detected ? getBorderColor(risk.severity) : 'border-white/[0.02] bg-white/[0.01]'} flex gap-3`}>
              <div className="mt-0.5">
                {risk.detected ? (
                  <ShieldAlert className={`h-4 w-4 ${getLevelColor(risk.severity)}`} />
                ) : (
                  <Activity className="h-4 w-4 text-zinc-600" />
                )}
              </div>
              <div>
                <h4 className={`text-xs font-bold ${risk.detected ? 'text-white' : 'text-zinc-500'}`}>{risk.category}</h4>
                {risk.detected && risk.detail && (
                  <p className="text-[10px] font-medium text-zinc-400 mt-1 leading-relaxed">{risk.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
