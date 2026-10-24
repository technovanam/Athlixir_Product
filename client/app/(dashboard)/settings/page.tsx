'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, api } from '../../context/AuthContext';
import { getOnboardingProfile } from '../../utils/api';
import { 
  User, Shield, Sliders, Bell, LogOut, Trash2, 
  Activity, AlertCircle, CheckCircle2, Loader2, ArrowLeft, Calendar,
  ChevronDown, Sparkles, Cpu, Eye, Check, Key, Smartphone, HardDrive,
  Flame, Award
} from 'lucide-react';
import MobileDatePickerModal from '../../components/ui/MobileDatePickerModal';
import MobileDropdownModal from '../../components/ui/MobileDropdownModal';

const RUNNING_TYPES = [
  { value: 'Sprint', label: 'Sprint', subtext: 'Short-distance explosive sprinting (60m - 400m)' },
  { value: 'Middle Distance', label: 'Middle Distance', subtext: '800m - 1500m sustained speed' },
  { value: 'Long Distance', label: 'Long Distance', subtext: '5K - 10K endurance running' },
];

const EVENTS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  'Sprint': [
    { value: '60m', label: '60m Indoor Sprint' },
    { value: '100m', label: '100m Outdoor Sprint' },
    { value: '200m', label: '200m Curved Sprint' },
    { value: '400m', label: '400m Sprint' },
  ],
  'Middle Distance': [
    { value: '800m', label: '800m Middle Distance' },
    { value: '1500m', label: '1500m Metric Mile' },
  ],
  'Long Distance': [
    { value: '5K', label: '5K Track / Road' },
    { value: '10K', label: '10K Road Race' },
  ],
};

const COMPETITION_LEVELS = [
  { value: 'Beginner', label: 'Beginner', subtext: 'Starting sprint mechanics training' },
  { value: 'School', label: 'School / Club', subtext: 'Inter-school & local track club' },
  { value: 'District', label: 'District Level', subtext: 'District level competitive athlete' },
  { value: 'State', label: 'State Level', subtext: 'State-ranked competitive squad' },
  { value: 'National', label: 'National Level', subtext: 'National championship competitor' },
  { value: 'Elite', label: 'International / Elite', subtext: 'Sub-10.20s standard or equivalent' },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', subtext: 'Biological male kinematic baseline' },
  { value: 'Female', label: 'Female', subtext: 'Biological female kinematic baseline' },
  { value: 'Other', label: 'Other', subtext: 'Custom biomechanics calibration' },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'analysis' | 'ai_hardware' | 'security'>('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states - Account Tab
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2000-01-01');
  const [gender, setGender] = useState('Male');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  // Modals
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPrimaryEventModalOpen, setIsPrimaryEventModalOpen] = useState(false);
  const [isSecondaryEventModalOpen, setIsSecondaryEventModalOpen] = useState(false);
  const [isCompLevelModalOpen, setIsCompLevelModalOpen] = useState(false);

  // Form states - Analysis Tab
  const [runningType, setRunningType] = useState('Sprint');
  const [primaryEvent, setPrimaryEvent] = useState('100m');
  const [secondaryEvent, setSecondaryEvent] = useState('200m');
  const [competitionLevel, setCompetitionLevel] = useState('Beginner');

  // Form states - AI & Hardware Preferences
  const [fatigueAlerts, setFatigueAlerts] = useState(true);
  const [highSpeedMode, setHighSpeedMode] = useState(true);
  const [metricUnits, setMetricUnits] = useState<'metric' | 'imperial'>('metric');
  const [aiSensitivity, setAiSensitivity] = useState<'Conservative' | 'Balanced' | 'Aggressive'>('Balanced');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get('/onboarding/status');
        const data = getOnboardingProfile(response) as any;
        if (data.full_name) {
          setFullName(data.full_name);
        } else if (user?.name || user?.username) {
          setFullName(user.name || user.username);
        }
        if (data.dob) setDob(data.dob.split('T')[0]);
        if (data.gender) setGender(data.gender);
        if (data.state) setState(data.state);
        if (data.city) setCity(data.city);
        if (data.profile_photo) setProfilePhoto(data.profile_photo);

        if (data.running_type) setRunningType(data.running_type);
        if (data.primary_event) setPrimaryEvent(data.primary_event);
        if (data.secondary_event) setSecondaryEvent(data.secondary_event);
        if (data.competition_level) setCompetitionLevel(data.competition_level);
      } catch (err) {
        console.error('Failed to load profile settings', err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/onboarding/basic-info', {
        fullName, dob, gender, state, city, profilePhoto,
      });
      await refreshUser();
      setSuccess('Profile details successfully saved!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/onboarding/classification', {
        runningType, primaryEvent, secondaryEvent, competitionLevel,
      });
      await refreshUser();
      setSuccess('Biomechanics preferences successfully updated!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update analysis preferences.');
    } finally {
      setSaving(false);
    }
  };

  const handleRunningTypeChange = (type: string) => {
    setRunningType(type);
    const available = EVENTS_BY_TYPE[type] || [];
    if (available.length > 0) {
      setPrimaryEvent(available[0].value);
      setSecondaryEvent(available[1]?.value || available[0].value);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh] bg-[#F2F2F7]">
        <Activity className="h-7 w-7 animate-spin text-[#FF4F21]" />
      </div>
    );
  }

  const TABS = [
    { id: 'account' as const, label: 'Athlete Profile', icon: User },
    { id: 'analysis' as const, label: 'Discipline & Events', icon: Sliders },
    { id: 'ai_hardware' as const, label: 'AI & Telemetry', icon: Cpu },
    { id: 'security' as const, label: 'Security & Session', icon: Shield },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  const userInitials = (fullName || user?.name || user?.username || 'A')
    .split(' ')
    .map(p => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-24 space-y-7 animate-fadeIn font-poppins relative z-10 text-[#1C1C1E]">
      
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-wider text-[#8E8E93] uppercase block">
            {currentDate} · ATHLETE PREFERENCES & HARDWARE CALIBRATION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight mt-0.5 flex items-center gap-2">
            Athlete Settings <Sliders size={24} className="text-[#FF4F21]" />
          </h1>
        </div>
      </div>

      {/* Tab Switcher Pills */}
      <div className="flex items-center gap-2 bg-white rounded-2xl border border-black/[0.06] p-1.5 shadow-xs max-w-2xl overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSuccess(null); setError(null); }}
              className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-[#FF4F21] text-white shadow-xs'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/[0.03]'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Alerts */}
      {success && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs text-emerald-800 font-bold shadow-2xs animate-fadeIn">
          <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-red-50 border border-red-200 p-4 text-xs text-red-600 font-bold shadow-2xs animate-fadeIn">
          <AlertCircle size={16} className="shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: ATHLETE PROFILE */}
      {activeTab === 'account' && (
        <form onSubmit={handleSaveAccount} className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#FF4F21] text-white flex items-center justify-center font-black text-lg shadow-md shadow-[#FF4F21]/20">
                {userInitials}
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C1C1E]">
                  Athlete Profile Credentials
                </h3>
                <p className="text-xs text-[#8E8E93] font-medium">
                  Manage athlete name, biological baseline, and regional club location.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] border border-[#34C759]/20">
              Active Account
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Full Name */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#1C1C1E]">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full h-12 bg-[#F8F8FA] border border-black/[0.06] rounded-2xl px-4 text-xs font-semibold text-[#1C1C1E] outline-none focus:border-[#FF4F21] focus:bg-white transition"
                placeholder="Athlete Full Name"
              />
            </div>

            {/* Email Address (Readonly) */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-bold text-[#8E8E93]">Registered Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="w-full h-12 bg-[#F8F8FA]/60 border border-black/[0.04] rounded-2xl px-4 text-xs font-semibold text-[#8E8E93] outline-none cursor-not-allowed"
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1C1C1E]">Date of Birth</label>
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(true)}
                className="w-full h-12 flex items-center justify-between px-4 bg-[#F8F8FA] border border-black/[0.06] rounded-2xl text-xs font-semibold text-[#1C1C1E] hover:border-[#FF4F21] hover:bg-white transition cursor-pointer"
              >
                <span>{dob || 'Select Date'}</span>
                <Calendar size={16} className="text-[#FF4F21]" />
              </button>
            </div>

            {/* Biological Gender Baseline */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1C1C1E]">Biological Baseline</label>
              <button
                type="button"
                onClick={() => setIsGenderModalOpen(true)}
                className="w-full h-12 flex items-center justify-between px-4 bg-[#F8F8FA] border border-black/[0.06] rounded-2xl text-xs font-semibold text-[#1C1C1E] hover:border-[#FF4F21] hover:bg-white transition cursor-pointer"
              >
                <span>{gender || 'Select Gender'}</span>
                <ChevronDown size={16} className="text-[#8E8E93]" />
              </button>
            </div>

            {/* State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1C1C1E]">State / Region</label>
              <input
                type="text"
                required
                value={state}
                onChange={e => setState(e.target.value)}
                className="w-full h-12 bg-[#F8F8FA] border border-black/[0.06] rounded-2xl px-4 text-xs font-semibold text-[#1C1C1E] outline-none focus:border-[#FF4F21] focus:bg-white transition"
                placeholder="State (e.g. California / Karnataka)"
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1C1C1E]">City / Track Location</label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full h-12 bg-[#F8F8FA] border border-black/[0.06] rounded-2xl px-4 text-xs font-semibold text-[#1C1C1E] outline-none focus:border-[#FF4F21] focus:bg-white transition"
                placeholder="City (e.g. Los Angeles / Bengaluru)"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-black/[0.04] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: DISCIPLINE & EVENTS */}
      {activeTab === 'analysis' && (
        <form onSubmit={handleSaveAnalysis} className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#FFF5F2] text-[#FF4F21] flex items-center justify-center font-bold shadow-2xs">
                <Sliders size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C1C1E]">
                  Discipline & Kinematic Calibration
                </h3>
                <p className="text-xs text-[#8E8E93] font-medium">
                  Set target event distance and competition percentile benchmarking standards.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Running Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1C1C1E]">Running Discipline</label>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(true)}
                className="w-full h-12 flex items-center justify-between px-4 bg-[#F8F8FA] border border-black/[0.06] rounded-2xl text-xs font-semibold text-[#1C1C1E] hover:border-[#FF4F21] hover:bg-white transition cursor-pointer"
              >
                <span>{runningType}</span>
                <ChevronDown size={16} className="text-[#8E8E93]" />
              </button>
            </div>

            {/* Primary & Secondary Events */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1C1C1E]">Primary Event</label>
                <button
                  type="button"
                  onClick={() => setIsPrimaryEventModalOpen(true)}
                  className="w-full h-12 flex items-center justify-between px-4 bg-[#F8F8FA] border border-black/[0.06] rounded-2xl text-xs font-semibold text-[#1C1C1E] hover:border-[#FF4F21] hover:bg-white transition cursor-pointer"
                >
                  <span>{primaryEvent}</span>
                  <ChevronDown size={16} className="text-[#8E8E93]" />
                </button>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#1C1C1E]">Secondary Event</label>
                <button
                  type="button"
                  onClick={() => setIsSecondaryEventModalOpen(true)}
                  className="w-full h-12 flex items-center justify-between px-4 bg-[#F8F8FA] border border-black/[0.06] rounded-2xl text-xs font-semibold text-[#1C1C1E] hover:border-[#FF4F21] hover:bg-white transition cursor-pointer"
                >
                  <span>{secondaryEvent}</span>
                  <ChevronDown size={16} className="text-[#8E8E93]" />
                </button>
              </div>
            </div>

            {/* Competition Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#1C1C1E]">Competition Tier Baseline</label>
              <button
                type="button"
                onClick={() => setIsCompLevelModalOpen(true)}
                className="w-full h-12 flex items-center justify-between px-4 bg-[#F8F8FA] border border-black/[0.06] rounded-2xl text-xs font-semibold text-[#1C1C1E] hover:border-[#FF4F21] hover:bg-white transition cursor-pointer"
              >
                <span>{competitionLevel}</span>
                <ChevronDown size={16} className="text-[#8E8E93]" />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-black/[0.04] flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-full bg-[#FF4F21] text-white text-xs font-bold shadow-md shadow-[#FF4F21]/20 hover:bg-[#E03E12] active:scale-95 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              <span>Save Discipline Preferences</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 3: AI & TELEMETRY */}
      {activeTab === 'ai_hardware' && (
        <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#FFF5F2] text-[#FF4F21] flex items-center justify-center font-bold shadow-2xs">
                <Cpu size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C1C1E]">
                  AI Engine & Telemetry Parameters
                </h3>
                <p className="text-xs text-[#8E8E93] font-medium">
                  Configure real-time joint tracking precision, fatigue alert thresholds, and units.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* High Speed Processing */}
            <div className="flex items-center justify-between p-4.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04]">
              <div>
                <h4 className="text-xs font-bold text-[#1C1C1E]">High-Speed 60fps Joint Interpolation</h4>
                <p className="text-[11px] text-[#8E8E93] mt-0.5">Applies sub-frame kinetic smoothing for sub-10ms ground contact analysis.</p>
              </div>
              <button
                type="button"
                onClick={() => setHighSpeedMode(!highSpeedMode)}
                className={`w-12 h-7 rounded-full transition-colors cursor-pointer p-1 flex items-center ${
                  highSpeedMode ? 'bg-[#FF4F21] justify-end' : 'bg-black/[0.15] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* Fatigue Detection Thresholds */}
            <div className="flex items-center justify-between p-4.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04]">
              <div>
                <h4 className="text-xs font-bold text-[#1C1C1E]">Kinetic Fatigue Early-Warning Alerts</h4>
                <p className="text-[11px] text-[#8E8E93] mt-0.5">Triggers warning flags if sprint deceleration asymmetry exceeds 7%.</p>
              </div>
              <button
                type="button"
                onClick={() => setFatigueAlerts(!fatigueAlerts)}
                className={`w-12 h-7 rounded-full transition-colors cursor-pointer p-1 flex items-center ${
                  fatigueAlerts ? 'bg-[#FF4F21] justify-end' : 'bg-black/[0.15] justify-start'
                }`}
              >
                <div className="w-5 h-5 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            {/* AI Sensitivity */}
            <div className="p-4.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#1C1C1E]">AI Diagnostic Sensitivity</h4>
                  <p className="text-[11px] text-[#8E8E93] mt-0.5">Controls strictness when rating joint flexion and ground impact mechanics.</p>
                </div>
                <span className="text-xs font-black text-[#FF4F21]">{aiSensitivity}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(['Conservative', 'Balanced', 'Aggressive'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setAiSensitivity(mode)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                      aiSensitivity === mode
                        ? 'bg-[#FF4F21] text-white shadow-xs'
                        : 'bg-white border border-black/[0.06] text-[#636366] hover:text-[#1C1C1E]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & SESSIONS */}
      {activeTab === 'security' && (
        <div className="rounded-[28px] bg-white border border-black/[0.06] p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-[#FFF5F2] text-[#FF4F21] flex items-center justify-center font-bold shadow-2xs">
                <Shield size={22} />
              </div>
              <div>
                <h3 className="text-base font-black text-[#1C1C1E]">
                  Security, Session & Privacy
                </h3>
                <p className="text-xs text-[#8E8E93] font-medium">
                  Manage active device sessions, security tokens, and data lifecycle.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Sign Out Card */}
            <div className="flex items-center justify-between p-4.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white border border-black/[0.06] flex items-center justify-center shrink-0 shadow-2xs">
                  <LogOut size={18} className="text-[#636366]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1C1C1E]">Sign Out Active Session</h4>
                  <p className="text-[11px] text-[#8E8E93] mt-0.5">Terminate current authenticated browser session on this device.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 bg-white border border-black/[0.08] rounded-full text-xs font-bold text-[#1C1C1E] hover:border-[#FF4F21] hover:text-[#FF4F21] active:scale-95 transition shadow-2xs cursor-pointer"
              >
                Sign out
              </button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4.5 rounded-2xl bg-red-50/70 border border-red-200/80">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white border border-red-200 flex items-center justify-center shrink-0 shadow-2xs">
                  <Trash2 size={18} className="text-red-500" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-red-700">Delete Athlete Profile & Telemetry</h4>
                  <p className="text-[11px] text-red-600/80 mt-0.5">Permanently erase all historical video scans, metrics, and certified PDF archives.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    logout();
                  }
                }}
                className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-full text-xs font-bold hover:bg-red-600 hover:text-white active:scale-95 transition shadow-2xs cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <MobileDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        title="Date of Birth"
        value={dob}
        onChange={(val) => setDob(val)}
      />

      <MobileDropdownModal
        isOpen={isGenderModalOpen}
        onClose={() => setIsGenderModalOpen(false)}
        title="Select Gender"
        options={GENDER_OPTIONS}
        selectedValue={gender}
        onSelect={(val) => setGender(val)}
      />

      <MobileDropdownModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Running Category"
        options={RUNNING_TYPES}
        selectedValue={runningType}
        onSelect={(val) => handleRunningTypeChange(val)}
      />

      <MobileDropdownModal
        isOpen={isPrimaryEventModalOpen}
        onClose={() => setIsPrimaryEventModalOpen(false)}
        title="Primary Event"
        options={EVENTS_BY_TYPE[runningType] || []}
        selectedValue={primaryEvent}
        onSelect={(val) => setPrimaryEvent(val)}
      />

      <MobileDropdownModal
        isOpen={isSecondaryEventModalOpen}
        onClose={() => setIsSecondaryEventModalOpen(false)}
        title="Secondary Event"
        options={EVENTS_BY_TYPE[runningType] || []}
        selectedValue={secondaryEvent}
        onSelect={(val) => setSecondaryEvent(val)}
      />

      <MobileDropdownModal
        isOpen={isCompLevelModalOpen}
        onClose={() => setIsCompLevelModalOpen(false)}
        title="Competition Level"
        options={COMPETITION_LEVELS}
        selectedValue={competitionLevel}
        onSelect={(val) => setCompetitionLevel(val)}
      />
    </div>
  );
}
