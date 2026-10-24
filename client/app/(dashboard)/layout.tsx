'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Bell, Menu, X, LogOut, Lock } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import DesktopSidebar from '../components/ui/DesktopSidebar';
import MobileHeader from '../components/ui/MobileHeader';
import {
  NavItem, BOTTOM_TAB_NAV, TRAINING_NAV, LAB_NAV, SYSTEM_NAV, PAGE_TITLES,
} from '../components/ui/navConfig';

function BottomTabBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') ?? null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-2xl border-t border-black/[0.06] px-2 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-around md:hidden shadow-[0_-2px_10px_rgba(0,0,0,0.02)] font-poppins"
      aria-label="Primary"
    >
      {BOTTOM_TAB_NAV.map((item) => {
        const isActive = item.isActive ? item.isActive(pathname, tab) : pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            aria-current={isActive ? 'page' : undefined}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] px-2 py-1 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adx-accent"
          >
            <Icon size={22} strokeWidth={isActive ? 2.4 : 1.8} className={isActive ? 'text-[#FF4F21]' : 'text-[#8E8E93]'} />
            <span className={`text-[10px] mt-1 ${isActive ? 'font-bold text-[#FF4F21]' : 'font-medium text-[#8E8E93]'}`}>
              {item.name}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

function DrawerNavRow({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate: () => void }) {
  const isActive = pathname === item.href;
  const Icon = item.icon;

  if (item.disabled) {
    return (
      <div className="flex items-center gap-3 h-11 px-3.5 rounded-2xl text-adx-text-disabled select-none">
        <Icon size={17} />
        <span className="text-sm font-medium flex-1">{item.name}</span>
        <Lock size={12} />
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 h-11 px-3.5 rounded-2xl transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adx-accent ${
        isActive ? 'bg-[#FF4F21]/10 text-[#FF4F21] font-bold' : 'text-adx-text-secondary font-medium hover:bg-black/[0.03]'
      }`}
    >
      <Icon size={17} className={isActive ? 'text-[#FF4F21]' : 'text-adx-text-muted'} />
      <span className="text-sm">{item.name}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    }
  }, [pathname, searchParams]);

  const athleteName = user?.physicalProfile?.full_name || user?.name || user?.username || 'Athlete';
  const athleteTier = user?.physicalProfile?.competition_level || user?.classification?.athleteLevel || 'Competitive';
  const athleteInitial = athleteName.charAt(0).toUpperCase();
  const firstName = athleteName.split(' ')[0];

  const isHome = pathname === '/dashboard' && !searchParams?.get('tab');
  const pageTitle = PAGE_TITLES[pathname ?? ''] ?? 'Athlixir';

  const drawerTransition = prefersReducedMotion ? { duration: 0 } : { type: 'spring' as const, stiffness: 320, damping: 32 };

  return (
    <div className="min-h-screen bg-adx-bg text-adx-text-primary antialiased selection:bg-adx-accent-soft selection:text-adx-accent font-poppins">
      <DesktopSidebar athleteName={athleteName} athleteTier={athleteTier} athleteInitial={athleteInitial} />

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-2xl border-b border-adx-border pt-[env(safe-area-inset-top)] md:hidden">
        {isHome ? (
          <MobileHeader
            variant="home"
            greeting={`Hi, ${firstName}`}
            leading={
              <>
                <button
                  onClick={() => setIsMenuOpen(true)}
                  aria-label="Open menu"
                  className="h-9 w-9 rounded-full bg-black/[0.04] text-adx-text-secondary flex items-center justify-center active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adx-accent shrink-0"
                >
                  <Menu size={17} />
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-adx-accent to-[#FFA233] flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
                  {athleteInitial}
                </div>
              </>
            }
            trailing={
              <Link
                href="/notifications"
                aria-label="Notifications"
                className="relative h-9 w-9 rounded-full bg-black/[0.04] text-adx-text-secondary flex items-center justify-center active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-adx-accent"
              >
                <Bell size={16} />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-adx-accent" />
              </Link>
            }
          />
        ) : (
          <MobileHeader variant="page" title={pageTitle} />
        )}
      </header>

      {/* Desktop top bar */}
      <header className="hidden md:flex md:pl-60 sticky top-0 z-20 h-14 items-center justify-end px-8 bg-white/80 backdrop-blur-xl border-b border-zinc-100">
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="relative h-8 w-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center hover:bg-zinc-200 transition"
        >
          <Bell size={15} />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-[#FF4F21]" />
        </Link>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-xs z-50 md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={drawerTransition}
              className="fixed inset-y-0 left-0 w-[84%] max-w-[300px] bg-white z-50 flex flex-col pt-[env(safe-area-inset-top)] shadow-2xl border-r border-zinc-200 md:hidden"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              <div className="p-5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#FF4F21] to-[#FF7A50] flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs">
                    {athleteInitial}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-zinc-900 truncate">{athleteName}</p>
                    <p className="text-[11px] text-[#FF4F21] font-semibold truncate">{athleteTier}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                  className="h-8 w-8 rounded-full bg-zinc-100 text-zinc-600 flex items-center justify-center active:scale-95 transition shrink-0 cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3 space-y-4">
                <div className="space-y-0.5">
                  {TRAINING_NAV.map((item) => (
                    <DrawerNavRow key={item.name} item={item} pathname={pathname} onNavigate={() => setIsMenuOpen(false)} />
                  ))}
                </div>
                <div className="h-px bg-zinc-100" />
                <div className="space-y-0.5">
                  {SYSTEM_NAV.map((item) => (
                    <DrawerNavRow key={item.name} item={item} pathname={pathname} onNavigate={() => setIsMenuOpen(false)} />
                  ))}
                </div>
              </nav>

              <div className="p-4 border-t border-zinc-100 shrink-0">
                <button
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-red-50 text-red-600 font-semibold text-xs active:scale-[0.98] transition cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Content */}
      <main className="pb-24 md:pb-12 md:pl-60">{children}</main>

      <Suspense fallback={<div className="h-16" />}>
        <BottomTabBar />
      </Suspense>
    </div>
  );
}
