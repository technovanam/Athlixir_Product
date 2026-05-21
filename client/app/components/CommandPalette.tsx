'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { Search, Activity, Target, Shield, Zap, TrendingUp, ShieldAlert, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (route: string) => {
    setOpen(false);
    router.push(route);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex items-start justify-center pt-[15vh] p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="w-full flex flex-col" label="Global Command Menu">
              <div className="flex items-center border-b border-zinc-800/80 px-4 py-3">
                <Search className="h-5 w-5 text-zinc-500 mr-3 shrink-0" />
                <Command.Input 
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 font-sans text-lg" 
                  placeholder="Search athletes, analyses, reports..." 
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <kbd className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[10px] font-mono font-bold">ESC</kbd>
                </div>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-2 scrollbar-hide">
                <Command.Empty className="py-6 text-center text-sm text-zinc-500">No results found.</Command.Empty>

                <Command.Group heading="Quick Links" className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2 py-2">
                  <Command.Item onSelect={() => handleSelect('/dashboard')} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-zinc-200 hover:bg-zinc-900 aria-selected:bg-zinc-900 cursor-pointer transition">
                    <Activity className="h-4 w-4 text-[#FF4F21]" />
                    Dashboard
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/dashboard/progress')} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-zinc-200 hover:bg-zinc-900 aria-selected:bg-zinc-900 cursor-pointer transition">
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                    Athlete Evolution
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/dashboard/athlete/profile')} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-zinc-200 hover:bg-zinc-900 aria-selected:bg-zinc-900 cursor-pointer transition">
                    <Shield className="h-4 w-4 text-blue-500" />
                    Identity Profile
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/dashboard/recommendations')} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-zinc-200 hover:bg-zinc-900 aria-selected:bg-zinc-900 cursor-pointer transition">
                    <Zap className="h-4 w-4 text-amber-500" />
                    AI Coach & Recommendations
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/dashboard/injury-risk')} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-zinc-200 hover:bg-zinc-900 aria-selected:bg-zinc-900 cursor-pointer transition">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Injury Intelligence
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/dashboard/copilot')} className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-zinc-200 hover:bg-zinc-900 aria-selected:bg-zinc-900 cursor-pointer transition">
                    <MessageSquare className="h-4 w-4 text-purple-500" />
                    AI Copilot
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Recent Analyses" className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-2 pt-4 pb-2">
                  <Command.Item onSelect={() => handleSelect('/dashboard/history')} className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-zinc-200 hover:bg-zinc-900 aria-selected:bg-zinc-900 cursor-pointer transition">
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-zinc-400" />
                      <div>
                        <p>View Analysis History</p>
                        <p className="text-[10px] text-zinc-500">Access all past scans</p>
                      </div>
                    </div>
                  </Command.Item>
                </Command.Group>
              </Command.List>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
