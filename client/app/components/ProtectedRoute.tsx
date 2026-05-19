'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const publicRoutes = ['/login', '/signup'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user) {
      // Unauthenticated users trying to access protected routes go to login
      if (!isPublicRoute) {
        router.replace('/login');
      }
    } else {
      // Authenticated users
      if (!user.onboardingCompleted) {
        // Must complete onboarding before accessing anything else
        if (pathname !== '/onboarding') {
          router.replace('/onboarding');
        }
      } else {
        // Onboarding is completed
        if (isPublicRoute || pathname === '/onboarding') {
          router.replace('/dashboard');
        }
      }
    }
  }, [user, loading, pathname, router]);

  // Loading spinner with dynamic, ultra-premium theme
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="relative flex flex-col items-center">
          {/* Glowing Glassmorphic Background Blur */}
          <div className="absolute -inset-10 rounded-full bg-violet-600/20 blur-3xl"></div>
          
          <div className="relative flex flex-col items-center gap-6">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500"></div>
            <div className="flex flex-col items-center">
              <span className="text-sm font-semibold tracking-wider uppercase text-zinc-400 animate-pulse">
                Authenticating
              </span>
              <span className="text-xs text-zinc-500 mt-1">Establishing secure gateway session...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const publicRoutes = ['/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Guard renders
  if (!user && !isPublicRoute) {
    return null; // Prevents flashing content while redirecting to /login
  }

  if (user) {
    if (!user.onboardingCompleted && pathname !== '/onboarding') {
      return null; // Prevents flashing dashboard while redirecting to /onboarding
    }
    if (user.onboardingCompleted && (isPublicRoute || pathname === '/onboarding')) {
      return null; // Prevents flashing login page while redirecting to /dashboard
    }
  }

  return <>{children}</>;
}
