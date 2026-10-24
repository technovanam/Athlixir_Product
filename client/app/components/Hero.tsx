'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowRight,
  Activity,
  Zap,
  ShieldCheck,
  Play,
  Flame,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex flex-col justify-center overflow-hidden bg-[#FAFAFC] pt-28 pb-14 font-poppins"
    >
      {/* Soft Ambient Radial Lights */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[550px] bg-gradient-to-b from-[#FF4F21]/12 via-[#FFA233]/6 to-transparent rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-[450px] h-[450px] bg-[#FF4F21]/6 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-[#FF4F21]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10 flex flex-col items-center">
        
        {/* 1. TOP PILL BADGE */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-black/[0.06] bg-white/90 backdrop-blur-md shadow-2xs mb-6 sm:mb-8"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF4F21] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF4F21]" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-800">
            AI Sprint Biomechanics Platform
          </span>
          <span className="text-zinc-300 font-light">|</span>
          <span className="text-[11px] font-bold text-[#FF4F21] flex items-center gap-1">
            v2.0 Active <ChevronRight size={12} />
          </span>
        </motion.div>

        {/* 2. HERO HEADLINE */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-center text-[#1C1C1E] tracking-tight leading-[1.08] max-w-4xl mb-6"
        >
          Every Millisecond Counts.{' '}
          <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6A3D] to-[#FFA233] bg-clip-text text-transparent">
            Decode Your Sprint.
          </span>
        </motion.h1>

        {/* 3. SUBTITLE COPY */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
          className="text-base sm:text-lg text-[#636366] text-center max-w-2xl mb-8 sm:mb-10 font-normal leading-relaxed"
        >
          Transform regular smartphone video into lab-grade kinematic data.
          Measure cadence, ground contact time, injury risks, and track athlete evolution in seconds.
        </motion.p>

        {/* 4. CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto mb-12 sm:mb-16"
        >
          <Link
            href="/signup"
            className="w-full sm:w-auto px-8 py-4 bg-[#FF4F21] text-white font-bold rounded-full hover:bg-[#E03E12] transition-all shadow-[0_4px_20px_rgba(255,79,33,0.3)] hover:shadow-[0_6px_24px_rgba(255,79,33,0.4)] text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Analyze Your Sprint</span>
            <ArrowRight size={14} />
          </Link>

          <Link
            href="/login"
            className="w-full sm:w-auto px-7 py-4 bg-white border border-black/[0.08] text-[#1C1C1E] font-bold rounded-full hover:bg-black/[0.03] transition-all text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 shadow-2xs"
          >
            <Play size={13} className="fill-[#1C1C1E] text-[#1C1C1E]" />
            <span>Try Demo Account</span>
          </Link>
        </motion.div>

        {/* 5. INTERACTIVE LIVE TELEMETRY SHOWCASE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
          className="w-full max-w-5xl xl:max-w-6xl bg-white rounded-3xl sm:rounded-[32px] border border-black/[0.08] shadow-[0_16px_50px_rgba(0,0,0,0.06)] p-5 sm:p-8 overflow-hidden relative"
        >
          {/* Card Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center font-black">
                <Activity size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[#1C1C1E]">
                    Sprint Biomechanics Studio
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-full">
                    Live Telemetry
                  </span>
                </div>
                <p className="text-[11px] text-[#8E8E93] font-medium">
                  Computer Vision Pose Estimation · 100m Acceleration Phase
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-500 bg-[#F2F2F7] px-3 py-1.5 rounded-xl border border-black/[0.04]">
                60 FPS Kinematics
              </span>
            </div>
          </div>

          {/* 4 Real-time Telemetry KPI Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-5">
            {/* KPI 1: Cadence */}
            <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.04] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-[#8E8E93] font-bold">
                  Cadence
                </span>
                <div className="p-1.5 rounded-lg bg-[#FF4F21]/10 text-[#FF4F21]">
                  <Zap size={13} />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#1C1C1E]">
                  184
                </span>
                <span className="text-xs text-[#8E8E93] font-semibold ml-1">
                  SPM
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#34C759] mt-2">
                <TrendingUp size={11} /> +6.2% vs Baseline
              </div>
            </div>

            {/* KPI 2: Ground Contact Time */}
            <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.04] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-[#8E8E93] font-bold">
                  Ground Contact
                </span>
                <div className="p-1.5 rounded-lg bg-[#FF4F21]/10 text-[#FF4F21]">
                  <Activity size={13} />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#1C1C1E]">
                  94
                </span>
                <span className="text-xs text-[#8E8E93] font-semibold ml-1">
                  ms
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#FF4F21] mt-2">
                <CheckCircle2 size={11} /> Elite Grade (&lt;100ms)
              </div>
            </div>

            {/* KPI 3: Bilateral Symmetry */}
            <div className="p-4 rounded-2xl bg-[#F8F8FA] border border-black/[0.04] flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-[#8E8E93] font-bold">
                  Symmetry Index
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <ShieldCheck size={13} />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#34C759]">
                  98.2%
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#34C759] mt-2">
                <CheckCircle2 size={11} /> Perfectly Balanced
              </div>
            </div>

            {/* KPI 4: Readiness Score */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#FF4F21]/8 via-[#FFA233]/6 to-transparent border border-[#FF4F21]/15 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] uppercase tracking-wider text-[#FF4F21] font-bold">
                  Readiness
                </span>
                <div className="p-1.5 rounded-lg bg-[#FF4F21] text-white">
                  <Flame size={13} />
                </div>
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-black text-[#FF4F21]">
                  92
                </span>
                <span className="text-xs text-[#8E8E93] font-semibold ml-1">
                  /100
                </span>
              </div>
              <div className="text-[10px] font-bold text-[#FF4F21] mt-2">
                Peak Sprint Power
              </div>
            </div>
          </div>
        </motion.div>

        {/* 6. TRUST FOOTER TICKER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-10 sm:mt-12 text-xs font-semibold text-[#8E8E93]"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#34C759]" />
            <span>AI Joint Angle Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#34C759]" />
            <span>Injury Risk Mitigation</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-[#34C759]" />
            <span>Collegiate Benchmark Grading</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Hero;
