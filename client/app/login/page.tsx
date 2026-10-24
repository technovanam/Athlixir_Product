'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';
import { Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, Loader2, Activity, Zap } from 'lucide-react';

export default function LoginPage() {
  const { login, loginAsDemo, error, setError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setValidationError(null);

    if (!email.trim() || !password) {
      setValidationError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch {
      // handled by AuthContext
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setValidationError(null);
    setDemoLoading(true);
    try {
      await loginAsDemo();
    } catch {
      // handled by AuthContext
    } finally {
      setDemoLoading(false);
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
              <span>AI Sprint Biomechanics Platform</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-[#1C1C1E] leading-[1.1] tracking-tight">
              Hey, Welcome Back!
            </h1>

            <p className="text-[#636366] text-sm xl:text-base leading-relaxed font-normal">
              Transform standard 60 FPS smartphone video into lab-grade 33-joint kinematic telemetry, ground contact times, and sprint injury prevention diagnostics.
            </p>

            {/* Feature Badges Strip */}
            <div className="grid grid-cols-2 gap-3.5 pt-2">
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/[0.06] text-xs font-semibold text-[#1C1C1E] shadow-2xs">
                <div className="p-1.5 rounded-lg bg-[#FF4F21]/10 text-[#FF4F21]">
                  <Activity size={16} />
                </div>
                <span>33-Joint 3D Tracking</span>
              </div>
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-[#F9F9FB] border border-black/[0.06] text-xs font-semibold text-[#1C1C1E] shadow-2xs">
                <div className="p-1.5 rounded-lg bg-[#FF4F21]/10 text-[#FF4F21]">
                  <Zap size={16} />
                </div>
                <span>Millisecond GCT</span>
              </div>
            </div>
          </div>

          {/* Left Footer Note */}
          <div className="text-xs text-[#8E8E93] font-medium">
            &copy; {new Date().getFullYear()} ATHLIXIR. A product of Techno Vanam Innovation Pvt. Ltd.
          </div>
        </div>

        {/* Right Side: Clean White Floating Form Card */}
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
                Welcome Back
              </h2>
              <p className="text-xs sm:text-sm text-[#636366] mt-1.5">
                Sign in to continue your sprint analytics.
              </p>
            </div>

            {/* Error Notification */}
            {(error || validationError) && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700 font-medium">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
                <span>{validationError || error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email / Username Input */}
              <div>
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
                  placeholder="Username or Email"
                  className="w-full h-12 sm:h-13 px-5 rounded-2xl sm:rounded-full bg-[#F7F7FA] border border-black/[0.08] text-xs sm:text-sm font-medium text-[#1C1C1E] placeholder:text-zinc-400 focus:bg-white focus:border-[#FF4F21] focus:ring-4 focus:ring-[#FF4F21]/10 outline-none transition"
                />
              </div>

              {/* Password Input with Visibility Toggle */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                    setValidationError(null);
                  }}
                  placeholder="Password"
                  className="w-full h-12 sm:h-13 pl-5 pr-11 rounded-2xl sm:rounded-full bg-[#F7F7FA] border border-black/[0.08] text-xs sm:text-sm font-medium text-[#1C1C1E] placeholder:text-zinc-400 focus:bg-white focus:border-[#FF4F21] focus:ring-4 focus:ring-[#FF4F21]/10 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 p-1 transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end pt-0.5">
                <Link
                  href="/forgot-password"
                  className="text-xs font-semibold text-zinc-500 hover:text-[#FF4F21] transition"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* Primary Login Button */}
              <button
                type="submit"
                disabled={loading || demoLoading}
                className="w-full h-12 sm:h-13 rounded-2xl sm:rounded-full bg-[#FF4F21] hover:bg-[#E03E12] text-white text-sm font-bold shadow-lg shadow-[#FF4F21]/25 hover:shadow-xl hover:shadow-[#FF4F21]/35 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>

            </form>

            {/* OR Divider */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/[0.08]" />
              </div>
              <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                OR
              </span>
            </div>

            {/* Instant Demo Access Button */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={demoLoading || loading}
              className="w-full h-11 sm:h-12 rounded-2xl sm:rounded-full border border-[#FF4F21]/25 bg-[#FFF5F2] hover:bg-[#FFEBE5] text-[#FF4F21] text-xs font-bold transition active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-2xs"
            >
              {demoLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin text-[#FF4F21]" />
                  <span>Loading Demo Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-[#FF4F21]" />
                  <span>⚡ Instant Demo Access</span>
                </>
              )}
            </button>

            {/* Bottom Switch Link */}
            <div className="text-center mt-5 text-xs text-zinc-500 font-medium">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-[#FF4F21] font-bold hover:underline">
                Sign Up
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
