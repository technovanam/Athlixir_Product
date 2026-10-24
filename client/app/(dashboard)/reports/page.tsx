'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../config/service-urls';
import {
  FileText, Download, Calendar, Trophy, ChevronRight,
  UploadCloud, ArrowRight, Eye, CheckCircle2, Zap, Search,
  Filter, Sparkles, SlidersHorizontal, Activity, ArrowUpRight,
  Share2, BarChart2, ShieldCheck, Flame
} from 'lucide-react';
import Link from 'next/link';
import DataFetchError, { classifyFetchError, FetchErrorPresentation } from '../components/DataFetchError';

type AnalysisRecord = {
  id?: string;
  analysisId?: string;
  status?: string;
  createdAt?: string;
  reportReady?: boolean;
  scores?: {
    performanceScore?: number | null;
  };
  metrics?: {
    cadence?: number | null;
    gct?: number | null;
    strideLength?: number | null;
    symmetry?: number | null;
  };
  classification?: {
    athleteLevel?: string;
    event?: string;
  };
};

export default function ReportsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [reports, setReports] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'highestScore'>('newest');
  const [fetchError, setFetchError] = useState<FetchErrorPresentation | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/analysis/list');
      setFetchError(null);
      const list = res.data?.data ?? res.data ?? [];
      if (Array.isArray(list)) {
        setReports(list.filter((a: AnalysisRecord) => a.status === 'COMPLETED'));
      }
    } catch (err) {
      console.error('Failed to load reports', err);
      setFetchError(classifyFetchError(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  // Filter & Sort Logic
  const filteredReports = reports.filter((r) => {
    const searchMatch =
      searchQuery === '' ||
      (r.analysisId && r.analysisId.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.classification?.event && r.classification.event.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.classification?.athleteLevel && r.classification.athleteLevel.toLowerCase().includes(searchQuery.toLowerCase()));

    const levelMatch =
      filterLevel === 'ALL' ||
      (filterLevel === 'ELITE' && (r.scores?.performanceScore ?? 0) >= 85) ||
      (filterLevel === 'HIGH' && (r.scores?.performanceScore ?? 0) >= 70 && (r.scores?.performanceScore ?? 0) < 85) ||
      (filterLevel === 'DEVELOPMENTAL' && (r.scores?.performanceScore ?? 0) < 70);

    return searchMatch && levelMatch;
  }).sort((a, b) => {
    if (sortBy === 'highestScore') {
      return (b.scores?.performanceScore ?? 0) - (a.scores?.performanceScore ?? 0);
    }
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  // Only sessions with a real score count; nothing is substituted for a missing one.
  const scoredValues = reports
    .map((r) => r.scores?.performanceScore)
    .filter((s): s is number => typeof s === 'number');
  const averageScore = scoredValues.length > 0
    ? Math.round(scoredValues.reduce((acc, s) => acc + s, 0) / scoredValues.length)
    : null;

  const cadenceValues = reports
    .map((r) => r.metrics?.cadence)
    .filter((c): c is number => typeof c === 'number');
  const bestCadence = cadenceValues.length > 0 ? Math.max(...cadenceValues) : null;

  const handleDownloadPdf = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDownloadingId(id);
    setTimeout(() => {
      window.open(`${getApiBaseUrl()}/api/analysis/${id}/report`, '_blank');
      setDownloadingId(null);
    }, 400);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-24 space-y-7 animate-fadeIn font-poppins relative z-10 text-[#1C1C1E]">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase block">
            {currentDate} · OFFICIAL BIOMECHANICS REPORTS & PDF ARCHIVE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight mt-0.5 flex items-center gap-2">
            Sprint Reports <FileText size={24} className="text-[#FF4F21]" />
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
        </div>
      </div>

      {fetchError && <DataFetchError error={fetchError} onRetry={fetchReports} />}

      {/* 2. SUMMARY HERO CARD */}
      <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-8 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                Official Diagnostics
              </span>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20 flex items-center gap-1">
                <CheckCircle2 size={13} /> Certified PDF Engine
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">
              Executive Biomechanical Reports
            </h2>
            <p className="text-xs text-[#636366] max-w-xl font-medium leading-relaxed">
              Export cadence, ground contact, stride, symmetry and posture analysis with benchmark levels, injury-risk flags and training recommendations for coaches and sprinters.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-4 lg:pt-0 lg:border-l border-black/[0.06] lg:pl-8">
            <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.04]">
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                Total Reports
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#1C1C1E] mt-0.5">
                {reports.length}
              </div>
              <p className="text-[10px] text-[#34C759] font-bold mt-0.5">● Ready to export</p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.04]">
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                Average Score
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#FF4F21] mt-0.5">
                {averageScore ?? '—'} {averageScore !== null && <span className="text-xs font-bold text-[#8E8E93]">pts</span>}
              </div>
              <p className="text-[10px] text-[#8E8E93] font-semibold mt-0.5">
                {scoredValues.length} scored session{scoredValues.length === 1 ? '' : 's'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.04] col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
                Best Cadence
              </span>
              <div className="text-2xl sm:text-3xl font-black text-[#1C1C1E] mt-0.5">
                {bestCadence ?? '—'} {bestCadence !== null && <span className="text-xs font-bold text-[#8E8E93]">spm</span>}
              </div>
              <p className="text-[10px] text-[#34C759] font-bold mt-0.5">Record high</p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. FILTER & SEARCH CONTROL BAR */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8E8E93]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report by ID, event (e.g. 100m) or level..."
            className="w-full bg-white border border-black/[0.06] rounded-2xl pl-11 pr-4 py-2.5 text-xs font-medium text-[#1C1C1E] placeholder:text-[#8E8E93] outline-none focus:border-[#FF4F21] shadow-2xs transition"
          />
        </div>

        {/* Filter Pills & Sorting */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-white border border-black/[0.06] p-1 rounded-2xl shadow-2xs">
            {['ALL', 'ELITE', 'HIGH', 'DEVELOPMENTAL'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                  filterLevel === lvl
                    ? 'bg-[#FF4F21] text-white shadow-2xs'
                    : 'text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/[0.02]'
                }`}
              >
                {lvl === 'ALL' ? 'All Tiers' : lvl === 'ELITE' ? 'Elite 85+' : lvl === 'HIGH' ? 'Tier 70-85' : 'Tier <70'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 bg-white border border-black/[0.06] p-1 rounded-2xl shadow-2xs">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                sortBy === 'newest'
                  ? 'bg-[#1C1C1E] text-white shadow-2xs'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('highestScore')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition cursor-pointer ${
                sortBy === 'highestScore'
                  ? 'bg-[#1C1C1E] text-white shadow-2xs'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              Top Score
            </button>
          </div>
        </div>

      </div>

      {/* 4. REPORTS LIST */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="h-44 bg-white rounded-3xl border border-black/[0.04] animate-pulse" />
          <div className="h-44 bg-white rounded-3xl border border-black/[0.04] animate-pulse" />
          <div className="h-44 bg-white rounded-3xl border border-black/[0.04] animate-pulse" />
          <div className="h-44 bg-white rounded-3xl border border-black/[0.04] animate-pulse" />
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-[28px] bg-white border border-black/[0.06] p-12 text-center shadow-xs">
          <FileText size={42} className="text-[#FF4F21] mx-auto mb-3 opacity-80" />
          <h3 className="text-lg font-black text-[#1C1C1E]">
            {reports.length === 0 ? 'No Sprint Reports Generated Yet' : 'No Reports Match Your Search'}
          </h3>
          <p className="text-xs text-[#8E8E93] font-medium mt-1 max-w-sm mx-auto">
            {reports.length === 0
              ? 'Upload a sprint video on the dashboard to compute your first certified diagnostic report.'
              : 'Try clearing your search query or switching tier filters.'}
          </p>
          {reports.length === 0 ? (
            <Link
              href="/dashboard?tab=biomechanics"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition mt-5"
            >
              <UploadCloud size={16} />
              <span>Upload Sprint Video</span>
            </Link>
          ) : (
            <button
              onClick={() => { setSearchQuery(''); setFilterLevel('ALL'); }}
              className="px-5 py-2.5 rounded-full bg-[#F8F8FA] border border-black/[0.06] text-xs font-bold text-[#1C1C1E] mt-4 hover:bg-zinc-100 transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredReports.map((r, i) => {
            const id = r.analysisId || r.id || '';
            const score = typeof r.scores?.performanceScore === 'number' ? r.scores.performanceScore : null;
            const date = r.createdAt
              ? new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
              : 'Recent Session';

            const fmt = (v: number | null | undefined, unit: string, digits = 0) =>
              typeof v === 'number' ? `${v.toFixed(digits)} ${unit}` : '—';
            const cadence = fmt(r.metrics?.cadence, 'spm');
            const contactTime = fmt(r.metrics?.gct, 'ms');
            const stride = fmt(r.metrics?.strideLength, 'm', 2);
            const symmetry = fmt(r.metrics?.symmetry, '%');

            return (
              <div
                key={id || i}
                onClick={() => id && router.push(`/analysis/${id}`)}
                className="rounded-[28px] bg-white border border-black/[0.06] p-6 shadow-xs hover:shadow-md hover:border-[#FF4F21]/30 transition-all flex flex-col justify-between group cursor-pointer"
              >
                <div>
                  
                  {/* Top Row: Session Title & Score */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-2xl bg-[#FFF5F2] text-[#FF4F21] flex items-center justify-center font-bold shadow-2xs group-hover:bg-[#FF4F21] group-hover:text-white transition-colors shrink-0">
                        <FileText size={22} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-[#1C1C1E] group-hover:text-[#FF4F21] transition-colors">
                            Sprint Diagnostic #{filteredReports.length - i}
                          </h3>
                          {r.classification?.athleteLevel && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/[0.04] text-[#636366]">
                              {r.classification.athleteLevel}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-[#8E8E93] font-semibold">
                          <Calendar size={13} />
                          <span>{date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-black text-[#FF4F21]">
                        {score ?? '—'} {score !== null && <span className="text-xs font-bold text-[#8E8E93]">pts</span>}
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        score === null
                          ? 'bg-black/[0.04] text-[#636366]'
                          : score >= 85 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {score === null ? 'Unscored' : score >= 85 ? 'Elite Tier' : 'Good Form'}
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Metric Pills */}
                  <div className="grid grid-cols-4 gap-2 pt-4 mt-4 border-t border-black/[0.04]">
                    <div className="bg-[#F8F8FA] p-2.5 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-[#8E8E93] uppercase block">Cadence</span>
                      <span className="text-xs font-black text-[#1C1C1E]">{cadence}</span>
                    </div>
                    <div className="bg-[#F8F8FA] p-2.5 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-[#8E8E93] uppercase block">Contact</span>
                      <span className="text-xs font-black text-[#1C1C1E]">{contactTime}</span>
                    </div>
                    <div className="bg-[#F8F8FA] p-2.5 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-[#8E8E93] uppercase block">Stride</span>
                      <span className="text-xs font-black text-[#1C1C1E]">{stride}</span>
                    </div>
                    <div className="bg-[#F8F8FA] p-2.5 rounded-xl text-center">
                      <span className="text-[9px] font-bold text-[#8E8E93] uppercase block">Symmetry</span>
                      <span className="text-xs font-black text-[#1C1C1E]">{symmetry}</span>
                    </div>
                  </div>

                </div>

                {/* Bottom Action Footer */}
                <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-black/[0.04]">
                  <span className="text-xs font-bold text-[#636366] group-hover:text-[#1C1C1E] transition flex items-center gap-1.5">
                    View Complete Telemetry <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDownloadPdf(e, id)}
                      disabled={downloadingId === id}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF4F21] text-white text-xs font-bold hover:bg-[#E03E12] active:scale-95 transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Download size={13} />
                      <span>{downloadingId === id ? 'Generating...' : 'Export PDF'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
