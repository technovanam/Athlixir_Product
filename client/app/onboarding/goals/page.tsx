'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { Target, Loader2, ArrowLeft, ArrowRight, AlertCircle, Check } from 'lucide-react';

const GOALS_LIST = [
  { id: 'Improve Speed', title: 'Improve Speed', desc: 'Lower your personal best sprint timings & pacing threshold' },
  { id: 'Improve Running Form', title: 'Improve Running Form', desc: 'Optimize biomechanical posture, stride rate, & step geometry' },
  { id: 'Injury Prevention', title: 'Injury Prevention', desc: 'Detect stress load limits and prevent active muscular strains' },
  { id: 'Increase Endurance', title: 'Increase Endurance', desc: 'Extend high-intensity aerobic thresholds and run longer' },
  { id: 'Improve Sprint Mechanics', title: 'Improve Sprint Mechanics', desc: 'Perfect block starts, ground contact time, & knee drive power' },
  { id: 'Improve Consistency', title: 'Improve Consistency', desc: 'Form sustainable weekly habit loops and track progress reports' },
];

export default function GoalsStep() {
  const router = useRouter();

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing goals if any
  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = response.data?.data?.data || {};
        if (data.goals && Array.isArray(data.goals)) {
          setSelectedGoals(data.goals);
        }
      } catch (err) {
        // Safe to ignore
      }
    }
    loadSavedData();
  }, []);

  const toggleGoal = (goalId: string) => {
    if (selectedGoals.includes(goalId)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goalId));
    } else {
      setSelectedGoals([...selectedGoals, goalId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedGoals.length === 0) {
      setError('Please select at least one primary athletic target goal.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/onboarding/goals', {
        goals: selectedGoals,
      });
      router.push('/onboarding/injury-history');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save athlete goals.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Target className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 5: Primary Athlete Goals</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Select all training targets you wish to prioritize. These options personalize your recommendations feed.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {GOALS_LIST.map((goal) => {
            const isSelected = selectedGoals.includes(goal.id);
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                className={`flex flex-col items-start p-5 rounded-2xl border text-left transition duration-200 outline-none cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-[#FF4F21] bg-[#FF4F21]/5 ring-1 ring-[#FF4F21]/30'
                    : 'border-zinc-900 hover:border-zinc-800 bg-zinc-950/30'
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 right-3 h-5 w-5 rounded-full bg-[#FF4F21] flex items-center justify-center text-white">
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <span className="font-extrabold text-xs text-white pr-4">{goal.title}</span>
                <span className="text-[10px] text-zinc-500 mt-2 leading-relaxed">{goal.desc}</span>
              </button>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-zinc-900">
          <button
            type="button"
            onClick={() => router.push('/onboarding/training-profile')}
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
