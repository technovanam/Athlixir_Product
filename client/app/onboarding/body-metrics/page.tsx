'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { AlertCircle } from 'lucide-react';

export default function BodyMetricsStep() {
  const router = useRouter();

  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = getOnboardingProfile(response);
        if (data.height_cm !== undefined) setHeightCm(Number(data.height_cm));
        if (data.weight_kg !== undefined) setWeightKg(Number(data.weight_kg));
      } catch (err) {
        // Safe to ignore
      }
    }
    loadSavedData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/onboarding/body-metrics', {
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
      });
      router.replace('/onboarding/training-profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save body metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center">
      {/* Title & Subtitle */}
      <div className="text-center select-none mb-6">
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
          Body Metrics
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
          Used for stride normalization and joint kinematic angles.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/90 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Height Card */}
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBEB',
            boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.12)',
            borderRadius: '26px',
            padding: '20px 24px',
          }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <span
              style={{
                fontFamily: "'Mazzard', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#6E6D6D',
              }}
            >
              Height
            </span>
            <span
              style={{
                fontFamily: "'Mazzard', sans-serif",
                fontWeight: 700,
                fontSize: '22px',
                color: '#FF4F21',
              }}
            >
              {heightCm}{' '}
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#8C8C8C' }}>
                cm
              </span>
            </span>
          </div>
          <input
            type="range"
            min="100"
            max="250"
            value={heightCm}
            onChange={(e) => setHeightCm(Number(e.target.value))}
            className="w-full h-2 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
          />
          <div
            className="flex justify-between"
            style={{
              fontFamily: "'Mazzard', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              color: '#8C8C8C',
            }}
          >
            <span>100 cm</span>
            <span>250 cm</span>
          </div>
        </div>

        {/* Weight Card */}
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBEB',
            boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.12)',
            borderRadius: '26px',
            padding: '20px 24px',
          }}
          className="space-y-4"
        >
          <div className="flex justify-between items-center">
            <span
              style={{
                fontFamily: "'Mazzard', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                color: '#6E6D6D',
              }}
            >
              Weight
            </span>
            <span
              style={{
                fontFamily: "'Mazzard', sans-serif",
                fontWeight: 700,
                fontSize: '22px',
                color: '#FF4F21',
              }}
            >
              {weightKg}{' '}
              <span style={{ fontSize: '13px', fontWeight: 500, color: '#8C8C8C' }}>
                kg
              </span>
            </span>
          </div>
          <input
            type="range"
            min="30"
            max="200"
            value={weightKg}
            onChange={(e) => setWeightKg(Number(e.target.value))}
            className="w-full h-2 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
          />
          <div
            className="flex justify-between"
            style={{
              fontFamily: "'Mazzard', sans-serif",
              fontSize: '11px',
              fontWeight: 500,
              color: '#8C8C8C',
            }}
          >
            <span>30 kg</span>
            <span>200 kg</span>
          </div>
        </div>

        {/* Submit Action */}
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
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
