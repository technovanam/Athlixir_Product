'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { Activity, Loader2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

const RUNNING_TYPES = [
  { id: 'Sprint', label: 'Sprint', desc: 'Short-burst explosiveness (100m - 400m)' },
  { id: 'Middle Distance', label: 'Middle Distance', desc: 'Aerobic & anaerobic pacing (800m - 1500m)' },
  { id: 'Long Distance', label: 'Long Distance', desc: 'Aerobic durability & threshold (5K - 10K)' },
];

const EVENTS_BY_TYPE: Record<string, string[]> = {
  'Sprint': ['100m', '200m', '400m'],
  'Middle Distance': ['800m', '1500m'],
  'Long Distance': ['5K', '10K'],
};

const COMPETITION_LEVELS = [
  { id: 'Beginner', label: 'Beginner', desc: 'Recreational pacing' },
  { id: 'School', label: 'School', desc: 'Inter-school events' },
  { id: 'District', label: 'District', desc: 'District championships' },
  { id: 'State', label: 'State', desc: 'State-level representation' },
  { id: 'National', label: 'National', desc: 'National-grade credentials' },
];

export default function ClassificationStep() {
  const router = useRouter();

  const [runningType, setRunningType] = useState('Sprint');
  const [primaryEvent, setPrimaryEvent] = useState('100m');
  const [secondaryEvent, setSecondaryEvent] = useState('200m');
  const [competitionLevel, setCompetitionLevel] = useState('Beginner');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing classification data if any
  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = response.data?.data?.data || {};
        if (data.running_type) {
          setRunningType(data.running_type);
          const available = EVENTS_BY_TYPE[data.running_type] || [];
          if (data.primary_event) setPrimaryEvent(data.primary_event);
          else if (available[0]) setPrimaryEvent(available[0]);

          if (data.secondary_event) setSecondaryEvent(data.secondary_event);
          else if (available[1]) setSecondaryEvent(available[1]);
        }
        if (data.competition_level) setCompetitionLevel(data.competition_level);
      } catch (err) {
        // Safe to ignore
      }
    }
    loadSavedData();
  }, []);

  // Update event choices dynamically when Running Type switches
  const handleRunningTypeChange = (type: string) => {
    setRunningType(type);
    const availableEvents = EVENTS_BY_TYPE[type] || [];
    if (availableEvents.length > 0) {
      setPrimaryEvent(availableEvents[0]);
      setSecondaryEvent(availableEvents[1] || availableEvents[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/onboarding/classification', {
        runningType,
        primaryEvent,
        secondaryEvent,
        competitionLevel,
      });
      router.push('/onboarding/body-metrics');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save classification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn relative">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-wider text-white flex items-center gap-2 uppercase crt-glow-white">
          <Activity className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 2: Athlete Classification</span>
        </h2>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Your running classification configures advanced scoring metrics, injury risks, and tailored AI recommendations.
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
        {/* Running type selectors */}
        <div className="space-y-3">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Running Category</label>
          <div className="grid gap-4 sm:grid-cols-3">
            {RUNNING_TYPES.map((t) => {
              const active = runningType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleRunningTypeChange(t.id)}
                  className={`flex flex-col items-start p-4 rounded-xl border text-left transition duration-300 outline-none cursor-pointer ${
                    active
                      ? 'border-[#FF4F21] bg-[#FF4F21]/5 shadow-[0_0_15px_rgba(255,79,33,0.15)] ring-1 ring-[#FF4F21]/30'
                      : 'border-white/[0.05] hover:border-[#FF4F21]/20 bg-black/40 hover:bg-[#08080C]/60'
                  }`}
                >
                  <span className="font-bold text-xs text-white uppercase tracking-wide">{t.label}</span>
                  <span className="text-[10px] text-zinc-500 mt-2 font-medium leading-normal">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Event selection */}
        <div className="grid gap-6 sm:grid-cols-2 border-t border-white/[0.05] pt-6">
          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 transition-colors duration-200 group-focus-within:text-[#FF4F21]">Primary Event Focus</label>
            <select
              value={primaryEvent}
              onChange={(e) => setPrimaryEvent(e.target.value)}
              className="block w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer"
            >
              {(EVENTS_BY_TYPE[runningType] || []).map((ev) => (
                <option key={ev} value={ev} className="bg-[#08080C] text-white">
                  {ev}
                </option>
              ))}
            </select>
          </div>

          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 transition-colors duration-200 group-focus-within:text-[#FF4F21]">Secondary Event Focus</label>
            <select
              value={secondaryEvent}
              onChange={(e) => setSecondaryEvent(e.target.value)}
              className="block w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer"
            >
              {(EVENTS_BY_TYPE[runningType] || []).map((ev) => (
                <option key={ev} value={ev} className="bg-[#08080C] text-white">
                  {ev}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Competition level select */}
        <div className="space-y-3 border-t border-white/[0.05] pt-6">
          <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500">Competition Level</label>
          <div className="grid gap-3 sm:grid-cols-5">
            {COMPETITION_LEVELS.map((lvl) => {
              const active = competitionLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setCompetitionLevel(lvl.id)}
                  className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-center transition duration-300 outline-none cursor-pointer ${
                    active
                      ? 'border-[#FF4F21] bg-[#FF4F21]/5 shadow-[0_0_15px_rgba(255,79,33,0.15)] ring-1 ring-[#FF4F21]/30'
                      : 'border-white/[0.05] hover:border-[#FF4F21]/20 bg-black/40 hover:bg-[#08080C]/60'
                  }`}
                >
                  <span className="font-bold text-xs text-white uppercase tracking-wide">{lvl.label}</span>
                  <span className="text-[9px] text-zinc-500 mt-2 font-medium leading-normal">{lvl.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form navigation buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-white/[0.05]">
          <button
            type="button"
            onClick={() => router.push('/onboarding/basic-info')}
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

