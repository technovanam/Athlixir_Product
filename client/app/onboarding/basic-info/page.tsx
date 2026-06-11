'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, api } from '../../context/AuthContext';
import { getOnboardingProfile, unwrapApiData } from '../../utils/api';
import { User, Mail, Calendar, MapPin, Loader2, ArrowRight, Upload, AlertCircle } from 'lucide-react';

export default function BasicInfoStep() {
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill existing status if they already filled parts of it and are resuming
  useEffect(() => {
    async function loadSavedData() {
      try {
        const response = await api.get('/onboarding/status');
        const data = getOnboardingProfile(response) as any;
        if (data.full_name) setFullName(data.full_name);
        if (data.dob) setDob(data.dob.split('T')[0]); // YYYY-MM-DD
        if (data.gender) setGender(data.gender);
        if (data.state) setState(data.state);
        if (data.city) setCity(data.city);
        if (data.profile_photo) setProfilePhoto(data.profile_photo);
      } catch (err) {
        // Safe to ignore on fresh profiles
      }
    }
    loadSavedData();
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const previewUrl = URL.createObjectURL(file);
    setProfilePhoto(previewUrl);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/onboarding/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = unwrapApiData<{ url?: string }>(response);
      if (result?.url) {
        URL.revokeObjectURL(previewUrl);
        setProfilePhoto(result.url);
      }
    } catch (err: any) {
      URL.revokeObjectURL(previewUrl);
      try {
        const statusRes = await api.get('/onboarding/status');
        const saved = getOnboardingProfile(statusRes);
        setProfilePhoto((saved.profile_photo as string) || '');
      } catch {
        setProfilePhoto('');
      }
      setError(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !dob || !state.trim() || !city.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.post('/onboarding/basic-info', {
        fullName,
        dob,
        gender,
        state,
        city,
        profilePhoto,
      });
      router.replace('/onboarding/classification');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save basic athlete info.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn relative">
      <div>
        <h2 className="text-xl md:text-2xl font-black tracking-wider text-white flex items-center gap-2 uppercase crt-glow-white">
          <User className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 1: Athlete Basic Information</span>
        </h2>
        <p className="text-zinc-500 text-xs mt-1 font-medium">
          Let’s set up your core athlete identity card. You can edit this anytime inside your dashboard settings.
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
        {/* Profile Photo Uploader */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/[0.05]">
          <div className="relative group shrink-0">
            <div className="h-20 w-20 rounded-full border border-white/[0.08] bg-[#08080C]/40 flex items-center justify-center overflow-hidden shadow-inner relative z-10">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
              ) : uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#FF4F21]" />
              ) : (
                <User className="h-8 w-8 text-zinc-600" />
              )}
            </div>
            <div className="absolute inset-[-4px] rounded-full border border-[#FF4F21]/20 animate-[spin_10s_linear_infinite] pointer-events-none" />
            <div className="absolute inset-[-8px] rounded-full border border-[#FF4F21]/5 animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <span className="block text-[10px] font-black uppercase tracking-widest text-zinc-400">Avatar Image</span>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/[0.05] bg-white/[0.02] text-zinc-300 hover:text-white hover:border-[#FF4F21]/30 hover:bg-[#FF4F21]/5 cursor-pointer text-xs font-bold transition-all duration-300">
              <Upload className="h-3.5 w-3.5 text-[#FF4F21]" />
              <span>{uploading ? 'Uploading image...' : 'Upload Photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
            <p className="text-[9px] text-zinc-500 font-medium">Supports JPEG, PNG up to 5MB</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Full Name */}
          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 transition-colors duration-200 group-focus-within:text-[#FF4F21]">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="block w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#FF4F21] transition duration-200"
            />
          </div>

          {/* Readonly Email */}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Registered Email</label>
            <div className="relative flex items-center">
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                className="block w-full bg-zinc-900/20 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-zinc-500 cursor-not-allowed border-dashed select-none"
              />
              <Mail className="absolute right-4 h-4 w-4 text-zinc-700" />
            </div>
          </div>

          {/* DOB */}
          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 transition-colors duration-200 group-focus-within:text-[#FF4F21]">Date of Birth</label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="block w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 cursor-pointer"
            />
          </div>

          {/* Gender */}
          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 transition-colors duration-200 group-focus-within:text-[#FF4F21]">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="block w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#FF4F21] transition duration-200 appearance-none cursor-pointer"
            >
              <option value="Male" className="bg-[#08080C] text-white">Male</option>
              <option value="Female" className="bg-[#08080C] text-white">Female</option>
              <option value="Other" className="bg-[#08080C] text-white">Other</option>
            </select>
          </div>

          {/* State */}
          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 transition-colors duration-200 group-focus-within:text-[#FF4F21]">State</label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="California"
              className="block w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#FF4F21] transition duration-200"
            />
          </div>

          {/* City */}
          <div className="group">
            <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 transition-colors duration-200 group-focus-within:text-[#FF4F21]">City</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Los Angeles"
              className="block w-full bg-black/40 border border-white/[0.05] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-[#FF4F21] transition duration-200"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end pt-6 border-t border-white/[0.05]">
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#FF4F21] to-[#FF8433] hover:brightness-110 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-[#FF4F21]/20 active:scale-98 transition duration-200 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving details...</span>
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
