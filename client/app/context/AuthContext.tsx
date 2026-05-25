'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter, usePathname } from 'next/navigation';

export interface UserProfile {
  uid: string;
  username: string;
  name?: string;
  email: string;
  role: string;
  onboardingCompleted: boolean;
  profileCompleted: boolean;
  status: string;
  workspace?: {
    workspaceName: string;
    roleInWorkspace: string;
    workspaceSize?: number;
    industries?: string[];
  };
  classification?: {
    primaryEvent?: string;
    athleteLevel?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  onboard: (workspaceData: { workspaceName: string; roleInWorkspace: string; workspaceSize?: number; industries?: string[] }) => Promise<void>;
  refreshUser: () => Promise<void>;
  error: string | null;
  setError: (err: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Configure global Axios instance to send cookies
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api` : 'http://localhost:3001/api', // NestJS gateway base address
  withCredentials: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = async () => {
    // Check if companion non-HttpOnly cookie is set before calling /auth/me
    const hasLoggedInCookie = typeof document !== 'undefined' && document.cookie.includes('athlixir_logged_in=true');
    
    if (!hasLoggedInCookie) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('/auth/me');
      if (response.data && response.data.user) {
        setUser(response.data.user);
      } else if (response.data && response.data.data && response.data.data.user) {
        setUser(response.data.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const signup = async (username: string, email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/signup', { username, email, password });
      const userData = response.data?.data?.user || response.data?.user;
      setUser(userData);
      
      // Since it's a new signup, onboardingCompleted is false -> Go to onboarding
      router.push('/onboarding');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data?.data?.user || response.data?.user;
      setUser(userData);

      // Decides routing based on backend database state
      if (userData?.onboardingCompleted) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    setLoading(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
      router.push('/login');
    } catch (err) {
      setUser(null);
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const onboard = async (workspaceData: {
    workspaceName: string;
    roleInWorkspace: string;
    workspaceSize?: number;
    industries?: string[];
  }) => {
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/users/onboard', workspaceData);
      const updatedUser = response.data?.data;
      setUser(updatedUser);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to complete onboarding.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        logout,
        onboard,
        refreshUser,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
