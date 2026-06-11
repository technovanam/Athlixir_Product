'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { Heart, Loader2, ArrowLeft, ArrowRight, AlertCircle, AlertTriangle } from 'lucide-react';

const INJURY_OPTIONS = [
  { id: 'Knee', label: 'Knee' },
  { id: 'Hamstring', label: 'Hamstring' },
  { id: 'Ankle', label: 'Ankle' },
  { id: 'Hip', label: 'Hip' },
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

  // Load existing injury history if any
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
      setError('Please select at least one injury status (or select No Prior Injuries).');
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
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn relative">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-wider text-white flex items-center gap-2 uppercase crt-glow-white">
          <Heart className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 6: Injury & Recovery History</span>
        </h2>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Used to construct customized biomechanical support, load relief routines, and strain alert limits.
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
        {/* Injury multi select */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">
            Have you had prior joint or muscle injuries?
          </label>
          <div className="grid gap-4 sm:grid-cols-3">
            {INJURY_OPTIONS.map((item) => {
              const active = selectedInjuries.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInjury(item.id)}
                  className={`p-4 rounded-xl border text-center transition duration-300 outline-none cursor-pointer text-xs font-black uppercase tracking-wide ${
                    active
                      ? 'border-[#FF4F21] bg-[#FF4F21]/10 text-white shadow-[0_0_15px_rgba(255,79,33,0.15)] ring-1 ring-[#FF4F21]/30'
                      : 'border-white/[0.05] hover:border-[#FF4F21]/20 bg-black/40 hover:bg-[#08080C]/60 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current pain and severity */}
        {(!selectedInjuries.includes('None') && selectedInjuries.length > 0) && (
          <div className="border-t border-white/[0.05] pt-6 space-y-6 animate-fadeIn">
            {/* Toggle current discomfort */}
            <div className="flex items-center justify-between rounded-2xl border border-white/[0.05] bg-black/40 hover:border-white/[0.08] transition duration-300 p-4">
              <div className="space-y-1">
                <span className="block text-xs font-black uppercase tracking-wider text-white">Active Discomfort</span>
                <span className="block text-[10px] text-zinc-500 font-medium">Are you currently experiencing discomfort in these zones?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentPain(!currentPain);
                  if (currentPain) setSeverity(0);
                }}
                className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                  currentPain ? 'bg-[#FF4F21] shadow-[0_0_10px_rgba(255,79,33,0.4)]' : 'bg-black/60'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                    currentPain ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Severity scale slider */}
            {currentPain && (
              <div className="rounded-2xl border border-white/[0.05] bg-black/40 hover:border-white/[0.08] transition duration-300 p-6 space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-[#FF4F21] animate-pulse" />
                    <span>Subjective Pain Severity</span>
                  </span>
                  <span className="text-xl font-black text-white tracking-wide">
                    {severity} <span className="text-xs text-zinc-550 uppercase tracking-widest font-black">/ 10</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                  <span>Mild pain (1-3)</span>
                  <span className="text-[#FF4F21]/70">Moderate (4-7)</span>
                  <span>Severe (8-10)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={() => router.replace('/onboarding/goals')}
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
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span>Save & Continue</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

