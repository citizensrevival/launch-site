import { RootState } from './index';

export function getCacheData<T>(state: RootState, type: string, key: string): T | null {
  const cacheKey = `${type}:${key}`;
  return state.cache.data[cacheKey] || null;
}

export function isCacheValid(state: RootState, type: string, key: string, maxAge: number = 5 * 60 * 1000): boolean {
  const cacheKey = `${type}:${key}`;
  const timestamp = state.cache.timestamps[cacheKey];
  if (!timestamp) return false;
  return Date.now() - timestamp < maxAge;
}

