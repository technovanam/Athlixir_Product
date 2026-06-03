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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-red-600/10 blur-[120px] pointer-events-none -z-10 animate-pulse" />

      <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-950/60 border border-red-500/20 backdrop-blur-xl shadow-[0_20px_50px_rgba(255,0,0,0.05)] text-center relative overflow-hidden group">
        {/* Animated accent gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/20 via-red-500 to-red-500/20" />

        <div className="mx-auto w-14 h-14 rounded-xl flex items-center justify-center bg-red-500/10 border border-red-500/20 text-red-500 mb-6 shadow-[0_0_15px_rgba(239,68,68,0.1)] group-hover:scale-110 transition-transform duration-300">
          <AlertOctagon className="h-7 w-7" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          Biomechanics Pipeline Interrupted
        </h2>
        
        <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
          The dashboard encountered an unexpected telemetry rendering error. Try refreshing the segment or return to your dashboard.
        </p>

        {error.message && (
          <div className="mb-8 p-3 rounded-lg bg-zinc-900/40 border border-white/[0.03] text-left text-xs font-mono text-zinc-500 max-h-28 overflow-y-auto break-all scrollbar-thin scrollbar-thumb-zinc-800">
            <span className="text-red-400 font-semibold">Error:</span> {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-[#FF4F21] hover:bg-[#FF4F21]/90 text-white font-medium text-sm transition-all duration-200 cursor-pointer shadow-[0_4px_12px_rgba(255,79,33,0.2)] hover:shadow-[0_4px_20px_rgba(255,79,33,0.3)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <RotateCcw className="h-4 w-4" />
            Retry Section
          </button>
          
          <Link
            href="/dashboard"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-zinc-900 border border-white/[0.05] hover:border-zinc-800 hover:bg-zinc-900/80 text-zinc-300 hover:text-white font-medium text-sm transition-all duration-200 cursor-pointer"
          >
            <Home className="h-4 w-4" />
            Home Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
