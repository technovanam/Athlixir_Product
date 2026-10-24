'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, ArrowRight, CheckCircle2, Dumbbell, FileBarChart2, OctagonAlert, Sparkles, Target } from 'lucide-react';

// Demo athlete graded against the U18 male 100m profile in the AI engine's
// benchmark norms; injury flags follow the engine's thresholds (38 pts → Moderate).
const LEVELS = ['District', 'State', 'National', 'Elite'] as const;

interface Metric {
  id: string;
  label: string;
  value: number;
  unit: string;
  digits?: number;
  /** District → Elite thresholds; descending when lower is better. */
  thresholds?: [number, number, number, number];
  /** Metrics without level norms are scored on closeness to an ideal instead. */
  ideal?: number;
  range: [number, number];
  what: string;
  note: string;
}

const METRICS: Metric[] = [
  {
    id: 'cadence',
    label: 'Cadence',
    value: 181,
    unit: 'spm',
    thresholds: [170, 175, 180, 185],
    range: [165, 190],
    what: 'Steps per minute at top speed.',
    note: 'Already at national level. Hold it while stride length grows, instead of chasing a higher turnover.',
  },
  {
    id: 'gct',
    label: 'Ground contact',
    value: 196,
    unit: 'ms',
    thresholds: [240, 210, 180, 150],
    range: [255, 140],
    what: 'Time each foot spends on the ground per step.',
    note: 'The biggest gain available. Stiffer ankles and landing under the hips move it toward the 180 ms national mark.',
  },
  {
    id: 'stride',
    label: 'Stride length',
    value: 1.98,
    unit: 'm',
    digits: 2,
    thresholds: [1.75, 1.9, 2.05, 2.2],
    range: [1.65, 2.3],
    what: 'Distance covered by each step.',
    note: 'Comes from pushing harder into the ground, not reaching forward. Reaching shows up as overstride.',
  },
  {
    id: 'symmetry',
    label: 'Asymmetry',
    value: 4.2,
    unit: '%',
    digits: 1,
    thresholds: [10, 5, 2.5, 1],
    range: [12, 0],
    what: 'Difference between left and right steps.',
    note: 'Under the 5% injury threshold. Single-leg bounding keeps both sides balanced.',
  },
  {
    id: 'oscillation',
    label: 'Vertical bounce',
    value: 7.1,
    unit: 'cm',
    digits: 1,
    thresholds: [10, 8, 6.5, 5],
    range: [12, 4],
    what: 'How far the hips rise and fall each step.',
    note: 'Some bounce is wasted energy. Projecting forward rather than up brings it toward national level.',
  },
  {
    id: 'posture',
    label: 'Trunk lean',
    value: 9,
    unit: '°',
    ideal: 8,
    range: [20, 8],
    what: 'Forward lean of the torso at top speed (ideal ≈ 8°).',
    note: 'Close to ideal. Keep the lean coming from the ankles, not by bending at the waist.',
  },
];

function level(m: Metric) {
  if (!m.thresholds) return 'Near ideal';
  const higherBetter = m.thresholds[3] > m.thresholds[0];
  let reached = -1;
  m.thresholds.forEach((t, i) => {
    if (higherBetter ? m.value >= t : m.value <= t) reached = i;
  });
  return reached < 0 ? 'Developing' : LEVELS[reached];
}

const position = (m: Metric, v: number) => Math.min(1, Math.max(0, (v - m.range[0]) / (m.range[1] - m.range[0])));

const format = (m: Metric, v: number) => v.toFixed(m.digits ?? 0);

const FLAGS = [
  { label: 'Ground contact', detail: '196 ms is above the 150 ms sprint target; flags fatigue risk.', severity: 'high' },
  { label: 'Overstriding', detail: 'Foot lands 6.8° ahead of the hips, adding hamstring load.', severity: 'medium' },
  { label: 'Limb asymmetry', detail: '4.2%, under the 5% threshold.', severity: 'clear' },
  { label: 'Vertical bounce', detail: '7.1 cm, under the 10 cm impact threshold.', severity: 'clear' },
] as const;

const SEVERITY = {
  high: { icon: OctagonAlert, text: 'High', color: '#E5484D' },
  medium: { icon: AlertTriangle, text: 'Watch', color: '#F5A524' },
  clear: { icon: CheckCircle2, text: 'Clear', color: '#30A46C' },
} as const;

const RISK_SCORE = 38;

const ScoreRing: React.FC<{ score: number }> = ({ score }) => {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg viewBox="0 0 128 128" className="h-32 w-32" role="img" aria-label={`Performance score ${score} out of 100`}>
      <circle cx="64" cy="64" r={r} fill="none" stroke="#F2F2F7" strokeWidth="10" />
      <motion.circle
        cx="64"
        cy="64"
        r={r}
        fill="none"
        stroke="url(#score-grad)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        whileInView={{ strokeDashoffset: c * (1 - score / 100) }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        transform="rotate(-90 64 64)"
      />
      <defs>
        <linearGradient id="score-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF4F21" />
          <stop offset="100%" stopColor="#FFA233" />
        </linearGradient>
      </defs>
      <text x="64" y="62" textAnchor="middle" className="fill-[#1C1C1E]" style={{ font: '800 34px Poppins, system-ui' }}>
        {score}
      </text>
      <text x="64" y="84" textAnchor="middle" className="fill-[#8E8E93]" style={{ font: '600 11px Poppins, system-ui' }}>
        / 100
      </text>
    </svg>
  );
};

const SampleReport: React.FC = () => {
  const [selected, setSelected] = useState('gct');
  const metric = METRICS.find((m) => m.id === selected)!;
  const target = metric.thresholds ? metric.thresholds[3] : metric.ideal!;
  const ticks = metric.thresholds
    ? metric.thresholds.map((t, i) => ({ at: t, label: LEVELS[i].slice(0, 3) }))
    : [{ at: metric.ideal!, label: 'Ideal' }];

  return (
    <section
      id="sample-report"
      className="py-12 sm:py-14 bg-[#F2F2F7] relative text-[#1C1C1E] overflow-hidden font-poppins border-t border-black/[0.04]"
    >
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#FF4F21]/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.06] bg-white shadow-2xs text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4F21] mb-4"
          >
            <FileBarChart2 size={12} />
            <span>Sample Report</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5"
          >
            This is what you{' '}
            <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6A3D] to-[#FFA233] bg-clip-text text-transparent">
              get back.
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base text-[#636366] leading-relaxed"
          >
            A real report layout with a demo athlete&apos;s numbers. Tap any metric to see what it means and how to
            improve it.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="rounded-[2rem] bg-white border border-black/[0.06] shadow-[0_24px_60px_rgba(0,0,0,0.06)] overflow-hidden"
        >
          {/* Report header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 border-b border-black/[0.06]">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF4F21] to-[#FFA233] text-white text-sm font-bold flex items-center justify-center">
                DA
              </span>
              <div>
                <p className="text-sm font-bold leading-tight">Demo Athlete · 100m sprint</p>
                <p className="text-[11px] text-[#8E8E93]">Benchmarked against U18 male 100m</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#F2F2F7] text-[10px] font-bold uppercase tracking-[0.16em] text-[#636366]">
              Sample data
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px] divide-y lg:divide-y-0 lg:divide-x divide-black/[0.06]">
            {/* Score */}
            <div className="p-5 sm:p-7 flex flex-col items-center text-center">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E8E93] mb-3">Performance score</p>
              <ScoreRing score={74} />
              <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF4F21]/10 text-xs font-bold text-[#E03E12]">
                <Sparkles size={12} /> State Potential
              </span>
              <p className="mt-4 text-xs text-[#636366] leading-relaxed">
                Strong turnover and posture. Ground contact is the main thing holding the score back.
              </p>
            </div>

            {/* Metrics */}
            <div className="p-5 sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E8E93] mb-4">Running metrics</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {METRICS.map((m) => {
                  const on = m.id === selected;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelected(m.id)}
                      aria-pressed={on}
                      className={`text-left p-3.5 rounded-2xl border transition-all active:scale-[0.98] ${
                        on ? 'border-[#FF4F21]/50 bg-[#FF4F21]/[0.04] shadow-[0_6px_18px_rgba(255,79,33,0.10)]' : 'border-black/[0.07] hover:bg-[#FAFAFC]'
                      }`}
                    >
                      <span className="block text-[11px] font-semibold text-[#8E8E93]">{m.label}</span>
                      <span className="block mt-1 text-2xl font-extrabold tabular-nums leading-none">
                        {format(m, m.value)}
                        <span className="ml-1 text-xs font-semibold text-[#8E8E93]">{m.unit}</span>
                      </span>
                      {/* Position between district and elite */}
                      <span className="relative block mt-3 h-1.5 rounded-full bg-[#F2F2F7]">
                        <span
                          className="absolute inset-y-0 left-0 rounded-full bg-[#FF4F21]"
                          style={{ width: `${position(m, m.value) * 100}%` }}
                        />
                      </span>
                      <span className="block mt-1.5 text-[10px] font-bold uppercase tracking-wider text-[#636366]">{level(m)}</span>
                    </button>
                  );
                })}
              </div>

              {/* Selected metric detail */}
              <div className="mt-4 p-4 sm:p-5 rounded-2xl bg-[#FAFAFC] border border-black/[0.05]" aria-live="polite">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                  <p className="text-sm font-bold">{metric.label}</p>
                  <p className="text-xs text-[#636366]">
                    You <span className="font-bold text-[#1C1C1E] tabular-nums">{format(metric, metric.value)} {metric.unit}</span>
                    {' · '}{metric.thresholds ? 'Elite' : 'Ideal'}{' '}
                    <span className="font-bold text-[#1C1C1E] tabular-nums">{format(metric, target)} {metric.unit}</span>
                  </p>
                </div>
                {/* Benchmark scale */}
                <div className="relative h-2 rounded-full bg-[#ECECF1] mb-1">
                  {ticks.map((t) => (
                    <span
                      key={t.label}
                      className="absolute top-1/2 -translate-y-1/2 h-3 w-0.5 bg-[#C7C7CC]"
                      style={{ left: `${position(metric, t.at) * 100}%` }}
                    />
                  ))}
                  <motion.span
                    key={metric.id}
                    initial={{ left: '0%' }}
                    animate={{ left: `${position(metric, metric.value) * 100}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-[#FF4F21] ring-[3px] ring-white shadow"
                  />
                </div>
                <div className="relative h-4 mb-3">
                  {ticks.map((t) => (
                    <span
                      key={t.label}
                      className="absolute -translate-x-1/2 text-[9px] font-semibold uppercase tracking-wide text-[#8E8E93]"
                      style={{ left: `${position(metric, t.at) * 100}%` }}
                    >
                      {t.label}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-[#636366] leading-relaxed">
                  <span className="font-semibold text-[#1C1C1E]">{metric.what}</span> {metric.note}
                </p>
              </div>
            </div>

            {/* Injury risk and insights */}
            <div className="p-5 sm:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8E8E93] mb-3">Injury risk</p>
              <div className="flex items-end justify-between mb-2">
                <p className="text-2xl font-extrabold leading-none">Moderate</p>
                <p className="text-xs text-[#636366]">
                  Main area <span className="font-bold text-[#1C1C1E]">Hamstring</span>
                </p>
              </div>
              {/* Risk scale: Minimal < 15 ≤ Low < 30 ≤ Moderate < 55 ≤ High */}
              <div className="relative mb-1">
                <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
                  <span className="bg-[#30A46C]/70" style={{ width: '15%' }} />
                  <span className="bg-[#30A46C]/40" style={{ width: '15%' }} />
                  <span className="bg-[#F5A524]/70" style={{ width: '25%' }} />
                  <span className="bg-[#E5484D]/70" style={{ width: '45%' }} />
                </div>
                <span
                  className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-white border-[3px] border-[#1C1C1E]"
                  style={{ left: `${RISK_SCORE}%` }}
                />
              </div>
              <div className="flex text-[9px] font-semibold uppercase tracking-wide text-[#8E8E93] mb-5">
                <span style={{ width: '30%' }}>Low</span>
                <span style={{ width: '25%' }}>Moderate</span>
                <span>High</span>
              </div>

              <ul className="space-y-3 mb-6">
                {FLAGS.map((f) => {
                  const s = SEVERITY[f.severity];
                  const Icon = s.icon;
                  return (
                    <li key={f.label} className="flex gap-2.5">
                      <Icon size={16} className="mt-0.5 shrink-0" style={{ color: s.color }} aria-hidden />
                      <div>
                        <p className="text-xs font-bold leading-tight">
                          {f.label} <span className="font-semibold text-[#8E8E93]">· {s.text}</span>
                        </p>
                        <p className="text-[11px] text-[#636366] leading-snug">{f.detail}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <div className="p-4 rounded-2xl bg-[#1C1C1E] text-white">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FF6A3D] mb-2 flex items-center gap-1.5">
                  <Dumbbell size={12} /> This week&apos;s focus
                </p>
                <p className="text-sm font-semibold leading-snug mb-1">Pogo hops and A-skips</p>
                <p className="text-[11px] text-white/60 leading-snug">
                  3 × 20 s, twice a week, to stiffen the ankle and land under the hips.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 sm:px-8 py-4 border-t border-black/[0.06] bg-[#FAFAFC]">
            <p className="text-xs text-[#636366] flex items-center gap-2">
              <Target size={14} className="text-[#FF4F21]" />
              Your report also tracks progress across every run you upload.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FF4F21] hover:text-[#E03E12]"
            >
              Get your own report <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SampleReport;
