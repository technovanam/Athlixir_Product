'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { User, Activity, Ruler, BarChart2, Target, Heart, CheckCircle2, ArrowLeft, LogOut } from 'lucide-react';

const STEPS = [
  { path: '/onboarding/basic-info', label: 'Identity Info', icon: User },
  { path: '/onboarding/classification', label: 'Classification', icon: Activity },
  { path: '/onboarding/body-metrics', label: 'Body Metrics', icon: Ruler },
  { path: '/onboarding/training-profile', label: 'Training Profile', icon: BarChart2 },
  { path: '/onboarding/goals', label: 'Primary Goals', icon: Target },
  { path: '/onboarding/injury-history', label: 'Injury & Health', icon: Heart },
  { path: '/onboarding/consent', label: 'Final Consent', icon: CheckCircle2 },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // Session Guard: If not loading and no user, send to login
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // If user has already completed onboarding, send them straight to dashboard, EXCEPT on the completed page!
    if (!loading && user?.onboardingCompleted && !pathname.endsWith('/completed')) {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    const idx = STEPS.findIndex((s) => pathname.startsWith(s.path));
    if (idx !== -1) {
      setCurrentStepIndex(idx);
    }
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FF4F21] border-t-transparent"></div>
          <span className="text-sm font-semibold tracking-wider text-zinc-400">Loading Athlete Session...</span>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  // If we are on the onboarding completed page, we may want to adjust sidebar or render standard, let's keep it consistent
  const isCompletedPage = pathname.endsWith('/completed');

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row bg-[#08080C] text-white selection:bg-[#FF4F21]/30 selection:text-white overflow-hidden">
      {/* Carbon fiber subtle pattern texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      {/* Background neon blurs */}
      <div className="absolute top-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-[#FF4F21]/5 blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-[#FF8433]/3 blur-[140px] pointer-events-none"></div>

      {/* Sidebar Progress Panel */}
      <aside className="relative z-20 w-full md:w-[320px] bg-[#08080C]/60 border-b md:border-b-0 md:border-r border-white/[0.05] p-6 md:p-8 flex flex-col justify-between backdrop-blur-md shrink-0">
        <div className="space-y-8">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center font-bold text-sm tracking-wider shadow-lg shadow-[#FF4F21]/20 text-white">
                Α
              </div>
              <div>
                <span className="block font-black tracking-wider text-xs uppercase text-white">ATHLIXIR</span>
                <span className="block text-[8px] font-black tracking-widest text-[#FF4F21] uppercase">SETUP PROTOCOL</span>
              </div>
            </div>
          </div>

          {/* Sleek Navigation Back Button */}
          <div>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:text-white hover:border-[#FF4F21]/25 hover:bg-[#FF4F21]/5 hover:shadow-[0_0_15px_rgba(255,79,33,0.08)] transition-all duration-300 text-[10px] font-black uppercase tracking-widest cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-[#FF4F21]" />
              <span>Back to Sign In</span>
            </button>
          </div>

          {/* Stepper Wizard Progress Timeline */}
          {!isCompletedPage && (
            <nav className="relative flex flex-col gap-6 pl-2">
              {/* Vertical connector line in background */}
              <div className="absolute left-[17px] top-4 bottom-4 w-0.5 bg-white/[0.04] z-0"></div>
              <div
                className="absolute left-[17px] top-4 w-0.5 bg-gradient-to-b from-[#FF4F21] to-[#FF8433] z-0 transition-all duration-500 shadow-[0_0_8px_rgba(255,79,33,0.5)]"
                style={{
                  height: `${(currentStepIndex / (STEPS.length - 1)) * 100}%`,
                  maxHeight: 'calc(100% - 32px)'
                }}
              ></div>

              {STEPS.map((s, idx) => {
                const StepIcon = s.icon;
                const isPassed = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;

                return (
                  <div key={s.path} className="relative z-10 flex items-center gap-4 group">
                    <button
                      disabled
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                        isPassed
                          ? 'border-[#FF4F21] bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] text-white shadow-lg shadow-[#FF4F21]/20 scale-105'
                          : isActive
                          ? 'border-[#FF4F21] bg-[#08080C] text-[#FF4F21] shadow-[0_0_20px_rgba(255,79,33,0.3)] ring-4 ring-[#FF4F21]/15 scale-110'
                          : 'border-white/[0.05] bg-zinc-950 text-zinc-600'
                      }`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </button>
                    <div className="flex flex-col">
                      <span className={`text-[8px] font-black uppercase tracking-widest transition-all ${
                        isActive ? 'text-[#FF4F21]' : isPassed ? 'text-zinc-500' : 'text-zinc-600'
                      }`}>
                        Step 0{idx + 1}
                      </span>
                      <span className={`text-xs font-black uppercase tracking-wider transition-all ${
                        isActive ? 'text-white' : isPassed ? 'text-zinc-300' : 'text-zinc-500'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </nav>
          )}
        </div>

        {/* User Info / Overall Percentage Progress */}
        <div className="mt-8 rounded-2xl border border-white/[0.05] bg-white/[0.01] p-4">
          <span className="block text-[8px] font-black uppercase tracking-widest text-zinc-500 mb-2">Onboarding Progress</span>
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-400 truncate max-w-[140px] uppercase text-[10px] tracking-wider">{user.username || 'Athlete'}</span>
            <span className="text-[#FF4F21] text-[10px] font-black tracking-widest">{isCompletedPage ? '100%' : `${progressPercent}%`}</span>
          </div>
          <div className="mt-2.5 h-1 w-full bg-white/[0.03] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF4F21] to-[#FF8433] transition-all duration-500"
              style={{ width: `${isCompletedPage ? 100 : progressPercent}%` }}
            />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col justify-start items-center p-4 sm:p-8 md:p-12 overflow-y-auto h-screen">
        <div className="w-full max-w-4xl my-auto">
          {/* Stepped Child Route Renders */}
          <div className="rounded-3xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden min-h-[460px] hover:border-white/[0.08] transition duration-300">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
