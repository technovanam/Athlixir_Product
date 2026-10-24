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
          className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-start justify-center pt-[15vh] p-4"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Command className="w-full flex flex-col" label="Global Command Menu">
              <div className="flex items-center border-b border-slate-100 px-5 py-4">
                <Search className="h-5 w-5 text-slate-400 mr-3 shrink-0" />
                <Command.Input 
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 font-sans text-base font-medium" 
                  placeholder="Type a command or search pages..." 
                  autoFocus
                />
                <div className="flex items-center gap-1">
                  <kbd className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold">ESC</kbd>
                </div>
              </div>

              <Command.List className="max-h-[60vh] overflow-y-auto p-3 scrollbar-hide">
                <Command.Empty className="py-8 text-center text-sm text-slate-500">No results found.</Command.Empty>

                <Command.Group heading="Navigation" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-2">
                  <Command.Item onSelect={() => handleSelect('/dashboard')} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 aria-selected:bg-slate-100 cursor-pointer transition">
                    <Activity className="h-4 w-4 text-[#FF4F21]" />
                    Dashboard
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/evolution')} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 aria-selected:bg-slate-100 cursor-pointer transition">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Athlete Evolution
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/identity')} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 aria-selected:bg-slate-100 cursor-pointer transition">
                    <Shield className="h-4 w-4 text-blue-600" />
                    Identity Profile
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/recommendations')} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 aria-selected:bg-slate-100 cursor-pointer transition">
                    <Zap className="h-4 w-4 text-amber-500" />
                    AI Coach & Recommendations
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/injury-risk')} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 aria-selected:bg-slate-100 cursor-pointer transition">
                    <ShieldAlert className="h-4 w-4 text-amber-500" />
                    Injury Intelligence
                  </Command.Item>
                  <Command.Item onSelect={() => handleSelect('/copilot')} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 aria-selected:bg-slate-100 cursor-pointer transition">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    AI Copilot
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Recent Analyses" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-3 pb-1">
                  <Command.Item onSelect={() => handleSelect('/history')} className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 aria-selected:bg-slate-100 cursor-pointer transition">
                    <div className="flex items-center gap-3">
                      <Target className="h-4 w-4 text-slate-400" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Session History</p>
                        <p className="text-[11px] text-slate-400">Access all historical biomechanics runs</p>
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

