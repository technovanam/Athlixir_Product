'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    
    // Simulating Firebase password reset call
    // In a real implementation, this would call auth.sendPasswordResetEmail(email)
    setTimeout(() => {
      if (email.includes('@')) {
        setStatus('success');
        setMessage('A password reset link has been sent to your email address.');
      } else {
        setStatus('error');
        setMessage('Please enter a valid email address.');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 selection:bg-[#FF4F21]/30 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF4F21]/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm font-semibold mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl p-8 shadow-2xl">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center font-bold text-xl shadow-lg shadow-[#FF4F21]/20 mb-6">
            A
          </div>
          
          <h1 className="text-2xl font-extrabold tracking-tight mb-2">Reset Password</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          {status === 'success' ? (
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-emerald-400">Email Sent</h3>
                <p className="text-xs text-emerald-300/80 mt-1">{message}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-10 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4F21] transition"
                    placeholder="athlete@athlixir.com"
                  />
                </div>
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-semibold bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
              >
                {status === 'loading' ? (
                  <span className="h-5 w-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
