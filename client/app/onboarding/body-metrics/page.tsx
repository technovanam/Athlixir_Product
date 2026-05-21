'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
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
        const data = response.data?.data?.data || {};
        if (data.height_cm) setHeightCm(data.height_cm);
        if (data.weight_kg) setWeightKg(data.weight_kg);
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
      router.push('/onboarding/training-profile');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save body metrics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Ruler className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 3: Body Metrics</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Used to calculate stride analysis, power output scaling, and biomechanical normalization profiles.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Height slider */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Height</span>
              <span className="text-xl font-black text-[#FF4F21]">{heightCm} <span className="text-xs text-zinc-500">cm</span></span>
            </div>
            <input
              type="range"
              min="100"
              max="250"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#FF4F21]"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 font-medium">
              <span>100 cm</span>
              <span>175 cm</span>
              <span>250 cm</span>
            </div>
          </div>

          {/* Weight slider */}
          <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Weight</span>
              <span className="text-xl font-black text-[#FF4F21]">{weightKg} <span className="text-xs text-zinc-500">kg</span></span>
            </div>
            <input
              type="range"
              min="30"
              max="200"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full h-1.5 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-[#FF4F21]"
            />
            <div className="flex justify-between text-[10px] text-zinc-600 font-medium">
              <span>30 kg</span>
              <span>115 kg</span>
              <span>200 kg</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-zinc-900">
          <button
            type="button"
            onClick={() => router.push('/onboarding/classification')}
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
