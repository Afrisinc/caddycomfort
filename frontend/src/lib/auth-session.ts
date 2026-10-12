/**
 * Client-side session primitives shared by the API client and the auth store.
 *
 * Kept free of imports from either so the two can depend on it without
 * creating a circular dependency.
 */

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

const readItem = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const tokenStorage = {
  getAccessToken: (): string | null => readItem(ACCESS_TOKEN_KEY),

  getRefreshToken: (): string | null => readItem(REFRESH_TOKEN_KEY),

  setTokens: ({ accessToken, refreshToken }: AuthTokens): void => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  clear: (): void => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

type SessionExpiredListener = () => void;

const sessionExpiredListeners = new Set<SessionExpiredListener>();

/** Subscribe to session expiry. Returns an unsubscribe function. */
export const onSessionExpired = (listener: SessionExpiredListener): (() => void) => {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
};

/** Clear stored tokens and notify subscribers that the session can no longer be renewed. */
export const expireSession = (): void => {
  tokenStorage.clear();
  sessionExpiredListeners.forEach((listener) => listener());
};
