'use client';

import React from 'react';
import { ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

export default function InjuryIntelligence({ analysis, userProfile }: { analysis: any; userProfile?: any }) {
  const hasHistory = userProfile?.injury_history?.injuries?.length > 0;
  
  const injuryRisk = analysis?.injuryRisk;
  const injuryRisks = analysis?.injuryRisks || [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 tracking-tight">Kinetic Joint Protection</h3>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60">
          {injuryRisk?.level || (hasHistory ? 'WATCH' : 'LOW RISK')}
        </span>
      </div>

      <div className="space-y-3">
        {hasHistory && userProfile.injury_history.injuries.map((inj: string, i: number) => (
          <div key={`hist-${i}`} className="p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/70 flex gap-3">
            <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">Recorded Injury Profile: {inj}</h4>
              <p className="text-xs text-amber-800/90 mt-0.5 leading-relaxed">
                Telemetry actively monitors foot braking force and knee flexion angles to prevent compensatory strain.
              </p>
            </div>
          </div>
        ))}

        {injuryRisks.length === 0 && !hasHistory && (
          analysis ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Joint Forces Symmetrical</h4>
                <p className="text-xs text-slate-500 mt-0.5">No abnormal joint deceleration or overstride loading detected.</p>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
              <Activity size={18} className="text-slate-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900">Not assessed yet</h4>
                <p className="text-xs text-slate-500 mt-0.5">Complete a sprint analysis to generate joint protection insights.</p>
              </div>
            </div>
          )
        )}

        {injuryRisks.map((risk: any, i: number) => (
          <div key={`ai-${i}`} className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 flex gap-3">
            <Activity size={16} className="text-slate-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800">{risk.category}</h4>
              {risk.detail && <p className="text-xs text-slate-500 mt-0.5">{risk.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
