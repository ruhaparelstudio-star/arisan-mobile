import AsyncStorage from '@react-native-async-storage/async-storage';

const TTL_MS = 24 * 60 * 60 * 1000;

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

export const CACHE_KEYS = {
  GROUPS_LIST: 'groups_list',
  groupDetail: (id: string) => `group_detail_${id}`,
  payments: (periodId: string) => `payments_${periodId}`,
  notifications: 'notifications',
};
