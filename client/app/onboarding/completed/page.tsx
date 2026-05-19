'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { Award, Check, ChevronRight, Sparkles, Activity, ShieldCheck, Ruler, Calendar } from 'lucide-react';

export default function CompletedStep() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        setProfileData(response.data?.data?.data || {});
      } catch (err) {
        // Safe to ignore
      }
    }
    loadSavedData();
  }, []);

  const handleEnterWorkspace = () => {
    router.push('/dashboard');
  };

  return (
    <div className="p-8 md:p-12 text-center space-y-8 animate-fadeIn relative overflow-hidden">
      {/* Decorative stars */}
      <div className="absolute top-10 left-10 text-violet-500/30 animate-pulse">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="absolute bottom-10 right-10 text-indigo-500/30 animate-pulse delay-1000">
        <Sparkles className="h-6 w-6" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30 ring-4 ring-violet-500/10">
          <Award className="h-8 w-8 text-white" />
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Athlete Card Initialized!
          </h2>
          <p className="text-zinc-400 text-xs mt-2 max-w-md mx-auto">
            Congratulations! Your physical profile datasets, dynamic running parameters, and safety thresholds are successfully locked in.
          </p>
        </div>
      </div>

      {/* Structured metrics summary */}
      {profileData && (
        <div className="max-w-md mx-auto grid grid-cols-2 gap-3.5 text-left border-t border-b border-zinc-900 py-6 my-6">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-3.5 flex items-center gap-3">
            <Activity className="h-5 w-5 text-violet-400 shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-zinc-500">Event Class</span>
              <span className="block text-xs font-bold text-zinc-300">{profileData.primary_event || 'Sprint'} Athlete</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-3.5 flex items-center gap-3">
            <Ruler className="h-5 w-5 text-violet-400 shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-zinc-500">Biometrics</span>
              <span className="block text-xs font-bold text-zinc-300">{profileData.height_cm || 175}cm / {profileData.weight_kg || 70}kg</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-3.5 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-violet-400 shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-zinc-500">Train Capacity</span>
              <span className="block text-xs font-bold text-zinc-300">{profileData.training_days || 4} Days / Week</span>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-3.5 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-violet-400 shrink-0" />
            <div>
              <span className="block text-[9px] uppercase tracking-widest text-zinc-500">Safety Status</span>
              <span className="block text-xs font-bold text-emerald-400">Shield Active</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleEnterWorkspace}
          className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-bold text-white shadow-lg shadow-violet-500/20 hover:scale-[1.02] transition duration-200 cursor-pointer"
        >
          <span>Enter Athlixir Workspace</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
