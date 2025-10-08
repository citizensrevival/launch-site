import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type TimeRange = 'today' | '7days' | '30days' | 'year'

export interface AdminState {
  // Time range selection
  timeRange: TimeRange
  
  // Lead management
  leads: {
    search: string
    selectedTypes: string[]
    sortKey: string
    sortDirection: 'asc' | 'desc'
    selectedIds: string[]
    loading: boolean
    refreshing: boolean
    exporting: boolean
  }
  
  // Analytics
  analytics: {
    loading: boolean
    refreshing: boolean
  }
  
  // Global search
  globalSearch: string
  
  // UI state
  ui: {
    drawerOpen: boolean
    drawerData: any
  }
}

const initialState: AdminState = {
  timeRange: '30days',
  leads: {
    search: '',
    selectedTypes: [],
    sortKey: 'created_at',
    sortDirection: 'desc',
    selectedIds: [],
    loading: false,
    refreshing: false,
    exporting: false
  },
  analytics: {
    loading: false,
    refreshing: false
  },
  globalSearch: '',
  ui: {
    drawerOpen: false,
    drawerData: null
  }
}

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // Time range actions
    setTimeRange: (state, action: PayloadAction<TimeRange>) => {
      state.timeRange = action.payload
    },
    
    // Lead management actions
    setLeadSearch: (state, action: PayloadAction<string>) => {
      state.leads.search = action.payload
    },
    setLeadTypes: (state, action: PayloadAction<string[]>) => {
      state.leads.selectedTypes = action.payload
    },
    toggleLeadType: (state, action: PayloadAction<string>) => {
      const type = action.payload
      const index = state.leads.selectedTypes.indexOf(type)
      if (index > -1) {
        state.leads.selectedTypes.splice(index, 1)
      } else {
        state.leads.selectedTypes.push(type)
      }
    },
    setLeadSort: (state, action: PayloadAction<{ key: string; direction: 'asc' | 'desc' }>) => {
      state.leads.sortKey = action.payload.key
      state.leads.sortDirection = action.payload.direction
    },
    setSelectedLeads: (state, action: PayloadAction<string[]>) => {
      state.leads.selectedIds = action.payload
    },
    toggleLeadSelection: (state, action: PayloadAction<string>) => {
      const id = action.payload
      const index = state.leads.selectedIds.indexOf(id)
      if (index > -1) {
        state.leads.selectedIds.splice(index, 1)
      } else {
        state.leads.selectedIds.push(id)
      }
    },
    setLeadLoading: (state, action: PayloadAction<boolean>) => {
      state.leads.loading = action.payload
    },
    setLeadRefreshing: (state, action: PayloadAction<boolean>) => {
      state.leads.refreshing = action.payload
    },
    setLeadExporting: (state, action: PayloadAction<boolean>) => {
      state.leads.exporting = action.payload
    },
    
    // Analytics actions
    setAnalyticsLoading: (state, action: PayloadAction<boolean>) => {
      state.analytics.loading = action.payload
    },
    setAnalyticsRefreshing: (state, action: PayloadAction<boolean>) => {
      state.analytics.refreshing = action.payload
    },
    
    // Global search
    setGlobalSearch: (state, action: PayloadAction<string>) => {
      state.globalSearch = action.payload
    },
    
    // UI actions
    setDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.ui.drawerOpen = action.payload
    },
    setDrawerData: (state, action: PayloadAction<any>) => {
      state.ui.drawerData = action.payload
    },
    
    // Reset actions
    resetLeads: (state) => {
      state.leads = initialState.leads
    },
    resetAdmin: () => initialState
  }
})

export const {
  setTimeRange,
  setLeadSearch,
  setLeadTypes,
  toggleLeadType,
  setLeadSort,
  setSelectedLeads,
  toggleLeadSelection,
  setLeadLoading,
  setLeadRefreshing,
  setLeadExporting,
  setAnalyticsLoading,
  setAnalyticsRefreshing,
  setGlobalSearch,
  setDrawerOpen,
  setDrawerData,
  resetLeads,
  resetAdmin
} = adminSlice.actions

export default adminSlice.reducer
