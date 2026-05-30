import * as SecureStore from 'expo-secure-store';

export const AUTH_TOKEN_KEY = 'arisan_auth_token';
export const AUTH_USER_KEY = 'arisan_auth_user';

export const storage = {
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  get: (key: string) => SecureStore.getItemAsync(key),
  delete: (key: string) => SecureStore.deleteItemAsync(key),
};
