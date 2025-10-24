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
    // Overview page parameters
    overview: {
      selectedMetric: 'uniqueUsers' | 'sessions' | 'pageviews' | 'events'
    }
    // Users page parameters
    users: {
      search: string
      sortKey: 'firstSeenAt' | 'lastSeenAt' | 'sessions' | 'avgDuration' | 'anonId' | 'hasLead'
      sortDirection: 'asc' | 'desc'
      selectedUser: string | null
    }
    // Sessions page parameters
    sessions: {
      search: string
      sortKey: 'startedAt' | 'duration' | 'pageviews' | 'events' | 'id' | 'userId' | 'deviceCategory' | 'geoCountry'
      sortDirection: 'asc' | 'desc'
      selectedSession: string | null
      deviceFilter: string[]
      countryFilter: string[]
    }
    // Events page parameters
    events: {
      search: string
      sortKey: 'name' | 'count' | 'uniqueUsers' | 'conversionRate' | 'lastOccurred'
      sortDirection: 'asc' | 'desc'
      eventTypeFilter: string[]
    }
    // Referrers page parameters
    referrers: {
      search: string
      sortKey: 'domain' | 'totalSessions' | 'totalUsers' | 'conversions' | 'avgSessionDuration' | 'bounceRate' | 'pagesPerSession'
      sortDirection: 'asc' | 'desc'
      selectedReferrer: string | null
      sourceFilter: string[]
    }
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
    refreshing: false,
    overview: {
      selectedMetric: 'uniqueUsers'
    },
    users: {
      search: '',
      sortKey: 'lastSeenAt',
      sortDirection: 'desc',
      selectedUser: null
    },
    sessions: {
      search: '',
      sortKey: 'startedAt',
      sortDirection: 'desc',
      selectedSession: null,
      deviceFilter: [],
      countryFilter: []
    },
    events: {
      search: '',
      sortKey: 'count',
      sortDirection: 'desc',
      eventTypeFilter: []
    },
    referrers: {
      search: '',
      sortKey: 'totalSessions',
      sortDirection: 'desc',
      selectedReferrer: null,
      sourceFilter: []
    }
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
    
    // Analytics Overview actions
    setAnalyticsOverviewMetric: (state, action: PayloadAction<'uniqueUsers' | 'sessions' | 'pageviews' | 'events'>) => {
      state.analytics.overview.selectedMetric = action.payload
    },
    
    // Analytics Users actions
    setAnalyticsUsersSearch: (state, action: PayloadAction<string>) => {
      state.analytics.users.search = action.payload
    },
    setAnalyticsUsersSort: (state, action: PayloadAction<{ key: 'firstSeenAt' | 'lastSeenAt' | 'sessions' | 'avgDuration' | 'anonId' | 'hasLead'; direction: 'asc' | 'desc' }>) => {
      state.analytics.users.sortKey = action.payload.key
      state.analytics.users.sortDirection = action.payload.direction
    },
    setAnalyticsUsersSelectedUser: (state, action: PayloadAction<string | null>) => {
      state.analytics.users.selectedUser = action.payload
    },
    
    // Analytics Sessions actions
    setAnalyticsSessionsSearch: (state, action: PayloadAction<string>) => {
      state.analytics.sessions.search = action.payload
    },
    setAnalyticsSessionsSort: (state, action: PayloadAction<{ key: 'startedAt' | 'duration' | 'pageviews' | 'events' | 'id' | 'userId' | 'deviceCategory' | 'geoCountry'; direction: 'asc' | 'desc' }>) => {
      state.analytics.sessions.sortKey = action.payload.key
      state.analytics.sessions.sortDirection = action.payload.direction
    },
    setAnalyticsSessionsSelectedSession: (state, action: PayloadAction<string | null>) => {
      state.analytics.sessions.selectedSession = action.payload
    },
    setAnalyticsSessionsDeviceFilter: (state, action: PayloadAction<string[]>) => {
      state.analytics.sessions.deviceFilter = action.payload
    },
    setAnalyticsSessionsCountryFilter: (state, action: PayloadAction<string[]>) => {
      state.analytics.sessions.countryFilter = action.payload
    },
    
    // Analytics Events actions
    setAnalyticsEventsSearch: (state, action: PayloadAction<string>) => {
      state.analytics.events.search = action.payload
    },
    setAnalyticsEventsSort: (state, action: PayloadAction<{ key: 'name' | 'count' | 'uniqueUsers' | 'conversionRate' | 'lastOccurred'; direction: 'asc' | 'desc' }>) => {
      state.analytics.events.sortKey = action.payload.key
      state.analytics.events.sortDirection = action.payload.direction
    },
    setAnalyticsEventsTypeFilter: (state, action: PayloadAction<string[]>) => {
      state.analytics.events.eventTypeFilter = action.payload
    },
    
    // Analytics Referrers actions
    setAnalyticsReferrersSearch: (state, action: PayloadAction<string>) => {
      state.analytics.referrers.search = action.payload
    },
    setAnalyticsReferrersSort: (state, action: PayloadAction<{ key: 'domain' | 'totalSessions' | 'totalUsers' | 'conversions' | 'avgSessionDuration' | 'bounceRate' | 'pagesPerSession'; direction: 'asc' | 'desc' }>) => {
      state.analytics.referrers.sortKey = action.payload.key
      state.analytics.referrers.sortDirection = action.payload.direction
    },
    setAnalyticsReferrersSelectedReferrer: (state, action: PayloadAction<string | null>) => {
      state.analytics.referrers.selectedReferrer = action.payload
    },
    setAnalyticsReferrersSourceFilter: (state, action: PayloadAction<string[]>) => {
      state.analytics.referrers.sourceFilter = action.payload
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
  setAnalyticsOverviewMetric,
  setAnalyticsUsersSearch,
  setAnalyticsUsersSort,
  setAnalyticsUsersSelectedUser,
  setAnalyticsSessionsSearch,
  setAnalyticsSessionsSort,
  setAnalyticsSessionsSelectedSession,
  setAnalyticsSessionsDeviceFilter,
  setAnalyticsSessionsCountryFilter,
  setAnalyticsEventsSearch,
  setAnalyticsEventsSort,
  setAnalyticsEventsTypeFilter,
  setAnalyticsReferrersSearch,
  setAnalyticsReferrersSort,
  setAnalyticsReferrersSelectedReferrer,
  setAnalyticsReferrersSourceFilter,
  setGlobalSearch,
  setDrawerOpen,
  setDrawerData,
  resetLeads,
  resetAdmin
} = adminSlice.actions

export default adminSlice.reducer
