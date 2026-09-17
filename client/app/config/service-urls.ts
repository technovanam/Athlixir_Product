export const PRODUCTION_API_URL = 'https://backend-n0z5.onrender.com';
export const PRODUCTION_AI_ENGINE_URL = 'https://ai-engine-4dn5.onrender.com';

export function getApiBaseUrl(): string {
  // If running in browser, automatically use current window origin (routed via Nginx)
  if (typeof window !== 'undefined') {
    const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (fromEnv && !fromEnv.includes('localhost') && !fromEnv.includes('127.0.0.1')) {
      return fromEnv;
    }
    return window.location.origin;
  }

  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }

  return process.env.NODE_ENV === 'production'
    ? PRODUCTION_API_URL
    : 'http://localhost:3001';
}
