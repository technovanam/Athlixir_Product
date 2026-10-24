import {
  Home, Sparkles, TrendingUp, MessageCircle, Activity, ShieldAlert,
  FileText, ListChecks, Radio, Cpu, Bell, Settings, Zap, User as UserIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  href: string;
  icon: typeof Home;
  disabled?: boolean;
  isActive?: (pathname: string, tab: string | null) => boolean;
}

/** Primary bottom-tab / sidebar-top destinations (Steps 10, 13). */
export const PRIMARY_NAV: NavItem[] = [
  { name: 'Home', href: '/dashboard', icon: Home, isActive: (p, t) => p === '/dashboard' && t !== 'biomechanics' },
  { name: 'Analyze', href: '/dashboard?tab=biomechanics', icon: Sparkles, isActive: (p, t) => p === '/dashboard' && t === 'biomechanics' },
  { name: 'Progress', href: '/evolution', icon: TrendingUp },
  { name: 'Coach', href: '/copilot', icon: MessageCircle },
];

/** Profile — 5th bottom-tab item; also linked from the sidebar footer. */
export const PROFILE_NAV: NavItem = { name: 'Profile', href: '/identity', icon: UserIcon };

/** Bottom tab bar order (Step 10) — the 4 primary destinations + Profile. */
export const BOTTOM_TAB_NAV: NavItem[] = [...PRIMARY_NAV, PROFILE_NAV];

/** Secondary "Training" group — drawer + sidebar (Step 11, 13). */
export const TRAINING_NAV: NavItem[] = [
  { name: 'Biomechanics', href: '/biomechanics', icon: Activity },
  { name: 'Muscle', href: '/muscle', icon: Zap, disabled: true },
  { name: 'Injury Risk', href: '/injury-risk', icon: ShieldAlert },
  { name: 'Recommendations', href: '/recommendations', icon: ListChecks },
  { name: 'Reports', href: '/reports', icon: FileText },
];

/** Future-hardware "Lab" group — not built yet, shown disabled (Step 11, 13). */
export const LAB_NAV: NavItem[] = [
  { name: 'Live Session', href: '/live-session', icon: Radio, disabled: true },
  { name: 'Sensor Lab', href: '/sensor-lab', icon: Cpu, disabled: true },
];

/** System group — drawer + sidebar. */
export const SYSTEM_NAV: NavItem[] = [
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Settings', href: '/settings', icon: Settings },
];

/** Static pathname → page title map, used by MobileHeader's "page" variant
 * since feature pages have no mechanism yet to pass a dynamic title up to
 * the shell (see MobileHeader.tsx doc comment). */
export const PAGE_TITLES: Record<string, string> = {
  '/evolution': 'Progress',
  '/copilot': 'Coach',
  '/biomechanics': 'Biomechanics',
  '/injury-risk': 'Injury Risk',
  '/recommendations': 'Recommendations',
  '/reports': 'Reports',
  '/history': 'History',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/identity': 'Profile',
};
