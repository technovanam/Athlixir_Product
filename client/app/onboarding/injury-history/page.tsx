'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
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
        const data = response.data?.data?.data || {};
        if (data.injury_history) {
          const hist = data.injury_history;
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
      router.push('/onboarding/consent');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save injury history.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Heart className="h-6 w-6 text-violet-500" />
          <span>Step 6: Injury & Recovery History</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Used to construct customized biomechanical support, load relief routines, and strain alert limits.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Injury multi select */}
        <div className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            Have you had prior joint or muscle injuries?
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            {INJURY_OPTIONS.map((item) => {
              const active = selectedInjuries.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInjury(item.id)}
                  className={`p-4 rounded-xl border text-center transition duration-200 outline-none cursor-pointer text-xs font-bold ${
                    active
                      ? 'border-violet-500 bg-violet-600/10 text-white ring-1 ring-violet-500'
                      : 'border-zinc-900 hover:border-zinc-800 bg-zinc-950/30 text-zinc-400 hover:text-zinc-200'
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
          <div className="border-t border-zinc-900 pt-6 space-y-6 animate-fadeIn">
            {/* Toggle current discomfort */}
            <div className="flex items-center justify-between rounded-2xl border border-zinc-900 bg-zinc-950/40 p-4">
              <div className="space-y-0.5">
                <span className="block text-xs font-bold text-white">Active Discomfort</span>
                <span className="block text-[10px] text-zinc-500">Are you currently experiencing discomfort in these zones?</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentPain(!currentPain);
                  if (currentPain) setSeverity(0);
                }}
                className={`h-6 w-11 rounded-full p-0.5 transition-colors duration-200 focus:outline-none cursor-pointer ${
                  currentPain ? 'bg-violet-600' : 'bg-zinc-800'
                }`}
              >
                <div
                  className={`h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                    currentPain ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Severity scale slider */}
            {currentPain && (
              <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>Subjective Pain Severity</span>
                  </span>
                  <span className="text-xl font-black text-amber-500">
                    {severity} <span className="text-xs text-zinc-500">/ 10</span>
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Mild pain (1-3)</span>
                  <span>Moderate discomfort (4-7)</span>
                  <span>Severe strain (8-10)</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-zinc-900">
          <button
            type="button"
            onClick={() => router.push('/onboarding/goals')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-white transition duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white shadow-lg shadow-violet-500/20 transition duration-200 cursor-pointer disabled:opacity-50"
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
