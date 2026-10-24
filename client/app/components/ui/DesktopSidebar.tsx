'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Bot,
  Activity,
  ShieldCheck,
  BarChart3,
  FileText,
  Bell,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  isActive?: (pathname: string, tab: string | null) => boolean;
}

const PRIMARY_SECTION: SidebarItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    isActive: (p, t) => p === '/dashboard' && t !== 'biomechanics',
  },
  {
    name: 'Kinematic Studio',
    href: '/dashboard?tab=biomechanics',
    icon: Sparkles,
    badge: 'AI',
    isActive: (p, t) => p === '/dashboard' && t === 'biomechanics',
  },
  {
    name: 'Progress & Evolution',
    href: '/evolution',
    icon: TrendingUp,
  },
  {
    name: 'AI Sprint Coach',
    href: '/copilot',
    icon: Bot,
  },
];

const ANALYTICS_SECTION: SidebarItem[] = [
  {
    name: 'Biomechanics Lab',
    href: '/biomechanics',
    icon: Activity,
  },
  {
    name: 'Injury Risk Guard',
    href: '/injury-risk',
    icon: ShieldCheck,
  },
  {
    name: 'Norm Benchmarks',
    href: '/recommendations',
    icon: BarChart3,
  },
  {
    name: 'Sprint Reports',
    href: '/reports',
    icon: FileText,
  },
];

const SYSTEM_SECTION: SidebarItem[] = [
  {
    name: 'Notifications',
    href: '/notifications',
    icon: Bell,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

interface DesktopSidebarProps {
  athleteName: string;
  athleteTier: string;
  athleteInitial: string;
}

export default function DesktopSidebar({
  athleteName,
  athleteTier,
  athleteInitial,
}: DesktopSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams?.get('tab') ?? null;
  const { logout } = useAuth();

  const renderNavRow = (item: SidebarItem) => {
    const isActive = item.isActive
      ? item.isActive(pathname, tab)
      : pathname === item.href;
    const Icon = item.icon;

    return (
      <Link
        key={item.name}
        href={item.href}
        className={`group relative flex items-center justify-between h-9 px-3 rounded-xl text-[13px] transition-all duration-150 select-none ${
          isActive
            ? 'bg-orange-500/[0.08] text-[#FF4F21] font-semibold'
            : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100/80 font-medium'
        }`}
      >
        {/* Subtle active left pill indicator */}
        {isActive && (
          <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-full bg-[#FF4F21]" />
        )}

        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            size={16}
            className={`shrink-0 transition-colors ${
              isActive ? 'text-[#FF4F21]' : 'text-zinc-400 group-hover:text-zinc-700'
            }`}
          />
          <span className="truncate">{item.name}</span>
        </div>

        {item.badge && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              isActive
                ? 'bg-[#FF4F21] text-white'
                : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'
            }`}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden md:flex md:flex-col fixed inset-y-0 left-0 w-60 bg-white border-r border-zinc-200/80 z-30 font-poppins selection:bg-[#FF4F21]/20 selection:text-[#FF4F21]">
      
      {/* 1. BRAND HEADER */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-zinc-100 shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <span
            style={{ fontFamily: "'Agale DEMO', 'Mazzard', sans-serif" }}
            className="font-black text-lg tracking-wider text-[#FF4F21]"
          >
            ATHLIXIR
          </span>
        </Link>
        <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
          v2.0
        </span>
      </div>

      {/* 2. NAVIGATION BODY */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        
        {/* Section: Platform */}
        <div className="space-y-0.5">
          <div className="px-3 pb-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Platform
          </div>
          {PRIMARY_SECTION.map(renderNavRow)}
        </div>

        {/* Section: Sprint Science */}
        <div className="space-y-0.5">
          <div className="px-3 pb-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Sprint Science
          </div>
          {ANALYTICS_SECTION.map(renderNavRow)}
        </div>

        {/* Section: Account */}
        <div className="space-y-0.5">
          <div className="px-3 pb-1 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Account
          </div>
          {SYSTEM_SECTION.map(renderNavRow)}
        </div>

      </nav>

      {/* 3. PROFILE & LOGOUT FOOTER (Matching user reference image) */}
      <div className="p-4 border-t border-zinc-100 shrink-0">
        <div className="flex items-center justify-between gap-3">
          
          {/* Avatar and Name */}
          <Link href="/identity" className="flex items-center gap-3 min-w-0 flex-1 group">
            <div className="h-10 w-10 rounded-full bg-[#FF4F21] flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs">
              {athleteInitial}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-zinc-950 truncate leading-tight group-hover:text-[#FF4F21] transition-colors">
                {athleteName}
              </p>
              <p className="text-xs text-zinc-400 truncate lowercase font-normal mt-0.5">
                {athleteTier}
              </p>
            </div>
          </Link>

          {/* Logout Icon */}
          <button
            type="button"
            onClick={() => logout()}
            title="Log Out"
            aria-label="Log Out"
            className="p-1 text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>

        </div>
      </div>

    </aside>
  );
}
