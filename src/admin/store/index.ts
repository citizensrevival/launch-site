import { configureStore } from '@reduxjs/toolkit';
import { adminSlice } from './slices/adminSlice';
import { cacheSlice } from './slices/cacheSlice';
import { assetSearchSlice } from './slices/assetSearchSlice';
import { siteSlice } from './slices/siteSlice';

export const store = configureStore({
  reducer: {
    admin: adminSlice.reducer,
    cache: cacheSlice.reducer,
    assetSearch: assetSearchSlice.reducer,
    site: siteSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;