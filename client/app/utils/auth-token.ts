const AUTH_TOKEN_KEY = 'athlixir_auth_token';
const REFRESH_TOKEN_KEY = 'athlixir_refresh_token';

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthSession(idToken: string, refreshToken?: string): void {
  sessionStorage.setItem(AUTH_TOKEN_KEY, idToken);
  if (refreshToken) {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearAuthToken(): void {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAtMs = payload.exp * 1000;
    return Date.now() >= expiresAtMs - 60_000;
  } catch {
    return true;
  }
}

export async function ensureValidAuthToken(
  refreshFn: (refreshToken: string) => Promise<{ idToken: string; refreshToken?: string }>,
): Promise<string | null> {
  const currentToken = getAuthToken();
  if (currentToken && !isTokenExpired(currentToken)) {
    return currentToken;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearAuthToken();
    return null;
  }

  try {
    const refreshed = await refreshFn(refreshToken);
    setAuthSession(refreshed.idToken, refreshed.refreshToken ?? refreshToken);
    return refreshed.idToken;
  } catch {
    clearAuthToken();
    return null;
  }
}
