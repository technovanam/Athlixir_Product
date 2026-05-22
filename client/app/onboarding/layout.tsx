'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { User, Activity, Ruler, BarChart2, Target, Heart, CheckCircle2, ChevronRight, LogOut } from 'lucide-react';

const STEPS = [
  { path: '/onboarding/basic-info', label: 'Info', icon: User },
  { path: '/onboarding/classification', label: 'Class', icon: Activity },
  { path: '/onboarding/body-metrics', label: 'Body', icon: Ruler },
  { path: '/onboarding/training-profile', label: 'Train', icon: BarChart2 },
  { path: '/onboarding/goals', label: 'Goals', icon: Target },
  { path: '/onboarding/injury-history', label: 'Health', icon: Heart },
  { path: '/onboarding/consent', label: 'Confirm', icon: CheckCircle2 },
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
  }, [user, loading, router]);

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

  return (
    <div className="relative flex min-h-screen flex-col bg-[#08080C] text-white selection:bg-[#FF4F21]/30 selection:text-white overflow-x-hidden">
      {/* Carbon fiber subtle pattern texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      {/* Background neon blurs */}
      <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-[#FF4F21]/5 blur-[150px] pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full bg-[#FF8433]/3 blur-[150px] pointer-events-none"></div>

      {/* Modern Header */}
      <header className="relative z-10 border-b border-white/[0.05] bg-[#08080C]/40 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center font-bold text-sm tracking-wider shadow-lg shadow-[#FF4F21]/20 text-white">
              Α
            </div>
            <span className="font-extrabold tracking-wider text-xs uppercase text-zinc-200">ATHLIXIR</span>
            <span className="text-[10px] bg-white/[0.02] border border-white/[0.05] text-zinc-400 px-2.5 py-0.5 rounded-lg font-bold uppercase tracking-wider">Athlete Setup</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wide">{user.username || 'Athlete'}</span>
              <span className="text-[10px] text-zinc-500 font-medium">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/[0.05] bg-[#08080C]/40 text-zinc-400 hover:text-[#FF4F21] hover:border-[#FF4F21]/20 hover:bg-[#FF4F21]/5 hover:shadow-[0_0_15px_rgba(255,79,33,0.1)] transition-all duration-300 text-xs cursor-pointer font-bold uppercase tracking-wider"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-start px-4 py-8 md:py-12">
        <div className="w-full max-w-4xl">
          
          {/* Custom Stepper Wizard */}
          <div className="mb-10 rounded-2xl border border-white/[0.05] bg-[#08080C]/40 p-5 backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),0_10px_30px_rgba(0,0,0,0.6)]">
            <div className="flex justify-between items-center mb-5 px-1">
              <span className="text-[10px] font-black text-[#FF4F21] tracking-widest uppercase">Onboarding Setup Progress</span>
              <span className="text-[10px] font-black text-zinc-400 tracking-wider">{progressPercent}% Completed</span>
            </div>

            {/* Stepper bar */}
            <div className="relative flex justify-between items-center px-4">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/[0.03] -translate-y-1/2 z-0"></div>
              <div
                className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-[#FF4F21] to-[#FF8433] -translate-y-1/2 z-0 transition-all duration-500 shadow-[0_0_8px_rgba(255,79,33,0.5)]"
                style={{ width: `${(currentStepIndex / (STEPS.length - 1)) * 100}%` }}
              ></div>

              {STEPS.map((s, idx) => {
                const StepIcon = s.icon;
                const isPassed = idx < currentStepIndex;
                const isActive = idx === currentStepIndex;

                return (
                  <div key={s.path} className="relative z-10 flex flex-col items-center">
                    <button
                      disabled
                      className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                        isPassed
                          ? 'border-[#FF4F21] bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] text-white shadow-lg shadow-[#FF4F21]/20 scale-105'
                          : isActive
                          ? 'border-[#FF4F21] bg-black text-[#FF4F21] shadow-[0_0_20px_rgba(255,79,33,0.4)] ring-4 ring-[#FF4F21]/20 scale-110'
                          : 'border-white/[0.05] bg-zinc-950 text-zinc-600'
                      }`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </button>
                    <span
                      className={`hidden md:block text-[9px] font-black uppercase tracking-widest mt-2 transition-all ${
                        isActive ? 'text-[#FF4F21]' : isPassed ? 'text-zinc-400' : 'text-zinc-600'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stepped Child Route Renders */}
          <div className="rounded-3xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden min-h-[460px] hover:border-white/[0.08] transition duration-300">
            {children}
          </div>

        </div>
      </main>
    </div>
  );
}
