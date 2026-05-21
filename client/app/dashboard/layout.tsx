'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { Bell, Search, Settings } from 'lucide-react';
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
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl print:hidden">
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-400 hover:text-white transition">
              <Search className="h-4 w-4" />
              <span>Search (Cmd+K)</span>
            </button>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center gap-6">
            <button className="relative text-zinc-400 hover:text-white transition">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#FF4F21] border-2 border-zinc-950"></span>
            </button>
            <div className="h-6 w-[1px] bg-zinc-800"></div>
            
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{athleteName}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{tier}</p>
              </div>
              <Link href="/dashboard/athlete/profile">
                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#FF4F21] to-[#FF8433] flex items-center justify-center font-black text-sm text-white shadow-[0_0_15px_rgba(255,79,33,0.3)] ring-2 ring-transparent group-hover:ring-[#FF4F21]/50 transition-all">
                  {athleteName.charAt(0).toUpperCase()}
                </div>
              </Link>
              <button onClick={logout} className="ml-2 text-[10px] text-zinc-600 hover:text-[#FF4F21] uppercase font-bold tracking-widest transition">
                Exit
              </button>
            </div>
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
