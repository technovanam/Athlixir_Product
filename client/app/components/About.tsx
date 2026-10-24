'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Target,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  {
    icon: Activity,
    color: '#FF4F21',
    bgColor: 'rgba(255, 79, 33, 0.08)',
    title: 'Kinematic Telemetry',
    desc: 'Cadence, stride length, ground contact time, and flight duration extracted frame-by-frame.',
  },
  {
    icon: Target,
    color: '#007AFF',
    bgColor: 'rgba(0, 122, 255, 0.08)',
    title: 'Collegiate Benchmarking',
    desc: 'Compare stride mechanics and acceleration against national standards and elite sprint tiers.',
  },
  {
    icon: ShieldCheck,
    color: '#34C759',
    bgColor: 'rgba(52, 199, 89, 0.08)',
    title: 'Injury Risk Mitigation',
    desc: 'Identifies overstriding patterns, asymmetric load distribution, and joint braking forces.',
  },
  {
    icon: TrendingUp,
    color: '#AF52DE',
    bgColor: 'rgba(175, 82, 222, 0.08)',
    title: 'Longitudinal Trajectories',
    desc: 'Track mechanical adaptations across training mesocycles to quantify athletic evolution.',
  },
];

const About: React.FC = () => {
  return (
    <section
      id="about"
      className="py-12 sm:py-14 bg-[#FAFAFC] relative overflow-hidden font-poppins border-t border-black/[0.04]"
    >
      {/* Background Soft Glow */}
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-[#FF4F21]/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-80 h-80 bg-[#FF4F21]/[0.04] rounded-full blur-[90px] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Scientific Narrative & 4 Pillars (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.06] bg-white shadow-2xs text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4F21]">
              <Sparkles size={12} />
              <span>Scientific Architecture</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1C1C1E] tracking-tight leading-[1.12]">
              Precision Biomechanics Meets{' '}
              <span className="bg-gradient-to-r from-[#FF4F21] to-[#FFA233] bg-clip-text text-transparent">
                Computer Vision.
              </span>
            </h2>

            {/* Narrative */}
            <p className="text-base text-[#636366] leading-relaxed font-normal max-w-2xl">
              Athlixir bridges the gap between elite sports-science laboratories and real-world track training. By processing standard smartphone footage through proprietary kinematic models, we deliver instant biomechanical diagnostics that coaches and athletes can immediately act on.
            </p>

            {/* 4 Feature Grid Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              {FEATURES.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="p-5 rounded-2xl bg-white border border-black/[0.06] shadow-2xs hover:shadow-md transition-all duration-200 group flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="h-9 w-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ backgroundColor: item.bgColor, color: item.color }}
                      >
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93]">
                        Verified
                      </span>
                    </div>

                    <div>
                      <h4 className="text-[#1C1C1E] font-bold text-sm mb-1.5 group-hover:text-[#FF4F21] transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#636366] leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Link */}
            <div className="pt-3">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#FF4F21] hover:text-[#E03E12] transition-all group"
              >
                <span>Learn how our kinematic engine validates sprint form</span>
                <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Column: Clean Telemetry Breakdown Card (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="bg-white rounded-3xl border border-black/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.05)] p-6 sm:p-7 relative overflow-hidden">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-5 border-b border-black/[0.06] mb-5">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#FF4F21] tracking-wider block mb-0.5">
                    Kinematic Phase Analysis
                  </span>
                  <h3 className="text-sm font-bold text-[#1C1C1E]">
                    100m Sprint Velocity Profile
                  </h3>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] text-[10px] font-bold uppercase tracking-wider">
                  Optimal
                </span>
              </div>

              {/* 3 Sprint Phases */}
              <div className="space-y-4 mb-6">
                {/* Phase 1 */}
                <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#1C1C1E]">
                      Phase 1: Drive &amp; Acceleration (0–15m)
                    </span>
                    <span className="font-bold text-[#FF4F21]">42° Lean</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-[#FF4F21] rounded-full w-[94%]" />
                  </div>
                  <p className="text-[11px] text-[#8E8E93]">
                    High horizontal impulse · Zero initial overstride
                  </p>
                </div>

                {/* Phase 2 */}
                <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#1C1C1E]">
                      Phase 2: Max Velocity (15–60m)
                    </span>
                    <span className="font-bold text-[#FF4F21]">88ms GCT</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-[#FF4F21] rounded-full w-[96%]" />
                  </div>
                  <p className="text-[11px] text-[#8E8E93]">
                    Vertical stiffness: 32 kN/m · Cadence: 4.8 Hz
                  </p>
                </div>

                {/* Phase 3 */}
                <div className="p-3.5 rounded-2xl bg-[#F8F8FA] border border-black/[0.04]">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-bold text-[#1C1C1E]">
                      Phase 3: Speed Endurance (60–100m)
                    </span>
                    <span className="font-bold text-[#34C759]">98.4% Sym</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-200 rounded-full overflow-hidden mb-1.5">
                    <div className="h-full bg-[#34C759] rounded-full w-[92%]" />
                  </div>
                  <p className="text-[11px] text-[#8E8E93]">
                    Posture maintained · Deceleration rate &lt; 2.1%
                  </p>
                </div>
              </div>

              {/* AI Coaching Directive Box */}
              <div className="p-3.5 rounded-2xl bg-[#FF4F21]/8 border border-[#FF4F21]/15 flex items-start gap-2.5">
                <Zap size={16} className="text-[#FF4F21] shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-[11px] font-bold text-[#FF4F21] uppercase tracking-wide mb-0.5">
                    AI Kinematic Insight
                  </h5>
                  <p className="text-xs text-[#1C1C1E] font-medium leading-relaxed">
                    Maintain active ankle dorsiflexion during late swing to reduce initial ground braking force by 14%.
                  </p>
                </div>
              </div>

              {/* Bottom Verification Note */}
              <div className="flex items-center justify-between pt-4 mt-4 border-t border-black/[0.06] text-[11px] text-[#8E8E93]">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-[#34C759]" />
                  <span>Sports Science Certified</span>
                </div>
                <span>60 FPS Accuracy</span>
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default About;
