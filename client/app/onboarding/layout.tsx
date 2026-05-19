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
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-violet-500 border-t-transparent"></div>
          <span className="text-sm font-semibold tracking-wider text-zinc-400">Loading Athlete Session...</span>
        </div>
      </div>
    );
  }

  const progressPercent = Math.round(((currentStepIndex + 1) / STEPS.length) * 100);

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white selection:bg-violet-500/30 overflow-x-hidden">
      {/* Background neon blurs */}
      <div className="absolute -top-40 right-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[150px] pointer-events-none"></div>

      {/* Modern Header */}
      <header className="relative z-10 border-b border-zinc-900 bg-zinc-950/40 px-6 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-sm tracking-wider shadow-lg shadow-violet-500/10">
              Α
            </div>
            <span className="font-extrabold tracking-wider text-xs uppercase text-zinc-200">ATHLIXIR</span>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full border border-zinc-700/50">Athlete Setup</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end text-right">
              <span className="text-xs font-semibold text-zinc-300">{user.username || 'Athlete'}</span>
              <span className="text-[10px] text-zinc-500">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/30 text-zinc-400 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition duration-200 text-xs cursor-pointer font-medium"
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
          <div className="mb-10 rounded-2xl border border-zinc-900 bg-zinc-950/40 p-4 backdrop-blur-xl shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-violet-400 tracking-wider uppercase">Onboarding Setup Progress</span>
              <span className="text-xs font-bold text-zinc-400">{progressPercent}% Completed</span>
            </div>

            {/* Stepper bar */}
            <div className="relative flex justify-between items-center px-2">
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-zinc-800 -translate-y-1/2 z-0"></div>
              <div
                className="absolute left-0 top-1/2 h-0.5 bg-gradient-to-r from-violet-600 to-indigo-500 -translate-y-1/2 z-0 transition-all duration-500"
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
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300 ${
                        isPassed
                          ? 'border-violet-500 bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                          : isActive
                          ? 'border-violet-400 bg-black text-violet-400 ring-4 ring-violet-500/10'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                      }`}
                    >
                      <StepIcon className="h-3.5 w-3.5" />
                    </button>
                    <span
                      className={`hidden md:block text-[10px] font-semibold uppercase tracking-wider mt-1.5 transition-all ${
                        isActive ? 'text-violet-400 font-bold' : isPassed ? 'text-zinc-400' : 'text-zinc-600'
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
          <div className="rounded-3xl border border-zinc-900 bg-zinc-950/20 shadow-2xl backdrop-blur-3xl overflow-hidden min-h-[460px]">
            {children}
          </div>

        </div>
      </main>
    </div>
  );
}
