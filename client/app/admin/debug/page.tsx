'use client';

import React from 'react';
import { 
  Activity, Server, ChevronRight, CheckCircle, Database
} from 'lucide-react';

export default function PipelineDebugPage() {
  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] p-8 font-poppins">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-6">
          <div>
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Server className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Internal Engineering</span>
            </div>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-[#1C1C1E]">AI Pipeline Debugger</h1>
          </div>
          <div className="flex gap-4 text-sm font-mono text-[#8E8E93]">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-black/[0.06] shadow-2xs">
              <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse"></span>
              API Status: LIVE
            </div>
          </div>
        </div>

        {/* Determinism Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-white border border-black/[0.06] rounded-[28px] p-6 shadow-2xs">
            <h2 className="text-base font-extrabold uppercase tracking-widest text-[#1C1C1E] mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#FF4F21]" /> Validation Metrics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#F2F2F7] border border-black/[0.04] rounded-2xl p-4">
                <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest mb-1">Savitzky-Golay Filter</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#34C759]">Active</span>
                  <CheckCircle className="h-5 w-5 text-[#34C759]" />
                </div>
              </div>
              <div className="bg-[#F2F2F7] border border-black/[0.04] rounded-2xl p-4">
                <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest mb-1">Strict FPS Gate</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-extrabold text-[#34C759]">&gt; 60 FPS</span>
                  <CheckCircle className="h-5 w-5 text-[#34C759]" />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest mb-4">Determinism Variance Tracker</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono min-w-[500px] md:min-w-0">
                  <thead>
                    <tr className="border-b border-slate-100 text-[#8E8E93]">
                      <th className="pb-3 font-semibold">Metric</th>
                      <th className="pb-3 font-semibold">Allowed Var.</th>
                      <th className="pb-3 font-semibold">Last Run Var.</th>
                      <th className="pb-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-4 text-[#1C1C1E] font-bold">Cadence</td>
                      <td className="py-4">±1 spm</td>
                      <td className="py-4 text-[#34C759] font-bold">0.0 spm</td>
                      <td className="py-4 text-right text-[#34C759] font-bold">STABLE</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-[#1C1C1E] font-bold">GCT</td>
                      <td className="py-4">±5 ms</td>
                      <td className="py-4 text-amber-600 font-bold">8 ms</td>
                      <td className="py-4 text-right text-amber-600 font-bold">WARNING</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-[#1C1C1E] font-bold">Symmetry</td>
                      <td className="py-4">±2 %</td>
                      <td className="py-4 text-[#34C759] font-bold">0.4 %</td>
                      <td className="py-4 text-right text-[#34C759] font-bold">STABLE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-white border border-black/[0.06] rounded-[28px] p-6 shadow-2xs">
            <h2 className="text-base font-extrabold uppercase tracking-widest text-[#1C1C1E] mb-6 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" /> Data Dumps
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between bg-[#F2F2F7] border border-black/[0.04] rounded-xl p-3 cursor-pointer hover:border-slate-300 transition">
                <span className="text-[#1C1C1E] font-medium">landmarks.json</span>
                <ChevronRight className="h-4 w-4 text-[#8E8E93]" />
              </div>
              <div className="flex items-center justify-between bg-[#F2F2F7] border border-black/[0.04] rounded-xl p-3 cursor-pointer hover:border-slate-300 transition">
                <span className="text-[#1C1C1E] font-medium">foot_strikes.json</span>
                <ChevronRight className="h-4 w-4 text-[#8E8E93]" />
              </div>
              <div className="flex items-center justify-between bg-[#F2F2F7] border border-black/[0.04] rounded-xl p-3 cursor-pointer hover:border-slate-300 transition">
                <span className="text-[#1C1C1E] font-medium">metrics.json</span>
                <ChevronRight className="h-4 w-4 text-[#8E8E93]" />
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-purple-50 border border-purple-200/60 rounded-2xl">
              <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest mb-1">Instructions</p>
              <p className="text-xs text-purple-900 leading-relaxed">
                To run the determinism test, execute:<br/><br/>
                <code className="text-purple-700 bg-purple-100/80 px-2 py-1 rounded">python ai-engine/scripts/validate_determinism.py</code>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
