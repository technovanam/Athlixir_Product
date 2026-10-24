'use client';

import React from 'react';
import { Medal, Star, ShieldCheck, Award } from 'lucide-react';

export default function AchievementsWidget({ historyCount, userProfile }: { historyCount: number; userProfile?: any }) {
  const achievements = [
    {
      title: 'First Sprint Scan',
      desc: 'Initial kinematics baseline recorded',
      icon: <Star size={18} className="text-amber-500" />,
      unlocked: historyCount >= 1,
      color: 'bg-amber-50 border-amber-200 text-amber-900',
    },
    {
      title: 'Consistency Milestones',
      desc: '3+ Sprint Telemetry Scans',
      icon: <Medal size={18} className="text-blue-500" />,
      unlocked: historyCount >= 3,
      color: 'bg-blue-50 border-blue-200 text-blue-900',
    },
    {
      title: 'High-Velocity Profile',
      desc: '5+ Scans for Longitudinal Curves',
      icon: <ShieldCheck size={18} className="text-[#FF4F21]" />,
      unlocked: historyCount >= 5,
      color: 'bg-[#FFF2EE] border-[#FFE0D6] text-[#FF4F21]',
    }
  ];

  let customAchievs: any[] = [];
  try {
    if (userProfile?.achievements) {
      const parsed = JSON.parse(userProfile.achievements);
      customAchievs = parsed.map((a: any) => ({
        title: a.title,
        desc: a.desc,
        icon: <Award size={18} className="text-purple-600" />,
        unlocked: true,
        color: 'bg-purple-50 border-purple-200 text-purple-900',
      }));
    }
  } catch (e) {
    // Ignore parse error
  }

  const allAchievements = [...customAchievs, ...achievements];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
        <Medal size={18} className="text-amber-500" />
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Milestones & Badges</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {allAchievements.map((ach, i) => (
          <div
            key={i}
            className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
              ach.unlocked ? `${ach.color}` : 'border-slate-200 bg-slate-50 opacity-50 grayscale'
            }`}
          >
            <div className="h-9 w-9 rounded-xl bg-white shadow-xs flex items-center justify-center shrink-0 border border-slate-100">
              {ach.icon}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold truncate">{ach.title}</h4>
              <p className="text-[11px] opacity-80 truncate">{ach.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
