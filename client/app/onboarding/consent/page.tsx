'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, useAuth } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { AlertCircle, Check } from 'lucide-react';

export default function ConsentStep() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [aiAnalysisConsent, setAiAnalysisConsent] = useState(false);
  const [dataStorageConsent, setDataStorageConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = getOnboardingProfile(response);
        if (data.terms_accepted !== undefined) setTermsAccepted(!!data.terms_accepted);
        if (data.ai_consent_accepted !== undefined) setAiAnalysisConsent(!!data.ai_consent_accepted);
        if (data.data_consent_accepted !== undefined) setDataStorageConsent(!!data.data_consent_accepted);
      } catch {
        // Fresh profile
      }
    }
    loadSavedData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted || !aiAnalysisConsent || !dataStorageConsent) {
      setError('Please agree to all three consent items to complete your profile.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/onboarding/consent', {
        termsAccepted,
        aiAnalysisConsent,
        dataStorageConsent,
      });

      await api.post('/onboarding/complete');
      await refreshUser();
      router.replace('/onboarding/completed');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to complete consent registration.');
    } finally {
      setLoading(false);
    }
  };

  const CONSENT_ITEMS = [
    {
      checked: termsAccepted,
      onChange: setTermsAccepted,
      title: 'Terms of Service & Privacy',
      desc: 'I agree to the Athlixir Terms of Use and Privacy Policy guidelines.',
    },
    {
      checked: aiAnalysisConsent,
      onChange: setAiAnalysisConsent,
      title: 'AI Sprint Video Analysis',
      desc: 'I authorize Athlixir to compute kinematic metrics from uploaded sprint videos.',
    },
    {
      checked: dataStorageConsent,
      onChange: setDataStorageConsent,
      title: 'Encrypted Cloud Storage',
      desc: 'I authorize secure cloud storage for physiological benchmarks & history.',
    },
  ];

  return (
    <div className="w-full flex flex-col justify-center">
      {/* Title & Subtitle */}
      <div className="text-center select-none mb-5">
        <h1
          style={{
            fontFamily: "'Mazzard', sans-serif",
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '28px',
            letterSpacing: '0.01em',
            color: '#FF4F21',
          }}
        >
          Final Consent
        </h1>
        <p
          style={{
            fontFamily: "'Mazzard', sans-serif",
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#6E6D6D',
            marginTop: '4px',
          }}
        >
          Review and accept these permissions to activate your account.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/90 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {CONSENT_ITEMS.map((item) => (
          <div
            key={item.title}
            onClick={() => item.onChange(!item.checked)}
            style={{
              boxSizing: 'border-box',
              width: '100%',
              padding: '14px 18px',
              borderRadius: '20px',
              backgroundColor: item.checked ? '#FFF8F5' : '#FFFFFF',
              border: item.checked ? '1.5px solid #FF4F21' : '1px solid #EBEBEB',
              boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.08)',
            }}
            className="flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
          >
            <div className="pr-3">
              <div
                style={{
                  fontFamily: "'Mazzard', sans-serif",
                  fontWeight: 600,
                  fontSize: '14px',
                  color: item.checked ? '#FF4F21' : '#1D1B20',
                }}
              >
                {item.title}
              </div>
              <div
                style={{
                  fontFamily: "'Mazzard', sans-serif",
                  fontSize: '12px',
                  color: '#6E6D6D',
                  marginTop: '2px',
                }}
              >
                {item.desc}
              </div>
            </div>
            <div
              className="rounded-full flex items-center justify-center shrink-0"
              style={{
                width: '22px',
                height: '22px',
                backgroundColor: item.checked ? '#FF4F21' : '#EBEBEB',
              }}
            >
              {item.checked && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
            </div>
          </div>
        ))}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '56px',
            backgroundColor: '#FF4F21',
            border: '1px solid #DDDDDD',
            boxShadow: 'inset 0px 1px 4px rgba(255, 255, 255, 0.05)',
            borderRadius: '26px',
            fontFamily: "'Mazzard', sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '24px',
            color: '#FCFCFC',
            marginTop: '20px',
          }}
          className="flex items-center justify-center active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Finalizing Setup...' : 'Complete Setup'}
        </button>
      </form>
    </div>
  );
}
