'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth, api } from '../../context/AuthContext';
import { getOnboardingProfile, unwrapApiData } from '../../utils/api';
import { User, Mail, Loader2, Camera, AlertCircle, MapPin, Calendar, ChevronDown } from 'lucide-react';
import MobileDatePickerModal from '../../components/ui/MobileDatePickerModal';
import MobileDropdownModal from '../../components/ui/MobileDropdownModal';

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male', subtext: 'Biological sex calibration' },
  { value: 'Female', label: 'Female', subtext: 'Biological sex calibration' },
  { value: 'Other', label: 'Other', subtext: 'Custom athletic calibration' },
];

export default function BasicInfoStep() {
  const { user } = useAuth();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('2000-05-15');
  const [gender, setGender] = useState('Male');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [profilePhoto, setProfilePhoto] = useState('');

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isGenderModalOpen, setIsGenderModalOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSavedData() {
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
      } catch (err) {
        if (user?.name || user?.username) {
          setFullName(user.name || user.username);
        }
      }
    }
    loadSavedData();
  }, [user]);

  useEffect(() => {
    if (!fullName && (user?.name || user?.username)) {
      setFullName(user.name || user.username);
    }
  }, [user, fullName]);

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
      const response = await api.post('/onboarding/upload-photo', formData);
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
        profilePhoto: profilePhoto.startsWith('http') ? profilePhoto : undefined,
      });
      router.replace('/onboarding/classification');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save basic athlete info.');
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
          Basic Information
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
          Tell us about yourself to calibrate your athlete identity.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 rounded-2xl border border-red-100 bg-red-50/90 p-3 text-xs text-red-600 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        
        {/* Profile Photo Uploader */}
        <div className="flex flex-col items-center gap-2 pb-1">
          <div className="relative">
            <div
              className="rounded-full flex items-center justify-center overflow-hidden relative"
              style={{
                width: '80px',
                height: '80px',
                border: '2px solid #EBEBEB',
                backgroundColor: '#FAFAFA',
              }}
            >
              {profilePhoto ? (
                profilePhoto.startsWith('blob:') || profilePhoto.startsWith('data:') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <Image src={profilePhoto} alt="Profile" fill sizes="80px" unoptimized className="h-full w-full object-cover" />
                )
              ) : uploading ? (
                <Loader2 className="h-6 w-6 animate-spin text-[#FF4F21]" />
              ) : (
                <User className="h-8 w-8 text-[#6E6D6D]" />
              )}
            </div>
            <label
              className="absolute bottom-0 right-0 rounded-full flex items-center justify-center text-white cursor-pointer shadow-md active:scale-95 transition"
              style={{
                width: '28px',
                height: '28px',
                backgroundColor: '#FF4F21',
                border: '2px solid #FFFFFF',
              }}
            >
              <Camera size={13} />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploading} />
            </label>
          </div>
          <span
            style={{
              fontFamily: "'Mazzard', sans-serif",
              fontSize: '12px',
              color: '#8C8C8C',
            }}
          >
            {uploading ? 'Uploading avatar...' : 'Add Profile Photo'}
          </span>
        </div>

        {/* Full Name */}
        <div
          className="flex items-center transition-all duration-200 focus-within:border-[#FF4F21] focus-within:ring-4 focus-within:ring-[#FF4F21]/15"
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '56px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #EBEBEB',
            boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.15)',
            borderRadius: '26px',
            paddingLeft: '21px',
            paddingRight: '21px',
          }}
        >
          <User className="h-[22px] w-[22px] text-[#6E6D6D] shrink-0" />
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            style={{
              fontFamily: "'Mazzard', sans-serif",
              fontSize: '15px',
              color: '#1D1B20',
            }}
            className="w-full h-full bg-transparent pl-3 pr-1 placeholder-[#6E6D6D] outline-none"
          />
        </div>

        {/* Registered Email (Read-only) */}
        <div
          className="flex items-center"
          style={{
            boxSizing: 'border-box',
            width: '100%',
            height: '56px',
            backgroundColor: '#FAFAFA',
            border: '1px solid #EBEBEB',
            borderRadius: '26px',
            paddingLeft: '21px',
            paddingRight: '21px',
          }}
        >
          <Mail className="h-[22px] w-[22px] text-[#8C8C8C] shrink-0" />
          <input
            type="email"
            readOnly
            value={user?.email || ''}
            style={{
              fontFamily: "'Mazzard', sans-serif",
              fontSize: '15px',
              color: '#8C8C8C',
            }}
            className="w-full h-full bg-transparent pl-3 pr-1 outline-none cursor-not-allowed"
          />
        </div>

        {/* Date of Birth & Gender (Custom Mobile Modals) */}
        <div className="grid grid-cols-2 gap-3">
          {/* DOB Button Trigger */}
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            style={{
              boxSizing: 'border-box',
              height: '56px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EBEBEB',
              boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.15)',
              borderRadius: '26px',
              paddingLeft: '16px',
              paddingRight: '12px',
            }}
            className="flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer hover:border-[#FF4F21]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="h-[18px] w-[18px] text-[#6E6D6D] shrink-0" />
              <div className="truncate">
                <div style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '10px', color: '#8C8C8C' }}>DOB</div>
                <div style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '13px', color: '#1D1B20', fontWeight: 500 }} className="truncate">
                  {dob || 'Select Date'}
                </div>
              </div>
            </div>
            <ChevronDown size={14} className="text-[#8C8C8C] shrink-0" />
          </button>

          {/* Gender Button Trigger */}
          <button
            type="button"
            onClick={() => setIsGenderModalOpen(true)}
            style={{
              boxSizing: 'border-box',
              height: '56px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EBEBEB',
              boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.15)',
              borderRadius: '26px',
              paddingLeft: '16px',
              paddingRight: '12px',
            }}
            className="flex items-center justify-between text-left transition-all active:scale-[0.98] cursor-pointer hover:border-[#FF4F21]"
          >
            <div className="flex items-center gap-2 min-w-0">
              <User className="h-[18px] w-[18px] text-[#6E6D6D] shrink-0" />
              <div className="truncate">
                <div style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '10px', color: '#8C8C8C' }}>Gender</div>
                <div style={{ fontFamily: "'Mazzard', sans-serif", fontSize: '13px', color: '#1D1B20', fontWeight: 500 }} className="truncate">
                  {gender}
                </div>
              </div>
            </div>
            <ChevronDown size={14} className="text-[#8C8C8C] shrink-0" />
          </button>
        </div>

        {/* State & City */}
        <div className="grid grid-cols-2 gap-3">
          {/* State */}
          <div
            className="flex items-center transition-all duration-200 focus-within:border-[#FF4F21] focus-within:ring-4 focus-within:ring-[#FF4F21]/15"
            style={{
              boxSizing: 'border-box',
              height: '56px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EBEBEB',
              boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.15)',
              borderRadius: '26px',
              paddingLeft: '16px',
              paddingRight: '12px',
            }}
          >
            <MapPin className="h-[18px] w-[18px] text-[#6E6D6D] shrink-0" />
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="State"
              style={{
                fontFamily: "'Mazzard', sans-serif",
                fontSize: '14px',
                color: '#1D1B20',
              }}
              className="w-full h-full bg-transparent pl-2 placeholder-[#6E6D6D] outline-none"
            />
          </div>

          {/* City */}
          <div
            className="flex items-center transition-all duration-200 focus-within:border-[#FF4F21] focus-within:ring-4 focus-within:ring-[#FF4F21]/15"
            style={{
              boxSizing: 'border-box',
              height: '56px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #EBEBEB',
              boxShadow: '0px 2px 2.7px rgba(0, 0, 0, 0.15)',
              borderRadius: '26px',
              paddingLeft: '16px',
              paddingRight: '12px',
            }}
          >
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City"
              style={{
                fontFamily: "'Mazzard', sans-serif",
                fontSize: '14px',
                color: '#1D1B20',
              }}
              className="w-full h-full bg-transparent pl-2 placeholder-[#6E6D6D] outline-none"
            />
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={loading || uploading}
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

      {/* Mobile Calendar Modal */}
      <MobileDatePickerModal
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        title="Date of Birth"
        value={dob}
        onChange={(newDate) => setDob(newDate)}
      />

      {/* Mobile Gender Dropdown Modal */}
      <MobileDropdownModal
        isOpen={isGenderModalOpen}
        onClose={() => setIsGenderModalOpen(false)}
        title="Select Gender"
        options={GENDER_OPTIONS}
        selectedValue={gender}
        onSelect={(newGender) => setGender(newGender)}
      />
    </div>
  );
}
