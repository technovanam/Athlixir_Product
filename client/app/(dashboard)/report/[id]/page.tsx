'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api, useAuth } from '../../../context/AuthContext';
import {
  Printer, Share2, Activity, Shield, Zap, Compass,
  Target, AlertTriangle, CheckCircle, TrendingUp, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';

// Helper component to force a page break when printing
const PageBreak = () => <div className="break-before-page print:block hidden" />;

const RING_PATH = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const show = (v: unknown) => (isNum(v) ? v : '—');

function ScoreRing({ label, value, ringClass, textClass }: { label: string; value: unknown; ringClass: string; textClass: string }) {
  const pct = isNum(value) ? Math.min(Math.max(value, 0), 100) : 0;
  return (
    <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-4">{label}</p>
      <div className="relative h-28 w-28">
        <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
          <path className="text-slate-200" strokeWidth="3" stroke="currentColor" fill="none" d={RING_PATH} />
          {pct > 0 && (
            <path className={ringClass} strokeDasharray={`${pct}, 100`} strokeWidth="3" stroke="currentColor" fill="none" strokeLinecap="round" d={RING_PATH} />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center"><span className={`text-3xl font-black ${textClass}`}>{show(value)}</span></div>
      </div>
    </div>
  );
}

function MetricRow({ label, value, unit, valueClass = 'text-slate-900', shaded = false, last = false }: { label: string; value: unknown; unit: string; valueClass?: string; shaded?: boolean; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center p-3.5 ${last ? '' : 'border-b border-slate-100'} ${shaded ? 'bg-slate-50/50' : ''}`}>
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <span className={`text-sm font-extrabold ${valueClass}`}>
        {show(value)}{isNum(value) && <span className="text-[10px] text-slate-400 font-semibold uppercase"> {unit}</span>}
      </span>
    </div>
  );
}

function InsightList({ title, items, icon, tone }: { title: string; items: string[]; icon: React.ReactNode; tone: string }) {
  return (
    <div className="rounded-2xl bg-slate-50/70 border border-slate-200/80 p-4 shadow-xs">
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center mb-3 ${tone}`}>{icon}</div>
      <p className="text-xs font-bold text-slate-900 mb-2">{title}</p>
      {items.length > 0 ? (
        <ul className="space-y-1.5">
          {items.map((item, i) => (
            <li key={i} className="text-[11px] text-slate-600 font-medium leading-snug">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-[11px] text-slate-400 font-medium">—</p>
      )}
    </div>
  );
}

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Activity className="h-8 w-8 text-[#FF4F21] animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Compiling executive sports science report...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const athleteName = user?.name || user?.username || 'Athlete';
  const scores = data.scores || {};
  const metrics = data.metrics || {};
  const tier = data.classification?.athleteLevel || scores.athleteLevel || 'Unclassified';
  const injury = data.injuryRisk || {};
  const injuryFlags: Array<{ detected?: boolean; detail?: string }> = Array.isArray(data.injuryRisks)
    ? data.injuryRisks.filter((f: any) => f?.detected)
    : [];
  const insights = data.insights || {};
  const recommendations: string[] = Array.isArray(data.recommendations) ? data.recommendations : [];
  const metricFlags: string[] = Array.isArray(data.metricFlags) ? data.metricFlags : [];
  const injuryLevel: string = injury.level || 'Not assessed';
  const injuryElevated = injuryLevel === 'Moderate' || injuryLevel === 'High';

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-slate-900 pb-32 print:bg-white print:pb-0" style={{ fontFamily: "'Mazzard', sans-serif" }}>

      {/* EXPORT FEATURES (Hidden on print) */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EBEBEB] px-6 py-3.5 flex items-center justify-between print:hidden shadow-xs">
        <Link href={`/history`} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#FF4F21] transition">
          <ChevronLeft className="h-4 w-4" /> Back to Sessions
        </Link>
        <div className="flex items-center gap-2.5">
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 active:scale-95 transition cursor-pointer">
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF4F21] hover:bg-[#e0451a] text-white text-xs font-semibold active:scale-95 transition shadow-sm cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" /> Print / Export PDF
          </button>
        </div>
      </div>

      <div className="max-w-[850px] mx-auto mt-6 print:mt-0 space-y-6 print:space-y-0 print:p-0 p-4">

        {/* =========================================
            PAGE 1: COVER PAGE
        ========================================= */}
        <div className="bg-white text-slate-900 rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm print:rounded-none print:border-none print:shadow-none print:min-h-screen print:flex print:flex-col print:justify-between relative p-12">
          <div className="relative z-10 flex flex-col h-full justify-between min-h-[560px] print:min-h-[880px]">
            <div>
              <div className="flex items-center justify-between pb-8 mb-10 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#FF4F21] flex items-center justify-center font-bold text-sm shadow-sm text-white">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span className="font-agale font-extrabold text-lg tracking-tight uppercase text-slate-900">ATHLIXIR</span>
                    <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Biomechanical Performance Lab</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-200/60 px-3 py-1 rounded-full">
                  Confidential Assessment
                </span>
              </div>

              <h2 className="text-[#FF4F21] text-xs font-bold uppercase tracking-[0.25em] mb-3">Official Biomechanics Assessment</h2>
              <h1 className="text-5xl font-black uppercase tracking-tight leading-tight mb-5 text-slate-900">{athleteName}</h1>

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-50/70 border border-orange-200/60 text-xs font-bold text-[#FF4F21]">
                <Shield className="h-4 w-4 text-[#FF4F21]" /> {tier}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 border-t border-slate-100 pt-8 mt-12 bg-slate-50/50 -mx-12 -mb-12 p-12">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Session Reference</p>
                <p className="text-xs font-mono font-bold text-slate-800">{id.slice(0, 14).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Assessment Date</p>
                <p className="text-xs font-bold text-slate-800">{data.createdAt ? new Date(data.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Engine Algorithm</p>
                <p className="text-xs font-bold text-slate-800">MediaPipe Pose Kinematics</p>
              </div>
            </div>
          </div>
        </div>

        <PageBreak />

        {/* =========================================
            PAGE 2: PERFORMANCE SUMMARY
        ========================================= */}
        <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/80 shadow-sm print:rounded-none print:border-none print:shadow-none print:min-h-screen p-12">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-10">
            <Target className="h-5 w-5 text-[#FF4F21]" />
            <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">Performance Summary & Diagnostics</h2>
          </div>

          <div className="grid grid-cols-3 gap-6 mb-10">
            <ScoreRing label="Overall Performance" value={scores.performanceScore} ringClass="text-slate-900" textClass="text-slate-900" />
            <ScoreRing label="Sprint Efficiency" value={scores.efficiencyScore} ringClass="text-[#FF4F21]" textClass="text-[#FF4F21]" />
            <ScoreRing label="Kinematics" value={scores.biomechanicsScore} ringClass="text-emerald-500" textClass="text-emerald-600" />
          </div>

          <div className={`${injuryElevated ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'} border rounded-2xl p-6 flex items-start gap-4 shadow-xs`}>
            {injuryElevated
              ? <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              : <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />}
            <div>
              <h3 className={`text-xs font-bold uppercase tracking-wider mb-1.5 ${injuryElevated ? 'text-amber-900' : 'text-emerald-900'}`}>
                Injury Risk Assessment: {injuryLevel}
                {injury.riskArea && injury.riskArea !== 'None' ? ` · ${injury.riskArea}` : ''}
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {injuryFlags.length > 0
                  ? injuryFlags.map((f) => f.detail).filter(Boolean).join('. ')
                  : 'No significant biomechanical risk flags detected in this session.'}
              </p>
            </div>
          </div>

          {metricFlags.length > 0 && (
            <p className="mt-4 text-[11px] text-slate-500 font-medium">
              Some metrics could not be measured reliably from this video and were excluded from scoring ({metricFlags.join(', ')}).
            </p>
          )}
        </div>

        <PageBreak />

        {/* =========================================
            PAGE 3: BIOMECHANICS & KINEMATICS
        ========================================= */}
        <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/80 shadow-sm print:rounded-none print:border-none print:shadow-none print:min-h-screen p-12">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-10">
            <Activity className="h-5 w-5 text-[#FF4F21]" />
            <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">Telemetry & Kinematic Breakdown</h2>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Core Running Metrics</h3>
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                <MetricRow label="Cadence" value={metrics.cadence} unit="SPM" />
                <MetricRow label="Ground Contact" value={metrics.gct} unit="ms" valueClass="text-[#FF4F21]" shaded />
                <MetricRow label="Stride Length" value={metrics.strideLength} unit="m" />
                <MetricRow label="Symmetry Index" value={metrics.symmetry} unit="%" valueClass="text-emerald-600" shaded last />
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Postural Kinematics</h3>
              <div className="border border-slate-200/80 rounded-2xl overflow-hidden bg-white shadow-xs">
                <MetricRow label="Forward Lean" value={metrics.postureAngle} unit="°" />
                <MetricRow label="Overstride Angle" value={metrics.overstrideAngle} unit="°" valueClass="text-[#FF4F21]" shaded />
                <MetricRow label="Vertical Oscillation" value={metrics.oscillation} unit="cm" last />
              </div>
            </div>
          </div>

          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Gait Phase Observations</h3>
          <div className="grid grid-cols-3 gap-4">
            <InsightList title="Strengths" items={insights.strengths || []} icon={<CheckCircle className="h-4 w-4" />} tone="bg-emerald-100 text-emerald-700" />
            <InsightList title="Focus Areas" items={insights.weaknesses || []} icon={<AlertTriangle className="h-4 w-4" />} tone="bg-orange-100 text-[#FF4F21]" />
            <InsightList title="Observations" items={insights.observations || []} icon={<TrendingUp className="h-4 w-4" />} tone="bg-blue-100 text-blue-700" />
          </div>
        </div>

        <PageBreak />

        {/* =========================================
            PAGE 4: INTERVENTIONS & DRILLS
        ========================================= */}
        <div className="bg-white text-slate-900 rounded-3xl border border-slate-200/80 shadow-sm print:rounded-none print:border-none print:shadow-none print:min-h-screen p-12 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-10">
              <Compass className="h-5 w-5 text-[#FF4F21]" />
              <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-900">Prescribed Training Interventions</h2>
            </div>

            <div className="bg-orange-50/40 border border-orange-200/60 rounded-2xl p-6 shadow-xs mb-10">
              <h3 className="text-xs font-bold text-orange-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#FF4F21]" /> Recommended Drills
              </h3>
              {recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-slate-700 font-medium flex items-start gap-2">
                      <span className="text-[#FF4F21] font-bold">•</span> {rec}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 font-medium">No drill recommendations for this session.</p>
              )}
            </div>
          </div>

          <div className="text-center pt-8 border-t border-slate-100 mt-12">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
              ATHLIXIR High Performance Biomechanical Intelligence System
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
