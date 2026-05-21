'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import BiomechanicsPanel from './BiomechanicsPanel';
import { LogOut, Activity, RefreshCcw, Clock, User, FileText, Lightbulb, Settings } from 'lucide-react';

function DashboardPageContent() {
  const { user, logout, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'history'>('upload');

  // We load fresh user data if needed
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshUser();
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF4F21]/30 flex flex-col md:flex-row">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-800/80 bg-zinc-950 p-6 relative z-10">
        <div className="flex-1 space-y-8">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center font-bold shadow-lg shadow-[#FF4F21]/25">
              A
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-wider text-sm text-white leading-tight">ATHLIXIR</span>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Workspace Enterprise</span>
            </div>
          </div>
 
          {/* Navigation Links */}
          <nav className="space-y-1.5 flex-1">
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-3 px-2">Core</div>
            <Link href="/dashboard" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-[#FF4F21]/10 text-[#FF4F21] border border-[#FF4F21]/20">
              <Activity className="h-4 w-4" />
              <span>AI Biomechanics</span>
            </Link>
            <Link href="/dashboard/history" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition">
              <Clock className="h-4 w-4" />
              <span>Analysis History</span>
            </Link>
            <Link href="/dashboard/athlete/profile" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition">
              <User className="h-4 w-4" />
              <span>Athlete Profile</span>
            </Link>
            
            <div className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-6 mb-3 px-2">Intelligence</div>
            <Link href="/dashboard/reports" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition">
              <FileText className="h-4 w-4" />
              <span>Professional Reports</span>
            </Link>
            <Link href="/dashboard/recommendations" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition">
              <Lightbulb className="h-4 w-4" />
              <span>Recommendations</span>
            </Link>
          </nav>

          <nav className="space-y-1.5 mt-auto pt-4">
            <Link href="/dashboard/settings" className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:text-white hover:bg-zinc-900/60 transition">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
          </nav>
        </div>
 
        {/* User context footer */}
        <div className="border-t border-zinc-800/80 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-[#FF4F21] uppercase border border-zinc-700">
              {user?.username?.substring(0, 2) || 'US'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-white truncate">{user?.username}</span>
              <span className="text-[10px] text-zinc-500 truncate">{user?.email}</span>
            </div>
          </div>
 
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 py-2.5 text-xs font-semibold text-zinc-400 hover:text-red-400 transition duration-200 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
 
      {/* DASHBOARD CONTENT DASHBOARD */}
      <main className="flex-1 overflow-y-auto px-10 py-12 relative">
        {/* Background Neon Blurs */}
        <div className="absolute top-0 right-1/4 h-[350px] w-[350px] rounded-full bg-[#FF4F21]/5 blur-[100px] pointer-events-none"></div>
        
        {/* TOP STATUS BAR */}
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Running Biomechanics
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Upload video, view skeleton overlay, and core metrics.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer"
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Profile</span>
          </button>
        </div>

        {/* TAB RENDERING */}
        <div className="relative z-10 space-y-8">
          <BiomechanicsPanel />
        </div>
      </main>

    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-zinc-400 text-sm">
      Loading dashboard…
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
