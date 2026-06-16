export const PRODUCTION_AI_ENGINE_URL = 'https://ai-engine-4dn5.onrender.com';

const isProduction = process.env.NODE_ENV === 'production';

export function getFastApiUrl(): string {
  return (
    process.env.FASTAPI_URL ||
    (isProduction
      ? `${PRODUCTION_AI_ENGINE_URL}/api/analyze`
      : 'http://127.0.0.1:8000/api/analyze')
  );
}

export function getFastApiIntelUrl(): string {
  return (
    process.env.FASTAPI_INTEL_URL ||
    (isProduction
      ? `${PRODUCTION_AI_ENGINE_URL}/api/analyze/intelligence`
      : 'http://127.0.0.1:8000/api/analyze/intelligence')
  );
}

export function getFastApiPublicUrl(): string {
  return (
    process.env.FASTAPI_PUBLIC_URL ||
    (isProduction ? PRODUCTION_AI_ENGINE_URL : 'http://localhost:8000')
  );
}
