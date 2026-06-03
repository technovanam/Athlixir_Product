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
      className="hidden md:flex md:fixed md:left-0 md:top-0 h-screen bg-[#08080C] border-r border-zinc-900/80 flex-col z-40 shrink-0 print:hidden overflow-y-auto"
    >
      {/* Floating Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-[#08080C] border border-zinc-800 text-zinc-500 hover:text-white flex items-center justify-center shadow-[0_2px_8px_rgba(0,0,0,0.8)] z-50 cursor-pointer transition-all hover:scale-110 hover:border-zinc-700"
      >
        {isExpanded ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {/* Sidebar Header */}
      <div className="h-16 flex items-center border-b border-zinc-900/80 px-[14px]">
        <div className="flex items-center font-semibold text-base tracking-tight text-white select-none w-full min-w-0">
          {/* Logo container wrapper */}
          <div className="w-12 h-9 flex items-center justify-center shrink-0">
            <div className="h-9 w-9 rounded-xl bg-zinc-900/80 border border-white/[0.08] flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] group/logo cursor-pointer transition-all hover:border-[#FF4F21]/30 shrink-0">
              <Compass className="h-5 w-5 text-white transition-all duration-300 group-hover/logo:text-[#FF4F21] group-hover/logo:rotate-45" />
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
            <span className="font-teko text-lg tracking-wider text-white leading-tight">
              Athlixir<span className="text-[#FF4F21]">.</span>
            </span>
            <span className="text-[8px] font-bold text-zinc-500 tracking-[0.25em] uppercase leading-none mt-1 truncate">
              Performance Engine
            </span>
          </motion.div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-4 mt-2">
        {SECTIONS.map((section) => (
          <div key={section.title} className="space-y-1">
            {/* Section Title & Separator */}
            <div className="relative h-6 flex items-center px-3.5 mb-1">
              {/* Title text */}
              <motion.h3
                initial={false}
                animate={{ 
                  opacity: isExpanded ? 1 : 0,
                  x: isExpanded ? 0 : -10,
                  width: isExpanded ? 140 : 0
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="text-[9px] font-bold text-zinc-500 tracking-[0.25em] uppercase select-none whitespace-nowrap overflow-hidden"
              >
                {section.title}
              </motion.h3>

              {/* Separator line when collapsed */}
              <motion.div
                initial={false}
                animate={{ 
                  opacity: isExpanded ? 0 : 1,
                  scaleX: isExpanded ? 0 : 1
                }}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                className="absolute left-3.5 right-3.5 h-[1px] bg-zinc-900/80 origin-left"
              />
            </div>

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="relative flex items-center group h-10 rounded-xl overflow-hidden block"
                  >
                    {/* Active Background Glow & Line Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeSidebar"
                        className="absolute inset-0 bg-white/[0.02] border border-white/[0.04] rounded-xl flex items-center"
                        initial={false}
                        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                      >
                        <div className="absolute left-0 top-[25%] bottom-[25%] w-[3px] rounded-r bg-[#FF4F21] shadow-[0_0_8px_rgba(255,79,33,0.6)]" />
                      </motion.div>
                    )}

                    <div className="relative flex items-center w-full pl-[2px]">
                      {/* Fixed width container for icon */}
                      <div className="w-12 h-9 flex items-center justify-center shrink-0">
                        <Icon className={`h-[18px] w-[18px] shrink-0 transition-all duration-200 ${isActive ? 'text-[#FF4F21]' : 'text-zinc-500 group-hover:text-zinc-200 group-hover:scale-105'}`} />
                      </div>
                      
                      {/* Smooth Sliding text */}
                      <motion.span
                        initial={false}
                        animate={{ 
                          opacity: isExpanded ? 1 : 0,
                          width: isExpanded ? 140 : 0,
                          marginLeft: isExpanded ? 8 : 0
                        }}
                        transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                        className={`text-xs font-semibold whitespace-nowrap overflow-hidden ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}
                      >
                        {item.name}
                      </motion.span>

                      {/* Optional Badge */}
                      {item.badge && (
                        <motion.span
                          initial={false}
                          animate={{ 
                            opacity: isExpanded ? 1 : 0,
                            scale: isExpanded ? 1 : 0.6,
                            width: isExpanded ? 'auto' : 0,
                            marginLeft: isExpanded ? 8 : 0
                          }}
                          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
                          className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#FF4F21]/10 text-[#FF4F21] border border-[#FF4F21]/20 tracking-wider shrink-0 overflow-hidden whitespace-nowrap ml-auto mr-2"
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile Footer Section */}
      <div className="mt-auto p-[14px] border-t border-zinc-900/60 bg-zinc-950/20 backdrop-blur-sm">
        <div className="flex items-center min-w-0 w-full justify-between">
          <div className="flex items-center min-w-0">
            {/* Avatar Container wrapper */}
            <div className="w-12 h-9 flex items-center justify-center shrink-0">
              <div className="relative shrink-0">
                <Link href="/identity">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#FF4F21]/20 to-[#FF8433]/20 border border-[#FF4F21]/30 flex items-center justify-center font-bold text-sm text-[#FF4F21] shadow-md hover:scale-105 transition-all">
                    {athleteName.charAt(0).toUpperCase()}
                  </div>
                </Link>
                {/* Active Online indicator */}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#00DF89] border-2 border-[#0B0B0F] shadow-[0_0_8px_#00DF89]" />
              </div>
            </div>
            
            {/* User Info (Smooth Sliding) */}
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
              <span className="text-xs font-semibold text-zinc-200 truncate leading-tight">
                {athleteName}
              </span>
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1 truncate">
                {tier}
              </span>
            </motion.div>
          </div>

          {/* Logout Button */}
          <motion.button
            initial={false}
            animate={{ 
              opacity: isExpanded ? 1 : 0,
              scale: isExpanded ? 1 : 0.6,
              width: isExpanded ? 'auto' : 0,
              marginLeft: isExpanded ? 8 : 0,
              pointerEvents: isExpanded ? 'auto' : 'none'
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            onClick={logout}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-[#FF4F21] hover:bg-[#FF4F21]/10 border border-transparent hover:border-[#FF4F21]/20 transition-all cursor-pointer shrink-0 overflow-hidden whitespace-nowrap"
            title="Sign Out"
          >
            <LogOut className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.aside>
  );
}
