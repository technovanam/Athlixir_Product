export const PRODUCTION_API_URL = 'https://backend-n0z5.onrender.com';
export const PRODUCTION_AI_ENGINE_URL = 'https://ai-engine-4dn5.onrender.com';

export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (fromEnv && !fromEnv.includes('localhost') && !fromEnv.includes('127.0.0.1')) {
      return fromEnv;
    }
    // A local/LAN dev server on :3000 talks to the backend on :3001 directly.
    const { hostname, port } = window.location;
    const local =
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.') ||
      hostname.startsWith('10.') ||
      hostname.endsWith('.local');
    if (local && port === '3000') {
      return `http://${hostname}:3001`;
    }
    // Otherwise the API is routed through the same origin (Nginx).
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
