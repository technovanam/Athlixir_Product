export const PRODUCTION_API_URL = 'https://backend-n0z5.onrender.com';
export const PRODUCTION_AI_ENGINE_URL = 'https://ai-engine-4dn5.onrender.com';

export function getApiBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (fromEnv) {
    return fromEnv;
  }

  return process.env.NODE_ENV === 'production'
    ? PRODUCTION_API_URL
    : 'http://localhost:3001';
}
