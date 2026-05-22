'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  Activity, 
  Ruler, 
  BarChart2, 
  Target, 
  Heart, 
  CheckCircle2, 
  Compass, 
  LogOut 
} from 'lucide-react';

const SECTIONS = [
  {
    title: 'Setup Protocol',
    items: [
      { name: 'Identity Info', path: '/onboarding/basic-info', icon: User },
      { name: 'Classification', path: '/onboarding/classification', icon: Activity },
      { name: 'Body Metrics', path: '/onboarding/body-metrics', icon: Ruler },
      { name: 'Training Profile', path: '/onboarding/training-profile', icon: BarChart2 },
      { name: 'Primary Goals', path: '/onboarding/goals', icon: Target },
      { name: 'Injury & Health', path: '/onboarding/injury-history', icon: Heart },
      { name: 'Final Consent', path: '/onboarding/consent', icon: CheckCircle2 },
    ],
  },
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
    // Determine current active index based on path matching
    const allItems = SECTIONS[0].items;
    const idx = allItems.findIndex((s) => pathname.startsWith(s.path));
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

  const progressPercent = Math.round(((currentStepIndex + 1) / SECTIONS[0].items.length) * 100);
  const isCompletedPage = pathname.endsWith('/completed');
  const athleteName = user?.name || user?.username || 'Athlete';
  const tier = user?.classification?.athleteLevel || 'Active Athlete';

  return (
    <div className="relative flex min-h-screen flex-col md:flex-row bg-black text-white selection:bg-[#FF4F21]/30 selection:text-white overflow-hidden">
      {/* Carbon fiber subtle pattern texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      {/* Background neon blurs */}
      <div className="absolute top-1/4 right-1/4 h-[600px] w-[600px] rounded-full bg-[#FF4F21]/5 blur-[160px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 left-1/3 h-[500px] w-[500px] rounded-full bg-[#FF8433]/3 blur-[140px] pointer-events-none"></div>

      {/* Sidebar Progress Panel (Matching Dashboard Sidebar styles) */}
      <aside className="relative z-20 w-full md:w-[250px] bg-[#08080C] border-b md:border-b-0 md:border-r border-zinc-900/80 flex flex-col justify-between shrink-0 print:hidden">
        <div>
          {/* Sidebar Header */}
          <div className="h-16 flex items-center border-b border-zinc-900/80 px-[14px]">
            <div className="flex items-center font-semibold text-base tracking-tight text-white select-none w-full min-w-0">
              <div className="w-12 h-9 flex items-center justify-center shrink-0">
                <div className="h-9 w-9 rounded-xl bg-zinc-900/80 border border-white/[0.08] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group/logo cursor-pointer transition-all hover:border-[#FF4F21]/30 shrink-0">
                  <Compass className="h-5 w-5 text-white transition-all duration-300 group-hover/logo:text-[#FF4F21] group-hover/logo:rotate-45" />
                </div>
              </div>
              
              <div className="flex flex-col min-w-0 overflow-hidden whitespace-nowrap ml-2">
                <span className="font-bold text-sm tracking-tight text-white leading-tight">
                  Athlixir<span className="text-[#FF4F21]">.</span>
                </span>
                <span className="text-[8px] font-bold text-zinc-500 tracking-[0.25em] uppercase leading-none mt-1 truncate">
                  Athlete Setup
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Timeline Progress */}
          {!isCompletedPage && (
            <nav className="p-3 space-y-4 mt-4">
              {SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  {/* Section header */}
                  <div className="relative h-6 flex items-center px-3.5 mb-1">
                    <h3 className="text-[9px] font-bold text-zinc-500 tracking-[0.25em] uppercase select-none whitespace-nowrap overflow-hidden">
                      {section.title}
                    </h3>
                  </div>

                  {/* Section items */}
                  <div className="space-y-1">
                    {section.items.map((item, idx) => {
                      const isActive = idx === currentStepIndex;
                      const isPassed = idx < currentStepIndex;
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.name}
                          className={`relative flex items-center h-10 rounded-xl overflow-hidden transition duration-200 ${
                            isActive 
                              ? 'bg-white/[0.02] border border-white/[0.04]' 
                              : 'border border-transparent'
                          }`}
                        >
                          {/* Active line indicator */}
                          {isActive && (
                            <div className="absolute left-0 top-[25%] bottom-[25%] w-[3px] rounded-r bg-[#FF4F21] shadow-[0_0_8px_rgba(255,79,33,0.6)]" />
                          )}

                          <div className="relative flex items-center w-full pl-[2px]">
                            {/* Fixed width container for icon */}
                            <div className="w-12 h-9 flex items-center justify-center shrink-0">
                              {isPassed ? (
                                <div className="h-5 w-5 rounded-full bg-[#FF4F21]/10 border border-[#FF4F21]/30 flex items-center justify-center text-[#FF4F21] shadow-[0_0_8px_rgba(255,79,33,0.2)]">
                                  <CheckCircle2 className="h-3 w-3" />
                                </div>
                              ) : (
                                <Icon className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 ${
                                  isActive ? 'text-[#FF4F21]' : 'text-zinc-650'
                                }`} />
                              )}
                            </div>
                            
                            <span className={`text-xs font-semibold whitespace-nowrap overflow-hidden tracking-wide transition duration-200 ${
                              isActive ? 'text-white' : isPassed ? 'text-zinc-400 font-medium' : 'text-zinc-600 font-medium'
                            }`}>
                              {item.name}
                            </span>

                            {/* Optional Active Badge */}
                            {isActive && (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#FF4F21]/10 text-[#FF4F21] border border-[#FF4F21]/20 tracking-wider shrink-0 overflow-hidden whitespace-nowrap ml-auto mr-2">
                                ACTIVE
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          )}
        </div>

        {/* Footer Area: Progress & User Info */}
        <div className="mt-auto space-y-4">
          
          {/* Progress bar details */}
          <div className="px-[18px]">
            <div className="flex justify-between items-center text-[8px] font-black tracking-[0.2em] text-zinc-500 uppercase mb-1.5">
              <span>Setup Progress</span>
              <span className="text-[#FF4F21] font-black tracking-normal">{isCompletedPage ? '100%' : `${progressPercent}%`}</span>
            </div>
            <div className="h-[3px] w-full bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#FF4F21] to-[#FF8433] transition-all duration-500"
                style={{ width: `${isCompletedPage ? 100 : progressPercent}%` }}
              />
            </div>
          </div>

          {/* User Profile Footer Section (Matching Dashboard) */}
          <div className="p-[14px] border-t border-zinc-900/60 bg-zinc-950/20 backdrop-blur-sm">
            <div className="flex items-center min-w-0 w-full justify-between">
              <div className="flex items-center min-w-0">
                {/* Avatar Container wrapper */}
                <div className="w-12 h-9 flex items-center justify-center shrink-0">
                  <div className="relative shrink-0">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#FF4F21]/20 to-[#FF8433]/20 border border-[#FF4F21]/30 flex items-center justify-center font-bold text-sm text-[#FF4F21] shadow-md transition-all select-none">
                      {athleteName.charAt(0).toUpperCase()}
                    </div>
                    {/* Active Online indicator */}
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#00DF89] border-2 border-[#0B0B0F] shadow-[0_0_8px_#00DF89]" />
                  </div>
                </div>
                
                {/* User Info (Smooth Sliding) */}
                <div className="flex flex-col min-w-0 overflow-hidden whitespace-nowrap ml-2">
                  <span className="text-xs font-semibold text-zinc-200 truncate leading-tight">
                    {athleteName}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1 truncate">
                    {tier}
                  </span>
                </div>
              </div>
            </div>
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
