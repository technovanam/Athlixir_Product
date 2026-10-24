'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, api } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { Award, ChevronRight, Activity, ShieldCheck, Ruler, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CompletedStep() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        setProfileData(getOnboardingProfile(response));
      } catch (err) {
        // Safe to ignore
      }
    }
    loadSavedData();
  }, []);

  const handleEnterWorkspace = async () => {
    await refreshUser();
    router.replace('/dashboard');
  };

  // Previously fell back to hardcoded 175cm/70kg/4-days-a-week when the
  // fetched profile was missing a field, presenting those as the athlete's
  // real just-confirmed measurements. Now shows the real saved value only.
  const stats = [
    { icon: Activity, label: 'Event Class', value: profileData?.primary_event ? `${profileData.primary_event} Athlete` : 'Not set' },
    {
      icon: Ruler,
      label: 'Biometrics',
      value: profileData?.height_cm && profileData?.weight_kg
        ? `${profileData.height_cm}cm / ${profileData.weight_kg}kg`
        : 'Not set',
    },
    { icon: Calendar, label: 'Train Capacity', value: profileData?.training_days ? `${profileData.training_days} Days / Wk` : 'Not set' },
    { icon: ShieldCheck, label: 'Safety Status', value: 'Shield Active', accent: 'text-[#FF4F21]' },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center text-center">
      {/* Brand Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="rounded-3xl bg-gradient-to-tr from-[#FF5E2B] to-[#FF3B00] flex items-center justify-center shadow-[0_10px_25px_rgba(255,79,33,0.35)] mb-5"
        style={{ width: '72px', height: '72px' }}
      >
        <Award className="h-8 w-8 text-white" />
      </motion.div>

      {/* Title */}
      <h1
        style={{
          fontFamily: "'Mazzard', sans-serif",
          fontWeight: 600,
          fontSize: '26px',
          lineHeight: '30px',
          letterSpacing: '0.01em',
          color: '#FF4F21',
        }}
      >
        You&apos;re All Set!
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontFamily: "'Mazzard', sans-serif",
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '20px',
          color: '#6E6D6D',
          marginTop: '6px',
          maxWidth: '320px',
        }}
      >
        Your athlete profile is calibrated. You are ready to analyze sprint biomechanics.
      </p>

      {/* Summary Badges */}
      {profileData && (
        <div className="w-full grid grid-cols-2 gap-2.5 mt-6 mb-2">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                style={{
                  boxSizing: 'border-box',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #EBEBEB',
                  boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.08)',
                  borderRadius: '20px',
                  padding: '14px 16px',
                }}
                className="flex items-center gap-2.5 text-left"
              >
                <Icon className={`h-5 w-5 shrink-0 ${stat.accent || 'text-[#FF4F21]'}`} />
                <div className="min-w-0">
                  <span
                    style={{
                      fontFamily: "'Mazzard', sans-serif",
                      fontWeight: 600,
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#8C8C8C',
                      display: 'block',
                    }}
                  >
                    {stat.label}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Mazzard', sans-serif",
                      fontWeight: 600,
                      fontSize: '12px',
                      color: '#1D1B20',
                      display: 'block',
                    }}
                    className="truncate mt-0.5"
                  >
                    {stat.value}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enter Workspace Button */}
      <button
        onClick={handleEnterWorkspace}
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
        className="flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform cursor-pointer"
      >
        <span>Enter Dashboard</span>
        <ChevronRight className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
