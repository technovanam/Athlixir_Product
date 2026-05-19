'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function OnboardingIndexPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;

    async function resumeOnboarding() {
      try {
        const response = await api.get('/onboarding/status');
        const nextStep = response.data?.data?.currentStep || 'basic-info';
        router.replace(`/onboarding/${nextStep}`);
      } catch (err) {
        // Fallback to basic-info if any error occurs
        router.replace('/onboarding/basic-info');
      }
    }
    resumeOnboarding();
  }, [router, user, loading]);

  return (
    <div className="flex h-[400px] flex-col items-center justify-center text-white bg-zinc-950/20">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <p className="text-sm font-medium tracking-wider text-zinc-400">Resuming active onboarding state...</p>
      </div>
    </div>
  );
}
