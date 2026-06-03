'use client';

import React, { useEffect, useState } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { User, Shield, Sliders, Bell, LogOut, Trash2, Activity, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const RUNNING_TYPES = [
  { id: 'Sprint', label: 'Sprint' },
  { id: 'Middle Distance', label: 'Middle Distance' },
  { id: 'Long Distance', label: 'Long Distance' },
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

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'account' | 'analysis' | 'security'>('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states - Account Tab
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  // Form states - Analysis Tab
  const [runningType, setRunningType] = useState('Sprint');
  const [primaryEvent, setPrimaryEvent] = useState('100m');
  const [secondaryEvent, setSecondaryEvent] = useState('200m');
  const [competitionLevel, setCompetitionLevel] = useState('Beginner');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get('/onboarding/status');
        const data = response.data?.data?.data || {};
        if (data.full_name) setFullName(data.full_name);
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
  }, []);

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/onboarding/basic-info', {
        fullName,
        dob,
        gender,
        state,
        city,
        profilePhoto,
      });
      await refreshUser();
      setSuccess('Profile details successfully updated!');
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
        runningType,
        primaryEvent,
        secondaryEvent,
        competitionLevel,
      });
      await refreshUser();
      setSuccess('Analysis preferences successfully updated!');
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
      setPrimaryEvent(available[0]);
      setSecondaryEvent(available[1] || available[0]);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin text-[#FF4F21]"><Activity className="h-8 w-8" /></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 uppercase">Settings</h1>
          <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">Manage your ATHLIXIR profile, analysis preferences, and security.</p>
        </div>

        {/* Success/Error Alerts */}
        {success && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-[11px] text-emerald-450 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <span className="font-bold text-[10px] bg-emerald-500/10 text-emerald-450 px-1.5 py-0.5 rounded uppercase shrink-0 mr-2">Success</span>
              {success}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[11px] text-red-400 animate-fadeIn">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
            <div>
              <span className="font-bold text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase shrink-0 mr-2">Fail</span>
              {error}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-white/[0.05] pb-px">
          <button
            onClick={() => { setActiveTab('account'); setSuccess(null); setError(null); }}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition duration-200 uppercase tracking-widest cursor-pointer ${
              activeTab === 'account' ? 'border-[#FF4F21] text-[#FF4F21]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <User className="h-4 w-4" /> Account
          </button>
          <button
            onClick={() => { setActiveTab('analysis'); setSuccess(null); setError(null); }}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition duration-200 uppercase tracking-widest cursor-pointer ${
              activeTab === 'analysis' ? 'border-[#FF4F21] text-[#FF4F21]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Sliders className="h-4 w-4" /> Analysis
          </button>
          <button
            onClick={() => { setActiveTab('security'); setSuccess(null); setError(null); }}
            className={`pb-3 text-xs font-bold flex items-center gap-2 border-b-2 transition duration-200 uppercase tracking-widest cursor-pointer ${
              activeTab === 'security' ? 'border-[#FF4F21] text-[#FF4F21]' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Shield className="h-4 w-4" /> Security
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-8">
          
          {/* Account Settings */}
          {activeTab === 'account' && (
            <form onSubmit={handleSaveAccount} className="space-y-6">
              <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Profile Information</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-4">Update your basic athlete details.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      required
                      value={fullName} 
                      onChange={e => setFullName(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      value={user?.email || ''} 
                      readOnly 
                      className="w-full bg-zinc-900/20 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date of Birth</label>
                    <input 
                      type="date" 
                      required
                      value={dob} 
                      onChange={e => setDob(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Gender</label>
                    <select 
                      value={gender} 
                      onChange={e => setGender(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer"
                    >
                      <option value="Male" className="bg-[#08080C] text-white">Male</option>
                      <option value="Female" className="bg-[#08080C] text-white">Female</option>
                      <option value="Other" className="bg-[#08080C] text-white">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">State</label>
                    <input 
                      type="text" 
                      required
                      value={state} 
                      onChange={e => setState(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">City</label>
                    <input 
                      type="text" 
                      required
                      value={city} 
                      onChange={e => setCity(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200" 
                    />
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          )}

          {/* Analysis Settings */}
          {activeTab === 'analysis' && (
            <form onSubmit={handleSaveAnalysis} className="space-y-6">
              <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Biomechanics Preferences</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-4">Customize how the AI evaluates your runs.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Running Category</label>
                    <select 
                      value={runningType} 
                      onChange={e => handleRunningTypeChange(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer"
                    >
                      {RUNNING_TYPES.map(t => (
                        <option key={t.id} value={t.id} className="bg-[#08080C] text-white">{t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Primary Event</label>
                    <select 
                      value={primaryEvent} 
                      onChange={e => setPrimaryEvent(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer"
                    >
                      {(EVENTS_BY_TYPE[runningType] || []).map(ev => (
                        <option key={ev} value={ev} className="bg-[#08080C] text-white">{ev}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Secondary Event</label>
                    <select 
                      value={secondaryEvent} 
                      onChange={e => setSecondaryEvent(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer"
                    >
                      {(EVENTS_BY_TYPE[runningType] || []).map(ev => (
                        <option key={ev} value={ev} className="bg-[#08080C] text-white">{ev}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Competition Level</label>
                    <select 
                      value={competitionLevel} 
                      onChange={e => setCompetitionLevel(e.target.value)}
                      className="w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer"
                    >
                      {COMPETITION_LEVELS.map(lvl => (
                        <option key={lvl.id} value={lvl.id} className="bg-[#08080C] text-white">{lvl.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/[0.03] pt-6">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-wider"><Bell className="h-4 w-4 text-[#FF4F21]" /> AI Notifications</h4>
                    <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mt-0.5">Receive alerts when a new analysis is complete.</p>
                  </div>
                  <button type="button" className="h-6 w-10 rounded-full bg-[#FF4F21] relative transition-colors shadow-[0_0_10px_rgba(255,79,33,0.3)] cursor-pointer">
                    <span className="absolute right-1 top-1 h-4 w-4 rounded-full bg-white transition-transform" />
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  disabled={saving}
                  className="bg-white hover:bg-zinc-200 text-black px-5 py-2.5 rounded-xl text-xs font-bold transition duration-200 shadow-md uppercase tracking-wider cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Preferences</span>
                </button>
              </div>
            </form>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="rounded-xl border border-white/[0.05] bg-[#08080C]/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] backdrop-blur-md p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1 uppercase tracking-wide">Session Management</h3>
                  <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider mb-4">Manage your active devices and connections.</p>
                </div>
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-black/40">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-zinc-900 border border-white/[0.05] flex items-center justify-center">
                      <LogOut className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Log Out</h4>
                      <p className="text-[10px] text-zinc-500 font-medium mt-0.5">End your current session.</p>
                    </div>
                  </div>
                  <button onClick={logout} className="px-4 py-2 border border-white/[0.05] bg-white/[0.03] hover:bg-white/[0.08] rounded-xl text-xs font-bold transition duration-200 uppercase tracking-wider cursor-pointer">
                    Log out
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-red-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider">Delete Account</h4>
                      <p className="text-[10px] text-red-400/70 font-medium mt-0.5">Permanently delete your data and analyses.</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold hover:bg-red-500/20 transition duration-200 uppercase tracking-wider cursor-pointer">
                    Delete Data
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
