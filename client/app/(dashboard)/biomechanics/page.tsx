'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, useAuth } from '../../context/AuthContext';
import {
  Activity, UploadCloud, FileText, Sparkles, Trophy,
  Timer, Footprints, Zap, Target, CheckCircle2, ChevronRight,
  Download, Eye, ArrowRight, Play, Calendar
} from 'lucide-react';
import BiomechanicsPanel from '../dashboard/BiomechanicsPanel';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';

export default function BiomechanicsLabPage() {
  const { user } = useAuth();
  const [analysesList, setAnalysesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/list');
      setFetchError(null);
      const list = res.data?.data ?? res.data ?? [];
      if (Array.isArray(list)) {
        setAnalysesList(list);
      }
    } catch (err) {
      console.error('Failed to load biomechanics analyses', err);
      setFetchError(classifyFetchError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const athleteName = user?.physicalProfile?.full_name || user?.name || user?.username || 'Athlete';
  const firstName = athleteName.split(' ')[0];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  const completedCount = analysesList.filter(a => a.status === 'COMPLETED').length;

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-24 space-y-7 animate-fadeIn font-poppins relative z-10 text-[#1C1C1E]">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase block">
            {currentDate} · SPRINT SCIENCE & TELEMETRY LAB
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight mt-0.5 flex items-center gap-2">
            Biomechanics Lab <Activity size={24} className="text-[#FF4F21]" />
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard?tab=biomechanics"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition cursor-pointer"
          >
            <UploadCloud size={15} />
            <span>Upload Sprint Video</span>
          </Link>

          <Link
            href="/reports"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-white border border-black/[0.08] text-[#1C1C1E] text-xs font-bold hover:bg-zinc-50 active:scale-95 transition shadow-2xs"
          >
            <FileText size={14} className="text-[#8E8E93]" />
            <span>Reports</span>
          </Link>
        </div>
      </div>

      {fetchError && (
        <DataFetchError error={fetchError} onRetry={fetchAnalyses} />
      )}

      {/* 2. LAB HIGHLIGHT STATS CARD */}
      <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                Computer Vision Sprint Engine
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#34C759]/10 text-[#34C759]">
                MediaPipe 33-Point Pose Model
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">
              Sagittal Sprint Kinematics & Joint Coordinates
            </h2>
            <p className="text-xs text-[#636366] max-w-xl font-medium">
              Extract step frequency, ground contact time, foot-strike angle, and bilateral kinetic symmetry at 60 FPS.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-black/[0.06] lg:pl-6">
            <div className="flex-1 min-w-[120px] p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
              <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                Total Sessions
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#1C1C1E] mt-1">
                {analysesList.length}
              </div>
            </div>

            <div className="flex-1 min-w-[120px] p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.03]">
              <span className="text-[11px] font-bold text-[#34C759] uppercase tracking-wider flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-[#34C759]" /> Analyzed
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#34C759] mt-1">
                {completedCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. KINEMATIC STUDIO WORKSPACE */}
      <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-7 shadow-xs space-y-6">
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
                Upload sprint video clips and inspect landmark overlays in real-time
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#8E8E93] bg-[#F8F8FA] px-3.5 py-1.5 rounded-full border border-black/[0.04]">
            <span className="h-2 w-2 rounded-full bg-[#34C759] animate-pulse" />
            <span>AI Pose Engine Ready</span>
          </div>
        </div>

        <BiomechanicsPanel
          analysesList={analysesList}
          onAnalysesUpdated={fetchAnalyses}
        />
      </div>

    </div>
  );
}
