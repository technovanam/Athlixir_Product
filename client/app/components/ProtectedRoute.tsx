'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';

const PUBLIC_ROUTES = ['/', '/login', '/signup'];

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

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
        // If logged in, they can stay on home page '/' or get redirected from login/signup/onboarding to dashboard
        if (pathname === '/login' || pathname === '/signup' || pathname === '/onboarding') {
          router.replace('/dashboard');
        }
      }
    }
  }, [user, loading, pathname, router]);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  // Guard renders - Render nothing for private paths only while verifying auth credentials to prevent content flashes
  if (loading && !isPublicRoute) {
    return null;
  }

  if (!user && !isPublicRoute) {
    return null; 
  }

  if (user) {
    if (!user.onboardingCompleted && pathname !== '/onboarding') {
      return null; 
    }
    if (user.onboardingCompleted && (pathname === '/login' || pathname === '/signup' || pathname === '/onboarding')) {
      return null; 
    }
  }

  return <>{children}</>;
}
