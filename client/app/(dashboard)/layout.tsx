'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Bell } from 'lucide-react';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  
  const athleteName = user?.name || user?.username || 'Athlete';
  const tier = user?.classification?.athleteLevel || 'U18 Sprinter';

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-[#FF4F21]/30 font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar (Global Actions) */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-end px-6 border-b border-zinc-900/80 bg-[#08080C]/80 backdrop-blur-xl print:hidden">
          {/* Right: User Menu */}
          <div className="flex items-center gap-5">
            {/* Bell button with sleek rounded-xl wrapper */}
            <Link href="/notifications" className="relative w-9 h-9 rounded-xl flex items-center justify-center bg-zinc-900/40 border border-white/[0.05] shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] text-zinc-400 hover:text-white hover:border-zinc-800/80 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#FF4F21] shadow-[0_0_8px_rgba(255,79,33,0.6)]"></span>
            </Link>
            
            <div className="h-6 w-[1px] bg-zinc-900/80"></div>
            
            <Link href="/identity" className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition leading-tight">{athleteName}</p>
                <p className="text-[9px] font-bold text-zinc-500 group-hover:text-zinc-400 transition uppercase tracking-widest leading-none mt-1">{tier}</p>
              </div>
              {/* Avatar with Squircle rounded-xl style matching the sidebar logo and avatar */}
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#FF4F21]/20 to-[#FF8433]/20 border border-[#FF4F21]/30 flex items-center justify-center font-bold text-sm text-[#FF4F21] shadow-[0_2px_10px_rgba(255,79,33,0.15)] ring-1 ring-[#FF4F21]/20 group-hover:ring-[#FF4F21]/50 group-hover:scale-105 transition-all duration-300">
                {athleteName.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col relative overflow-x-hidden">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#FF4F21]/5 blur-[150px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none -z-10" />
          
          {children}
        </main>
      </div>
    </div>
  );
}
