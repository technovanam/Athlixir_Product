'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { BarChart2, Loader2, ArrowLeft, ArrowRight, AlertCircle, Clock } from 'lucide-react';

export default function TrainingProfileStep() {
  const router = useRouter();

  const [trainingDays, setTrainingDays] = useState(4);
  const [trainingDuration, setTrainingDuration] = useState(90);
  const [experienceYears, setExperienceYears] = useState(2);
  const [personalBest, setPersonalBest] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing training profile if any
  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = response.data?.data?.data || {};
        if (data.training_days) setTrainingDays(data.training_days);
        if (data.training_duration) setTrainingDuration(data.training_duration);
        if (data.experience_years !== undefined) setExperienceYears(data.experience_years);
        if (data.personal_best) setPersonalBest(data.personal_best);
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
      await api.post('/onboarding/training-profile', {
        trainingDays: Number(trainingDays),
        trainingDuration: Number(trainingDuration),
        experienceYears: Number(experienceYears),
        personalBest: personalBest || '',
      });
      router.push('/onboarding/goals');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save training profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <BarChart2 className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 4: Athlete Training Profile</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Used to understand your active physical stress limits, capacity volumes, and progression analytics.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Training Days */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Training Frequency</span>
              <span className="text-sm font-black text-[#FF4F21]">{trainingDays} days/week</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={trainingDays}
              onChange={(e) => setTrainingDays(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#FF4F21]"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>1 day</span>
              <span>4 days</span>
              <span>7 days</span>
            </div>
          </div>

          {/* Average Duration */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Avg Session Duration</span>
              <span className="text-sm font-black text-[#FF4F21]">{trainingDuration} minutes</span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={trainingDuration}
              onChange={(e) => setTrainingDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#FF4F21]"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>10m</span>
              <span>150m</span>
              <span>300m</span>
            </div>
          </div>

          {/* Experience Years */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Running Experience</span>
              <span className="text-sm font-black text-[#FF4F21]">{experienceYears} {experienceYears === 1 ? 'year' : 'years'}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#FF4F21]"
            />
            <div className="flex justify-between text-[10px] text-zinc-600">
              <span>Fresh beginner</span>
              <span>10 years</span>
              <span>20+ years</span>
            </div>
          </div>

          {/* Personal Best timing */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-3 flex flex-col justify-center">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                Personal Best Timing (Optional)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={personalBest}
                  onChange={(e) => setPersonalBest(e.target.value)}
                  placeholder="e.g. 100m -> 12.4s"
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition duration-200 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
                />
                <Clock className="absolute right-4 h-4 w-4 text-zinc-700" />
              </div>
              <p className="text-[9px] text-zinc-500 mt-2">
                Example: 100m {"->"} 12.4s, 400m {"->"} 52s, or 5K {"->"} 18:45
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-zinc-900">
          <button
            type="button"
            onClick={() => router.push('/onboarding/body-metrics')}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-white transition duration-200 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#FF4F21] hover:brightness-110 text-xs font-bold text-white shadow-lg shadow-[#FF4F21]/20 transition duration-200 cursor-pointer disabled:opacity-50"
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
