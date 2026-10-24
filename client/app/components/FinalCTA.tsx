'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

const FinalCTA: React.FC = () => {
  return (
    <section className="py-12 sm:py-14 bg-[#F2F2F7] relative overflow-hidden font-poppins text-[#1C1C1E]">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[32px] overflow-hidden border border-black/[0.06] shadow-xl bg-white"
        >
          {/* Background photo */}
          <Image
            src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop"
            alt="Sprinter at the starting line"
            fill
            unoptimized
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-black/30" />

          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:px-16 md:py-20 max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 text-[11px] font-bold uppercase tracking-[0.2em] mb-6 text-white backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#FF4F21]" />
              Start Your Evolution
            </div>

            <h2 className="text-3xl md:text-5xl font-extrabold text-white leading-tight tracking-tight mb-4">
              Ready to Decode <br />
              <span className="text-[#FF4F21]">Your Sprint?</span>
            </h2>

            <p className="text-zinc-200 text-sm md:text-base leading-relaxed font-normal mb-8 max-w-lg">
              Upload a single sprint video and get AI-powered biomechanics analysis, injury risk detection, and performance benchmarking &mdash; built on real sports science.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="px-8 py-3.5 bg-[#FF4F21] text-white font-bold rounded-full hover:bg-[#E03E12] transition-all shadow-[0_4px_16px_rgba(255,79,33,0.3)] text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="px-8 py-3.5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-bold rounded-full hover:bg-white hover:text-black transition-all text-xs uppercase tracking-widest active:scale-95 flex items-center justify-center"
              >
                Analyze Your Sprint
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
