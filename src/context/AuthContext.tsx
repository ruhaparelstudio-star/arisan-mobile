import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { storage, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/storage';
import { getMe, updatePushToken, refreshToken } from '../api/auth';
import { ApiError, setSessionExpiredListener } from '../api/client';

function getJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

const THREE_DAYS_S = 3 * 24 * 60 * 60;

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Register 401/403 intercept — trigger session expiry dari manapun di app
  useEffect(() => {
    setSessionExpiredListener(async () => {
      await storage.delete(AUTH_TOKEN_KEY);
      await storage.delete(AUTH_USER_KEY);
      setToken(null);
      setUser(null);
      setSessionExpired(true);
    });
    return () => setSessionExpiredListener(null);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const t = await storage.get(AUTH_TOKEN_KEY);
        const u = await storage.get(AUTH_USER_KEY);
        if (t && u) {
          // Validasi token ke server — jika expired/invalid, paksa logout
          try {
            // Auto-refresh jika token akan expired dalam 3 hari
            const exp = getJwtExpiry(t);
            const nowS = Math.floor(Date.now() / 1000);
            let activeToken = t;
            if (exp !== null && exp - nowS < THREE_DAYS_S) {
              try {
                const refreshed = await refreshToken(t);
                activeToken = refreshed.token;
                await storage.set(AUTH_TOKEN_KEY, activeToken);
              } catch {
                // Refresh gagal — lanjutkan dengan token lama, getMe akan validasi
              }
            }

            const freshUser = await getMe(activeToken);
            // Token valid: update data user terbaru dari server
            const merged: AuthUser = { ...JSON.parse(u), ...freshUser };
            await storage.set(AUTH_USER_KEY, JSON.stringify(merged));
            setToken(activeToken);
            setUser(merged);
          } catch (e) {
            // Hanya hapus sesi jika server secara eksplisit menolak token (401/403).
            // Network error (status=0) atau server down → pertahankan sesi, user sudah login.
            if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
              await storage.delete(AUTH_TOKEN_KEY);
              await storage.delete(AUTH_USER_KEY);
              setSessionExpired(true);
            } else {
              // Offline / timeout → tetap login dengan data cache
              setToken(t);
              setUser(JSON.parse(u));
            }
          }
          return;
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (newToken: string, newUser: AuthUser) => {
    await storage.set(AUTH_TOKEN_KEY, newToken);
    await storage.set(AUTH_USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setSessionExpired(false);
    // GAP-P0-1 + GAP-P2-3: request permission dan daftarkan push token ke backend
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        const tokenData = await Notifications.getExpoPushTokenAsync();
        await updatePushToken(newToken, tokenData.data);
      }
    } catch {
      // Push token registration tidak block login
    }
  }, []);

  const logout = useCallback(async () => {
    await storage.delete(AUTH_TOKEN_KEY);
    await storage.delete(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const updateUser = useCallback(
    async (updated: Partial<AuthUser>) => {
      const newUser = { ...user, ...updated } as AuthUser;
      await storage.set(AUTH_USER_KEY, JSON.stringify(newUser));
      setUser(newUser);
    },
    [user],
  );

  return (
    <AuthContext.Provider value={{ token, user, isLoading, sessionExpired, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
