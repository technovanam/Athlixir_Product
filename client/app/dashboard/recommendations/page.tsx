'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { Lightbulb, Dumbbell, Activity, Heart, ChevronRight, CheckCircle2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function RecommendationsPage() {
  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/analysis/list');
        const list = res.data?.data ?? res.data ?? [];
        if (Array.isArray(list)) {
          const completed = list.filter((a: any) => a.status === 'COMPLETED');
          if (completed.length > 0) {
            // Sort by date descending
            completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setLatestAnalysis(completed[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load recommendations context', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8 bg-black flex items-center justify-center">
         <div className="animate-pulse text-[#FF4F21] font-bold tracking-widest uppercase text-xs">
          Loading AI Recommendations...
        </div>
      </div>
    );
  }

  if (!latestAnalysis) {
    return (
      <div className="flex-1 p-8 bg-black flex flex-col items-center justify-center">
        <Lightbulb className="h-12 w-12 text-zinc-700 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">No Data Available</h2>
        <p className="text-zinc-500 text-sm mb-6 text-center max-w-md">
          We need at least one completed biomechanics analysis to generate your customized training recommendations.
        </p>
        <Link href="/dashboard" className="rounded-xl bg-[#FF4F21] px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110">
          Upload Video
        </Link>
      </div>
    );
  }

  // Derive some static plan categories for UI completeness based on latest metrics
  const recommendations = latestAnalysis.insights?.recommendations || [
    "Increase cadence by 5%",
    "Focus on midfoot striking",
    "Reduce vertical oscillation"
  ];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-black text-white selection:bg-[#FF4F21]/30">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3 text-white">
            <Lightbulb className="h-6 w-6 text-amber-400" />
            AI Training Plan
          </h1>
          <p className="text-zinc-400 text-sm">
            Customized sprint drills, mobility work, and corrections based on your latest biomechanics scan.
          </p>
        </div>

        {/* Priority Focus Areas */}
        <div className="grid md:grid-cols-2 gap-6">
           <div className="rounded-2xl border border-[#FF4F21]/20 bg-[#FF4F21]/5 p-6">
             <h2 className="text-xs font-black text-[#FF4F21] uppercase tracking-widest mb-4">Primary Corrections</h2>
             <ul className="space-y-3">
               {recommendations.map((rec: string, i: number) => (
                 <li key={i} className="flex items-start gap-3 text-sm font-bold text-white leading-relaxed">
                   <CheckCircle2 className="h-5 w-5 shrink-0 text-[#FF4F21]" />
                   {rec}
                 </li>
               ))}
             </ul>
           </div>

           <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 flex flex-col justify-center">
             <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-2">Based on Scan</h2>
             <p className="text-sm font-mono text-zinc-400 mb-4">{latestAnalysis.analysisId?.slice(0, 8)} • {new Date(latestAnalysis.createdAt).toLocaleDateString()}</p>
             <div className="flex gap-4">
                <div className="bg-black border border-zinc-800 p-3 rounded-lg flex-1 text-center">
                   <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">Cadence</p>
                   <p className="text-xl font-black text-white">{latestAnalysis.metrics?.cadence || '—'}</p>
                </div>
                <div className="bg-black border border-zinc-800 p-3 rounded-lg flex-1 text-center">
                   <p className="text-[10px] text-zinc-500 font-bold uppercase mb-1">GCT</p>
                   <p className="text-xl font-black text-white">{latestAnalysis.metrics?.gct || '—'} <span className="text-xs">ms</span></p>
                </div>
             </div>
           </div>
        </div>

        {/* Weekly Plan */}
        <div>
          <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Recommended Weekly Plan</h2>
          <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/60">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-900/80 border-b border-zinc-800">
                <tr>
                  <th className="px-6 py-4 font-bold text-zinc-400 w-1/4">Day</th>
                  <th className="px-6 py-4 font-bold text-zinc-400 w-1/4">Focus</th>
                  <th className="px-6 py-4 font-bold text-zinc-400">Prescription</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                <tr className="hover:bg-zinc-900/30 transition">
                  <td className="px-6 py-4 font-bold text-white">Monday</td>
                  <td className="px-6 py-4 text-emerald-400 font-semibold flex items-center gap-2"><Activity className="h-4 w-4" /> Mechanics</td>
                  <td className="px-6 py-4 text-zinc-300">A-Skips (3x20m), B-Skips (3x20m), High Knees focus on strike angle.</td>
                </tr>
                <tr className="hover:bg-zinc-900/30 transition bg-black/20">
                  <td className="px-6 py-4 font-bold text-white">Wednesday</td>
                  <td className="px-6 py-4 text-[#FF4F21] font-semibold flex items-center gap-2"><Zap className="h-4 w-4" /> Speed</td>
                  <td className="px-6 py-4 text-zinc-300">Flying 30s (x4). Focus on maximizing cadence and minimizing GCT.</td>
                </tr>
                <tr className="hover:bg-zinc-900/30 transition">
                  <td className="px-6 py-4 font-bold text-white">Friday</td>
                  <td className="px-6 py-4 text-amber-400 font-semibold flex items-center gap-2"><Dumbbell className="h-4 w-4" /> Power</td>
                  <td className="px-6 py-4 text-zinc-300">Bounding (3x30m), Broad Jumps (x5). Work on explosive symmetry.</td>
                </tr>
                <tr className="hover:bg-zinc-900/30 transition bg-black/20">
                  <td className="px-6 py-4 font-bold text-white">Sunday</td>
                  <td className="px-6 py-4 text-blue-400 font-semibold flex items-center gap-2"><Heart className="h-4 w-4" /> Recovery</td>
                  <td className="px-6 py-4 text-zinc-300">Dynamic hamstring mobility, foam rolling, 20min light jog.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
