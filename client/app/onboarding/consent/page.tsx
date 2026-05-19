'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, useAuth } from '../../context/AuthContext';
import { CheckCircle2, Loader2, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

export default function ConsentStep() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [aiAnalysisConsent, setAiAnalysisConsent] = useState(false);
  const [dataStorageConsent, setDataStorageConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted || !aiAnalysisConsent || !dataStorageConsent) {
      setError('Please acknowledge and agree to all legal, storage, and analytical consent statements.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Submit consent details DTO
      await api.post('/onboarding/consent', {
        termsAccepted,
        aiAnalysisConsent,
        dataStorageConsent,
      });

      // 2. Trigger completion finalizers (synchronizes collection flags and main users model)
      await api.post('/onboarding/complete');

      // 3. Force token refresh or user context sync to update route auth checks instantly
      await refreshUser();

      // 4. Redirect to congratulations completion view
      router.push('/onboarding/completed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete consent registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-violet-500" />
          <span>Step 7: Legal Consent & Data Policy</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Athlixir prioritizes physical protection protocols. Review our analytical algorithms and secure Cloud Firestore storage agreements.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          
          {/* Terms Acceptance */}
          <label className={`flex items-start gap-4 p-4 rounded-xl border transition duration-200 outline-none cursor-pointer ${
            termsAccepted ? 'border-violet-500/40 bg-violet-600/5' : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
          }`}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-800 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600 bg-zinc-950"
            />
            <div className="space-y-1">
              <span className="block text-xs font-bold text-white">Terms of Service & Privacy Agreements</span>
              <span className="block text-[10px] text-zinc-500 leading-relaxed">
                I have read and agree to be bound by the Athlixir Terms of Use, Privacy Policy, and local compliance standards.
              </span>
            </div>
          </label>

          {/* AI Analysis Consent */}
          <label className={`flex items-start gap-4 p-4 rounded-xl border transition duration-200 outline-none cursor-pointer ${
            aiAnalysisConsent ? 'border-violet-500/40 bg-violet-600/5' : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
          }`}>
            <input
              type="checkbox"
              checked={aiAnalysisConsent}
              onChange={(e) => setAiAnalysisConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-800 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600 bg-zinc-950"
            />
            <div className="space-y-1">
              <span className="block text-xs font-bold text-white">AI Metric Analysis Consent</span>
              <span className="block text-[10px] text-zinc-500 leading-relaxed">
                I authorize Athlixir performance engines to compute AI-driven scoring benchmarks, injury risks, and stride metrics.
              </span>
            </div>
          </label>

          {/* Data Storage Consent */}
          <label className={`flex items-start gap-4 p-4 rounded-xl border transition duration-200 outline-none cursor-pointer ${
            dataStorageConsent ? 'border-violet-500/40 bg-violet-600/5' : 'border-zinc-900 bg-zinc-950/20 hover:border-zinc-800'
          }`}>
            <input
              type="checkbox"
              checked={dataStorageConsent}
              onChange={(e) => setDataStorageConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-zinc-800 text-violet-600 focus:ring-violet-500 cursor-pointer accent-violet-600 bg-zinc-950"
            />
            <div className="space-y-1">
              <span className="block text-xs font-bold text-white">Secure Data Storage Consent</span>
              <span className="block text-[10px] text-zinc-500 leading-relaxed">
                I agree to let Athlixir securely persist all my physiological variables inside Google Firestore database servers.
              </span>
            </div>
          </label>

        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-zinc-900">
          <button
            type="button"
            onClick={() => router.push('/onboarding/injury-history')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-white transition duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Finalizing Suite setup...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
