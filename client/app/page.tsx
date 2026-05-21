'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Activity, Shield, TrendingUp, Zap, Target, Play, ChevronRight, BarChart } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#FF4F21]/30 overflow-hidden font-sans">
      
      {/* Background ambient effects */}
      <div className="fixed top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-[#FF4F21]/10 blur-[150px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center font-bold text-sm shadow-lg shadow-[#FF4F21]/20">
            A
          </div>
          <span className="font-extrabold tracking-widest text-lg text-white">ATHLIXIR</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          <a href="#metrics" className="hover:text-white transition">Metrics</a>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-semibold text-zinc-300 hover:text-white transition">Log in</Link>
          <Link href="/signup" className="text-sm font-bold bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8">
          <span className="flex h-2 w-2 rounded-full bg-[#FF4F21] animate-pulse" />
          <span className="text-xs font-semibold text-zinc-300">ATHLIXIR Evolution Engine 1.0 is Live</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
          Perfect Your <br />
          <span className="text-white">Biomechanics.</span>
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          The elite AI sports intelligence platform for sprinters. Upload a video and instantly extract ground contact time, cadence, and symmetry using advanced computer vision.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="flex items-center gap-2 bg-[#FF4F21] hover:bg-[#FF8433] text-white px-8 py-4 rounded-full font-bold text-lg transition shadow-[0_0_40px_rgba(255,79,33,0.3)] hover:shadow-[0_0_60px_rgba(255,79,33,0.5)]">
            Start Free Analysis <ArrowRight className="h-5 w-5" />
          </Link>
          <a href="#demo" className="flex items-center gap-2 text-white px-8 py-4 rounded-full font-bold text-lg border border-zinc-800 hover:bg-zinc-900 transition">
            <Play className="h-5 w-5" /> Watch Demo
          </a>
        </div>
      </section>

      {/* Abstract Dashboard Preview (Linear style) */}
      <section id="demo" className="relative z-10 px-6 max-w-6xl mx-auto mb-32">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-xl p-2 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10 pointer-events-none" />
          <img 
            src="https://images.unsplash.com/photo-1552674605-15c2145efa38?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Sprinter starting blocks" 
            className="w-full h-[500px] object-cover rounded-xl opacity-40 grayscale"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center items-center">
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 w-full max-w-4xl">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-xl">
                  <Activity className="h-5 w-5 text-[#FF4F21] mb-2" />
                  <p className="text-3xl font-black">178 <span className="text-sm font-semibold text-zinc-500">SPM</span></p>
                  <p className="text-xs text-zinc-400 font-bold uppercase mt-1">Cadence</p>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-xl">
                  <Zap className="h-5 w-5 text-[#FF4F21] mb-2" />
                  <p className="text-3xl font-black">142 <span className="text-sm font-semibold text-zinc-500">ms</span></p>
                  <p className="text-xs text-zinc-400 font-bold uppercase mt-1">Ground Contact</p>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-xl">
                  <BarChart className="h-5 w-5 text-[#FF4F21] mb-2" />
                  <p className="text-3xl font-black">94 <span className="text-sm font-semibold text-zinc-500">Score</span></p>
                  <p className="text-xs text-zinc-400 font-bold uppercase mt-1">Sprint Efficiency</p>
                </div>
                <div className="bg-black/60 backdrop-blur-md border border-white/10 p-5 rounded-xl">
                  <Target className="h-5 w-5 text-emerald-400 mb-2" />
                  <p className="text-3xl font-black">92 <span className="text-sm font-semibold text-zinc-500">%</span></p>
                  <p className="text-xs text-zinc-400 font-bold uppercase mt-1">Symmetry</p>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 max-w-7xl mx-auto border-t border-zinc-900">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Engineered for Evolution</h2>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            ATHLIXIR replaces expensive lab equipment with computer vision, turning your smartphone into a world-class biomechanics lab.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 hover:bg-zinc-800/40 transition">
            <div className="h-12 w-12 rounded-xl bg-[#FF4F21]/10 flex items-center justify-center mb-6">
              <Activity className="h-6 w-6 text-[#FF4F21]" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI Biomechanics</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Proprietary computer vision extracts skeleton tracking, measuring every joint angle and foot strike with millisecond precision.
            </p>
          </div>
          
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 hover:bg-zinc-800/40 transition">
            <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6">
              <Shield className="h-6 w-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Injury Risk Detection</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Detect lateral asymmetries, overstriding, and posture degradation before they turn into chronic injuries.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8 hover:bg-zinc-800/40 transition">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6">
              <TrendingUp className="h-6 w-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Longitudinal Tracking</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Our Evolution Engine tracks your consistency, adaptation rate, and forecasts future performance tiers.
            </p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="relative z-10 px-6 py-32 max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-black text-center mb-20">The Intelligence Loop</h2>
        
        <div className="grid md:grid-cols-4 gap-4 relative">
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-zinc-800 to-transparent -translate-y-1/2" />
          
          <div className="relative bg-black border border-zinc-800 p-6 rounded-2xl text-center z-10">
            <div className="h-10 w-10 mx-auto rounded-full bg-zinc-900 flex items-center justify-center font-bold text-[#FF4F21] mb-4">1</div>
            <h4 className="font-bold mb-2">Upload Video</h4>
            <p className="text-xs text-zinc-500">Record a sprint and upload the raw file.</p>
          </div>
          
          <div className="relative bg-black border border-zinc-800 p-6 rounded-2xl text-center z-10">
            <div className="h-10 w-10 mx-auto rounded-full bg-zinc-900 flex items-center justify-center font-bold text-[#FF4F21] mb-4">2</div>
            <h4 className="font-bold mb-2">AI Analysis</h4>
            <p className="text-xs text-zinc-500">Our engine extracts 33 body landmarks.</p>
          </div>

          <div className="relative bg-black border border-[#FF4F21]/30 bg-[#FF4F21]/5 p-6 rounded-2xl text-center z-10 shadow-[0_0_30px_rgba(255,79,33,0.1)]">
            <div className="h-10 w-10 mx-auto rounded-full bg-[#FF4F21] flex items-center justify-center font-bold text-white mb-4">3</div>
            <h4 className="font-bold text-[#FF4F21] mb-2">Performance Dashboard</h4>
            <p className="text-xs text-zinc-400">View kinematics, GCT, and injury risks.</p>
          </div>

          <div className="relative bg-black border border-zinc-800 p-6 rounded-2xl text-center z-10">
            <div className="h-10 w-10 mx-auto rounded-full bg-zinc-900 flex items-center justify-center font-bold text-[#FF4F21] mb-4">4</div>
            <h4 className="font-bold mb-2">Recommendations</h4>
            <p className="text-xs text-zinc-500">Get custom drills to fix your mechanics.</p>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="border-t border-zinc-900 relative z-10">
        <div className="max-w-4xl mx-auto px-6 py-32 text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Build Your Digital Athlete Identity.</h2>
          <p className="text-zinc-400 text-lg mb-10">
            Join the revolution in sports science. Stop guessing, start measuring.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-8 py-4 rounded-full font-bold text-lg transition">
            Create Free Account <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
        
        <div className="border-t border-zinc-900 py-8 px-6 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-600 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 font-bold text-zinc-500 mb-4 md:mb-0">
            <div className="h-5 w-5 rounded bg-zinc-800 flex items-center justify-center text-[10px] text-white">A</div>
            ATHLIXIR © 2026
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-300">About</a>
            <a href="#" className="hover:text-zinc-300">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-300">Terms</a>
            <a href="#" className="hover:text-zinc-300">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
