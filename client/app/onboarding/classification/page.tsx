'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';
import MobileDropdownModal from '../../components/ui/MobileDropdownModal';

const RUNNING_TYPES = [
  { id: 'Sprint', label: 'Sprint', desc: 'Short-burst explosiveness (100m - 400m)' },
  { id: 'Middle Distance', label: 'Middle Distance', desc: 'Aerobic & anaerobic pacing (800m - 1500m)' },
  { id: 'Long Distance', label: 'Long Distance', desc: 'Durability & threshold (5K - 10K)' },
];

const EVENTS_BY_TYPE: Record<string, string[]> = {
  'Sprint': ['100m', '200m', '400m'],
  'Middle Distance': ['800m', '1500m'],
  'Long Distance': ['5K', '10K'],
};

const COMPETITION_LEVELS = [
  { id: 'Beginner', label: 'Beginner' },
  { id: 'School', label: 'School' },
  { id: 'District', label: 'District' },
  { id: 'State', label: 'State' },
  { id: 'National', label: 'National' },
];

export default function ClassificationStep() {
  const router = useRouter();

  const [runningType, setRunningType] = useState('Sprint');
  const [primaryEvent, setPrimaryEvent] = useState('100m');
  const [secondaryEvent, setSecondaryEvent] = useState('200m');
  const [competitionLevel, setCompetitionLevel] = useState('Beginner');

  const [isPrimaryModalOpen, setIsPrimaryModalOpen] = useState(false);
  const [isSecondaryModalOpen, setIsSecondaryModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = getOnboardingProfile(response) as any;
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
      router.replace('/onboarding/body-metrics');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save classification.');
    } finally {
      setLoading(false);
    }
  };

  const currentAvailableEvents = EVENTS_BY_TYPE[runningType] || ['100m', '200m', '400m'];

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
          Classification
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
          Select your track category and competition tier.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/90 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Running Category */}
        <div className="space-y-2">
          <label
            style={{
              fontFamily: "'Mazzard', sans-serif",
              fontWeight: 600,
              fontSize: '12px',
              color: '#1D1B20',
            }}
          >
            Running Category
          </label>
          <div className="space-y-2">
            {RUNNING_TYPES.map((t) => {
              const active = runningType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleRunningTypeChange(t.id)}
                  style={{
                    boxSizing: 'border-box',
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: '20px',
                    backgroundColor: active ? '#FFF8F5' : '#FFFFFF',
                    border: active ? '1.5px solid #FF4F21' : '1px solid #EBEBEB',
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
                        color: active ? '#FF4F21' : '#1D1B20',
                      }}
                    >
                      {t.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Mazzard', sans-serif",
                        fontSize: '12px',
                        color: '#6E6D6D',
                        marginTop: '2px',
                      }}
                    >
                      {t.desc}
                    </div>
                  </div>
                  <div
                    className="rounded-full flex items-center justify-center shrink-0 ml-3"
                    style={{
                      width: '20px',
                      height: '20px',
                      backgroundColor: active ? '#FF4F21' : '#EBEBEB',
                    }}
                  >
                    {active && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Primary & Secondary Event Pickers (Mobile Dropdown Triggers) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          {/* Primary Event Trigger */}
          <div>
            <label
              className="block mb-1.5"
              style={{
                fontFamily: "'Mazzard', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                color: '#1D1B20',
              }}
            >
              Primary Event
            </label>
            <button
              type="button"
              onClick={() => setIsPrimaryModalOpen(true)}
              style={{
                boxSizing: 'border-box',
                width: '100%',
                height: '52px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EBEBEB',
                boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.12)',
                borderRadius: '26px',
                paddingLeft: '16px',
                paddingRight: '14px',
              }}
              className="flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer hover:border-[#FF4F21]"
            >
              <span style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '14px', color: '#1D1B20', fontWeight: 500 }}>
                {primaryEvent}
              </span>
              <ChevronDown size={15} className="text-[#8C8C8C]" />
            </button>
          </div>

          {/* Secondary Event Trigger */}
          <div>
            <label
              className="block mb-1.5"
              style={{
                fontFamily: "'Mazzard', sans-serif",
                fontWeight: 600,
                fontSize: '12px',
                color: '#1D1B20',
              }}
            >
              Secondary Event
            </label>
            <button
              type="button"
              onClick={() => setIsSecondaryModalOpen(true)}
              style={{
                boxSizing: 'border-box',
                width: '100%',
                height: '52px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #EBEBEB',
                boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.12)',
                borderRadius: '26px',
                paddingLeft: '16px',
                paddingRight: '14px',
              }}
              className="flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer hover:border-[#FF4F21]"
            >
              <span style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '14px', color: '#1D1B20', fontWeight: 500 }}>
                {secondaryEvent}
              </span>
              <ChevronDown size={15} className="text-[#8C8C8C]" />
            </button>
          </div>
        </div>

        {/* Competition Level */}
        <div className="space-y-1.5 pt-1">
          <label
            style={{
              fontFamily: "'Mazzard', sans-serif",
              fontWeight: 600,
              fontSize: '12px',
              color: '#1D1B20',
            }}
          >
            Competition Tier
          </label>
          <div className="flex flex-wrap gap-2">
            {COMPETITION_LEVELS.map((lvl) => {
              const active = competitionLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setCompetitionLevel(lvl.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    backgroundColor: active ? '#FF4F21' : '#FAFAFA',
                    border: active ? '1px solid #FF4F21' : '1px solid #EBEBEB',
                    fontFamily: "'Mazzard', sans-serif",
                    fontWeight: 500,
                    fontSize: '13px',
                    color: active ? '#FFFFFF' : '#6E6D6D',
                    boxShadow: active ? '0px 2px 8px rgba(255, 79, 33, 0.3)' : 'none',
                  }}
                  className="transition-all active:scale-95 cursor-pointer"
                >
                  {lvl.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
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

      {/* Primary Event Modal */}
      <MobileDropdownModal
        isOpen={isPrimaryModalOpen}
        onClose={() => setIsPrimaryModalOpen(false)}
        title="Select Primary Event"
        options={currentAvailableEvents}
        selectedValue={primaryEvent}
        onSelect={(val) => setPrimaryEvent(val)}
      />

      {/* Secondary Event Modal */}
      <MobileDropdownModal
        isOpen={isSecondaryModalOpen}
        onClose={() => setIsSecondaryModalOpen(false)}
        title="Select Secondary Event"
        options={currentAvailableEvents}
        selectedValue={secondaryEvent}
        onSelect={(val) => setSecondaryEvent(val)}
      />
    </div>
  );
}
