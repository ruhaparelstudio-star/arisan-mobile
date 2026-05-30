import { useState, useEffect, useCallback } from 'react';
import { storage, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/storage';

export interface AuthUser {
  id: string;
  phone: string;
  name: string | null;
}

export function useAuth() {
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

  const updateUser = useCallback(async (updated: Partial<AuthUser>) => {
    const newUser = { ...user, ...updated } as AuthUser;
    await storage.set(AUTH_USER_KEY, JSON.stringify(newUser));
    setUser(newUser);
  }, [user]);

  return { token, user, isLoading, login, logout, updateUser };
}
