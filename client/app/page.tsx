'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { ArrowRight, ShieldCheck, Activity, Users, Zap } from 'lucide-react';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white overflow-hidden selection:bg-violet-500/30">
      
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none"></div>

      {/* Navigation Top bar */}
      <header className="relative z-10 border-b border-zinc-800/60 bg-zinc-950/20 backdrop-blur-md px-8 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold shadow-lg shadow-violet-500/20">
              A
            </div>
            <span className="font-extrabold tracking-widest text-sm uppercase text-white">Athlixir Suite</span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 px-4 py-2 text-xs font-semibold text-white transition duration-200"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-xs font-semibold text-zinc-400 hover:text-white transition duration-200"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/15 hover:from-violet-500 hover:to-indigo-500 transition duration-200"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main hero showcase */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          {/* Badge */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-4 py-1.5 text-xs font-semibold text-violet-400 border border-violet-500/20 shadow-inner">
            <ShieldCheck className="h-4 w-4" />
            <span>Fully Secure API Gateway Architecture</span>
          </span>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1] max-w-3xl mx-auto">
            Secure Performance Metrics for High-Performance Teams
          </h1>

          {/* Paragraph */}
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Athlixir bridges professional sports medicine, nutrition coaching, and wearable telemetry into a unified gateway, securely protected with no direct client-side Firebase access.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {user ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition duration-200 group cursor-pointer"
              >
                <span>Enter Workspace</span>
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-xl shadow-violet-500/20 hover:from-violet-500 hover:to-indigo-500 transition duration-200 group cursor-pointer"
                >
                  <span>Build Your Team Workspace</span>
                  <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950/30 px-8 py-3.5 text-sm font-semibold text-zinc-300 hover:text-white hover:bg-zinc-900/30 transition duration-200 cursor-pointer"
                >
                  Sign In Session
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Feature Highlights section */}
        <section className="max-w-5xl mx-auto grid gap-6 sm:grid-cols-3 mt-24">
          {[
            {
              title: 'API Gateway Security',
              desc: 'No client-side Firebase SDK exposure. Full HTTP-only session tracking prevents cookies hijacked by scripting injections.',
              icon: ShieldCheck,
            },
            {
              title: 'Dynamic Onboarding',
              desc: 'Sync workspace size, user role settings, and specific specialties to tailor UI metric summaries to your team needs.',
              icon: Activity,
            },
            {
              title: 'Unified Databases',
              desc: 'Sync Firebase Admin API capabilities to handle transactions and auditing streams in clean custom Firestore buckets.',
              icon: Users,
            },
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="rounded-2xl border border-zinc-800/80 bg-zinc-900/20 p-6 space-y-4 hover:border-zinc-700/80 transition duration-200 text-left">
                <div className="h-10 w-10 rounded-xl bg-violet-600/10 text-violet-400 flex items-center justify-center font-bold">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-white text-base">{feat.title}</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </section>
      </main>

      {/* Footer copyright */}
      <footer className="relative z-10 border-t border-zinc-900 bg-zinc-950/10 py-6 text-center text-[10px] text-zinc-600 uppercase tracking-wider">
        © 2026 Athlixir Systems. All rights secured.
      </footer>
    </div>
  );
}
