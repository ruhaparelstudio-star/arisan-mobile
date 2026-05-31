# MO-0 — Setup Scaffold Mobile

> **Prompt pembuka:**
> ```
> Baca CLAUDE.md dan PROGRESS.md sekarang.
> Konfirmasi: BE-0 backend sudah selesai? (health endpoint aktif?)
> Cek PROGRESS.md — semua MO-0 masih [ ]?
> Scope sesi ini: scaffold + infrastruktur dasar saja.
> Jangan mulai coding sebelum konfirmasi.
> ```

---

## Konteks

Sesi ini membangun fondasi `arisan-mobile`. Tidak ada screen bisnis — hanya scaffold, navigasi skeleton, komponen dasar, dan utilitas yang dipakai di semua sesi berikutnya.

**Repo:** `~/projects/arisan-mobile`
**Device:** USB Android — pastikan `adb devices` detect device sebelum mulai.

---

## Step 1 — Init Project

```bash
cd ~/projects
npx create-expo-app arisan-mobile --template blank-typescript
cd arisan-mobile

# Core dependencies
npx expo install expo-secure-store expo-constants expo-notifications
npx expo install @react-native-async-storage/async-storage
npx expo install @react-native-community/netinfo

# Navigation
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# Supabase Realtime (untuk payments di MO-3)
npm install @supabase/supabase-js
```

---

## Step 2 — Environment Variables

**`.env.example`:**
```
EXPO_PUBLIC_API_URL=http://192.168.x.x:3001
EXPO_PUBLIC_STREAM_API_KEY=
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

Copy ke `.env` dan isi IP WSL kamu (jalankan `ip addr show eth0` di WSL untuk cari IP).

---

## Step 3 — Struktur Folder

```bash
mkdir -p src/screens/auth src/screens/home src/screens/groups \
  src/screens/payments src/screens/undian src/screens/swaps src/screens/chat \
  src/components src/api src/hooks src/utils
```

---

## Step 4 — Utilitas Dasar

**`src/utils/storage.ts`** — SecureStore wrapper:
```typescript
import * as SecureStore from 'expo-secure-store';

export const storage = {
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  get: (key: string) => SecureStore.getItemAsync(key),
  delete: (key: string) => SecureStore.deleteItemAsync(key),
};

export const AUTH_TOKEN_KEY = 'arisan_auth_token';
export const AUTH_USER_KEY = 'arisan_auth_user';
```

**`src/utils/cache.ts`** — AsyncStorage + TTL:
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const TTL_MS = 24 * 60 * 60 * 1000; // 24 jam

export const cache = {
  async set<T>(key: string, data: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  },
  async get<T>(key: string): Promise<{ data: T; isStale: boolean } | null> {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    return { data, isStale: Date.now() - ts > TTL_MS };
  },
  async delete(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },
};

// Cache keys — tambah di sini saat butuh key baru
export const CACHE_KEYS = {
  GROUPS_LIST: 'groups_list',
  groupDetail: (id: string) => `group_detail_${id}`,
  payments: (periodId: string) => `payments_${periodId}`,
};
```

**`src/api/client.ts`** — base fetch wrapper:
```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function apiCall<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...rest } = options ?? {};
  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...rest.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Terjadi kesalahan. Coba lagi.' }));
    throw new Error(err.error ?? 'Request gagal');
  }
  return res.json();
}
```

---

## Step 5 — Hooks Dasar

**`src/hooks/useNetworkStatus.ts`:**
```typescript
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(!!state.isConnected && !!state.isInternetReachable);
    });
    return unsubscribe;
  }, []);

  return isOnline;
}
```

**`src/hooks/useAuth.ts`** — skeleton (diisi penuh di MO-1):
```typescript
import { useState, useEffect } from 'react';
import { storage, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../utils/storage';

type User = { id: string; phone: string; name: string | null };

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const t = await storage.get(AUTH_TOKEN_KEY);
      const u = await storage.get(AUTH_USER_KEY);
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
      setIsLoading(false);
    })();
  }, []);

  const login = async (newToken: string, newUser: User) => {
    await storage.set(AUTH_TOKEN_KEY, newToken);
    await storage.set(AUTH_USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    await storage.delete(AUTH_TOKEN_KEY);
    await storage.delete(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  };

  return { token, user, isLoading, login, logout };
}
```

---

## Step 6 — OfflineBanner Component

```typescript
// src/components/OfflineBanner.tsx
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export function OfflineBanner() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Kamu sedang offline. Menampilkan data terakhir.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EF4444',
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
```

---

## Step 7 — Navigation Skeleton

**`src/navigation/RootNavigator.tsx`:**
```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { AppNavigator } from './AppNavigator';
import { ActivityIndicator, View } from 'react-native';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator color="#00C897" /></View>;
  }

  return (
    <NavigationContainer>
      {token ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
```

**`src/navigation/AuthNavigator.tsx`** — placeholder:
```typescript
// Stack: SplashScreen → PhoneInputScreen → OTPVerifyScreen → LoginSuccessScreen
// Dibuat penuh di MO-1
```

**`src/navigation/AppNavigator.tsx`** — placeholder:
```typescript
// Stack: HomeScreen → semua screen lain
// Dibuat penuh di MO-2
```

---

## Step 8 — GitHub Actions

**`.github/workflows/ci.yml`:**
```yaml
name: CI
on:
  push:
    branches: ["**"]
  pull_request:
    branches: [main, develop]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run type-check
```

---

## Verifikasi Akhir

```bash
npx expo run:android --device
# App harus terbuka di device — tampilkan loading indicator sementara
# Tidak ada crash, tidak ada error merah di Metro bundler
```

---

## Update PROGRESS.md — WAJIB

```
Tandai semua MO-0 yang selesai.
Di "Catatan Sesi MO-0", catat:
- Versi Expo SDK yang terinstall
- IP WSL yang dipakai di EXPO_PUBLIC_API_URL
Commit: "chore(mo): initial mobile scaffold"
Branch: feature/mo-w01-setup → PR ke develop
```

---

**Sesi berikutnya:** `MO-1-auth.md`

---
---

