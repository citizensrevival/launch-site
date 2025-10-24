import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CacheState {
  data: Record<string, any>;
  timestamps: Record<string, number>;
}

const initialState: CacheState = {
  data: {},
  timestamps: {},
};

export const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    setCacheData: (state, action: PayloadAction<{ key: string; data: any }>) => {
      const { key, data } = action.payload;
      state.data[key] = data;
      state.timestamps[key] = Date.now();
    },
    getCacheData: (state, action: PayloadAction<string>) => {
      // This is a getter, no state change needed
    },
    isCacheValid: (state, action: PayloadAction<{ key: string; maxAge: number }>) => {
      // This is a getter, no state change needed
    },
    clearCacheType: (state, action: PayloadAction<string>) => {
      const type = action.payload;
      Object.keys(state.data).forEach(key => {
        if (key.startsWith(type)) {
          delete state.data[key];
          delete state.timestamps[key];
        }
      });
    },
  },
});

export const { setCacheData, getCacheData, isCacheValid, clearCacheType } = cacheSlice.actions;