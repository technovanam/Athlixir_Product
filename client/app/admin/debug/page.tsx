'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, ShieldAlert, Zap, Server, ChevronRight, CheckCircle, Database
} from 'lucide-react';

export default function PipelineDebugPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-purple-500 mb-2">
              <Server className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Internal Engineering</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tight">AI Pipeline Debugger</h1>
          </div>
          <div className="flex gap-4 text-sm font-mono text-zinc-500">
            <div className="flex items-center gap-2 bg-zinc-900 px-4 py-2 rounded-lg border border-zinc-800">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              API Status: LIVE
            </div>
          </div>
        </div>

        {/* Determinism Diagnostics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#FF4F21]" /> Validation Metrics
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Savitzky-Golay Filter</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-500">Active</span>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Strict FPS Gate</p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-emerald-500">&gt; 60 FPS</span>
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Determinism Variance Tracker</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm font-mono min-w-[500px] md:min-w-0">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500">
                      <th className="pb-3 font-medium">Metric</th>
                      <th className="pb-3 font-medium">Allowed Var.</th>
                      <th className="pb-3 font-medium">Last Run Var.</th>
                      <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    <tr>
                      <td className="py-4 text-white">Cadence</td>
                      <td className="py-4">±1 spm</td>
                      <td className="py-4 text-emerald-500">0.0 spm</td>
                      <td className="py-4 text-right text-emerald-500">STABLE</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">GCT</td>
                      <td className="py-4">±5 ms</td>
                      <td className="py-4 text-amber-500">8 ms</td>
                      <td className="py-4 text-right text-amber-500">WARNING</td>
                    </tr>
                    <tr>
                      <td className="py-4 text-white">Symmetry</td>
                      <td className="py-4">±2 %</td>
                      <td className="py-4 text-emerald-500">0.4 %</td>
                      <td className="py-4 text-right text-emerald-500">STABLE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="col-span-1 bg-zinc-950 border border-zinc-800 rounded-2xl p-6">
            <h2 className="text-lg font-black uppercase tracking-widest text-white mb-6 flex items-center gap-2">
              <Database className="h-5 w-5 text-blue-500" /> Data Dumps
            </h2>
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded p-3 cursor-pointer hover:border-zinc-700 transition">
                <span className="text-zinc-300">landmarks.json</span>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </div>
              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded p-3 cursor-pointer hover:border-zinc-700 transition">
                <span className="text-zinc-300">foot_strikes.json</span>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </div>
              <div className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded p-3 cursor-pointer hover:border-zinc-700 transition">
                <span className="text-zinc-300">metrics.json</span>
                <ChevronRight className="h-4 w-4 text-zinc-600" />
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
              <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Instructions</p>
              <p className="text-xs text-zinc-400">
                To run the determinism test, execute:<br/><br/>
                <code className="text-purple-400">python ai-engine/scripts/validate_determinism.py</code>
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
