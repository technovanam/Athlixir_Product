'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, FileBarChart2, Footprints, Smartphone, UploadCloud } from 'lucide-react';

const STEPS = [
  {
    icon: Smartphone,
    title: 'Record your run',
    text: 'Prop your phone side-on to the track and film a sprint. No markers, straps or sensors needed.',
    chips: ['Side-on view', '1080p · 60 FPS+'],
  },
  {
    icon: UploadCloud,
    title: 'Upload the video',
    text: 'Drop the clip into your dashboard. The AI engine tracks 33 body landmarks frame by frame and shows live progress.',
    chips: ['MP4, MOV or AVI', 'Live progress'],
  },
  {
    icon: FileBarChart2,
    title: 'Get your report',
    text: 'See your performance score, cadence, stride, ground contact, injury-risk flags and drills to fix what matters most.',
    chips: ['Benchmarked', 'Printable PDF'],
  },
];

const HowItWorks: React.FC = () => (
  <section
    id="how-it-works"
    className="py-12 sm:py-14 bg-[#F2F2F7] relative text-[#1C1C1E] overflow-hidden font-poppins border-t border-black/[0.04]"
  >
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
      <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-black/[0.06] bg-white shadow-2xs text-[11px] font-bold uppercase tracking-[0.18em] text-[#FF4F21] mb-4"
        >
          <Footprints size={12} />
          <span>How It Works</span>
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-5"
        >
          From phone video to{' '}
          <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6A3D] to-[#FFA233] bg-clip-text text-transparent">
            lab-grade report.
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-base text-[#636366] leading-relaxed"
        >
          Three steps, no lab booking and no equipment beyond the phone in your pocket.
        </motion.p>
      </div>

      <ol className="relative grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Connector behind the step badges on desktop */}
        <div
          aria-hidden
          className="hidden md:block absolute top-[46px] left-[16%] right-[16%] h-px bg-gradient-to-r from-[#FF4F21]/0 via-[#FF4F21]/35 to-[#FF4F21]/0"
        />
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.li
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.12 }}
              className="relative p-6 sm:p-7 rounded-3xl bg-white border border-black/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.03)]"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="h-12 w-12 rounded-2xl bg-[#FF4F21] text-white flex items-center justify-center shadow-[0_6px_18px_rgba(255,79,33,0.28)]">
                  <Icon size={21} />
                </span>
                <span className="text-5xl font-extrabold text-black/[0.05] tabular-nums leading-none">0{i + 1}</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-[#636366] leading-relaxed mb-5">{step.text}</p>
              <div className="flex flex-wrap gap-2">
                {step.chips.map((chip) => (
                  <span
                    key={chip}
                    className="px-2.5 py-1 rounded-full bg-[#F2F2F7] text-[11px] font-semibold text-[#636366]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </motion.li>
          );
        })}
      </ol>

      <div className="mt-10 sm:mt-12 flex justify-center">
        <Link
          href="/signup"
          className="px-7 py-3.5 bg-[#FF4F21] text-white font-bold rounded-full hover:bg-[#E03E12] transition-all shadow-[0_4px_16px_rgba(255,79,33,0.3)] text-xs uppercase tracking-widest active:scale-95 inline-flex items-center gap-2"
        >
          Analyze your first run <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default HowItWorks;
