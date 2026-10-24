'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { AlertCircle, AlertTriangle } from 'lucide-react';

const INJURY_OPTIONS = [
  { id: 'Hamstring', label: 'Hamstring' },
  { id: 'Knee', label: 'Knee' },
  { id: 'Ankle', label: 'Ankle' },
  { id: 'Hip Flexor', label: 'Hip Flexor' },
  { id: 'Lower Back', label: 'Lower Back' },
  { id: 'None', label: 'No Prior Injuries' },
];

export default function InjuryHistoryStep() {
  const router = useRouter();

  const [selectedInjuries, setSelectedInjuries] = useState<string[]>([]);
  const [currentPain, setCurrentPain] = useState(false);
  const [severity, setSeverity] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = getOnboardingProfile(response);
        if (data.injury_history) {
          const hist = data.injury_history as { injuries?: string[]; current_pain?: boolean; severity?: number };
          if (hist.injuries && Array.isArray(hist.injuries)) {
            setSelectedInjuries(hist.injuries);
          }
          if (hist.current_pain !== undefined) setCurrentPain(hist.current_pain);
          if (hist.severity !== undefined) setSeverity(hist.severity);
        }
      } catch (err) {
        // Safe to ignore
      }
    }
    loadSavedData();
  }, []);

  const toggleInjury = (id: string) => {
    if (id === 'None') {
      setSelectedInjuries(['None']);
      setCurrentPain(false);
      setSeverity(0);
      return;
    }

    let updated = selectedInjuries.filter((item) => item !== 'None');
    if (updated.includes(id)) {
      updated = updated.filter((item) => item !== id);
    } else {
      updated.push(id);
    }
    setSelectedInjuries(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedInjuries.length === 0) {
      setError('Please select an injury status (or select No Prior Injuries).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/onboarding/injury-history', {
        injuries: selectedInjuries,
        currentPain,
        severity: Number(severity),
      });
      router.replace('/onboarding/consent');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save injury history.');
    } finally {
      setLoading(false);
    }
  };

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
          Injury History
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
          Fine-tunes injury prevention alerts and fatigue thresholds.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/90 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Prior Injury Options */}
        <div className="space-y-2">
          <label
            style={{
              fontFamily: "'Mazzard', sans-serif",
              fontWeight: 600,
              fontSize: '12px',
              color: '#1D1B20',
            }}
          >
            Prior Joint or Muscle Injuries
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {INJURY_OPTIONS.map((item) => {
              const active = selectedInjuries.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInjury(item.id)}
                  style={{
                    boxSizing: 'border-box',
                    height: '50px',
                    borderRadius: '20px',
                    backgroundColor: active ? '#FFF8F5' : '#FFFFFF',
                    border: active ? '1.5px solid #FF4F21' : '1px solid #EBEBEB',
                    boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.08)',
                    fontFamily: "'Mazzard', sans-serif",
                    fontWeight: 600,
                    fontSize: '13px',
                    color: active ? '#FF4F21' : '#1D1B20',
                  }}
                  className="flex items-center justify-center transition-all active:scale-[0.98] cursor-pointer"
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Discomfort Card (if non-empty injury history) */}
        {!selectedInjuries.includes('None') && selectedInjuries.length > 0 && (
          <div className="space-y-3 pt-1">
            <div
              style={{
                boxSizing: 'border-box',
                width: '100%',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EBEBEB',
                boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.08)',
                borderRadius: '24px',
                padding: '16px 20px',
              }}
              className="flex items-center justify-between"
            >
              <div>
                <span style={{ fontFamily: "'Mazzard', sans-serif", fontWeight: 600, fontSize: '14px', color: '#1D1B20' }}>
                  Active Discomfort
                </span>
                <span style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '12px', color: '#6E6D6D', display: 'block' }}>
                  Experiencing active soreness?
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentPain(!currentPain);
                  if (currentPain) setSeverity(0);
                }}
                className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-200 shrink-0 ${
                  currentPain ? 'bg-[#FF4F21]' : 'bg-[#EBEBEB]'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    currentPain ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {currentPain && (
              <div
                style={{
                  boxSizing: 'border-box',
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EBEBEB',
                  boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.08)',
                  borderRadius: '24px',
                  padding: '16px 20px',
                }}
                className="space-y-3 animate-fadeIn"
              >
                <div className="flex justify-between items-center">
                  <span style={{ fontFamily: "'Mazzard', sans-serif", fontWeight: 600, fontSize: '13px', color: '#6E6D6D' }} className="flex items-center gap-1.5">
                    <AlertTriangle size={15} color="#FF4F21" />
                    <span>Pain Intensity</span>
                  </span>
                  <span style={{ fontFamily: "'Mazzard', sans-serif", fontWeight: 700, fontSize: '16px', color: '#FF4F21' }}>
                    {severity} <span style={{ fontSize: '11px', color: '#8C8C8C', fontWeight: 500 }}>/ 10</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
                />
                <div className="flex justify-between" style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '11px', color: '#8C8C8C' }}>
                  <span>Mild (1-3)</span>
                  <span>Moderate (4-7)</span>
                  <span>Severe (8-10)</span>
                </div>
              </div>
            )}
          </div>
        )}

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
