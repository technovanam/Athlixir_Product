import type { Response } from 'express';

const SESSION_MAX_AGE_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

const SESSION_COOKIE_OPTIONS = {
  maxAge: SESSION_MAX_AGE_MS,
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
};

const INDICATOR_COOKIE_OPTIONS = {
  maxAge: SESSION_MAX_AGE_MS,
  httpOnly: false,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
};

export function setAuthCookies(
  response: Response,
  sessionCookie: string,
): void {
  response.cookie('session', sessionCookie, SESSION_COOKIE_OPTIONS);
  response.cookie('athlixir_logged_in', 'true', INDICATOR_COOKIE_OPTIONS);
}

export function clearAuthCookies(response: Response): void {
  response.clearCookie('session', {
    secure: true,
    sameSite: 'none',
    path: '/',
  });
  response.clearCookie('athlixir_logged_in', {
    secure: true,
    sameSite: 'none',
    path: '/',
  });
}
