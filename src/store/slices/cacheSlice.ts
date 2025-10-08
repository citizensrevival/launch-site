import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface CacheEntry<T = any> {
  data: T
  timestamp: number
  expiresAt: number
}

export interface CacheState {
  leads: {
    [key: string]: CacheEntry
  }
  analytics: {
    [key: string]: CacheEntry
  }
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

const initialState: CacheState = {
  leads: {},
  analytics: {}
}

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    // Cache data with expiration
    setCacheData: <T>(
      state: CacheState, 
      action: PayloadAction<{
        type: 'leads' | 'analytics'
        key: string
        data: T
      }>
    ) => {
      const { type, key, data } = action.payload
      const now = Date.now()
      
      state[type][key] = {
        data,
        timestamp: now,
        expiresAt: now + CACHE_DURATION
      }
    },
    
    // Clear specific cache entry
    clearCacheEntry: (
      state: CacheState,
      action: PayloadAction<{
        type: 'leads' | 'analytics'
        key: string
      }>
    ) => {
      const { type, key } = action.payload
      delete state[type][key]
    },
    
    // Clear all cache entries for a type
    clearCacheType: (
      state: CacheState,
      action: PayloadAction<'leads' | 'analytics'>
    ) => {
      const type = action.payload
      state[type] = {}
    },
    
    // Clear all cache
    clearAllCache: (state: CacheState) => {
      state.leads = {}
      state.analytics = {}
    },
    
    // Clean expired entries
    cleanExpiredEntries: (state: CacheState) => {
      const now = Date.now()
      
      // Clean leads cache
      Object.keys(state.leads).forEach(key => {
        if (state.leads[key].expiresAt < now) {
          delete state.leads[key]
        }
      })
      
      // Clean analytics cache
      Object.keys(state.analytics).forEach(key => {
        if (state.analytics[key].expiresAt < now) {
          delete state.analytics[key]
        }
      })
    }
  }
})

export const {
  setCacheData,
  clearCacheEntry,
  clearCacheType,
  clearAllCache,
  cleanExpiredEntries
} = cacheSlice.actions

// Helper functions for cache operations
export const getCacheData = <T>(
  state: CacheState,
  type: 'leads' | 'analytics',
  key: string
): T | null => {
  const entry = state[type][key]
  if (!entry) return null
  
  const now = Date.now()
  if (entry.expiresAt < now) {
    return null // Expired
  }
  
  return entry.data as T
}

export const isCacheValid = (
  state: CacheState,
  type: 'leads' | 'analytics',
  key: string
): boolean => {
  const entry = state[type][key]
  if (!entry) return false
  
  const now = Date.now()
  return entry.expiresAt >= now
}

export const getCacheAge = (
  state: CacheState,
  type: 'leads' | 'analytics',
  key: string
): number | null => {
  const entry = state[type][key]
  if (!entry) return null
  
  return Date.now() - entry.timestamp
}

export const getCacheTimeRemaining = (
  state: CacheState,
  type: 'leads' | 'analytics',
  key: string
): number | null => {
  const entry = state[type][key]
  if (!entry) return null
  
  const now = Date.now()
  const remaining = entry.expiresAt - now
  return remaining > 0 ? remaining : 0
}

export default cacheSlice.reducer
