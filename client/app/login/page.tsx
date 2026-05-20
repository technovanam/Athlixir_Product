'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Mail, Lock, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div 
      className="relative flex min-h-screen items-center justify-center bg-black bg-cover bg-center bg-no-repeat px-6 py-12 font-sans"
      style={{ backgroundImage: `url('/stadium_grass_bg.png')` }}
    >
      {/* Dark overlay for background image */}
      <div className="absolute inset-0 bg-[#0a0f1c]/80 backdrop-blur-[1px]"></div>

      {/* Back to Home Button */}
      <div className="absolute top-8 left-8 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] text-white uppercase hover:text-[#FF5722] transition duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 text-[#FF5722]" />
          <span>BACK TO HOME</span>
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8 text-center">
          {/* Logo SVG */}
          <div className="mb-4">
            <svg width="44" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF5722" strokeWidth="4" strokeLinecap="square" strokeLinejoin="miter">
              <path d="M4 22L12 4L20 22" />
            </svg>
          </div>
          <h2 className="text-[32px] font-black tracking-tight text-white mb-2" style={{ textShadow: 'none' }}>
            ACCESS PORTAL
          </h2>
          <p className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">
            Secured Athlixir <span className="text-[#FF5722]">Data Gate</span>
          </p>
        </div>

        {/* Form Container */}
        <div className="w-full rounded-[28px] border border-white/5 bg-[#121212]/95 p-8 shadow-2xl backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Notifications */}
            {(error || validationError) && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                <span className="font-semibold">Error:</span> {validationError || error}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
                Athlete ID / Email
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
                  className="block w-full rounded-xl border border-transparent bg-[#1c1c1c] pl-11 pr-4 py-3.5 text-sm text-zinc-300 placeholder-zinc-600 outline-none transition duration-200 focus:border-[#FF5722]/50 focus:ring-1 focus:ring-[#FF5722]/50"
                  placeholder="name@email.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  Key Access
                </label>
                <Link href="#" className="text-[10px] font-bold uppercase tracking-wider text-[#FF5722] hover:opacity-80 transition-opacity">
                  Reset Key?
                </Link>
              </div>
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
                  className="block w-full rounded-xl border border-transparent bg-[#1c1c1c] pl-11 pr-4 py-3.5 text-sm text-zinc-300 placeholder-zinc-600 outline-none transition duration-200 focus:border-[#FF5722]/50 focus:ring-1 focus:ring-[#FF5722]/50 tracking-[0.2em]"
                  placeholder="........"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF5722] py-4 text-[13px] font-bold uppercase tracking-wide text-white hover:opacity-90 transition-opacity duration-200 outline-none focus:ring-2 focus:ring-[#FF5722] focus:ring-offset-2 focus:ring-offset-[#121212] disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Verifying...</span>
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
        <div className="mt-8 text-center text-[11px] font-medium text-zinc-500 tracking-wide">
          New Athlete?{' '}
          <Link href="/signup" className="font-bold text-[#FF5722] hover:opacity-80 transition-opacity uppercase">
            Build Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
