'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';

const SECTIONS = [
  {
    title: 'Setup Protocol',
    items: [
      { name: 'Basic Info', path: '/onboarding/basic-info' },
      { name: 'Classification', path: '/onboarding/classification' },
      { name: 'Body Metrics', path: '/onboarding/body-metrics' },
      { name: 'Training Profile', path: '/onboarding/training-profile' },
      { name: 'Goals', path: '/onboarding/goals' },
      { name: 'Injury History', path: '/onboarding/injury-history' },
      { name: 'Consent', path: '/onboarding/consent' },
    ],
  },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (!loading && user?.onboardingCompleted && !pathname.endsWith('/completed')) {
      router.push('/dashboard');
      return;
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    const allItems = SECTIONS[0].items;
    const idx = allItems.findIndex((s) => pathname.startsWith(s.path));
    if (idx !== -1) {
      setCurrentStepIndex(idx);
    }
  }, [pathname]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FFFFFF] text-zinc-900 font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-[#FF4F21] border-t-transparent"></div>
          <span className="text-sm font-semibold text-zinc-500">Loading your profile...</span>
        </div>
      </div>
    );
  }

  const totalSteps = SECTIONS[0].items.length;
  const isCompletedPage = pathname.endsWith('/completed');
  const stepName = SECTIONS[0].items[currentStepIndex]?.name || '';

  const handleBack = () => {
    if (currentStepIndex === 0) {
      router.push('/login');
    } else {
      router.push(SECTIONS[0].items[currentStepIndex - 1].path);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FFFFFF] flex flex-col items-center justify-center font-sans antialiased text-zinc-900">
      {/* 440px Container matching Login & Sign Up */}
      <div
        className="relative w-full max-w-[440px] min-h-screen bg-[#FFFFFF] flex flex-col justify-between px-6"
        style={{
          boxSizing: 'border-box',
          paddingTop: 'max(2rem, calc(env(safe-area-inset-top) + 0.75rem))',
          paddingBottom: 'max(2rem, calc(env(safe-area-inset-bottom) + 0.75rem))',
        }}
      >
        {/* Athletic Status Header */}
        {!isCompletedPage && (
          <div className="w-full select-none pb-3">
            
            {/* Top Row: Back button, ATHLIXIR logo in Agale font, Step badge */}
            <div className="flex items-center justify-between pt-1 pb-3">
              <button
                type="button"
                onClick={handleBack}
                className="h-9 w-9 rounded-full bg-[#FAFAFA] border border-[#EFEFEF] hover:bg-zinc-100 flex items-center justify-center text-zinc-600 active:scale-95 transition cursor-pointer"
                aria-label="Back"
              >
                <ArrowLeft className="h-4 w-4 text-[#6E6D6D]" />
              </button>

              <span
                style={{
                  fontFamily: "'Agale DEMO', 'Mazzard', sans-serif",
                  fontWeight: 700,
                  fontSize: '22px',
                  letterSpacing: '0.08em',
                  color: '#FF4F21',
                }}
              >
                ATHLIXIR
              </span>

              {/* Status Badge */}
              <div
                style={{
                  boxSizing: 'border-box',
                  backgroundColor: '#FFF8F5',
                  border: '1px solid #FFE6DC',
                  borderRadius: '16px',
                  padding: '4px 10px',
                  fontFamily: "'Mazzard', sans-serif",
                  fontWeight: 600,
                  fontSize: '11px',
                  color: '#FF4F21',
                }}
              >
                Step {currentStepIndex + 1}/{totalSteps}
              </div>
            </div>

            {/* Segmented Progress Bar (7 Segments) */}
            <div className="grid grid-cols-7 gap-1.5 pt-1">
              {Array.from({ length: totalSteps }).map((_, idx) => {
                const isPast = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                return (
                  <div
                    key={`step-segment-${idx}`}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor: isPast
                        ? '#FF4F21'
                        : isCurrent
                        ? '#FF4F21'
                        : '#EBEBEB',
                      boxShadow: isCurrent ? '0px 0px 8px rgba(255, 79, 33, 0.45)' : 'none',
                    }}
                  />
                );
              })}
            </div>

            {/* Step Label Bar */}
            <div className="flex justify-between items-center mt-2.5 px-0.5">
              <div className="flex items-center gap-1.5">
                <span
                  style={{
                    fontFamily: "'Mazzard', sans-serif",
                    fontWeight: 600,
                    fontSize: '12px',
                    color: '#1D1B20',
                  }}
                >
                  {stepName}
                </span>
              </div>
              <span
                style={{
                  fontFamily: "'Mazzard', sans-serif",
                  fontSize: '11px',
                  color: '#8C8C8C',
                  fontWeight: 500,
                }}
              >
                {Math.round(((currentStepIndex + 1) / totalSteps) * 100)}% Complete
              </span>
            </div>
          </div>
        )}

        {/* Step Body Content */}
        <main className="flex-1 flex flex-col justify-center">
          {children}
        </main>
      </div>
    </div>
  );
}
