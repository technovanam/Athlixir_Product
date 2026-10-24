'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Zap,
  ShieldCheck,
  TrendingUp,
  Target,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Gauge,
  Bot,
} from 'lucide-react';
import Link from 'next/link';

const CORE_CAPABILITIES = [
  {
    icon: Activity,
    color: '#FF4F21',
    bgColor: 'rgba(255, 79, 33, 0.08)',
    tag: 'Computer Vision',
    title: 'Markerless Joint Tracking',
    description:
      'Extract 33 skeletal kinematic landmarks from standard 60 FPS smartphone video without wearable sensors or hardware straps.',
    stats: '60 FPS Precision',
  },
  {
    icon: Zap,
    color: '#007AFF',
    bgColor: 'rgba(0, 122, 255, 0.08)',
    tag: 'Cadence & GCT',
    title: 'Ground Contact Dynamics',
    description:
      'Measure ground contact time down to single milliseconds and identify horizontal braking impulse vs propulsion forces.',
    stats: '< 100ms Elite Threshold',
  },
  {
    icon: ShieldCheck,
    color: '#34C759',
    bgColor: 'rgba(52, 199, 89, 0.08)',
    tag: 'Injury Prevention',
    title: 'Dynamic Injury Risk Guard',
    description:
      'Detect excessive hamstring eccentric strain, overstriding, and lateral pelvic drop before overuse injuries occur.',
    stats: 'Bilateral Symmetry Scan',
  },
  {
    icon: Target,
    color: '#FF9500',
    bgColor: 'rgba(255, 149, 0, 0.08)',
    tag: 'Scoring Engine',
    title: 'Collegiate Norm Benchmarking',
    description:
      'Index your sprint metrics against verified regional, collegiate, and elite national track standards in real-time.',
    stats: 'Top % Cohort Ranking',
  },
  {
    icon: TrendingUp,
    color: '#AF52DE',
    bgColor: 'rgba(175, 82, 222, 0.08)',
    tag: 'Analytics',
    title: 'Longitudinal Trajectories',
    description:
      'Track velocity improvements, mechanical consistency, and readiness trends across training microcycles and race seasons.',
    stats: 'Mesocycle Tracking',
  },
  {
    icon: Bot,
    color: '#FF4F21',
    bgColor: 'rgba(255, 79, 33, 0.08)',
    tag: 'AI Coach',
    title: 'Smart Directive Copilot',
    description:
      'Receive actionable, sports-science backed sprint drills and technical cue adaptations directly targeted to your gait flaws.',
    stats: 'Personalized Drills',
  },
];

const Features: React.FC = () => {
  return (
    <section
      id="features"
      className="py-12 sm:py-14 bg-[#FAFAFC] relative text-[#1C1C1E] overflow-hidden font-poppins border-t border-black/[0.04]"
    >
      {/* Background Soft Gradients */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[#FF4F21]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[400px] h-[400px] bg-[#FF4F21]/[0.04] rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.06] bg-white shadow-2xs text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4F21] mb-4"
          >
            <Sparkles size={12} />
            <span>Platform Capabilities</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold text-[#1C1C1E] tracking-tight leading-[1.1] mb-5"
          >
            Built for Sprinters.{' '}
            <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6A3D] to-[#FFA233] bg-clip-text text-transparent">
              Engineered by AI.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-[#636366] leading-relaxed font-normal"
          >
            Everything you need to analyze, understand, and accelerate sprint performance with clinical accuracy straight from your smartphone.
          </motion.p>
        </div>

        {/* 6-Card Clean Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {CORE_CAPABILITIES.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_36px_rgba(0,0,0,0.06)] hover:border-black/[0.12] transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Top Icon & Tag Strip */}
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className="h-11 w-11 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ backgroundColor: item.bgColor, color: item.color }}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] bg-[#F2F2F7] px-2.5 py-1 rounded-full border border-black/[0.04]">
                      {item.tag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-[#1C1C1E] mb-2.5 group-hover:text-[#FF4F21] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#636366] leading-relaxed mb-6 font-normal">
                    {item.description}
                  </p>
                </div>

                {/* Bottom Stats Badge */}
                <div className="pt-4 border-t border-black/[0.05] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-900 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-[#34C759]" />
                    {item.stats}
                  </span>
                  <span className="text-[11px] font-bold text-[#FF4F21] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                    View <ArrowRight size={11} />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Banner CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 sm:mt-12 p-6 sm:p-8 rounded-3xl bg-white border border-black/[0.08] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-12 w-12 rounded-2xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center font-black shrink-0 hidden sm:flex">
              <Layers size={24} />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold text-[#1C1C1E]">
                Ready to see your kinematic report?
              </h4>
              <p className="text-xs sm:text-sm text-[#636366]">
                Upload any 5-second sprint clip and receive your full biomechanics profile instantly.
              </p>
            </div>
          </div>

          <Link
            href="/signup"
            className="w-full sm:w-auto px-6 py-3.5 bg-[#FF4F21] text-white font-bold rounded-full hover:bg-[#E03E12] transition-all shadow-[0_2px_12px_rgba(255,79,33,0.25)] text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2 shrink-0"
          >
            <span>Start Free Analysis</span>
            <ArrowRight size={13} />
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default Features;
