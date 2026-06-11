'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { Ruler, Loader2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

export default function BodyMetricsStep() {
  const router = useRouter();

  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(70);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing body metrics if any
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
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn relative">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-wider text-white flex items-center gap-2 uppercase crt-glow-white">
          <Ruler className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 3: Body Metrics</span>
        </h2>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Used to calculate stride analysis, power output scaling, and biomechanical normalization profiles.
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

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Height slider */}
          <div className="rounded-2xl border border-white/[0.05] bg-black/40 hover:border-white/[0.08] transition duration-300 p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Height Metric</span>
              <span className="text-xl font-black text-white tracking-wide">
                {heightCm} <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">cm</span>
              </span>
            </div>
            <input
              type="range"
              min="100"
              max="250"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
            />
            <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>100 cm</span>
              <span className="text-[#FF4F21]/70">175 cm</span>
              <span>250 cm</span>
            </div>
          </div>

          {/* Weight slider */}
          <div className="rounded-2xl border border-white/[0.05] bg-black/40 hover:border-white/[0.08] transition duration-300 p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Weight Mass</span>
              <span className="text-xl font-black text-white tracking-wide">
                {weightKg} <span className="text-xs text-zinc-500 uppercase tracking-widest font-black">kg</span>
              </span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full h-1 bg-white/[0.08] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
            />
            <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
              <span>30 kg</span>
              <span className="text-[#FF4F21]/70">115 kg</span>
              <span>200 kg</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={() => router.replace('/onboarding/classification')}
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

