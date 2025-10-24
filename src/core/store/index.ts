import { configureStore } from '@reduxjs/toolkit'
import sessionReducer from './slices/sessionSlice'
import siteReducer from './slices/siteSlice'

export const store = configureStore({
  reducer: {
    session: sessionReducer,
    site: siteReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
