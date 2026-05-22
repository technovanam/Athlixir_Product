'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { Award, ChevronRight, Sparkles, Activity, ShieldCheck, Ruler, Calendar } from 'lucide-react';

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
      <div className="absolute top-10 left-10 text-[#FF4F21]/30 animate-pulse">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="absolute bottom-10 right-10 text-[#FF8433]/30 animate-pulse delay-1000">
        <Sparkles className="h-6 w-6" />
      </div>

      <div className="flex flex-col items-center justify-center space-y-5">
        <div className="relative group">
          <div className="absolute inset-0 bg-[#FF4F21]/20 blur-[15px] rounded-full scale-75 group-hover:scale-110 transition duration-300 pointer-events-none" />
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center shadow-lg shadow-[#FF4F21]/30 ring-4 ring-[#FF4F21]/10 relative z-10">
            <Award className="h-8 w-8 text-white" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-wider uppercase crt-glow-white">
            Athlete Card Initialized!
          </h2>
          <p className="text-zinc-500 text-xs mt-2 max-w-md mx-auto font-medium leading-relaxed">
            Congratulations! Your physical profile datasets, dynamic running parameters, and safety thresholds are successfully locked in.
          </p>
        </div>
      </div>

      {/* Structured metrics summary */}
      {profileData && (
        <div className="max-w-md mx-auto grid grid-cols-2 gap-4 text-left border-t border-b border-white/[0.05] py-6 my-6">
          <div className="rounded-2xl border border-white/[0.05] bg-black/40 hover:border-white/[0.08] transition duration-300 p-3.5 flex items-center gap-3">
            <Activity className="h-5 w-5 text-[#FF4F21] shrink-0" />
            <div>
              <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-500">Event Class</span>
              <span className="block text-xs font-bold text-white mt-0.5">{profileData.primary_event || 'Sprint'} Athlete</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.05] bg-black/40 hover:border-white/[0.08] transition duration-300 p-3.5 flex items-center gap-3">
            <Ruler className="h-5 w-5 text-[#FF4F21] shrink-0" />
            <div>
              <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-500">Biometrics</span>
              <span className="block text-xs font-bold text-white mt-0.5">{profileData.height_cm || 175}cm / {profileData.weight_kg || 70}kg</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.05] bg-black/40 hover:border-white/[0.08] transition duration-300 p-3.5 flex items-center gap-3">
            <Calendar className="h-5 w-5 text-[#FF4F21] shrink-0" />
            <div>
              <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-500">Train Capacity</span>
              <span className="block text-xs font-bold text-white mt-0.5">{profileData.training_days || 4} Days / Wk</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.05] bg-black/40 hover:border-white/[0.08] transition duration-300 p-3.5 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-[#FF4F21] shrink-0 animate-pulse" />
            <div>
              <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-500">Safety Status</span>
              <span className="block text-xs font-black uppercase text-emerald-400 mt-0.5 tracking-wider">Shield Active</span>
            </div>
          </div>
        </div>
      )}

      {/* CTA Button */}
      <div className="flex justify-center pt-4">
        <button
          onClick={handleEnterWorkspace}
          className="flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-[#FF4F21] to-[#FF8433] hover:brightness-110 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,79,33,0.25)] hover:shadow-[0_0_30px_rgba(255,79,33,0.4)] active:scale-98 transition duration-200 cursor-pointer"
        >
          <span>Enter Athlixir Workspace</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

