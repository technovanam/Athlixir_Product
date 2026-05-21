'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, api } from '../../context/AuthContext';
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
        const data = response.data?.data?.data || {};
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/onboarding/upload-photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data?.data?.url) {
        setProfilePhoto(response.data.data.url);
      }
    } catch (err: any) {
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
      router.push('/onboarding/classification');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save basic athlete info.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 space-y-8 animate-fadeIn">
      <div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <User className="h-6 w-6 text-[#FF4F21]" />
          <span>Step 1: Athlete Basic Information</span>
        </h2>
        <p className="text-zinc-400 text-xs mt-1">
          Let’s set up your core athlete identity card. You can edit this anytime inside your dashboard settings.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Photo Uploader */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-zinc-900">
          <div className="relative h-20 w-20 rounded-full border border-zinc-800 bg-zinc-900/50 flex items-center justify-center overflow-hidden shadow-inner">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
            ) : uploading ? (
              <Loader2 className="h-6 w-6 animate-spin text-[#FF4F21]" />
            ) : (
              <User className="h-8 w-8 text-zinc-600" />
            )}
          </div>
          <div className="space-y-2 text-center sm:text-left">
            <span className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">Avatar Image</span>
            <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-300 hover:text-white hover:border-zinc-700 cursor-pointer text-xs font-medium transition duration-200">
              <Upload className="h-3.5 w-3.5" />
              <span>{uploading ? 'Uploading image...' : 'Upload Photo'}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
            <p className="text-[10px] text-zinc-500">Supports JPEG, PNG up to 5MB</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. John Doe"
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition duration-200 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
            />
          </div>

          {/* Readonly Email */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Registered Email</label>
            <div className="relative flex items-center">
              <input
                type="email"
                readOnly
                value={user?.email || ''}
                className="block w-full rounded-xl border border-zinc-900 bg-zinc-950/20 px-4 py-3 text-xs text-zinc-500 outline-none select-none cursor-not-allowed"
              />
              <Mail className="absolute right-4 h-4 w-4 text-zinc-700" />
            </div>
          </div>

          {/* DOB */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Date of Birth</label>
            <input
              type="date"
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-xs text-white outline-none transition duration-200 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-xs text-white outline-none transition duration-200 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30 cursor-pointer"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* State */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">State</label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g. California"
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition duration-200 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">City</label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Los Angeles"
              className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3 text-xs text-white placeholder-zinc-600 outline-none transition duration-200 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30"
            />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex justify-end pt-6 border-t border-zinc-900">
          <button
            type="submit"
            disabled={loading || uploading}
            className="flex items-center gap-1.5 px-6 py-3 rounded-xl bg-[#FF4F21] hover:brightness-110 text-xs font-bold text-white shadow-lg shadow-[#FF4F21]/20 transition duration-200 cursor-pointer disabled:opacity-50"
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
