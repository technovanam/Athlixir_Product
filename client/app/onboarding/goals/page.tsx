'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { AlertCircle, Check } from 'lucide-react';

const GOALS_LIST = [
  { id: 'Improve Speed', title: 'Improve Speed', desc: 'Lower sprint times and break through velocity plateaus' },
  { id: 'Improve Running Form', title: 'Improve Running Form', desc: 'Refine posture, stride geometry, & angular mechanics' },
  { id: 'Injury Prevention', title: 'Injury Prevention', desc: 'Identify asymmetrical strain and mitigate hamstring/knee risks' },
  { id: 'Improve Sprint Mechanics', title: 'Improve Sprint Mechanics', desc: 'Enhance block departure, ground contact & flight ratios' },
];

export default function GoalsStep() {
  const router = useRouter();

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = getOnboardingProfile(response);
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
      setError('Please select at least one primary athletic goal.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/onboarding/goals', {
        goals: selectedGoals,
      });
      router.replace('/onboarding/injury-history');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save athlete goals.');
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
          Primary Goals
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
          Choose your target milestones to personalize AI analytics.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/90 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {GOALS_LIST.map((goal) => {
          const isSelected = selectedGoals.includes(goal.id);
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '14px 18px',
                borderRadius: '20px',
                backgroundColor: isSelected ? '#FFF8F5' : '#FFFFFF',
                border: isSelected ? '1.5px solid #FF4F21' : '1px solid #EBEBEB',
                boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.08)',
              }}
              className="flex items-center justify-between text-left transition-all active:scale-[0.99] cursor-pointer"
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Mazzard', sans-serif",
                    fontWeight: 600,
                    fontSize: '14px',
                    color: isSelected ? '#FF4F21' : '#1D1B20',
                  }}
                >
                  {goal.title}
                </div>
                <div
                  style={{
                    fontFamily: "'Mazzard', sans-serif",
                    fontSize: '12px',
                    color: '#6E6D6D',
                    marginTop: '2px',
                  }}
                >
                  {goal.desc}
                </div>
              </div>
              <div
                className="rounded-full flex items-center justify-center shrink-0 ml-3"
                style={{
                  width: '22px',
                  height: '22px',
                  backgroundColor: isSelected ? '#FF4F21' : '#EBEBEB',
                }}
              >
                {isSelected && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
              </div>
            </button>
          );
        })}

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
