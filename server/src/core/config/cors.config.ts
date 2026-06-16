const LOCAL_DEV_ORIGINS = ['http://localhost:3000', 'http://127.0.0.1:3000'];

export const PRODUCTION_FRONTEND_ORIGINS = [
  'https://athlixir-product.vercel.app',
  'https://athlixir.vercel.app',
  'https://www.athlixirsports.com',
  'https://athlixirsports.com',
  'https://www.athlixirsports.in',
  'https://athlixirsports.in',
];

/** Vercel production + preview deployments (e.g. *.vercel.app). */
const VERCEL_ORIGIN_PATTERN = /^https:\/\/[\w-]+\.vercel\.app$/;

export function getConfiguredOrigins(): string[] {
  const fromEnv = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',')
        .map((url) => url.trim())
        .filter(Boolean)
    : [];

  const defaults =
    process.env.NODE_ENV === 'production'
      ? PRODUCTION_FRONTEND_ORIGINS
      : LOCAL_DEV_ORIGINS;

  return [...new Set([...defaults, ...fromEnv])];
}

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) {
    return true;
  }

  if (getConfiguredOrigins().includes(origin)) {
    return true;
  }

  return VERCEL_ORIGIN_PATTERN.test(origin);
}

export const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void,
  ) => {
    callback(null, isOriginAllowed(origin));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
