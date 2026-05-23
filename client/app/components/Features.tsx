'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Zap, TrendingUp, Activity, Check } from 'lucide-react';

// Live Biomechanics Telemetry Graph Component (Replaces static stock image)
const TelemetryGraphCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let offset = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || 400;
      canvas.height = canvas.parentElement?.clientHeight || 300;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      const step = 24;
      for (let x = 0; x < canvas.width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw neon wave line (Sprint telemetry - orange)
      ctx.strokeStyle = '#FF4F21';
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FF4F21';
      
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.015 + offset) * 35 + Math.cos(x * 0.006) * 12;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw second wave line (Symmetry comparison - green)
      ctx.strokeStyle = '#00DF89';
      ctx.lineWidth = 1.5;
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#00DF89';
      
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = canvas.height / 2 + Math.sin(x * 0.018 + offset + Math.PI) * 30 + Math.sin(x * 0.007) * 8;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw floating telemetry tracking dot
      ctx.shadowBlur = 8;
      const dotX = (offset * 40) % canvas.width;
      const dotY = canvas.height / 2 + Math.sin(dotX * 0.015 + offset) * 35 + Math.cos(dotX * 0.006) * 12;
      
      ctx.fillStyle = '#FF8433';
      ctx.shadowColor = '#FF8433';
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Draw coordinates label
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '8px monospace';
      ctx.fillText(`BIOMECH_Y: ${dotY.toFixed(1)}px`, dotX + 8, dotY - 5);

      offset += 0.015;
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block bg-[#08080C] z-0" />;
};

const Features: React.FC = () => {
  return (
    <section
      id="features"
      className="pt-8 pb-16 md:pt-12 md:pb-24 bg-background relative text-white overflow-hidden"
    >
      {/* Background Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background z-0" />
      <div
        className="absolute inset-0 opacity-[0.15] z-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="container mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-stretch relative z-10">
        
        {/* Left Side - Featured Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="p-8 md:p-12 rounded-[2.5rem] bg-white/5 backdrop-blur-xl border border-white/10 relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col h-full"
        >
          {/* Enhanced Background Graphic to fill the gap */}
          <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity hidden lg:block">
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 border-[1px] border-primary/30 rounded-full border-dashed"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-10 border-[1px] border-white/10 rounded-full border-dashed"
              />
            </div>
          </div>

          <div className="inline-flex px-5 py-2 rounded-full border border-primary/30 bg-primary/10 text-[10px] font-bold mb-8 tracking-[0.2em] uppercase text-primary w-fit relative z-10">
            Powering Potential
          </div>

          <h3 className="text-2xl md:text-3xl lg:text-4xl font-black mb-6 text-white tracking-tight leading-tight relative z-10">
            AI Biomechanics <br />
            <span className="text-primary">Intelligence Engine.</span>
          </h3>

          <p className="text-gray-400 mb-10 leading-relaxed text-base md:text-lg max-w-md font-light relative z-10">
            Athlixir transforms sprint videos into scientific performance intelligence using AI-powered biomechanics analysis, benchmark scoring, injury-risk detection, and athlete evolution tracking.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 relative z-10">
            <div className="space-y-4">
              {[
                { icon: Activity, text: 'AI Sprint Biomechanics' },
                { icon: Zap, text: 'Cadence & GCT Analysis' },
                { icon: Shield, text: 'Injury Risk Detection' },
                { icon: Check, text: 'Performance Benchmarking' },
                { icon: TrendingUp, text: 'Athlete Evolution Tracking' },
              ].map((item, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm text-gray-300 font-medium">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Real Sprint Telemetry Metrics (Replaces Neural Engine/Biometric Link) */}
          <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-end space-y-2.5 opacity-60 text-[9px] font-mono text-zinc-400">
            <div className="flex items-center space-x-2">
              <span>CADENCE</span>
              <div className="w-12 h-[1px] bg-primary/20" />
              <span className="font-bold text-white">182 SPM</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>GCT</span>
              <div className="w-12 h-[1px] bg-primary/20" />
              <span className="font-bold text-primary">118 ms</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>SYMMETRY</span>
              <div className="w-12 h-[1px] bg-primary/20" />
              <span className="font-bold text-emerald-400">91%</span>
            </div>
          </div>

          <div className="mt-auto relative z-10">
            <button className="px-8 py-4 bg-primary text-white font-bold rounded-full hover:bg-orange-600 transition-all shadow-[0_0_20px_rgba(255,87,34,0.4)] text-xs uppercase tracking-widest flex items-center space-x-3 group w-fit cursor-pointer">
              <span>Explore Dashboard</span>
              <ArrowRight
                size={16}
                className="transform group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </motion.div>

        {/* Right Side - Content & Preview */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-between h-full relative"
        >
          <div className="relative z-10 mb-8">
            <div className="inline-flex px-5 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-[10px] font-bold mb-6 tracking-[0.2em] uppercase text-blue-400 backdrop-blur-sm">
              The Future
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-black leading-tight mb-6 tracking-tight text-white">
              Track Every Sprint <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-gray-600">
                With Scientific Precision.
              </span>
            </h2>
            <p className="text-lg text-gray-400 max-w-lg leading-relaxed font-light mb-8">
              Measure sprint efficiency, analyze biomechanics, detect movement inefficiencies, and monitor athlete progress through real-time AI-powered running intelligence.
            </p>

            {/* Real Sports Science Tags (Replaces generic buzzwords) */}
            <div className="flex flex-wrap gap-2 lg:gap-3">
              {[
                'Cadence Tracking',
                'GCT Analysis',
                'Stride Intelligence',
                'Sprint Efficiency',
                'Injury Detection',
                'Biomechanics AI',
              ].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[9px] uppercase tracking-wider text-gray-400 font-bold hover:border-blue-500/40 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Preview Element: Real Telemetry Line Chart & Joint Tracking */}
          <div className="relative w-full aspect-[4/3] lg:aspect-auto lg:flex-grow rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 group min-h-[300px]">
            {/* Live-rendered telemetry screen */}
            <TelemetryGraphCanvas />

            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent pointer-events-none" />

            {/* Floating overlay card: Score Diagnostics (Replaces generic heart rate) */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-6 left-6 p-5 rounded-2xl bg-black/50 backdrop-blur-md border border-white/10 w-64 z-10 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold text-primary uppercase tracking-widest">
                  Sprint Diagnostics
                </span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl font-black mb-1 text-white">84 <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider ml-1">Score</span></div>
              <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Efficiency: Elite
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: '84%' }}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Features;
