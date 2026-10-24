'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '../../context/AuthContext';
import Link from 'next/link';
import { Lock, ArrowLeft, Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setStatus('error');
      setMessage('Please fill in both password fields');
      return;
    }

    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters');
      return;
    }

    setStatus('loading');

    try {
      await api.post(`/auth/password/reset/${token}`, { password });
      setStatus('success');
      setMessage('Password reset successfully');

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Failed to reset password. Please try again or request a new link.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] flex flex-col items-center justify-center p-6 selection:bg-[#FF4F21]/20 font-poppins relative overflow-hidden">
      
      <div className="w-full max-w-md relative z-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-[#8E8E93] hover:text-[#1C1C1E] transition text-sm font-semibold mb-6">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        <div className="rounded-[28px] border border-black/[0.06] bg-white p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-[#FF4F21] to-[#FFA233] flex items-center justify-center font-black text-xl text-white shadow-sm shadow-[#FF4F21]/20 mb-6">
            A
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight mb-2 text-[#1C1C1E]">Set New Password</h1>
          <p className="text-[#8E8E93] text-xs mb-8 leading-relaxed font-normal">
            Enter a new password for your account. Use a strong password with at least 8 characters.
          </p>

          {status === 'success' ? (
            <div className="rounded-2xl bg-[#34C759]/10 border border-[#34C759]/20 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-[#34C759] shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-[#34C759]">Password Reset</h3>
                <p className="text-xs text-slate-600 mt-1">{message}</p>
                <p className="text-xs text-slate-400 mt-2">Redirecting to login...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-[#F2F2F7] border border-black/[0.04] rounded-2xl pl-10 pr-12 py-3 text-xs font-semibold text-[#1C1C1E] placeholder-[#8E8E93] focus:outline-none focus:border-[#FF4F21] focus:bg-white transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8E8E93]" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F2F2F7] border border-black/[0.04] rounded-2xl pl-10 pr-12 py-3 text-xs font-semibold text-[#1C1C1E] placeholder-[#8E8E93] focus:outline-none focus:border-[#FF4F21] focus:bg-white transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8E8E93] hover:text-[#1C1C1E] transition cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-600 text-xs font-semibold bg-red-50 p-3 rounded-2xl border border-red-200">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-[#FF4F21] hover:bg-[#E03E12] text-white font-bold py-3.5 rounded-full transition shadow-[0_4px_16px_rgba(255,79,33,0.25)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-xs uppercase tracking-widest active:scale-95 cursor-pointer mt-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
