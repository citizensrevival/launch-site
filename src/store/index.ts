import { configureStore } from '@reduxjs/toolkit'
import sessionReducer from './slices/sessionSlice'
import adminReducer from './slices/adminSlice'
import cacheReducer from './slices/cacheSlice'

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    admin: adminReducer,
    cache: cacheReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
