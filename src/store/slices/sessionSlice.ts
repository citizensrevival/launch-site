import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ColorTheme, GetInvolvedType } from '../../lib/SiteSettingsManager'

export interface SessionState {
  colorTheme: ColorTheme
  emailSubscribed: boolean
  getInvolvedSubmissions: {
    vendor: boolean
    sponsor: boolean
    volunteer: boolean
  }
}

const initialState: SessionState = {
  colorTheme: 'purple',
  emailSubscribed: false,
  getInvolvedSubmissions: {
    vendor: false,
    sponsor: false,
    volunteer: false
  }
}

// Load state from localStorage on initialization
const loadStateFromStorage = (): SessionState => {
  if (typeof window === 'undefined') {
    return initialState
  }

  try {
    const stored = localStorage.getItem('siteSettings')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        colorTheme: parsed.colorTheme || initialState.colorTheme,
        emailSubscribed: parsed.emailSubscribed ?? initialState.emailSubscribed,
        getInvolvedSubmissions: {
          vendor: parsed.getInvolvedSubmissions?.vendor ?? initialState.getInvolvedSubmissions.vendor,
          sponsor: parsed.getInvolvedSubmissions?.sponsor ?? initialState.getInvolvedSubmissions.sponsor,
          volunteer: parsed.getInvolvedSubmissions?.volunteer ?? initialState.getInvolvedSubmissions.volunteer
        }
      }
    }
  } catch (error) {
    console.warn('Failed to parse session state from localStorage:', error)
  }

  return initialState
}

// Save state to localStorage
const saveStateToStorage = (state: SessionState) => {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem('siteSettings', JSON.stringify(state))
  } catch (error) {
    console.error('Failed to save session state to localStorage:', error)
  }
}

const sessionSlice = createSlice({
  name: 'session',
  initialState: loadStateFromStorage(),
  reducers: {
    setColorTheme: (state, action: PayloadAction<ColorTheme>) => {
      state.colorTheme = action.payload
      saveStateToStorage(state)
    },
    setEmailSubscribed: (state, action: PayloadAction<boolean>) => {
      state.emailSubscribed = action.payload
      saveStateToStorage(state)
    },
    setGetInvolvedSubmission: (state, action: PayloadAction<{ type: GetInvolvedType; submitted: boolean }>) => {
      const { type, submitted } = action.payload
      state.getInvolvedSubmissions[type] = submitted
      saveStateToStorage(state)
    },
    setGetInvolvedSubmissions: (state, action: PayloadAction<Partial<{ vendor: boolean; sponsor: boolean; volunteer: boolean }>>) => {
      state.getInvolvedSubmissions = { ...state.getInvolvedSubmissions, ...action.payload }
      saveStateToStorage(state)
    },
    clearGetInvolvedSubmissions: (state) => {
      state.getInvolvedSubmissions = {
        vendor: false,
        sponsor: false,
        volunteer: false
      }
      saveStateToStorage(state)
    },
    resetSession: () => {
      const newState = initialState
      saveStateToStorage(newState)
      return newState
    }
  }
})

export const {
  setColorTheme,
  setEmailSubscribed,
  setGetInvolvedSubmission,
  setGetInvolvedSubmissions,
  clearGetInvolvedSubmissions,
  resetSession
} = sessionSlice.actions

export default sessionSlice.reducer
