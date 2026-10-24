'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Sparkles, Smartphone, Building2, Watch, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ComparisonRow {
  feature: string;
  category: string;
  athlixir: string | boolean;
  labMocap: string | boolean;
  wearables: string | boolean;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: 'Hardware Required',
    category: 'Accessibility',
    athlixir: 'Any 60fps Smartphone',
    labMocap: '12+ Optical Cameras (₹40L+)',
    wearables: 'Multiple IMU Straps (₹25,000+)',
  },
  {
    feature: 'Setup Time per Sprint',
    category: 'Accessibility',
    athlixir: '< 30 Seconds',
    labMocap: '45–60 Minutes',
    wearables: '10–15 Minutes',
  },
  {
    feature: 'Markerless Tracking',
    category: 'Technology',
    athlixir: true,
    labMocap: false,
    wearables: false,
  },
  {
    feature: 'Full 33-Joint 3D Kinematics',
    category: 'Technology',
    athlixir: true,
    labMocap: true,
    wearables: false,
  },
  {
    feature: 'Ground Contact Time (ms)',
    category: 'Biomechanical Metrics',
    athlixir: true,
    labMocap: true,
    wearables: 'Approximated',
  },
  {
    feature: 'Hamstring Strain & Injury Guard',
    category: 'Biomechanical Metrics',
    athlixir: true,
    labMocap: false,
    wearables: false,
  },
  {
    feature: 'AI Verbal & Visual Coaching Cues',
    category: 'Intelligence',
    athlixir: true,
    labMocap: false,
    wearables: false,
  },
  {
    feature: 'Cost per Athlete / Session',
    category: 'Economics',
    athlixir: 'Free Tier / From ₹1,199/mo',
    labMocap: '₹25,000+ per Session',
    wearables: '₹25,000 Upfront + Sub',
  },
];

const ComparisonMatrix: React.FC = () => {
  const renderCell = (val: string | boolean, isHighlighted = false) => {
    if (typeof val === 'boolean') {
      return val ? (
        <div className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${isHighlighted ? 'bg-[#FF4F21] text-white shadow-2xs' : 'bg-emerald-100 text-emerald-600'}`}>
          <Check size={16} strokeWidth={2.5} />
        </div>
      ) : (
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <X size={15} strokeWidth={2.5} />
        </div>
      );
    }
    return (
      <span className={`text-xs sm:text-sm font-semibold leading-tight ${isHighlighted ? 'text-[#FF4F21]' : 'text-zinc-700'}`}>
        {val}
      </span>
    );
  };

  return (
    <section id="comparison" className="relative w-full py-12 sm:py-14 bg-[#F2F2F7] text-[#1C1C1E] overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-[#FF4F21]/[0.03] blur-[150px] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-black/[0.06] shadow-2xs mb-4">
            <Sparkles size={14} className="text-[#FF4F21]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Why Athlixir Wins
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1C1C1E] leading-[1.15]">
            Lab-Grade Precision,{' '}
            <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6B3D] to-[#FF8C66] bg-clip-text text-transparent">
              Zero Expensive Hardware.
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#636366] max-w-2xl mx-auto leading-relaxed">
            Compare Athlixir&apos;s computer-vision AI against traditional 3D biomechanics lab systems and wearable sensors.
          </p>
        </div>

        {/* Comparison Table Card - Expanded Width */}
        <div className="w-full bg-white rounded-3xl border border-black/[0.08] shadow-xl shadow-black/[0.03] overflow-hidden">
          
          {/* Table Header Row */}
          <div className="grid grid-cols-12 bg-[#F9F9FB] border-b border-black/[0.08] p-4 sm:p-6 lg:p-7 items-center text-center">
            <div className="col-span-4 sm:col-span-5 text-left font-bold text-xs sm:text-sm text-zinc-500 uppercase tracking-wider">
              Capability / Metric
            </div>

            {/* Athlixir Column Header (Highlighted) */}
            <div className="col-span-3 sm:col-span-3 flex flex-col items-center justify-center p-2.5 sm:p-3.5 rounded-2xl bg-white border border-[#FF4F21]/20 shadow-xs relative">
              <div className="absolute -top-3 px-2.5 py-0.5 rounded-full bg-[#FF4F21] text-white text-[10px] font-black uppercase tracking-wider shadow-2xs">
                Next-Gen
              </div>
              <div className="flex items-center gap-1.5 text-xs sm:text-base font-extrabold text-[#1C1C1E]">
                <Smartphone size={16} className="text-[#FF4F21]" />
                <span>ATHLIXIR</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">Markerless Computer Vision</span>
            </div>

            {/* Lab MoCap */}
            <div className="col-span-2 sm:col-span-2 flex flex-col items-center justify-center p-1 sm:p-2 text-zinc-700">
              <div className="flex items-center gap-1 text-[11px] sm:text-sm font-bold">
                <Building2 size={14} className="text-zinc-400 hidden sm:inline" />
                <span>MoCap Lab</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">Vicon / Qualisys (₹40L+)</span>
            </div>

            {/* Wearables */}
            <div className="col-span-3 sm:col-span-2 flex flex-col items-center justify-center p-1 sm:p-2 text-zinc-700">
              <div className="flex items-center gap-1 text-[11px] sm:text-sm font-bold">
                <Watch size={14} className="text-zinc-400 hidden sm:inline" />
                <span>Wearables</span>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium hidden sm:inline">IMU Pods</span>
            </div>
          </div>

          {/* Table Body Rows */}
          <div className="divide-y divide-black/[0.04]">
            {COMPARISON_DATA.map((row, idx) => (
              <div
                key={row.feature}
                className={`grid grid-cols-12 p-4 sm:p-5 lg:p-6 items-center text-center transition-colors ${
                  idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFBFD]/60'
                } hover:bg-orange-50/20`}
              >
                {/* Feature Name */}
                <div className="col-span-4 sm:col-span-5 text-left pr-2">
                  <span className="block text-xs sm:text-sm lg:text-base font-bold text-[#1C1C1E]">
                    {row.feature}
                  </span>
                  <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">
                    {row.category}
                  </span>
                </div>

                {/* Athlixir Cell (Highlighted) */}
                <div className="col-span-3 sm:col-span-3 flex items-center justify-center py-1 px-1">
                  {renderCell(row.athlixir, true)}
                </div>

                {/* Lab MoCap Cell */}
                <div className="col-span-2 sm:col-span-2 flex items-center justify-center py-1 px-1">
                  {renderCell(row.labMocap, false)}
                </div>

                {/* Wearables Cell */}
                <div className="col-span-3 sm:col-span-2 flex items-center justify-center py-1 px-1">
                  {renderCell(row.wearables, false)}
                </div>
              </div>
            ))}
          </div>

          {/* Card Footer Call to Action */}
          <div className="p-5 sm:p-7 bg-[#F9F9FB] border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-zinc-600 font-medium text-center sm:text-left">
              Ready to eliminate cumbersome wearables and expensive testing queues?
            </p>
            <Link
              href="/onboarding"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF4F21] text-white text-xs sm:text-sm font-bold hover:bg-[#E03E12] transition active:scale-95 shadow-md shadow-[#FF4F21]/20 shrink-0"
            >
              <span>Get Started Free</span>
              <ArrowRight size={14} />
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};

export default ComparisonMatrix;
