'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, useAuth } from '../../../context/AuthContext';
import { 
  Printer, Share2, Activity, Shield, Zap, Compass, 
  Target, AlertTriangle, CheckCircle, TrendingUp, ChevronLeft, MapPin
} from 'lucide-react';
import Link from 'next/link';

// Helper component to force a page break when printing
const PageBreak = () => <div className="break-before-page print:block hidden" />;

export default function ProfessionalAIReportPage() {
  const { id } = useParams() as { id: string };
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/analysis/${id}`);
        setData(res.data?.data || res.data);
      } catch (err) {
        console.error('Failed to load report data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Activity className="h-12 w-12 text-[#FF4F21] animate-pulse mb-4" />
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Generating Report Engine...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const athleteName = user?.name || user?.username || 'Athlete';
  const tier = user?.classification?.athleteLevel || 'U18 Sprinter';
  const scores = data.scores || { performanceScore: 82, efficiencyScore: 78, biomechanicsScore: 85 };
  const metrics = data.metrics || { cadence: 172, gct: 210, strideLength: 1.8, symmetry: 94, verticalOscillation: 8.5 };
  const form = data.formAnalysis || { postureAngle: 12, hipDrop: 4, kneeExtension: 165 };

  return (
    <div className="min-h-screen bg-zinc-950 text-white print:bg-white print:text-black font-sans pb-32">
      
      {/* EXPORT FEATURES (Hidden on print) */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-white/[0.05] px-6 py-4 flex items-center justify-between print:hidden">
        <Link href={`/history`} className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition">
          <ChevronLeft className="h-4 w-4" /> Back to History
        </Link>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-white/[0.05] hover:border-white/[0.1] text-xs font-bold text-white transition">
            <Share2 className="h-3.5 w-3.5" /> Share Link
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF4F21] to-[#FF8433] text-white hover:opacity-90 text-xs font-bold shadow-[0_0_15px_rgba(255,79,33,0.3)] transition"
          >
            <Printer className="h-3.5 w-3.5" /> Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-[850px] mx-auto mt-12 print:mt-0 space-y-12 print:space-y-0 print:p-0 p-4">
        
        {/* =========================================
            PAGE 1: COVER PAGE
        ========================================= */}
        <div className="bg-black text-white rounded-2xl overflow-hidden border border-white/[0.05] print:rounded-none print:border-none print:min-h-screen print:flex print:flex-col print:justify-center relative p-12" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
            <Compass className="h-[600px] w-[600px]" />
          </div>
          
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[600px] print:min-h-[900px]">
            <div>
              <div className="flex items-center gap-3 mb-12">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center font-bold text-sm shadow-[0_0_15px_rgba(255,79,33,0.3)]">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <span className="font-black text-xl tracking-tight uppercase">Athlixir <span className="text-zinc-600">OS</span></span>
              </div>
              <h2 className="text-[#FF4F21] text-xs font-bold uppercase tracking-[0.3em] mb-4">Official Biomechanics Report</h2>
              <h1 className="text-6xl font-black uppercase tracking-tight leading-none mb-6">{athleteName}</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-white/[0.05] text-sm font-bold text-zinc-300 print:border-zinc-500">
                <Shield className="h-4 w-4 text-[#FF4F21]" /> {tier}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 border-t border-white/[0.05] pt-8 mt-12">
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Session ID</p>
                <p className="text-sm font-mono text-zinc-300">{id.slice(0, 12).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Analysis Date</p>
                <p className="text-sm font-bold text-zinc-300">{new Date(data.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>

        <PageBreak />

        {/* =========================================
            PAGE 2: PERFORMANCE SUMMARY
        ========================================= */}
        <div className="bg-zinc-950 text-white rounded-2xl border border-white/[0.05] print:rounded-none print:border-none print:min-h-screen p-12" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-10">
            <Target className="h-5 w-5 text-[#FF4F21]" />
            <h2 className="text-lg font-black uppercase tracking-widest">Performance Summary</h2>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-12">
            <div className="bg-[#08080C]/40 border border-white/[0.05] rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5"><Activity className="h-24 w-24" /></div>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 relative z-10">Overall Performance</p>
              <div className="relative h-32 w-32 z-10">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-zinc-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-white" strokeDasharray={`${scores.performanceScore}, 100`} strokeWidth="2.5" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-black">{scores.performanceScore}</span></div>
              </div>
            </div>

            <div className="bg-[#08080C]/40 border border-white/[0.05] rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 relative z-10">Sprint Efficiency</p>
              <div className="relative h-32 w-32 z-10">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-zinc-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-[#FF4F21]" strokeDasharray={`${scores.efficiencyScore}, 100`} strokeWidth="2.5" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-black">{scores.efficiencyScore}</span></div>
              </div>
            </div>

            <div className="bg-[#08080C]/40 border border-white/[0.05] rounded-xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 relative z-10">Biomechanics</p>
              <div className="relative h-32 w-32 z-10">
                <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-zinc-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className="text-blue-500" strokeDasharray={`${scores.biomechanicsScore}, 100`} strokeWidth="2.5" stroke="currentColor" fill="none" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-black">{scores.biomechanicsScore}</span></div>
              </div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
            <div>
              <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest mb-2">Injury Risk: Moderate</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Elevated ground contact time combined with forward posture lean indicates significant load on the left hamstring during the deceleration phase. Recommend targeted mobility work.
              </p>
            </div>
          </div>
        </div>

        <PageBreak />

        {/* =========================================
            PAGE 3: BIOMECHANICS & VIDEO SNAPSHOTS
        ========================================= */}
        <div className="bg-zinc-950 text-white rounded-2xl border border-white/[0.05] print:rounded-none print:border-none print:min-h-screen p-12" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-10">
            <Activity className="h-5 w-5 text-[#FF4F21]" />
            <h2 className="text-lg font-black uppercase tracking-widest">Biomechanics & Kinematics</h2>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-12">
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Core Running Metrics</h3>
              <div className="border border-white/[0.05] rounded-xl overflow-hidden bg-[#08080C]/40 backdrop-blur-md">
                <div className="flex justify-between items-center p-4 border-b border-white/[0.05]">
                  <span className="text-xs font-bold text-zinc-400">Cadence</span>
                  <span className="text-sm font-black text-white">{metrics.cadence} <span className="text-[9px] text-zinc-600 font-bold uppercase">SPM</span></span>
                </div>
                <div className="flex justify-between items-center p-4 border-b border-white/[0.05] bg-black/40">
                  <span className="text-xs font-bold text-zinc-400">Ground Contact</span>
                  <span className="text-sm font-black text-[#FF4F21]">{metrics.gct} <span className="text-[9px] text-[#FF4F21]/50 font-bold uppercase">ms</span></span>
                </div>
                <div className="flex justify-between items-center p-4 border-b border-white/[0.05]">
                  <span className="text-xs font-bold text-zinc-400">Stride Length</span>
                  <span className="text-sm font-black text-white">{metrics.strideLength} <span className="text-[9px] text-zinc-600 font-bold uppercase">m</span></span>
                </div>
                <div className="flex justify-between items-center p-4 bg-black/40">
                  <span className="text-xs font-bold text-zinc-400">Symmetry Index</span>
                  <span className="text-sm font-black text-emerald-500">{metrics.symmetry} <span className="text-[9px] text-emerald-500/50 font-bold uppercase">%</span></span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Postural Kinematics</h3>
              <div className="border border-white/[0.05] rounded-xl overflow-hidden bg-[#08080C]/40 backdrop-blur-md">
                <div className="flex justify-between items-center p-4 border-b border-white/[0.05]">
                  <span className="text-xs font-bold text-zinc-400">Forward Lean</span>
                  <span className="text-sm font-black text-white">{form.postureAngle}°</span>
                </div>
                <div className="flex justify-between items-center p-4 border-b border-white/[0.05] bg-black/40">
                  <span className="text-xs font-bold text-zinc-400">Hip Drop</span>
                  <span className="text-sm font-black text-[#FF4F21]">{form.hipDrop}° <span className="text-[9px] text-[#FF4F21]/50 font-bold uppercase">(High)</span></span>
                </div>
                <div className="flex justify-between items-center p-4">
                  <span className="text-xs font-bold text-zinc-400">Knee Extension</span>
                  <span className="text-sm font-black text-white">{form.kneeExtension}°</span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Key Pose Snapshots</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="aspect-[4/5] rounded-xl bg-[#08080C]/40 border border-white/[0.05] relative overflow-hidden flex flex-col justify-end p-4">
              <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-zinc-800/40" />
              <div className="relative z-10">
                <p className="text-xs font-black text-white mb-1">Max Knee Drive</p>
                <p className="text-[9px] font-bold text-emerald-500">Optimal Angle Detected</p>
              </div>
            </div>
            <div className="aspect-[4/5] rounded-xl bg-[#08080C]/40 border border-white/[0.05] relative overflow-hidden flex flex-col justify-end p-4">
              <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-zinc-800/40" />
              <div className="relative z-10">
                <p className="text-xs font-black text-white mb-1">Foot Strike</p>
                <p className="text-[9px] font-bold text-[#FF4F21]">Braking Force Alert</p>
              </div>
            </div>
            <div className="aspect-[4/5] rounded-xl bg-[#08080C]/40 border border-white/[0.05] relative overflow-hidden flex flex-col justify-end p-4">
              <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-12 w-12 text-zinc-800/40" />
              <div className="relative z-10">
                <p className="text-xs font-black text-white mb-1">Toe-Off</p>
                <p className="text-[9px] font-bold text-zinc-400">165° Extension</p>
              </div>
            </div>
          </div>
        </div>

        <PageBreak />

        {/* =========================================
            PAGE 4: AI INSIGHTS & BENCHMARKS
        ========================================= */}
        <div className="bg-zinc-950 text-white rounded-2xl border border-white/[0.05] print:rounded-none print:border-none print:min-h-screen p-12" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          
          <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-10">
            <Zap className="h-5 w-5 text-[#FF4F21]" />
            <h2 className="text-lg font-black uppercase tracking-widest">AI Intelligence Engine</h2>
          </div>

          <div className="space-y-4 mb-16">
            <div className="bg-[#FF4F21]/10 border border-[#FF4F21]/20 rounded-xl p-5 flex items-start gap-4">
              <Zap className="h-5 w-5 text-[#FF4F21] shrink-0 mt-0.5" />
              <p className="text-xs text-[#FF4F21] font-bold leading-relaxed">
                Overstride detected during acceleration phase. Your foot is striking significantly ahead of your center of mass, leading to high braking forces and elevated GCT.
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 flex items-start gap-4">
              <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-500 font-bold leading-relaxed">
                Ground contact asymmetry reduced by 11% compared to previous session. Left-leg mechanics are stabilizing nicely during maximal velocity.
              </p>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 flex items-start gap-4">
              <TrendingUp className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-400 font-bold leading-relaxed">
                Cadence has improved significantly (now 172 SPM), but remains slightly below the elite benchmark. Focus on stiffening the ankle complex.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-10">
            <Shield className="h-5 w-5 text-[#FF4F21]" />
            <h2 className="text-lg font-black uppercase tracking-widest">State & Elite Benchmarks</h2>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-2">
                <span>Cadence Target</span>
                <span className="text-white">172 / 185 SPM</span>
              </div>
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/[0.05]">
                <div className="h-full bg-gradient-to-r from-blue-600 to-blue-400 w-[93%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase mb-2">
                <span>Overall Efficiency vs {tier}</span>
                <span className="text-[#FF4F21]">Top 18%</span>
              </div>
              <div className="h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/[0.05]">
                <div className="h-full bg-gradient-to-r from-[#FF4F21] to-[#FF8433] w-[82%]" />
              </div>
            </div>
          </div>
        </div>

        <PageBreak />

        {/* =========================================
            PAGE 5: AI COACH RECOMMENDATIONS
        ========================================= */}
        <div className="bg-zinc-950 text-white rounded-2xl border border-white/[0.05] print:rounded-none print:border-none print:min-h-screen p-12" style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>
          <div className="flex items-center gap-3 border-b border-white/[0.05] pb-4 mb-10">
            <Compass className="h-5 w-5 text-[#FF4F21]" />
            <h2 className="text-lg font-black uppercase tracking-widest">Prescribed Interventions</h2>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-16">
            <div className="bg-[#08080C]/40 border border-white/[0.05] rounded-xl p-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#FF4F21]" /> Sprint Drills
              </h3>
              <ul className="space-y-3">
                <li className="text-xs text-zinc-300 font-medium flex items-start gap-2">
                  <span className="text-[#FF4F21] font-black">•</span> Wicket runs (Focus on rapid turnover)
                </li>
                <li className="text-xs text-zinc-300 font-medium flex items-start gap-2">
                  <span className="text-[#FF4F21] font-black">•</span> A-Skips with emphasis on mid-foot strike
                </li>
                <li className="text-xs text-zinc-300 font-medium flex items-start gap-2">
                  <span className="text-[#FF4F21] font-black">•</span> Resisted sled pushes (Acceleration phase)
                </li>
              </ul>
            </div>

            <div className="bg-[#08080C]/40 border border-white/[0.05] rounded-xl p-6">
              <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                <Shield className="h-4 w-4 text-blue-500" /> Mobility & Recovery
              </h3>
              <ul className="space-y-3">
                <li className="text-xs text-zinc-300 font-medium flex items-start gap-2">
                  <span className="text-blue-500 font-black">•</span> Ankle dorsiflexion stretching (2x daily)
                </li>
                <li className="text-xs text-zinc-300 font-medium flex items-start gap-2">
                  <span className="text-blue-500 font-black">•</span> Left hip flexor isometric holds
                </li>
                <li className="text-xs text-zinc-300 font-medium flex items-start gap-2">
                  <span className="text-blue-500 font-black">•</span> Drop jumps to decrease GCT
                </li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-16 border-t border-white/[0.05] mt-auto">
            <Activity className="h-6 w-6 text-zinc-700 mx-auto mb-2" />
            <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">
              Generated by ATHLIXIR AI Athlete OS
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
