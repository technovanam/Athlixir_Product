'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, Shield, Activity, Zap, ChevronRight } from 'lucide-react';

import { Biomech3DCanvas } from './Biomech3DCanvas';

const About: React.FC = () => {
  return (
    <section
      id="about"
      className="pt-8 pb-16 md:pt-12 md:pb-24 bg-background relative overflow-hidden"
    >
      {/* Background Decorative Element */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[120px] z-0" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[120px] z-0" />

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center relative z-10">
        
        {/* Left Side: Scientific Copy and 4 Biomechanics Feature Blocks */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <div className="inline-flex px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-[11px] font-bold uppercase tracking-[0.25em] text-primary backdrop-blur-sm">
            About Athlixir
          </div>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight text-white tracking-tight">
            Scientific Sprint Intelligence <br />
            <span className="text-primary">Built For Athlete Evolution.</span>
          </h2>

          <p className="text-base text-gray-400 leading-relaxed font-light max-w-xl">
            Athlixir is an AI-powered biomechanics platform that converts sprint videos into performance intelligence. We analyze mechanics, detect injury risks, and track athlete evolution.
          </p>

          {/* Grid of 4 Real Sports-Science Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
            
            {/* Feature 1: Biomechanics Intelligence */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 shadow-md">
                <Activity className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                  Biomechanics Intelligence
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  AI analysis of cadence, GCT, stride length, and symmetry.
                </p>
              </div>
            </div>

            {/* Feature 2: Performance Benchmarking */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 shadow-md">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                  Performance Benchmarking
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Compare sprints against state and elite-level norms.
                </p>
              </div>
            </div>

            {/* Feature 3: Injury Risk Detection */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 shadow-md">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                  Injury Risk Detection
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Detect overstride patterns and asymmetries early.
                </p>
              </div>
            </div>

            {/* Feature 4: Athlete Evolution Tracking */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10 shrink-0 shadow-md">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-1">
                  Athlete Evolution Tracking
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Track performance growth over time with AI telemetry.
                </p>
              </div>
            </div>

          </div>

          <div className="pt-6">
            <button className="px-10 py-4 bg-primary text-white font-bold rounded-full hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(255,87,34,0.4)] text-sm uppercase tracking-widest hover:scale-105 cursor-pointer flex items-center gap-2">
              Explore Analytics <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Right Side: Biomechanical Telemetry & UI Dashboard snippets */}
        <div className="relative h-[500px] w-full flex items-center justify-center lg:justify-end">
          
          {/* Main Visual: AI Biomechanics Telemetry Screen */}
          <div className="relative h-[480px] w-full bg-[#08080C]/80 border border-white/[0.06] rounded-3xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_20px_50px_rgba(0,0,0,0.9)] flex items-center justify-center p-6 select-none backdrop-blur-md">
            
            {/* scanline screen overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent pointer-events-none crt-flicker" />
            
            {/* Grid matrix pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* 3D Volumetric Sprinter Heatmap Canvas Renderer */}
            <Biomech3DCanvas />

            {/* Radar telemetry scanning lines */}
            <div className="absolute w-[150%] h-[1px] bg-primary/20 top-1/3 left-0 animate-[pulse_3s_infinite]" />

            {/* Badge overlay: Validated Sprint Intelligence */}
            <div className="absolute top-6 right-6 z-20 py-1.5 px-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5 backdrop-blur-md shadow-md">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[8px] font-extrabold uppercase tracking-widest text-emerald-400">
                Validated Sprint Intelligence
              </span>
            </div>

            {/* Console HUD status */}
            <div className="absolute top-6 left-6 z-20 flex flex-col gap-1 text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
              <span>SYS.ENG // BIOMECH_SCAN_3D</span>
              <span className="text-zinc-400">FPS: 240 // ACTIVE_3D_RENDER</span>
            </div>

            {/* CARD 1: Sprint Metrics */}
            <motion.div
              className="absolute top-16 left-6 z-20 p-4 rounded-xl bg-[#08080C]/80 border border-white/[0.08] shadow-2xl w-44 backdrop-blur-md"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="text-[8px] font-black uppercase tracking-wider text-primary block mb-2.5">
                Sprint Telemetry
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Cadence</span>
                  <span className="font-bold text-white">182 SPM</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">GCT</span>
                  <span className="font-bold text-primary">118ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Stride</span>
                  <span className="font-bold text-white">2.2m</span>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: AI Performance Score */}
            <motion.div
              className="absolute bottom-6 right-6 z-20 p-4 rounded-xl bg-[#08080C]/80 border border-white/[0.08] shadow-2xl w-48 backdrop-blur-md"
              animate={{ y: [0, 8, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <span className="text-[8px] font-black uppercase tracking-wider text-emerald-400 block mb-2.5">
                Performance Diagnostics
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Perf. Score</span>
                  <span className="font-bold text-white">84 / 100</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Efficiency</span>
                  <span className="font-bold text-emerald-400">Elite</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500 font-medium">Injury Risk</span>
                  <span className="font-bold text-emerald-400">Low</span>
                </div>
              </div>
            </motion.div>

            {/* CARD 3: Benchmarking Alert */}
            <motion.div
              className="absolute bottom-6 left-6 z-20 p-4 rounded-xl bg-[#08080C]/80 border border-white/[0.08] shadow-2xl w-48 backdrop-blur-md"
              animate={{ x: [0, 6, 0] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              <span className="text-[8px] font-black uppercase tracking-wider text-blue-400 block mb-1">
                State-Level Benchmark
              </span>
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                <span className="text-[10px] font-extrabold text-white uppercase tracking-wider">
                  Top 12% Sprint Efficiency
                </span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
