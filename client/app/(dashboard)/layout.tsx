'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, X, Compass, LogOut, LayoutDashboard, UploadCloud, TrendingUp, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { SECTIONS } from '../components/Sidebar';

function BottomNavigation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab');
  
  const bottomNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Upload', href: '/dashboard?tab=biomechanics', icon: UploadCloud },
    { name: 'Progress', href: '/evolution', icon: TrendingUp },
    { name: 'Profile', href: '/identity', icon: Shield },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#08080C]/90 backdrop-blur-xl border-t border-zinc-900/80 z-40 flex items-center justify-around px-4 md:hidden pb-safe">
      {bottomNavItems.map((item) => {
        const isActive = item.name === 'Upload'
          ? (pathname === '/dashboard' && tab === 'biomechanics')
          : (pathname === item.href && !(pathname === '/dashboard' && tab === 'biomechanics'));

        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-250 relative group cursor-pointer animate-fadeIn"
          >
            {isActive && (
              <motion.div
                layoutId="activeBottomNav"
                className="absolute inset-0 bg-white/[0.02] border border-white/[0.04] rounded-xl"
                initial={false}
                transition={{ type: 'spring', stiffness: 220, damping: 26 }}
              />
            )}
            <Icon className={`h-5 w-5 transition-all duration-200 ${isActive ? 'text-[#FF4F21]' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
            <span className={`text-[8px] font-bold mt-1 tracking-wider uppercase ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
              {item.name}
            </span>
            {isActive && (
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-1 w-1.5 rounded-full bg-[#FF4F21] shadow-[0_0_8px_rgba(255,79,33,0.8)]" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const pathname = usePathname();

  const athleteName = user?.name || user?.username || 'Athlete';
  const tier = user?.classification?.athleteLevel || 'U18 Sprinter';

  return (
    <div className="flex min-h-screen bg-black text-white selection:bg-[#FF4F21]/30 font-sans">
      {/* Desktop Sidebar (hidden on mobile, fixed and expands on md+) */}
      <Sidebar isExpanded={isSidebarExpanded} setIsExpanded={setIsSidebarExpanded} />
      
      {/* Main Content Area */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:pl-[var(--sidebar-width)]"
        style={{ '--sidebar-width': isSidebarExpanded ? '250px' : '76px' } as React.CSSProperties}
      >
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between md:justify-end px-4 md:px-6 border-b border-zinc-900/80 bg-[#08080C]/80 backdrop-blur-xl print:hidden">
          {/* Mobile Left Actions: Hamburger Menu & Logo */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setIsMobileDrawerOpen(true)}
              className="w-11 h-11 rounded-xl flex items-center justify-center bg-zinc-900/40 border border-white/[0.05] text-zinc-400 hover:text-white hover:border-zinc-800/80 hover:bg-zinc-900/80 transition-all duration-200 cursor-pointer"
              title="Open Navigation Drawer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-zinc-900/80 border border-white/[0.08] flex items-center justify-center">
                <Compass className="h-4.5 w-4.5 text-[#FF4F21]" />
              </div>
              <span className="font-teko text-lg tracking-wider text-white">
                Athlixir<span className="text-[#FF4F21]">.</span>
              </span>
            </Link>
          </div>

          {/* Right actions: Notifications and User Menu */}
          <div className="flex items-center gap-3 md:gap-5">
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
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#FF4F21]/20 to-[#FF8433]/20 border border-[#FF4F21]/30 flex items-center justify-center font-bold text-sm text-[#FF4F21] shadow-[0_2px_10px_rgba(255,79,33,0.15)] ring-1 ring-[#FF4F21]/20 group-hover:ring-[#FF4F21]/50 group-hover:scale-105 transition-all duration-300">
                {athleteName.charAt(0).toUpperCase()}
              </div>
            </Link>
          </div>
        </header>

        {/* Mobile Slide-out Drawer Navigation */}
        <AnimatePresence>
          {isMobileDrawerOpen && (
            <>
              {/* Drawer Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileDrawerOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              />
              
              {/* Navigation Drawer panel */}
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 260, damping: 28 }}
                className="fixed inset-y-0 left-0 w-64 bg-[#08080C] border-r border-zinc-900/80 z-50 flex flex-col p-5 md:hidden"
              >
                {/* Drawer Header */}
                <div className="flex items-center justify-between pb-5 border-b border-zinc-900/80 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-xl bg-zinc-900/80 border border-white/[0.08] flex items-center justify-center">
                      <Compass className="h-5 w-5 text-[#FF4F21]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-teko text-lg tracking-wider text-white leading-tight">
                        Athlixir<span className="text-[#FF4F21]">.</span>
                      </span>
                      <span className="text-[8px] font-bold text-zinc-500 tracking-[0.25em] uppercase leading-none mt-1">
                        Performance Engine
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className="w-10 h-10 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Close Drawer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Drawer Menu links */}
                <nav className="flex-1 overflow-y-auto space-y-5">
                  {SECTIONS.map((section) => (
                    <div key={section.title} className="space-y-1.5">
                      <h4 className="text-[9px] font-bold text-zinc-500 tracking-[0.25em] uppercase px-3 select-none">
                        {section.title}
                      </h4>
                      <div className="space-y-1">
                        {section.items.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={() => setIsMobileDrawerOpen(false)}
                              className="relative flex items-center group h-11 rounded-xl overflow-hidden block cursor-pointer"
                            >
                              {isActive && (
                                <div className="absolute inset-0 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                  <div className="absolute left-0 top-[25%] bottom-[25%] w-[3px] rounded-r bg-[#FF4F21] shadow-[0_0_8px_rgba(255,79,33,0.6)]" />
                                </div>
                              )}
                              <div className="relative flex items-center w-full pl-3 gap-3">
                                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-[#FF4F21]' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
                                <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-[#FF4F21]/10 text-[#FF4F21] border border-[#FF4F21]/20 tracking-wider ml-auto mr-2">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>

                {/* Drawer User profile footer */}
                <div className="pt-4 border-t border-zinc-900/60 bg-zinc-950/20 mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#FF4F21]/20 to-[#FF8433]/20 border border-[#FF4F21]/30 flex items-center justify-center font-bold text-sm text-[#FF4F21]">
                        {athleteName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-zinc-200 truncate leading-tight">{athleteName}</span>
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none mt-1 truncate">{tier}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => { logout(); setIsMobileDrawerOpen(false); }}
                      className="w-10 h-10 rounded-xl text-zinc-500 hover:text-[#FF4F21] hover:bg-[#FF4F21]/10 border border-transparent hover:border-[#FF4F21]/20 transition-all flex items-center justify-center cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Page Content viewport */}
        <main className="flex-1 flex flex-col relative overflow-x-hidden pb-20 md:pb-0">
          {/* Ambient Glows */}
          <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-[#FF4F21]/5 blur-[150px] pointer-events-none -z-10" />
          <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none -z-10" />
          
          {children}
        </main>

        {/* Fixed Mobile Bottom Tab Bar */}
        <Suspense fallback={<div className="h-16 md:hidden bg-[#08080C]" />}>
          <BottomNavigation />
        </Suspense>
      </div>
    </div>
  );
}
