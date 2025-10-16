import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Site {
  id: string
  handle: string
  label: string
  default_locale: string
  slug: string
  created_at: string
  updated_at: string
}

export interface SiteState {
  currentSite: Site | null
  loading: boolean
  error: string | null
}

const initialState: SiteState = {
  currentSite: null,
  loading: false,
  error: null
}

const siteSlice = createSlice({
  name: 'site',
  initialState,
  reducers: {
    setSite: (state, action: PayloadAction<Site>) => {
      state.currentSite = action.payload
      state.loading = false
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },
    clearSite: (state) => {
      state.currentSite = null
      state.loading = false
      state.error = null
    }
  }
})

export const { setSite, setLoading, setError, clearSite } = siteSlice.actions

export default siteSlice.reducer
