'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error('Dashboard boundary caught error:', error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 min-h-[70vh] relative">
      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-[#FF4F21]/5 blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-black/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.06)] text-center relative overflow-hidden group">
        {/* Animated accent gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#FF4F21]/20 via-[#FF4F21] to-[#FF4F21]/20" />

        <div className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center bg-red-50 border border-red-100 text-red-500 mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300">
          <AlertOctagon className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">
          Biomechanics Pipeline Interrupted
        </h2>
        
        <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
          The dashboard encountered an unexpected telemetry rendering error. Try refreshing the segment or return to your dashboard.
        </p>

        {error.message && (
          <div className="mb-8 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/70 text-left text-xs font-mono text-zinc-600 max-h-28 overflow-y-auto break-all">
            <span className="text-red-500 font-semibold">Error:</span> {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-[#FF4F21] hover:bg-[#FF4F21]/90 text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-sm hover:shadow active:scale-[0.98]"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Section
          </button>
          
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-200 text-zinc-700 font-medium text-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Home Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
