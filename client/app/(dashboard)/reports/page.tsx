'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../config/service-urls';
import { FileText, Download, Activity, Calendar, Trophy, ChevronRight } from 'lucide-react';
import Link from 'next/link';

type AnalysisRecord = {
  id?: string;
  analysisId?: string;
  status?: string;
  createdAt?: string;
  reportReady?: boolean;
  scores?: {
    performanceScore?: number;
  };
  classification?: {
    athleteLevel?: string;
  };
};

export default function ReportsPage() {
  const [reports, setReports] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/analysis/list');
        const list = res.data?.data ?? res.data ?? [];
        if (Array.isArray(list)) {
          // Only show completed ones that ideally have a report
          setReports(list.filter((a: AnalysisRecord) => a.status === 'COMPLETED'));
        }
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 w-48 bg-zinc-900 rounded-lg mb-8" />
          <div className="h-24 bg-zinc-900/50 rounded-2xl" />
          <div className="h-24 bg-zinc-900/50 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto text-white selection:bg-[#FF4F21]/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2 flex items-center gap-3 uppercase">
              <FileText className="h-6 w-6 text-[#FF4F21]" />
              Professional Reports
            </h1>
            <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Download your generated PDF biomechanics reports.</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white">{reports.length}</span>
            <p className="text-[9px] uppercase font-bold tracking-widest text-zinc-500">Available</p>
          </div>
        </div>

        {reports.length === 0 ? (
           <div className="rounded-xl border border-dashed border-white/[0.05] bg-[#08080C]/20 p-16 text-center">
             <FileText className="h-10 w-10 text-zinc-700 mx-auto mb-4" />
             <p className="text-sm font-bold text-white uppercase tracking-wider">No reports yet</p>
             <p className="text-xs text-zinc-500 mt-2">Upload a sprint video to generate your first professional report.</p>
             <Link href="/dashboard" className="inline-flex items-center gap-2 mt-5 text-xs font-bold text-[#FF4F21] hover:text-[#FF8433] uppercase tracking-wider transition">
               Go to Dashboard <ChevronRight className="h-3.5 w-3.5" />
             </Link>
           </div>
        ) : (
          <div className="grid gap-4">
            {reports.map((r, i) => {
              const id = r.analysisId || r.id || '';
              const date = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Unknown Date';
              
              return (
                <div key={id} className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-xl border border-white/[0.05] bg-[#08080C]/40 hover:bg-[#08080C]/60 hover:shadow-[0_4px_20px_rgba(0,0,0,0.4)] transition-all duration-300">
                  
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-xl bg-zinc-900/60 flex items-center justify-center border border-white/[0.05]">
                      <FileText className="h-6 w-6 text-zinc-400" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white mb-1.5 tracking-wider uppercase">Biomechanics Report #{reports.length - i}</h3>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-zinc-400" /> {date}</span>
                        <span className="flex items-center gap-1.5"><Activity className="h-3 w-3 text-[#FF4F21]" /> Score: {r.scores?.performanceScore || 'N/A'}</span>
                        {r.classification?.athleteLevel && (
                          <span className="flex items-center gap-1.5"><Trophy className="h-3 w-3 text-amber-400" /> {r.classification.athleteLevel}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {r.reportReady ? (
                      <a
                        href={`${getApiBaseUrl()}/api/analysis/${id}/report`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 shadow-md uppercase tracking-wider"
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </a>
                    ) : (
                      <button disabled className="flex items-center gap-2 bg-zinc-900 text-zinc-500 px-5 py-2.5 rounded-xl text-xs font-bold cursor-not-allowed border border-white/[0.05] uppercase tracking-wider">
                        Pending Generation
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
