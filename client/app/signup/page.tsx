'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Trophy, Target, User, Mail, Lock, ShieldCheck, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

export default function SignupPage() {
  const { signup, error, setError } = useAuth();
  const [role, setRole] = useState('ATHLETE');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!username || !email || !password || !confirmPassword) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(username, email, password);
    } catch (err) {
      // Handled by AuthContext error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-black bg-cover bg-center bg-no-repeat px-4 py-6 font-sans" style={{ backgroundImage: `url('/stadium_grass_bg.png')` }}>
      <div className="absolute inset-0 bg-[#0a0f1c]/80 backdrop-blur-[2px]"></div>
      
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link href="/" className="flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] text-zinc-400 uppercase hover:text-white transition duration-200 cursor-pointer">
          <ArrowLeft className="h-4 w-4 text-[#FF5722]" />
          <span>BACK TO HOME</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[760px] flex flex-col items-center mt-2">
        
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="mb-3">
            <svg width="36" height="26" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M4 22L12 4L20 22" />
            </svg>
          </div>
          <h1 className="text-[28px] sm:text-[36px] font-black tracking-tight text-white mb-1 uppercase">
            JOIN THE ECOSYSTEM
          </h1>
          <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase mt-1">
            Create your verified <span className="text-[#FF5722]">digital profile</span>
          </p>
        </div>

        {/* Main Panel */}
        <div className="w-full flex flex-col sm:flex-row rounded-[20px] bg-[#0c0c0c]/95 border border-white/5 shadow-2xl backdrop-blur-xl overflow-hidden min-h-[400px]">
          
          {/* Left Sidebar - Roles */}
          <div className="flex sm:flex-col gap-3 p-4 sm:p-6 border-b sm:border-b-0 sm:border-r border-white/5 bg-black/40 sm:w-[140px] shrink-0 justify-center sm:justify-start">
            
            <button
              type="button"
              onClick={() => setRole('ATHLETE')}
              className={`flex flex-col items-center justify-center gap-2 w-[72px] h-[72px] sm:w-full sm:h-[84px] rounded-[16px] transition-all duration-200 ${
                role === 'ATHLETE' 
                  ? 'bg-[#FF5722] text-white shadow-[0_0_20px_rgba(255,87,34,0.15)]' 
                  : 'bg-[#1a1a1a] text-zinc-500 hover:bg-[#222] hover:text-zinc-300'
              }`}
            >
              <Trophy className={`h-5 w-5 ${role === 'ATHLETE' ? 'text-white' : 'text-zinc-400'}`} strokeWidth={role === 'ATHLETE' ? 2 : 1.5} />
              <span className="text-[9px] font-bold tracking-[0.1em] uppercase">Athlete</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('COACH')}
              className={`flex flex-col items-center justify-center gap-2 w-[72px] h-[72px] sm:w-full sm:h-[84px] rounded-[16px] transition-all duration-200 ${
                role === 'COACH' 
                  ? 'bg-[#FF5722] text-white shadow-[0_0_20px_rgba(255,87,34,0.15)]' 
                  : 'bg-[#1a1a1a] text-zinc-500 hover:bg-[#222] hover:text-zinc-300'
              }`}
            >
              <Target className={`h-5 w-5 ${role === 'COACH' ? 'text-white' : 'text-zinc-400'}`} strokeWidth={role === 'COACH' ? 2 : 1.5} />
              <span className="text-[9px] font-bold tracking-[0.1em] uppercase">Coach</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('USER')}
              className={`flex flex-col items-center justify-center gap-2 w-[72px] h-[72px] sm:w-full sm:h-[84px] rounded-[16px] transition-all duration-200 ${
                role === 'USER' 
                  ? 'bg-[#FF5722] text-white shadow-[0_0_20px_rgba(255,87,34,0.15)]' 
                  : 'bg-transparent text-zinc-500 hover:bg-[#1a1a1a] hover:text-zinc-300'
              }`}
            >
              <User className={`h-5 w-5 ${role === 'USER' ? 'text-white' : 'text-zinc-400'}`} strokeWidth={role === 'USER' ? 2 : 1.5} />
              <span className="text-[9px] font-bold tracking-[0.1em] uppercase">User</span>
            </button>

          </div>

          {/* Right Area - Form */}
          <div className="flex-1 p-5 sm:p-8 flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-[480px] mx-auto space-y-5">
              
              {/* Error Notifications */}
              {(error || validationError) && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs text-red-400">
                  <span className="font-semibold">Error:</span> {validationError || error}
                </div>
              )}

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label htmlFor="username" className="block text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">
                    Full Identity Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-600">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      required
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError(null);
                        setValidationError(null);
                      }}
                      className="block w-full rounded-[12px] border border-transparent bg-[#171717] pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition duration-200 focus:border-[#FF5722]/30 focus:ring-1 focus:ring-[#FF5722]/30 focus:bg-[#1c1c1c]"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">
                    Secure Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-600">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                        setValidationError(null);
                      }}
                      className="block w-full rounded-[12px] border border-transparent bg-[#171717] pl-11 pr-4 py-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition duration-200 focus:border-[#FF5722]/30 focus:ring-1 focus:ring-[#FF5722]/30 focus:bg-[#1c1c1c]"
                      placeholder="name@email.com"
                    />
                  </div>
                </div>

                {/* Passwords - Grid layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">
                      Access Key
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-600">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        id="password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                          setValidationError(null);
                        }}
                        className="block w-full rounded-[12px] border border-transparent bg-[#171717] pl-11 pr-3 py-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition duration-200 focus:border-[#FF5722]/30 focus:ring-1 focus:ring-[#FF5722]/30 focus:bg-[#1c1c1c] tracking-[0.2em]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-[9px] font-bold uppercase tracking-[0.15em] text-zinc-400 mb-2">
                      Confirm Key
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-600">
                        <ShieldCheck className="h-4 w-4" />
                      </div>
                      <input
                        type="password"
                        id="confirmPassword"
                        required
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setError(null);
                          setValidationError(null);
                        }}
                        className="block w-full rounded-[12px] border border-transparent bg-[#171717] pl-11 pr-3 py-3 text-sm text-zinc-200 placeholder-zinc-700 outline-none transition duration-200 focus:border-[#FF5722]/30 focus:ring-1 focus:ring-[#FF5722]/30 focus:bg-[#1c1c1c] tracking-[0.2em]"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-[12px] bg-[#FF5722] py-3.5 text-[12px] font-bold uppercase tracking-widest text-white hover:bg-[#f24c16] transition-colors duration-200 outline-none focus:ring-2 focus:ring-[#FF5722] focus:ring-offset-2 focus:ring-offset-[#121212] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer group"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create Profile</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

            </form>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="mt-5 text-center text-[11px] font-medium text-zinc-500 tracking-wide">
          Already an Athlete?{' '}
          <Link href="/login" className="font-bold text-[#FF5722] hover:opacity-80 transition-opacity uppercase tracking-wider ml-1">
            Access Portal
          </Link>
        </div>

      </div>
    </div>
  );
}
