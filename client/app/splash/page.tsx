'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SplashPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!user) {
        router.replace('/login');
      } else if (!user.onboardingCompleted) {
        router.replace('/onboarding');
      } else {
        router.replace('/dashboard');
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [user, loading, router]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#FF4F21] px-6 overflow-hidden">
      {/* Ambient glow blooms */}
      <div className="absolute top-[-15%] left-[-15%] w-[420px] h-[420px] bg-white/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-15%] w-[380px] h-[380px] bg-black/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="h-20 w-20 rounded-[22px] bg-white flex items-center justify-center shadow-[0_8px_30px_rgba(0,0,0,0.25)] mb-6">
          <Zap className="h-10 w-10 text-[#FF4F21]" fill="currentColor" />
        </div>

        <h1 className="text-3xl font-black tracking-tight text-white">
          Athlixir
        </h1>
        <p className="text-xs font-semibold tracking-[0.3em] text-white/80 uppercase mt-2">
          Sprint Intelligence
        </p>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="absolute bottom-16 flex flex-col items-center gap-3"
      >
        <div className="h-1 w-24 rounded-full bg-white/25 overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
            className="h-full w-1/2 bg-white rounded-full"
          />
        </div>
        <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">
          Loading your profile
        </span>
      </motion.div>
    </div>
  );
}
