import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { storage, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/storage';

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
        if (t) setToken(t);
        if (u) setUser(JSON.parse(u));
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
