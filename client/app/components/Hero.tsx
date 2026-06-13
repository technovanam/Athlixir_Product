'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Check, Zap, Activity } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section
      id="home"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background"
    >
      {/* Background and overlay elements */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1459865264687-595d652de67e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Athlete Running"
          fill
          unoptimized
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />
      </div>

      {/* Floating Card Left: Sprint Metrics */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{
          opacity: 1,
          x: 0,
          y: [0, -12, 0],
        }}
        transition={{
          opacity: { duration: 0.8 },
          x: { duration: 0.8 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="hidden xl:flex absolute left-6 xl:left-12 top-[30%] z-30 flex-col p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl w-56 text-left"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">
            Sprint Metrics
          </span>
        </div>

        {/* Row 1: Cadence */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
              Cadence
            </span>
            <span className="text-lg font-black text-white leading-tight">
              182 <span className="text-[10px] text-zinc-500 font-medium">SPM</span>
            </span>
          </div>
          <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20 text-primary">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Row 2: GCT */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
              GCT
            </span>
            <span className="text-lg font-black text-white leading-tight">
              118 <span className="text-[10px] text-zinc-500 font-medium">ms</span>
            </span>
          </div>
          <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Row 3: Symmetry */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
              Symmetry
            </span>
            <span className="text-lg font-black text-emerald-400 leading-tight">
              91%
            </span>
          </div>
          <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20 text-emerald-400">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>
      </motion.div>

      {/* Floating Card Right: AI Performance Score */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{
          opacity: 1,
          x: 0,
          y: [0, 15, 0],
        }}
        transition={{
          opacity: { duration: 0.8 },
          x: { duration: 0.8 },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
        }}
        className="hidden xl:flex absolute right-6 xl:right-12 bottom-[25%] z-30 flex-col p-5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl w-56 text-left"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] uppercase tracking-widest text-gray-300 font-bold">
            AI Performance Score
          </span>
        </div>

        {/* Row 1: Performance Score */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
              Performance Score
            </span>
            <span className="text-xl font-black text-primary leading-tight">
              84<span className="text-[10px] text-zinc-500 font-medium">/100</span>
            </span>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary">
            84
          </div>
        </div>

        {/* Row 2: Sprint Efficiency */}
        <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
              Sprint Efficiency
            </span>
            <span className="text-sm font-bold text-white leading-tight">
              Elite
            </span>
          </div>
          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary uppercase">
            LVL 4
          </span>
        </div>

        {/* Row 3: Injury Risk */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">
              Injury Risk
            </span>
            <span className="text-sm font-bold text-emerald-400 leading-tight">
              Low
            </span>
          </div>
          <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 uppercase">
            Stable
          </span>
        </div>
      </motion.div>

      {/* Content — Center Aligned */}
      <div className="relative z-20 container mx-auto px-6 lg:px-12 flex flex-col items-center justify-center h-full text-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold uppercase tracking-[0.25em] mb-10 text-primary backdrop-blur-sm"
        >
          AI-Powered Athlete Ecosystem
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-8 max-w-4xl tracking-tight"
        >
          Every Sprint Tells A Story.
          <br />
          <span className="text-primary">Athlixir Decodes It.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="text-base md:text-lg text-gray-300 max-w-2xl mb-12 leading-relaxed font-light"
        >
          Analyze biomechanics, measure sprint efficiency, detect injury risks, and track athletic evolution using AI-powered performance intelligence.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-5"
        >
          <Link
            href="/signup"
            className="px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(255,87,34,0.4)] text-sm uppercase tracking-widest hover:scale-105 flex items-center justify-center"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-10 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white hover:text-black transition-all text-sm uppercase tracking-widest hover:scale-105 flex items-center justify-center"
          >
            Analyze Your Sprint
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
