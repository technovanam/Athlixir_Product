'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, RefreshCcw, ShieldOff, WifiOff, SearchX, LucideIcon } from 'lucide-react';
import { clearAuthToken, ensureValidAuthToken } from '../../utils/auth-token';

export interface FetchErrorPresentation {
  status?: number;
  title: string;
  message: string;
  canRetry: boolean;
  isAuthError?: boolean;
}

/**
 * Classifies an axios/fetch error into a user-facing presentation.
 * Phase 6: errors must never be silently swallowed into an empty state —
 * this is the shared mapping every dashboard page's catch block should use.
 */
export function classifyFetchError(err: any): FetchErrorPresentation {
  // Network failure / no response at all (offline, DNS, CORS, timeout)
  if (!err?.response) {
    const isTimeout = err?.code === 'ECONNABORTED' || /timeout/i.test(err?.message || '');
    return {
      title: isTimeout ? 'Request timed out' : 'Unable to connect',
      message: isTimeout
        ? 'That took too long to respond. Check your connection and try again.'
        : 'Check your connection and retry.',
      canRetry: true,
    };
  }

  const status = err.response.status as number;
  const serverMessage: string | undefined = err.response?.data?.message;

  switch (status) {
    case 401:
      return {
        status,
        title: 'Session expired',
        message: 'Please sign in again to continue.',
        canRetry: false,
        isAuthError: true,
      };
    case 403:
      return {
        status,
        title: 'Access denied',
        message: "You don't have permission to access this.",
        canRetry: false,
      };
    case 404:
      return {
        status,
        title: 'Not found',
        message: serverMessage || "We couldn't find what you're looking for.",
        canRetry: false,
      };
    case 422:
      return {
        status,
        title: 'Invalid request',
        message: serverMessage || 'That request could not be processed.',
        canRetry: false,
      };
    default:
      return {
        status,
        title: 'Something went wrong',
        message: "Athlixir couldn't complete this request. Please retry.",
        canRetry: true,
      };
  }
}

/**
 * Attempts to recover from a 401 by refreshing the auth token. If refresh
 * fails, clears the session and sends the user back to login. Returns true
 * if the caller should retry its original request.
 */
export async function tryRecoverFromAuthError(
  refreshFn: (refreshToken: string) => Promise<{ idToken: string; refreshToken?: string }>,
  router: ReturnType<typeof useRouter>,
): Promise<boolean> {
  try {
    await ensureValidAuthToken(refreshFn);
    return true;
  } catch {
    clearAuthToken();
    router.replace('/login');
    return false;
  }
}

interface DataFetchErrorProps {
  error: FetchErrorPresentation;
  onRetry?: () => void;
  className?: string;
}

const ICONS: Record<number, LucideIcon> = {
  403: ShieldOff,
  404: SearchX,
};

export default function DataFetchError({ error, onRetry, className = '' }: DataFetchErrorProps) {
  const Icon = (error.status && ICONS[error.status]) || (!error.status ? WifiOff : AlertCircle);

  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-3xl border border-red-100 bg-red-50/60 px-6 py-10 ${className}`}
    >
      <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <Icon size={22} className="text-red-500" />
      </div>
      <h3 className="text-base font-bold text-[#1C1C1E]">{error.title}</h3>
      <p className="text-sm text-[#8E8E93] font-medium mt-1.5 max-w-xs">{error.message}</p>
      {error.canRetry && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF4F21] text-white text-sm font-bold active:scale-95 transition"
        >
          <RefreshCcw size={14} />
          Retry
        </button>
      )}
    </div>
  );
}
