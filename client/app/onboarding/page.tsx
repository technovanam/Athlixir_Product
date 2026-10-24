'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, useAuth } from '../context/AuthContext';
import { getOnboardingCurrentStep } from '../utils/api';
import { Loader2 } from 'lucide-react';

export default function OnboardingIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;

    async function resumeOnboarding() {
      try {
        const response = await api.get('/onboarding/status');
        const nextStep = getOnboardingCurrentStep(response);
        router.replace(`/onboarding/${nextStep}`);
      } catch (err) {
        // Fallback to basic-info if any error occurs
        router.replace('/onboarding/basic-info');
      }
    }
    resumeOnboarding();
  }, [router, user, loading]);

  return (
    <div className="flex h-[400px] flex-col items-center justify-center text-zinc-900 bg-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF4F21]" />
        <p className="text-sm font-medium tracking-wide text-zinc-500">Resuming your setup...</p>
      </div>
    </div>
  );
}
