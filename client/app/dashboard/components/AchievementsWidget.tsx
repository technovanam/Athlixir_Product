'use client';

import React from 'react';
import { Medal, Star, ShieldCheck } from 'lucide-react';

export default function AchievementsWidget({ historyCount }: { historyCount: number }) {
  
  const achievements = [
    {
      title: 'First Analysis',
      desc: 'Completed onboarding sprint',
      icon: <Star className="h-5 w-5 text-amber-400" />,
      unlocked: historyCount >= 1,
      color: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    },
    {
      title: 'Consistency Streak',
      desc: '3+ Biomechanics Scans',
      icon: <Medal className="h-5 w-5 text-blue-400" />,
      unlocked: historyCount >= 3,
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-400'
    },
    {
      title: 'Data Rich Profile',
      desc: '5+ Scans for AI Evolution',
      icon: <ShieldCheck className="h-5 w-5 text-[#FF4F21]" />,
      unlocked: historyCount >= 5,
      color: 'bg-[#FF4F21]/10 border-[#FF4F21]/20 text-[#FF4F21]'
    }
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-6">
        <Medal className="h-5 w-5 text-amber-500" />
        <h3 className="text-sm font-black text-white uppercase tracking-widest">Achievements</h3>
      </div>

      <div className="flex-1 space-y-3">
        {achievements.map((ach, i) => (
          <div key={i} className={`p-3 rounded-xl flex items-center gap-4 transition-all duration-500 ${ach.unlocked ? `border ${ach.color}` : 'border border-zinc-800 bg-zinc-900/20 opacity-50 grayscale'}`}>
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${ach.unlocked ? ach.color : 'bg-zinc-800'}`}>
              {ach.icon}
            </div>
            <div>
              <h4 className={`text-sm font-bold ${ach.unlocked ? 'text-white' : 'text-zinc-500'}`}>{ach.title}</h4>
              <p className="text-[10px] font-medium text-zinc-400 mt-0.5">{ach.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
