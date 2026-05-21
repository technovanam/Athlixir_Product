'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, TrendingUp, History, Shield, Zap, ChevronLeft, ChevronRight, Compass, Settings, ShieldAlert, MessageSquare
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/dashboard', icon: Activity },
  { name: 'Evolution', href: '/dashboard/progress', icon: TrendingUp },
  { name: 'History', href: '/dashboard/history', icon: History },
  { name: 'AI Coach', href: '/dashboard/recommendations', icon: Zap },
  { name: 'Injury Risk', href: '/dashboard/injury-risk', icon: ShieldAlert },
  { name: 'Copilot', href: '/dashboard/copilot', icon: MessageSquare },
  { name: 'Identity', href: '/dashboard/athlete/profile', icon: Shield },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(true);
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isExpanded ? 240 : 80 }}
      className="sticky top-0 h-screen bg-zinc-950 border-r border-zinc-800/80 flex flex-col z-40 transition-all duration-300 ease-in-out shrink-0 print:hidden"
    >
      {/* Sidebar Header */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-zinc-800/80">
        <AnimatePresence mode="popLayout">
          {isExpanded ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-3 font-black text-xl tracking-tight text-white uppercase"
            >
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center shadow-[0_0_15px_rgba(255,79,33,0.3)] shrink-0">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                Athlixir
              </span>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="h-8 w-8 rounded-lg bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center shadow-[0_0_15px_rgba(255,79,33,0.3)] shrink-0 mx-auto"
            >
              <Compass className="h-5 w-5 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-2 scrollbar-hide mt-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative flex items-center group h-12 rounded-xl transition-all overflow-hidden"
            >
              {/* Active Background Glow */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebar"
                  className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className={`relative flex items-center w-full px-4 ${isExpanded ? 'justify-start' : 'justify-center'}`}>
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? 'text-[#FF4F21]' : 'text-zinc-500 group-hover:text-white'}`} />
                <AnimatePresence mode="popLayout">
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className={`ml-4 text-sm font-bold whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="p-4 border-t border-zinc-800/80 flex items-center justify-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full h-10 flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-white transition"
        >
          {isExpanded ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </button>
      </div>
    </motion.aside>
  );
}
