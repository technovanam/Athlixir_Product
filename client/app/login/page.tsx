'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      // Handled by AuthContext error state
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#08080C] px-6 py-12 font-sans overflow-hidden">
      {/* Carbon fiber subtle pattern texture */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] mix-blend-overlay pointer-events-none" />

      {/* Massive gradient background blooms */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#FF4F21]/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-4000" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#FF8433]/5 rounded-full blur-[100px] pointer-events-none animate-pulse duration-6000 delay-1000" />

      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-zinc-400 uppercase hover:text-white transition duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#FF4F21] transition-transform duration-200 hover:-translate-x-0.5" />
          <span>BACK TO HOME</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8 text-center animate-fadeIn">
          {/* Logo SVG */}
          <div className="mb-4 relative group">
            <div className="absolute inset-0 bg-[#FF4F21]/20 blur-[10px] rounded-full scale-75 group-hover:scale-110 transition duration-300 pointer-events-none" />
            <svg width="48" height="36" viewBox="0 0 24 24" fill="none" stroke="#FF4F21" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter" className="relative z-10">
              <path d="M4 22L12 4L20 22" />
            </svg>
          </div>
          <h2 className="text-[28px] font-black tracking-wider text-white mb-2 uppercase crt-glow-white">
            ATHLETE SIGN IN
          </h2>
          <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
            Secured Athlixir <span className="text-[#FF4F21]">Athlete Gate</span>
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full rounded-3xl border border-white/[0.05] bg-[#08080C]/40 p-8 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03),0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-md hover:border-white/[0.08] transition-all duration-300">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Notifications */}
            {(error || validationError) && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-[11px] text-red-400 flex items-start gap-2.5 animate-fadeIn">
                <span className="font-bold text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase shrink-0">FAIL</span>
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 transition-colors duration-200 group-focus-within:text-[#FF4F21]">
                Athlete ID / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-600 transition-colors duration-200 group-focus-within:text-[#FF4F21]">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                    setValidationError(null);
                  }}
                  className="block w-full rounded-xl border border-white/[0.05] bg-white/[0.02] pl-11 pr-4 py-3.5 text-xs text-white placeholder-zinc-600 outline-none transition duration-300 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30 focus:bg-white/[0.04]"
                  placeholder="athlete@athlixir.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 transition-colors duration-200 group-focus-within:text-[#FF4F21]">
                  Access Key
                </label>
                <Link href="/forgot-password" className="text-[9px] font-bold uppercase tracking-wider text-[#FF4F21] hover:brightness-110 transition">
                  Reset Key?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-600 transition-colors duration-200 group-focus-within:text-[#FF4F21]">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                    setValidationError(null);
                  }}
                  className="block w-full rounded-xl border border-white/[0.05] bg-white/[0.02] pl-11 pr-12 py-3.5 text-xs text-white placeholder-zinc-600 outline-none transition duration-300 focus:border-[#FF4F21] focus:ring-1 focus:ring-[#FF4F21]/30 focus:bg-white/[0.04] tracking-[0.25em]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-[#FF4F21] transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FF4F21] to-[#FF8433] py-4 text-xs font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(255,79,33,0.25)] hover:shadow-[0_0_30px_rgba(255,79,33,0.4)] hover:brightness-110 active:scale-[0.98] transition-all duration-200 outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Verifying Athlete Card...</span>
                </>
              ) : (
                <>
                  <span>Verify Identity</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-[10px] font-bold text-zinc-500 tracking-wider uppercase animate-fadeIn">
          New Athlete?{' '}
          <Link href="/signup" className="ml-1 text-[#FF4F21] hover:brightness-110 transition uppercase font-black">
            Build Athlete Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
