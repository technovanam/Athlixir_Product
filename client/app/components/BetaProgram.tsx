'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Cpu, LineChart, MessageCircle, Rocket, Trophy, Users } from 'lucide-react';

const PERKS = [
  {
    icon: Trophy,
    title: 'Start free',
    text: 'The free plan includes 5 video analyses every month. No card needed.',
  },
  {
    icon: MessageCircle,
    title: 'A direct line to the team',
    text: 'Tell us what the report gets right and wrong. Your feedback shapes the next release.',
  },
  {
    icon: Cpu,
    title: 'Hear first about hardware',
    text: 'Get updates on the sleeve, insole and telemetry pod as they move toward launch.',
  },
  {
    icon: Users,
    title: 'Built for coaches too',
    text: 'The Coach & Academy plan tracks a whole squad with multi-coach seats.',
  },
];

// What beta athletes' results will be measured on — the same numbers the report tracks.
const TRACKED = [
  { label: 'Ground contact time', hint: 'ms per step' },
  { label: 'Cadence & stride length', hint: 'turnover vs. reach' },
  { label: 'Performance score', hint: 'run to run' },
  { label: 'Injury-risk flags', hint: 'raised and resolved' },
];

const BetaProgram: React.FC = () => (
  <section
    id="beta"
    className="py-12 sm:py-14 bg-[#FAFAFC] relative text-[#1C1C1E] overflow-hidden font-poppins border-t border-black/[0.04]"
  >
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.06] bg-white shadow-2xs text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4F21] mb-4"
          >
            <Rocket size={12} />
            <span>Beta Athletes</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5"
          >
            Be one of the{' '}
            <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6A3D] to-[#FFA233] bg-clip-text text-transparent">
              first results.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-[#636366] leading-relaxed mb-8"
          >
            Athlixir is in beta. We&apos;re looking for sprinters and coaches who want to train with their data and
            help us prove what it can do.
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {PERKS.map((perk, i) => {
              const Icon = perk.icon;
              return (
                <motion.div
                  key={perk.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
                  className="p-4 rounded-2xl bg-white border border-black/[0.06]"
                >
                  <span className="h-9 w-9 rounded-xl bg-[#FF4F21]/10 text-[#FF4F21] flex items-center justify-center mb-3">
                    <Icon size={17} />
                  </span>
                  <p className="text-sm font-bold mb-1">{perk.title}</p>
                  <p className="text-xs text-[#636366] leading-relaxed">{perk.text}</p>
                </motion.div>
              );
            })}
          </div>

          <Link
            href="/signup"
            className="px-7 py-3.5 bg-[#FF4F21] text-white font-bold rounded-full hover:bg-[#E03E12] transition-all shadow-[0_4px_16px_rgba(255,79,33,0.3)] text-xs uppercase tracking-widest active:scale-95 inline-flex items-center gap-2"
          >
            Join the beta <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative p-6 sm:p-8 rounded-[2rem] bg-[#1C1C1E] text-white overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
        >
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#FF4F21]/25 rounded-full blur-[90px] pointer-events-none" />
          <p className="relative text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF6A3D] mb-2 flex items-center gap-1.5">
            <LineChart size={12} /> Results we&apos;ll publish
          </p>
          <h3 className="relative text-xl sm:text-2xl font-bold leading-snug mb-2">
            Real athletes, real numbers, shared with permission.
          </h3>
          <p className="relative text-sm text-white/60 leading-relaxed mb-6">
            As beta athletes train, we&apos;ll share their progress here on the same measurements every report uses.
          </p>
          <ul className="relative divide-y divide-white/10 border-y border-white/10">
            {TRACKED.map((t) => (
              <li key={t.label} className="flex items-center justify-between gap-4 py-3.5">
                <span className="text-sm font-semibold">{t.label}</span>
                <span className="text-xs text-white/45">{t.hint}</span>
              </li>
            ))}
          </ul>
          <p className="relative mt-6 text-xs text-white/50 leading-relaxed">
            Your story could be the first one here.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);

export default BetaProgram;
