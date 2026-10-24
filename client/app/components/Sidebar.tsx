'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  History, 
  Shield, 
  Sparkles, 
  ShieldAlert, 
  Bot, 
  ChevronLeft, 
  ChevronRight, 
  Compass,
  LogOut
} from 'lucide-react';

export const SECTIONS = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Evolution', href: '/evolution', icon: TrendingUp },
      { name: 'History', href: '/history', icon: History },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { name: 'AI Coach', href: '/recommendations', icon: Sparkles, badge: 'AI' },
      { name: 'Injury Risk', href: '/injury-risk', icon: ShieldAlert },
      { name: 'Copilot', href: '/copilot', icon: Bot },
    ],
  },
  {
    title: 'Athlete',
    items: [
      { name: 'Identity', href: '/identity', icon: Shield },
    ],
  },
];

interface SidebarProps {
  isExpanded?: boolean;
  setIsExpanded?: (expanded: boolean) => void;
}

export default function Sidebar({ isExpanded: propIsExpanded, setIsExpanded: propSetIsExpanded }: SidebarProps) {
  const [localIsExpanded, setLocalIsExpanded] = useState(true);
  const isExpanded = propIsExpanded !== undefined ? propIsExpanded : localIsExpanded;
  const setIsExpanded = propSetIsExpanded !== undefined ? propSetIsExpanded : setLocalIsExpanded;
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const athleteName = user?.name || user?.username || 'Athlete';
  const tier = user?.classification?.athleteLevel || user?.role || 'Elite Athlete';

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 250 : 76 }}
      transition={{ type: 'spring', stiffness: 220, damping: 26 }}
      className="hidden md:flex md:fixed md:left-0 md:top-0 h-screen bg-white/95 border-r border-black/[0.06] backdrop-blur-xl flex-col z-40 shrink-0 print:hidden overflow-y-auto"
    >
      {/* Floating Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 flex items-center justify-center shadow-md z-50 cursor-pointer transition-all hover:scale-110"
      >
        {isExpanded ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {/* Sidebar Header */}
      <div className="h-16 flex items-center border-b border-zinc-100 px-[14px]">
        <div className="flex items-center font-semibold text-base tracking-tight text-zinc-900 select-none w-full min-w-0">
          {/* Logo container wrapper */}
          <div className="w-12 h-9 flex items-center justify-center shrink-0">
            <div className="h-9 w-9 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center group/logo cursor-pointer transition-all hover:border-[#FF4F21]/30 shrink-0">
              <Compass className="h-5 w-5 text-[#FF4F21] transition-all duration-300 group-hover/logo:rotate-45" />
            </div>
          </div>
          
          {/* Dynamic text using Framer Motion */}
          <motion.div
            initial={false}
            animate={{ 
              opacity: isExpanded ? 1 : 0,
              width: isExpanded ? 140 : 0,
              marginLeft: isExpanded ? 8 : 0
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            className="flex flex-col min-w-0 overflow-hidden whitespace-nowrap"
          >
            <span
              style={{
                fontFamily: "'Agale DEMO', 'Mazzard', sans-serif",
                color: '#FF4F21',
                letterSpacing: '0.04em',
              }}
              className="text-lg font-bold leading-none"
            >
              ATHLIXIR
            </span>
            <span className="text-[10px] text-zinc-400 font-bold tracking-widest uppercase mt-0.5 font-poppins">
              AI Biomechanics
            </span>
          </motion.div>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-4 px-[10px] space-y-6 overflow-y-auto">
        {SECTIONS.map((section, idx) => (
          <div key={section.title} className="relative">
            {/* Section Title */}
            {isExpanded ? (
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 font-poppins">
                {section.title}
              </div>
            ) : (
              idx > 0 && (
                <div className="mx-auto w-6 h-[1px] bg-zinc-200 my-2" />
              )
            )}

            {/* Nav Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`relative flex items-center h-10 rounded-xl px-3 text-sm font-medium transition-colors font-poppins ${
                      isActive
                        ? 'text-[#FF4F21] font-semibold bg-orange-50/70'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
                    }`}
                  >
                    <div className="w-6 h-6 flex items-center justify-center shrink-0">
                      <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#FF4F21]' : 'text-zinc-500'}`} />
                    </div>

                    {isExpanded && (
                      <span className="ml-3 truncate">{item.name}</span>
                    )}

                    {isExpanded && (item as any).badge && (
                      <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-100 text-[#FF4F21]">
                        {(item as any).badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Athlete Profile Footer */}
      <div className="p-3 border-t border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-full bg-[#FF4F21] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {athleteName.charAt(0).toUpperCase()}
            </div>
            {isExpanded && (
              <div className="min-w-0">
                <div className="text-xs font-semibold text-zinc-900 truncate font-poppins">{athleteName}</div>
                <div className="text-[10px] text-zinc-400 truncate font-poppins">{tier}</div>
              </div>
            )}
          </div>
          {isExpanded && (
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition shrink-0 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
