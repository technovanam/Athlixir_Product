'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { AlertCircle, Clock } from 'lucide-react';

export default function TrainingProfileStep() {
  const router = useRouter();

  const [trainingDays, setTrainingDays] = useState(4);
  const [trainingDuration, setTrainingDuration] = useState(90);
  const [experienceYears, setExperienceYears] = useState(2);
  const [personalBest, setPersonalBest] = useState('');
  const [achievements, setAchievements] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = getOnboardingProfile(response) as any;
        if (data.training_days !== undefined) setTrainingDays(Number(data.training_days));
        if (data.training_duration !== undefined) setTrainingDuration(Number(data.training_duration));
        if (data.experience_years !== undefined) setExperienceYears(data.experience_years);
        if (data.personal_best) setPersonalBest(data.personal_best);
        if (data.achievements) setAchievements(data.achievements);
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
        achievements: achievements || '',
      });
      router.replace('/onboarding/goals');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save training profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center">
      {/* Title & Subtitle */}
      <div className="text-center select-none mb-5">
        <h1
          style={{
            fontFamily: "'Mazzard', sans-serif",
            fontWeight: 600,
            fontSize: '24px',
            lineHeight: '28px',
            letterSpacing: '0.01em',
            color: '#FF4F21',
          }}
        >
          Training Profile
        </h1>
        <p
          style={{
            fontFamily: "'Mazzard', sans-serif",
            fontWeight: 400,
            fontSize: '14px',
            lineHeight: '20px',
            color: '#6E6D6D',
            marginTop: '4px',
          }}
        >
          Calibrates workload progression and recovery intervals.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/90 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Training Frequency */}
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBEB',
            boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.12)',
            borderRadius: '24px',
            padding: '16px 20px',
          }}
          className="space-y-3"
        >
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Mazzard', sans-serif", fontWeight: 600, fontSize: '13px', color: '#6E6D6D' }}>
              Training Frequency
            </span>
            <span style={{ fontFamily: "'Mazzard', sans-serif", fontWeight: 700, fontSize: '16px', color: '#FF4F21' }}>
              {trainingDays} <span style={{ fontSize: '11px', color: '#8C8C8C', fontWeight: 500 }}>days/wk</span>
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="7"
            value={trainingDays}
            onChange={(e) => setTrainingDays(Number(e.target.value))}
            className="w-full h-1.5 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
          />
          <div className="flex justify-between" style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '11px', color: '#8C8C8C' }}>
            <span>1 day</span>
            <span>7 days</span>
          </div>
        </div>

        {/* Avg Duration */}
        <div
          style={{
            boxSizing: 'border-box',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBEB',
            boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.12)',
            borderRadius: '24px',
            padding: '16px 20px',
          }}
          className="space-y-3"
        >
          <div className="flex justify-between items-center">
            <span style={{ fontFamily: "'Mazzard', sans-serif", fontWeight: 600, fontSize: '13px', color: '#6E6D6D' }}>
              Avg Duration
            </span>
            <span style={{ fontFamily: "'Mazzard', sans-serif", fontWeight: 700, fontSize: '16px', color: '#FF4F21' }}>
              {trainingDuration} <span style={{ fontSize: '11px', color: '#8C8C8C', fontWeight: 500 }}>min</span>
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="240"
            step="5"
            value={trainingDuration}
            onChange={(e) => setTrainingDuration(Number(e.target.value))}
            className="w-full h-1.5 bg-[#EBEBEB] rounded-lg appearance-none cursor-pointer accent-[#FF4F21] focus:outline-none"
          />
          <div className="flex justify-between" style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '11px', color: '#8C8C8C' }}>
            <span>10 min</span>
            <span>240 min</span>
          </div>
        </div>

        {/* Personal Best Timing Field */}
        <div
          className="flex items-center transition-all duration-200 focus-within:border-[#FF4F21] focus-within:ring-4 focus-within:ring-[#FF4F21]/15"
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '56px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBEB',
            boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.12)',
            borderRadius: '26px',
            paddingLeft: '21px',
            paddingRight: '21px',
          }}
        >
          <Clock className="h-[20px] w-[20px] text-[#6E6D6D] shrink-0" />
          <input
            type="text"
            value={personalBest}
            onChange={(e) => setPersonalBest(e.target.value)}
            placeholder="Personal Best (e.g. 100m - 10.4s)"
            style={{
              fontFamily: "'Mazzard', sans-serif",
              fontSize: '15px',
              color: '#1D1B20',
            }}
            className="w-full h-full bg-transparent pl-3 pr-1 placeholder-[#6E6D6D] outline-none"
          />
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={loading}
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '56px',
            backgroundColor: '#FF4F21',
            border: '1px solid #DDDDDD',
            boxShadow: 'inset 0px 1px 4px rgba(255, 255, 255, 0.05)',
            borderRadius: '26px',
            fontFamily: "'Mazzard', sans-serif",
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '24px',
            color: '#FCFCFC',
            marginTop: '20px',
          }}
          className="flex items-center justify-center active:scale-[0.98] transition-transform cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
