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
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn relative">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-wider text-white flex items-center gap-2 uppercase crt-glow-white">
          <ShieldCheck className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 7: Legal Consent & Data Policy</span>
        </h2>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Athlixir prioritizes physical protection protocols. Review our analytical algorithms and secure Cloud Firestore storage agreements.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[11px] text-red-400 animate-fadeIn">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <div>
            <span className="font-bold text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase shrink-0 mr-2">FAIL</span>
            {error}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          
          {/* Terms Acceptance */}
          <label className={`flex items-start gap-4 p-4 rounded-xl border transition duration-305 outline-none cursor-pointer ${
            termsAccepted 
              ? 'border-[#FF4F21]/40 bg-[#FF4F21]/5 shadow-[0_0_15px_rgba(255,79,33,0.1)]' 
              : 'border-white/[0.05] bg-black/40 hover:bg-[#08080C]/60 hover:border-white/[0.08]'
          }`}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/[0.08] text-[#FF4F21] focus:ring-[#FF4F21]/30 focus:ring-offset-0 cursor-pointer accent-[#FF4F21] bg-black/40 transition duration-200"
            />
            <div className="space-y-1">
              <span className="block text-xs font-black uppercase tracking-wider text-white">Terms of Service & Privacy Agreements</span>
              <span className="block text-[10px] text-zinc-500 font-medium leading-relaxed">
                I have read and agree to be bound by the Athlixir Terms of Use, Privacy Policy, and local compliance standards.
              </span>
            </div>
          </label>

          {/* AI Analysis Consent */}
          <label className={`flex items-start gap-4 p-4 rounded-xl border transition duration-305 outline-none cursor-pointer ${
            aiAnalysisConsent 
              ? 'border-[#FF4F21]/40 bg-[#FF4F21]/5 shadow-[0_0_15px_rgba(255,79,33,0.1)]' 
              : 'border-white/[0.05] bg-black/40 hover:bg-[#08080C]/60 hover:border-white/[0.08]'
          }`}>
            <input
              type="checkbox"
              checked={aiAnalysisConsent}
              onChange={(e) => setAiAnalysisConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/[0.08] text-[#FF4F21] focus:ring-[#FF4F21]/30 focus:ring-offset-0 cursor-pointer accent-[#FF4F21] bg-black/40 transition duration-200"
            />
            <div className="space-y-1">
              <span className="block text-xs font-black uppercase tracking-wider text-white">AI Metric Analysis Consent</span>
              <span className="block text-[10px] text-zinc-500 font-medium leading-relaxed">
                I authorize Athlixir performance engines to compute AI-driven scoring benchmarks, injury risks, and stride metrics.
              </span>
            </div>
          </label>

          {/* Data Storage Consent */}
          <label className={`flex items-start gap-4 p-4 rounded-xl border transition duration-305 outline-none cursor-pointer ${
            dataStorageConsent 
              ? 'border-[#FF4F21]/40 bg-[#FF4F21]/5 shadow-[0_0_15px_rgba(255,79,33,0.1)]' 
              : 'border-white/[0.05] bg-black/40 hover:bg-[#08080C]/60 hover:border-white/[0.08]'
          }`}>
            <input
              type="checkbox"
              checked={dataStorageConsent}
              onChange={(e) => setDataStorageConsent(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-white/[0.08] text-[#FF4F21] focus:ring-[#FF4F21]/30 focus:ring-offset-0 cursor-pointer accent-[#FF4F21] bg-black/40 transition duration-200"
            />
            <div className="space-y-1">
              <span className="block text-xs font-black uppercase tracking-wider text-white">Secure Data Storage Consent</span>
              <span className="block text-[10px] text-zinc-500 font-medium leading-relaxed">
                I agree to let Athlixir securely persist all my physiological variables inside Google Firestore database servers.
              </span>
            </div>
          </label>

        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={() => router.push('/onboarding/injury-history')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#FF4F21]" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF4F21] to-[#FF8433] hover:brightness-110 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#FF4F21]/20 active:scale-98 transition duration-200 cursor-pointer disabled:opacity-50"
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

