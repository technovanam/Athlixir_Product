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
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn relative">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-wider text-white flex items-center gap-2 uppercase crt-glow-white">
          <BarChart2 className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 4: Athlete Training Profile</span>
        </h2>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Used to understand your active physical stress limits, capacity volumes, and progression analytics.
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Training Days */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:border-white/[0.08] transition duration-300 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Training Frequency</span>
              <span className="text-sm font-black text-white tracking-wide">{trainingDays} <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">days/wk</span></span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={trainingDays}
              onChange={(e) => setTrainingDays(Number(e.target.value))}
              className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
            />
            <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>1 day</span>
              <span className="text-[#FF4F21]/70">4 days</span>
              <span>7 days</span>
            </div>
          </div>

          {/* Average Duration */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:border-white/[0.08] transition duration-300 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Avg Session Duration</span>
              <span className="text-sm font-black text-white tracking-wide">{trainingDuration} <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">minutes</span></span>
            </div>
            <input
              type="range"
              min="10"
              max="300"
              step="5"
              value={trainingDuration}
              onChange={(e) => setTrainingDuration(Number(e.target.value))}
              className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
            />
            <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>10m</span>
              <span className="text-[#FF4F21]/70">150m</span>
              <span>300m</span>
            </div>
          </div>

          {/* Experience Years */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:border-white/[0.08] transition duration-300 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Running Experience</span>
              <span className="text-sm font-black text-white tracking-wide">{experienceYears} <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">{experienceYears === 1 ? 'year' : 'years'}</span></span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={experienceYears}
              onChange={(e) => setExperienceYears(Number(e.target.value))}
              className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
            />
            <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>Rookie</span>
              <span className="text-[#FF4F21]/70">10 yrs</span>
              <span>20+ yrs</span>
            </div>
          </div>

          {/* Personal Best timing */}
          <div className="rounded-2xl border border-white/[0.05] bg-white/[0.01] hover:border-white/[0.08] transition duration-300 p-6 space-y-4 flex flex-col justify-center group">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 transition-colors duration-200 group-focus-within:text-[#FF4F21]">
                Personal Best Timing (Optional)
              </label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={personalBest}
                  onChange={(e) => setPersonalBest(e.target.value)}
                  placeholder="e.g. 100m -> 12.4s"
                  className="block w-full rounded-xl border border-white/[0.05] bg-white/[0.02] pl-4 pr-11 py-3.5 text-xs text-white placeholder-zinc-650 outline-none transition duration-350 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30 focus:bg-white/[0.04]"
                />
                <Clock className="absolute right-4 h-4 w-4 text-zinc-700 transition-colors duration-200 group-focus-within:text-[#FF4F21]" />
              </div>
              <p className="text-[9px] text-zinc-550 font-medium mt-2">
                Example: 100m {"->"} 12.4s, 400m {"->"} 52s, or 5K {"->"} 18:45
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={() => router.push('/onboarding/body-metrics')}
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

