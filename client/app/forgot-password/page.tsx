'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '../context/AuthContext';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, Sparkles, Activity } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;

    setStatus('loading');
    setMessage('');
    setResetLink(null);

    try {
      const response = await api.post('/auth/password/forgot', { email: email.trim() });
      const data = response.data;
      setStatus('success');
      setMessage(data?.message || 'Password reset link has been dispatched to your email.');
      if (data?.link) {
        setResetLink(data.link);
      }
      setResendCountdown(60);
    } catch (err: any) {
      setStatus('error');
      setMessage(
        err.response?.data?.message ||
        'Failed to connect to authentication server. Please check your email and try again.'
      );
    }
  };

  return (
    <div className="h-screen w-full bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-poppins selection:bg-[#FF4F21]/20 selection:text-[#FF4F21] relative text-[#1C1C1E]">
      
      {/* Background Soft Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF4F21]/[0.05] blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#FF4F21]/[0.03] blur-[140px] pointer-events-none" />

      {/* Main Container - Desktop Split / Mobile Centered */}
      <div className="w-full max-w-6xl h-full max-h-[860px] flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 relative z-10">
        
        {/* Left Side: Brand & Welcoming Hero (Desktop / Tablet) */}
        <div className="hidden lg:flex flex-col justify-between flex-1 h-full py-6 pr-4">
          
          {/* Brand Logo Header */}
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span
              style={{ fontFamily: "'Agale DEMO', 'Mazzard', sans-serif" }}
              className="text-3xl font-black tracking-wider text-[#FF4F21] group-hover:opacity-90 transition"
            >
              ATHLIXIR
            </span>
          </Link>

          {/* Core Welcoming Copy */}
          <div className="space-y-6 max-w-lg my-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF5F2] border border-[#FF4F21]/20 text-xs font-bold text-[#FF4F21] uppercase tracking-wider shadow-2xs">
              <Sparkles size={14} className="text-[#FF4F21]" />
              <span>Secure Athlete Recovery</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-[#1C1C1E] leading-[1.1] tracking-tight">
              Password Recovery
            </h1>

            <p className="text-[#636366] text-sm xl:text-base leading-relaxed font-normal">
              Enter your registered email to receive an instant verification link and reset your security credentials.
            </p>

            <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/[0.06] text-xs font-semibold text-[#1C1C1E] shadow-2xs max-w-xs">
              <div className="p-1.5 rounded-lg bg-[#FF4F21]/10 text-[#FF4F21]">
                <Activity size={16} />
              </div>
              <span>TLS 1.3 & AES-256 Encrypted</span>
            </div>
          </div>

          {/* Left Footer Note */}
          <div className="text-xs text-[#8E8E93] font-medium">
            &copy; {new Date().getFullYear()} ATHLIXIR. A product of Techno Vanam Innovation Pvt. Ltd.
          </div>
        </div>

        {/* Right Side: Clean White Floating Card */}
        <div className="w-full lg:w-[450px] shrink-0">
          
          <div className="w-full bg-white rounded-[32px] p-6 sm:p-8 lg:p-9 border border-black/[0.08] shadow-2xl shadow-black/[0.04]">
            
            {/* Mobile Brand Logo */}
            <div className="lg:hidden text-center mb-4">
              <Link href="/" className="inline-block">
                <span
                  style={{ fontFamily: "'Agale DEMO', 'Mazzard', sans-serif" }}
                  className="text-2xl font-black tracking-wider text-[#FF4F21]"
                >
                  ATHLIXIR
                </span>
              </Link>
            </div>

            {/* Card Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-[#1C1C1E] tracking-tight">
                Reset Password
              </h2>
              <p className="text-xs sm:text-sm text-[#636366] mt-1.5">
                We&apos;ll send you real-time recovery instructions.
              </p>
            </div>

            {/* Success Notification */}
            {status === 'success' && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900">Email Dispatched</div>
                  <div className="mt-0.5 text-emerald-700 leading-tight">{message}</div>
                  {resetLink && (
                    <div className="mt-2 pt-2 border-t border-emerald-200">
                      <a
                        href={resetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#FF4F21] font-bold underline break-all hover:brightness-110"
                      >
                        Open Password Reset Link →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Notification */}
            {status === 'error' && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 font-medium animate-fadeIn">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                <span>{message}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Registered Email"
                  className="w-full h-12 sm:h-13 px-5 rounded-2xl sm:rounded-full bg-[#F7F7FA] border border-black/[0.08] text-xs sm:text-sm font-medium text-[#1C1C1E] placeholder:text-zinc-400 focus:bg-white focus:border-[#FF4F21] focus:ring-4 focus:ring-[#FF4F21]/10 outline-none transition"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={status === 'loading' || (status === 'success' && resendCountdown > 0)}
                className="w-full h-12 sm:h-13 rounded-2xl sm:rounded-full bg-[#FF4F21] hover:bg-[#E03E12] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#FF4F21]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Dispatching Link...</span>
                  </>
                ) : status === 'success' && resendCountdown > 0 ? (
                  <span>Resend in {resendCountdown}s</span>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

            </form>

            {/* Back to Login Link */}
            <div className="text-center mt-6 text-xs text-zinc-500 font-medium">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 font-bold text-[#FF4F21] hover:underline"
              >
                <ArrowLeft size={13} />
                <span>Back to Sign In</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
