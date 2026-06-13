'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const FinalCTA = () => {
  return (
    <section className="relative py-16 md:py-24 flex items-center justify-center overflow-hidden bg-black border-t border-zinc-950">
      
      {/* Background ambient overlays */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none">
        <Image
          src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1305&auto=format&fit=crop&ixlib=rb-4.1.0"
          alt="Stadium lights backdrop"
          fill
          unoptimized
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF4F21]/10 rounded-full blur-[150px]" />
      </div>

      {/* Content wrapper */}
      <div className="relative z-20 text-center text-white px-6 md:px-12 container mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="inline-flex px-5 py-2 rounded-full border border-[#FF4F21]/30 bg-[#FF4F21]/10 text-[11px] font-bold uppercase tracking-[0.25em] mb-10 text-[#FF4F21] backdrop-blur-sm"
        >
          Get Early Access
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 leading-tight tracking-tight text-white"
        >
          Ready to Unlock Your <br />
          <span className="text-[#FF4F21]">Sprint Intelligence?</span>
        </motion.h2>

        <p className="text-base md:text-lg mb-12 max-w-2xl mx-auto font-light leading-relaxed text-zinc-400">
          Upload your sprint video. Get instant AI-powered cadence, ground contact time, and skeletal posture telemetry today. Train smarter. Run faster.
        </p>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-5 sm:space-y-0 sm:space-x-8">
          <Link
            href="/signup"
            className="px-10 py-4.5 bg-[#FF4F21] text-white font-bold rounded-full hover:bg-orange-600 transition-all shadow-[0_0_30px_rgba(255,79,33,0.35)] text-xs uppercase tracking-widest hover:scale-105 min-w-[220px] flex items-center justify-center cursor-pointer"
          >
            Start AI Sprint Analysis
          </Link>
          <Link
            href="/login"
            className="px-10 py-4.5 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white hover:text-black transition-all text-xs uppercase tracking-widest min-w-[220px] hover:scale-105 flex items-center justify-center cursor-pointer"
          >
            Explore Platform
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
