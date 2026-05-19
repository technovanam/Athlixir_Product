'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { UserPlus, User, Mail, Lock, Loader2, ArrowRight, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export default function SignupPage() {
  const { signup, error, setError } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Password rules checks
  const [checks, setChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    specialOrDigit: false,
  });

  useEffect(() => {
    setChecks({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      specialOrDigit: /[\d\W]/.test(password),
    });
  }, [password]);

  const isPasswordValid = Object.values(checks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!username || !email || !password) {
      setValidationError('Please fill in all fields.');
      return;
    }

    if (!isPasswordValid) {
      setValidationError('Please satisfy all password safety criteria.');
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
    <div className="relative flex min-h-screen items-center justify-center bg-black px-6 py-12">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition duration-200 cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] rounded-full bg-violet-600/10 blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 h-[350px] w-[350px] rounded-full bg-indigo-600/10 blur-[100px]"></div>

      <div className="relative w-full max-w-lg">
        {/* Logo Icon */}
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/20">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Create an account
          </h2>
          <p className="text-sm text-zinc-400">
            Establish your premium enterprise-grade profile
          </p>
        </div>

        {/* Form Container */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Error Notifications */}
            {(error || validationError) && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                <span className="font-semibold">Error:</span> {validationError || error}
              </div>
            )}

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Full Name / Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                  <User className="h-4.5 w-4.5" />
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
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition duration-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                  <Mail className="h-4.5 w-4.5" />
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
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition duration-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-zinc-500">
                  <Lock className="h-4.5 w-4.5" />
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
                  className="block w-full rounded-xl border border-zinc-800 bg-zinc-950/50 pl-11 pr-4 py-3 text-sm text-white placeholder-zinc-500 outline-none transition duration-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  placeholder="••••••••••••"
                />
              </div>

              {/* Real-time Password Strength Meter */}
              {password.length > 0 && (
                <div className="mt-4 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/30 p-4">
                  <span className="text-xs font-semibold text-zinc-400 block mb-1">Password Strength Requirements:</span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      {checks.length ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600" />
                      )}
                      <span className={checks.length ? 'text-emerald-400' : 'text-zinc-500'}>8+ Characters</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checks.uppercase ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600" />
                      )}
                      <span className={checks.uppercase ? 'text-emerald-400' : 'text-zinc-500'}>Uppercase Letter</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checks.lowercase ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600" />
                      )}
                      <span className={checks.lowercase ? 'text-emerald-400' : 'text-zinc-500'}>Lowercase Letter</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {checks.specialOrDigit ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-zinc-600" />
                      )}
                      <span className={checks.specialOrDigit ? 'text-emerald-400' : 'text-zinc-500'}>Number / Special</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!isPasswordValid && password.length > 0)}
              className="relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition duration-200 outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-8 text-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-6">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-violet-400 hover:underline">
              Sign in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
