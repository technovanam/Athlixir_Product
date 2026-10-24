'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Shield, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface PricingTier {
  id: string;
  name: string;
  badge?: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  isPopular?: boolean;
  icon: React.ElementType;
  ctaText: string;
  ctaHref: string;
  features: string[];
}

const TIERS: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Essential markerless sprint tracking for individual track & field athletes.',
    monthlyPrice: 0,
    annualPrice: 0,
    icon: Zap,
    ctaText: 'Start for Free',
    ctaHref: '/onboarding',
    features: [
      '5 video kinematic analyses / month',
      'Ground contact time & cadence tracking',
      'Basic bilateral symmetry score',
      'Single smartphone camera support (60 FPS)',
      'Community norm benchmarking',
    ],
  },
  {
    id: 'pro',
    name: 'Athlete Pro',
    badge: 'Most Popular',
    isPopular: true,
    description: 'Comprehensive sports-science sprint intelligence for competitive sprinters.',
    monthlyPrice: 1499,
    annualPrice: 1199,
    icon: Sparkles,
    ctaText: 'Unlock Athlete Pro',
    ctaHref: '/onboarding',
    features: [
      'Unlimited video kinematic uploads',
      '33 skeletal joint kinematic 3D angles',
      'Hamstring strain & eccentric injury guard',
      'Braking vs. propulsion impulse calculation',
      'Athlixir Copilot AI verbal coaching cues',
      'Exportable Lab-Grade PDF sprint reports',
      'High-speed 120 / 240 FPS video support',
    ],
  },
  {
    id: 'team',
    name: 'Coach & Academy',
    badge: 'Teams & Labs',
    description: 'Designed for collegiate track teams, academies, and performance training centers.',
    monthlyPrice: 5999,
    annualPrice: 4799,
    icon: Users,
    ctaText: 'Get Team License',
    ctaHref: '/onboarding',
    features: [
      'Unlimited athletes roster & multi-coach seats',
      'Batch sprint video upload & processing',
      'Team normative benchmarking & leaderboard',
      'Custom drill and training protocol builder',
      'Data API access & CSV kinematic export',
      'Priority processing server queue',
      'Dedicated sports science onboarding session',
    ],
  },
];

const Pricing: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  return (
    <section id="pricing" className="relative w-full py-12 sm:py-14 bg-white text-[#1C1C1E] overflow-hidden border-t border-black/[0.06]">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#FF4F21]/[0.03] blur-[160px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#FF4F21]/[0.02] blur-[160px] pointer-events-none" />

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2F2F7] border border-black/[0.06] mb-4">
            <Shield size={14} className="text-[#FF4F21]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
              Transparent Pricing
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#1C1C1E] leading-[1.15]">
            Simple Plans for Every{' '}
            <span className="bg-gradient-to-r from-[#FF4F21] via-[#FF6B3D] to-[#FF8C66] bg-clip-text text-transparent">
              Speed Pursuit.
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-[#636366] max-w-2xl mx-auto leading-relaxed">
            From individual track athletes to national collegiate academies, access elite sprint kinematics without hardware overhead.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-[#F2F2F7] border border-black/[0.06]">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                !isAnnual
                  ? 'bg-white text-[#1C1C1E] shadow-2xs'
                  : 'text-[#636366] hover:text-[#1C1C1E]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                isAnnual
                  ? 'bg-[#FF4F21] text-white shadow-2xs'
                  : 'text-[#636366] hover:text-[#1C1C1E]'
              }`}
            >
              <span>Annual Billing</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isAnnual ? 'bg-white text-[#FF4F21]' : 'bg-[#FF4F21]/10 text-[#FF4F21]'
              }`}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid - Expanded */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-10 max-w-7xl mx-auto items-stretch">
          {TIERS.map((tier) => {
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            const Icon = tier.icon;

            return (
              <div
                key={tier.id}
                className={`relative flex flex-col justify-between rounded-3xl p-7 sm:p-9 transition-all duration-300 ${
                  tier.isPopular
                    ? 'bg-white border-2 border-[#FF4F21] shadow-2xl shadow-[#FF4F21]/12 lg:-translate-y-2'
                    : 'bg-[#F9F9FB] border border-black/[0.08] hover:border-black/[0.15] hover:shadow-xl'
                }`}
              >
                {/* Popular Pill Badge */}
                {tier.badge && (
                  <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-2xs ${
                    tier.isPopular
                      ? 'bg-[#FF4F21] text-white'
                      : 'bg-zinc-800 text-white'
                  }`}>
                    {tier.badge}
                  </div>
                )}

                <div>
                  {/* Tier Title & Icon */}
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-[#1C1C1E]">{tier.name}</h3>
                      <p className="text-xs sm:text-sm text-[#636366] mt-1 line-clamp-2 min-h-[36px]">
                        {tier.description}
                      </p>
                    </div>
                    <div className={`h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center ${
                      tier.isPopular ? 'bg-[#FF4F21]/10 text-[#FF4F21]' : 'bg-black/[0.04] text-zinc-600'
                    }`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  {/* Price Tag with Rupee Symbol */}
                  <div className="my-6 pb-6 border-b border-black/[0.06]">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black tracking-tight text-[#1C1C1E]">
                        {price === 0 ? '₹0' : `₹${price.toLocaleString('en-IN')}`}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-[#8E8E93]">
                        / {tier.monthlyPrice === 0 ? 'forever' : 'month'}
                      </span>
                    </div>
                    {isAnnual && tier.monthlyPrice > 0 && (
                      <span className="text-xs font-medium text-emerald-600 mt-1.5 block">
                        Billed annually (₹{(price * 12).toLocaleString('en-IN')}/year)
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="space-y-3.5 mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-3">
                      Included Capabilities
                    </span>
                    {tier.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-3 text-xs sm:text-sm text-[#1C1C1E] font-medium">
                        <div className={`mt-0.5 h-4 w-4 shrink-0 rounded-full flex items-center justify-center ${
                          tier.isPopular ? 'bg-[#FF4F21]/15 text-[#FF4F21]' : 'bg-zinc-200 text-zinc-700'
                        }`}>
                          <Check size={11} strokeWidth={3} />
                        </div>
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action CTA Button */}
                <div>
                  <Link
                    href={tier.ctaHref}
                    className={`w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                      tier.isPopular
                        ? 'bg-[#FF4F21] text-white hover:bg-[#E03E12] shadow-md shadow-[#FF4F21]/25'
                        : 'bg-white border border-black/[0.12] text-[#1C1C1E] hover:bg-zinc-50'
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>

        {/* Enterprise / University Research Callout */}
        <div className="mt-10 sm:mt-12 max-w-5xl mx-auto rounded-3xl bg-[#F9F9FB] border border-black/[0.08] p-7 sm:p-9 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left shadow-xs">
          <div>
            <h4 className="text-base sm:text-lg font-black text-[#1C1C1E]">
              University Research Lab or Olympic Federation?
            </h4>
            <p className="text-xs sm:text-sm text-[#636366] mt-1 max-w-xl">
              Custom raw IMU kinematic sync, dedicated local on-premise AI deployments, and bulk team licensing.
            </p>
          </div>
          <Link
            href="#contact"
            className="shrink-0 inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-black/[0.1] bg-white text-xs sm:text-sm font-bold text-[#1C1C1E] hover:bg-zinc-50 transition active:scale-95 shadow-2xs"
          >
            Contact Sports Science Team
          </Link>
        </div>

      </div>
    </section>
  );
};

export default Pricing;
