'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth, api } from '../../context/AuthContext';
import BiomechanicsPanel from './BiomechanicsPanel';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';
import {
  Zap,
  Target,
  UploadCloud,
  Footprints,
  Flame,
  Timer,
  Activity,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
  FileText,
} from 'lucide-react';

function ActivityRings({
  cadence,
  gct,
  symmetry,
}: {
  cadence: number | null;
  gct: number | null;
  symmetry: number | null;
}) {
  const hasData = cadence !== null && gct !== null && symmetry !== null;

  const cadencePct = hasData ? Math.min(100, Math.round((cadence / 180) * 100)) : 0;
  const symmetryPct = hasData ? Math.min(100, Math.round(symmetry)) : 0;
  const gctPct = hasData ? Math.min(100, Math.max(20, Math.round(100 - Math.max(0, gct - 160)))) : 0;

  const radiusOuter = 38;
  const radiusMid = 28;
  const radiusInner = 18;

  const circOuter = 2 * Math.PI * radiusOuter;
  const circMid = 2 * Math.PI * radiusMid;
  const circInner = 2 * Math.PI * radiusInner;

  const offsetOuter = circOuter - (cadencePct / 100) * circOuter;
  const offsetMid = circMid - (symmetryPct / 100) * circMid;
  const offsetInner = circInner - (gctPct / 100) * circInner;

  return (
    <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Track Backgrounds */}
        <circle cx="50" cy="50" r={radiusOuter} stroke="#FF4F21" strokeOpacity="0.12" strokeWidth="6" fill="none" />
        <circle cx="50" cy="50" r={radiusMid} stroke="#34C759" strokeOpacity="0.12" strokeWidth="6" fill="none" />
        <circle cx="50" cy="50" r={radiusInner} stroke="#FF9500" strokeOpacity="0.12" strokeWidth="6" fill="none" />

        {/* Dynamic Progress Arcs */}
        <circle
          cx="50"
          cy="50"
          r={radiusOuter}
          stroke="#FF4F21"
          strokeWidth="6"
          strokeDasharray={circOuter}
          strokeDashoffset={offsetOuter}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
        <circle
          cx="50"
          cy="50"
          r={radiusMid}
          stroke="#34C759"
          strokeWidth="6"
          strokeDasharray={circMid}
          strokeDashoffset={offsetMid}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
        <circle
          cx="50"
          cy="50"
          r={radiusInner}
          stroke="#FF9500"
          strokeWidth="6"
          strokeDasharray={circInner}
          strokeDashoffset={offsetInner}
          strokeLinecap="round"
          fill="none"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Flame size={16} className="text-[#FF4F21]" />
      </div>
    </div>
  );
}

function DashboardPageContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const isAnalyzeMode = searchParams?.get('tab') === 'biomechanics';

  const [latestAnalysis, setLatestAnalysis] = useState<any>(null);
  const [allAnalysesList, setAllAnalysesList] = useState<any[]>([]);
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);

  const scrollToStudio = () => {
    const el = document.getElementById('biomechanics-upload-section');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const fetchLatest = async () => {
    try {
      const res = await api.get('/analysis/list');
      setFetchError(null);
      const list = res.data?.data ?? res.data ?? [];
      if (Array.isArray(list)) {
        setAllAnalysesList(list);
        const completed = list.filter((a: any) => a.status === 'COMPLETED');
        if (completed.length > 0) {
          completed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setLatestAnalysis(completed[0]);
        } else {
          setLatestAnalysis(null);
        }
      }
    } catch (err) {
      console.error('Failed to load analysis for hero', err);
      setFetchError(classifyFetchError(err));
    }
  };

  useEffect(() => {
    fetchLatest();
  }, []);

  const athleteName = user?.physicalProfile?.full_name || user?.name || user?.username || 'Athlete';
  const firstName = athleteName.split(' ')[0];

  const cadence: number | null = latestAnalysis?.metrics?.cadence ?? null;
  const gct: number | null = latestAnalysis?.metrics?.gct ?? null;
  const strideLength: number | null = latestAnalysis?.metrics?.strideLength ?? null;
  const symmetry: number | null = latestAnalysis?.metrics?.symmetry ?? null;
  const readinessScore = latestAnalysis?.scores?.performanceScore ?? null;

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-24 space-y-7 animate-fadeIn font-poppins relative z-10 text-[#1C1C1E]">
      
      {/* 1. TOP WELCOME & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase block">
            {currentDate}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight mt-0.5">
            {isAnalyzeMode ? 'Kinematic Studio' : `Hello, ${firstName} 👋`}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={scrollToStudio}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition cursor-pointer"
          >
            <UploadCloud size={15} />
            <span>Upload Sprint Video</span>
          </button>

          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#1C1C1E] text-xs font-bold hover:bg-zinc-50 active:scale-95 transition shadow-2xs"
          >
            <FileText size={14} className="text-[#8E8E93]" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {fetchError && !isAnalyzeMode && (
        <DataFetchError error={fetchError} onRetry={fetchLatest} />
      )}

      {/* 2. SPRINT READINESS & ACTIVITY RINGS SUMMARY CARD */}
      {!isAnalyzeMode && !fetchError && (
        <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            {/* Concentric Rings & Readiness KPI */}
            <div className="flex items-center gap-6">
              <ActivityRings cadence={cadence} gct={gct} symmetry={symmetry} />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                    Sprint Readiness Index
                  </span>
                  {readinessScore !== null && (
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#34C759]/10 text-[#34C759]">
                      {readinessScore >= 80 ? 'Optimal' : readinessScore >= 60 ? 'Building' : 'Developing'}
                    </span>
                  )}
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#1C1C1E] tracking-tight mt-1">
                  {readinessScore !== null ? readinessScore : '—'}{' '}
                  <span className="text-sm font-semibold text-[#8E8E93]">/ 100</span>
                </h2>
                <p className="text-xs font-medium text-[#636366] mt-1.5 max-w-sm">
                  {readinessScore !== null
                    ? 'Kinetic elasticity and bilateral symmetry are primed for high-velocity acceleration.'
                    : 'Upload your first sprint video to generate comprehensive biomechanical readiness.'}
                </p>
              </div>
            </div>

            {/* Metric Legend Tiles */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-black/[0.06] lg:pl-6">
              
              <div className="flex-1 min-w-[110px] p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF4F21]">
                  <span className="h-2 w-2 rounded-full bg-[#FF4F21]" /> Cadence
                </div>
                <div className="text-lg font-black text-[#1C1C1E] mt-1">
                  {cadence !== null ? cadence : '—'}{' '}
                  <span className="text-[10px] text-[#8E8E93] font-normal">SPM</span>
                </div>
              </div>

              <div className="flex-1 min-w-[110px] p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#34C759]">
                  <span className="h-2 w-2 rounded-full bg-[#34C759]" /> Symmetry
                </div>
                <div className="text-lg font-black text-[#1C1C1E] mt-1">
                  {symmetry !== null ? `${symmetry}%` : '—'}
                </div>
              </div>

              <div className="flex-1 min-w-[110px] p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#FF9500]">
                  <span className="h-2 w-2 rounded-full bg-[#FF9500]" /> Contact Time
                </div>
                <div className="text-lg font-black text-[#1C1C1E] mt-1">
                  {gct !== null ? gct : '—'}{' '}
                  <span className="text-[10px] text-[#8E8E93] font-normal">MS</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* 3. 4-TILE BIOMECHANICAL TELEMETRY GRID */}
      {!isAnalyzeMode && !fetchError && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Metric 1: Cadence */}
          <div className="rounded-3xl bg-white border border-black/[0.06] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                Step Frequency
              </span>
              <div className="h-8 w-8 rounded-xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center font-bold">
                <Timer size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">
                {cadence !== null ? cadence : '—'}
              </span>
              <span className="text-xs font-semibold text-[#8E8E93] ml-1">spm</span>
              <div className="text-[11px] font-semibold text-[#34C759] flex items-center gap-1 mt-1">
                <TrendingUp size={12} /> {cadence !== null ? 'Target ~180 SPM' : 'Awaiting sprint video'}
              </div>
            </div>
          </div>

          {/* Metric 2: Ground Contact Time */}
          <div className="rounded-3xl bg-white border border-black/[0.06] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                Ground Contact Time
              </span>
              <div className="h-8 w-8 rounded-xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center font-bold">
                <Footprints size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">
                {gct !== null ? gct : '—'}
              </span>
              <span className="text-xs font-semibold text-[#8E8E93] ml-1">ms</span>
              <div className="text-[11px] font-semibold text-[#FF4F21] flex items-center gap-1 mt-1">
                <CheckCircle2 size={12} /> {gct !== null ? '< 100ms Elite Standard' : 'Awaiting sprint video'}
              </div>
            </div>
          </div>

          {/* Metric 3: Stride Length */}
          <div className="rounded-3xl bg-white border border-black/[0.06] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                Stride Amplitude
              </span>
              <div className="h-8 w-8 rounded-xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center font-bold">
                <Zap size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">
                {strideLength !== null ? strideLength : '—'}
              </span>
              <span className="text-xs font-semibold text-[#8E8E93] ml-1">m</span>
              <div className="text-[11px] font-semibold text-[#8E8E93] flex items-center gap-1 mt-1">
                Optimal: 2.10–2.25m
              </div>
            </div>
          </div>

          {/* Metric 4: Kinetic Symmetry */}
          <div className="rounded-3xl bg-white border border-black/[0.06] p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition">
            <div className="flex items-start justify-between">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
                Bilateral Balance
              </span>
              <div className="h-8 w-8 rounded-xl bg-[#34C759]/10 text-[#34C759] flex items-center justify-center font-bold">
                <Target size={16} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">
                {symmetry !== null ? symmetry : '—'}
              </span>
              <span className="text-xs font-semibold text-[#8E8E93] ml-1">%</span>
              <div className={`text-[11px] font-semibold flex items-center gap-1 mt-1 ${symmetry && symmetry >= 90 ? 'text-[#34C759]' : 'text-[#FF4F21]'}`}>
                <CheckCircle2 size={12} /> {symmetry ? (symmetry >= 90 ? 'Balanced symmetry' : 'Imbalance detected') : 'Awaiting sprint video'}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 4. KINEMATIC VIDEO UPLOAD STUDIO */}
      <div
        id="biomechanics-upload-section"
        className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-6"
      >
        <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#FF4F21] text-white flex items-center justify-center shadow-xs">
              <UploadCloud size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-[#1C1C1E] tracking-tight">
                Kinematic Studio
              </h3>
              <p className="text-xs text-[#8E8E93] font-medium">
                Instant 33-point computer vision pose estimation for sprint telemetry
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#8E8E93] bg-[#F8F8FA] px-3.5 py-1.5 rounded-full border border-black/[0.04]">
            <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
            <span>AI Pose Engine Ready</span>
          </div>
        </div>

        {/* Biomechanics Studio Panel */}
        <div>
          <BiomechanicsPanel
            analysesList={allAnalysesList}
            onAnalysesUpdated={fetchLatest}
          />
        </div>
      </div>

      {/* 5. QUICK PERFORMANCE HUB (3 ACTION CARDS) */}
      {!isAnalyzeMode && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <Link
            href="/injury-risk"
            className="p-5 rounded-3xl bg-white border border-black/[0.06] hover:border-[#FF4F21]/30 hover:shadow-md transition group"
          >
            <div className="h-9 w-9 rounded-2xl bg-[#FFF5F2] text-[#FF4F21] flex items-center justify-center mb-3">
              <ShieldCheck size={18} />
            </div>
            <h4 className="text-sm font-black text-[#1C1C1E] group-hover:text-[#FF4F21] transition-colors">
              Injury Risk Guard
            </h4>
            <p className="text-xs text-[#636366] mt-1 line-clamp-2">
              Assess hamstring eccentric load and pelvic stability trends.
            </p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FF4F21]">
              <span>View Scan</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/recommendations"
            className="p-5 rounded-3xl bg-white border border-black/[0.06] hover:border-[#FF4F21]/30 hover:shadow-md transition group"
          >
            <div className="h-9 w-9 rounded-2xl bg-[#FFF5F2] text-[#FF4F21] flex items-center justify-center mb-3">
              <Target size={18} />
            </div>
            <h4 className="text-sm font-black text-[#1C1C1E] group-hover:text-[#FF4F21] transition-colors">
              Norm Benchmarks
            </h4>
            <p className="text-xs text-[#636366] mt-1 line-clamp-2">
              Compare your cadence & GCT against collegiate athletic tiers.
            </p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FF4F21]">
              <span>View Norms</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/copilot"
            className="p-5 rounded-3xl bg-white border border-black/[0.06] hover:border-[#FF4F21]/30 hover:shadow-md transition group"
          >
            <div className="h-9 w-9 rounded-2xl bg-[#FFF5F2] text-[#FF4F21] flex items-center justify-center mb-3">
              <Sparkles size={18} />
            </div>
            <h4 className="text-sm font-black text-[#1C1C1E] group-hover:text-[#FF4F21] transition-colors">
              AI Sprint Coach
            </h4>
            <p className="text-xs text-[#636366] mt-1 line-clamp-2">
              Get direct technical cues and personalized training drills.
            </p>
            <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#FF4F21]">
              <span>Consult Copilot</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>
      )}

    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2F2F7] text-[#8E8E93] text-xs font-bold uppercase tracking-wider font-poppins">
      <Activity className="h-5 w-5 animate-spin mr-3 text-[#FF4F21]" /> Loading Telemetry...
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardPageContent />
    </Suspense>
  );
}
