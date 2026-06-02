import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { storage, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/storage';
import { getMe } from '../api/auth';
import { ApiError } from '../api/client';

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
}

interface AuthContextValue {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updated: Partial<AuthUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const t = await storage.get(AUTH_TOKEN_KEY);
        const u = await storage.get(AUTH_USER_KEY);
        if (t && u) {
          // Validasi token ke server — jika expired/invalid, paksa logout
          try {
            const freshUser = await getMe(t);
            // Token valid: update data user terbaru dari server
            const merged: AuthUser = { ...JSON.parse(u), ...freshUser };
            await storage.set(AUTH_USER_KEY, JSON.stringify(merged));
            setToken(t);
            setUser(merged);
          } catch (e) {
            // Hanya hapus sesi jika server secara eksplisit menolak token (401/403).
            // Network error (status=0) atau server down → pertahankan sesi, user sudah login.
            if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
              await storage.delete(AUTH_TOKEN_KEY);
              await storage.delete(AUTH_USER_KEY);
            } else {
              // Offline / timeout → tetap login dengan data cache
              setToken(t);
              setUser(JSON.parse(u));
            }
          }
          return;
        }
        // Test Lab bypass: auto-login with pre-seeded JWT (build-time env var)
        const testJwt = process.env.EXPO_PUBLIC_TEST_JWT;
        if (testJwt) {
          try {
            const payload = JSON.parse(atob(testJwt.split('.')[1]));
            const testUser: AuthUser = {
              id: payload.userId,
              phone: payload.phone,
              name: null,
            };
            await storage.set(AUTH_TOKEN_KEY, testJwt);
            await storage.set(AUTH_USER_KEY, JSON.stringify(testUser));
            setToken(testJwt);
            setUser(testUser);
          } catch {}
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
    <AuthContext.Provider value={{ token, user, isLoading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
