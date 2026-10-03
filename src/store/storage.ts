import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = {
  names: 'bidwars.names',
  score: 'bidwars.score',
  session: 'bidwars.session',
  settings: 'bidwars.settings',
  owned: 'bidwars.owned',
  seen: 'bidwars.seen',
  recent: 'bidwars.recentTopics',
} as const;

export async function load<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? { ...fallback, ...(JSON.parse(v) as T) } : fallback;
  } catch {
    return fallback;
  }
}

export async function loadRaw<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save(key: string, value: unknown) {
  AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
}
