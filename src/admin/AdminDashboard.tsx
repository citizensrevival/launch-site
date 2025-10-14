import { useEffect, useState, useCallback } from 'react'
import { createLeadsAdminService } from '../shell/lib'
import { AdminLayout } from './AdminLayout'
import { Icon } from '@mdi/react'
import { mdiRefresh, mdiDownload } from '@mdi/js'
import { TimeRangeToolbar } from './analytics/TimeRangeToolbar'
import { ChartTooltipWrapper } from './analytics/ChartComponents'
import { useAppSelector, useAppDispatch } from '../shell/store/hooks'
import { setTimeRange, setAnalyticsLoading, setAnalyticsRefreshing } from '../shell/store/slices/adminSlice'
import { setCacheData, getCacheData, isCacheValid, clearCacheType } from '../shell/store/slices/cacheSlice'
import { analyticsService, UsersData } from '../shell/lib/AnalyticsService'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import type { RootState } from '../shell/store'

interface CountsState {
  total: number
  vendors: number
  sponsors: number
  volunteers: number
  subscribers: number
}

// Create properly typed selectors
const selectTimeRange = (state: RootState) => (state as any).admin?.timeRange || '30days'
const selectAnalyticsLoading = (state: RootState) => (state as any).admin?.analytics?.loading || false
const selectAnalyticsRefreshing = (state: RootState) => (state as any).admin?.analytics?.refreshing || false
const selectCache = (state: RootState) => (state as any).cache

export default function AdminDashboard() {
  const dispatch = useAppDispatch()
  const timeRange = useAppSelector(selectTimeRange)
  const analyticsLoading = useAppSelector(selectAnalyticsLoading)
  const analyticsRefreshing = useAppSelector(selectAnalyticsRefreshing)
  const cache = useAppSelector(selectCache)
  
  const [counts, setCounts] = useState<CountsState | null>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [analyticsData, setAnalyticsData] = useState<UsersData | null>(null)

  const fetchCounts = async () => {
    setLoading(true)
    const leadsAdmin = createLeadsAdminService()
    const res = await leadsAdmin.getDashboardCounts()
    if (res.success && res.data) {
      setCounts(res.data)
    } else {
      setCounts({
        total: 0,
        vendors: 0,
        sponsors: 0,
        volunteers: 0,
        subscribers: 0,
      })
    }
    setLoading(false)
  }

  const getAnalyticsCacheKey = useCallback(() => `analytics-users-${timeRange}`, [timeRange])

  const fetchAnalyticsData = useCallback(async (forceRefresh = false) => {
    const cacheKey = getAnalyticsCacheKey()
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && isCacheValid(cache, 'analytics', cacheKey)) {
      const cachedData = getCacheData<UsersData>(cache, 'analytics', cacheKey)
      if (cachedData) {
        setAnalyticsData(cachedData)
        return
      }
    }

    try {
      dispatch(setAnalyticsLoading(true))
      
      // Fetch data from analytics service
      const usersData = await analyticsService.getUsersData(timeRange)
      setAnalyticsData(usersData)
      
      // Cache the data
      dispatch(setCacheData({
        type: 'analytics',
        key: cacheKey,
        data: usersData
      }))
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      dispatch(setAnalyticsLoading(false))
    }
  }, [timeRange, cache, dispatch, getAnalyticsCacheKey])

  const refreshAnalytics = useCallback(async () => {
    dispatch(setAnalyticsRefreshing(true))
    // Clear cache for this data type to force refresh
    dispatch(clearCacheType('analytics'))
    await fetchAnalyticsData(true)
    dispatch(setAnalyticsRefreshing(false))
  }, [dispatch, fetchAnalyticsData])

  const refreshAll = useCallback(async () => {
    // Refresh both leads and analytics data
    await Promise.all([
      fetchCounts(),
      refreshAnalytics()
    ])
  }, [refreshAnalytics])

  useEffect(() => {
    fetchCounts()
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  const handleExportCSV = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const leadsAdmin = createLeadsAdminService()
      const res = await leadsAdmin.exportLeadsToCSV()
      if (res.success && res.data) {
        const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        link.setAttribute('download', `leads-export-${timestamp}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } finally {
      setExporting(false)
    }
  }


  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white sm:text-2xl">
          Dashboard
        </h1>
        <p className="text-gray-300">Leads overview and analytics insights</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={refreshAll}
          aria-label="Refresh all data"
          title="Refresh all data"
          disabled={loading || analyticsRefreshing}
          className="rounded-md bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          <Icon path={mdiRefresh} className={`h-4 w-4 ${(loading || analyticsRefreshing) ? 'animate-spin' : ''}`} />
          <span>Refresh All</span>
        </button>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="rounded-md bg-gray-800 px-3 py-2 text-sm text-gray-100 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {exporting ? (
            <Icon path={mdiDownload} className="h-4 w-4 animate-spin text-gray-300" />
          ) : null}
          <span>Download CSV</span>
        </button>
      </div>
    </div>
  )

  const renderValue = (value?: number) => {
    if (loading) return '…'
    return value ?? 0
  }

  return (
    <AdminLayout pageHeader={pageHeader}>
      {/* Leads Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Leads Overview</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <a
            href="/manage/leads?type=subscriber"
            className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-400">Subscribers</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {renderValue(counts?.subscribers)}
            </div>
          </a>
          <a
            href="/manage/leads?type=sponsor"
            className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-400">Sponsors</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {renderValue(counts?.sponsors)}
            </div>
          </a>

          <a
            href="/manage/leads?type=vendor"
            className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-400">Vendors</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {renderValue(counts?.vendors)}
            </div>
          </a>
          <a
            href="/manage/leads?type=volunteer"
            className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-400">Volunteers</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {renderValue(counts?.volunteers)}
            </div>
          </a>
          <a
            href="/manage/leads"
            className="rounded-lg bg-gray-800 p-4 hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <div className="text-xs text-gray-400">Total Leads</div>
            <div className="mt-1 text-2xl font-semibold text-white">
              {renderValue(counts?.total)}
            </div>
          </a>
        </div>
      </div>

      {/* Analytics Overview */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Analytics Overview</h2>
        
        {/* Time Range Toolbar */}
        <div className="mb-6">
          <TimeRangeToolbar 
            selectedRange={timeRange} 
            onRangeChange={(range) => dispatch(setTimeRange(range))}
            onRefresh={refreshAnalytics}
            refreshing={analyticsRefreshing}
            showRefresh={false}
          />
        </div>

        {/* New Users Over Time Chart */}
        {analyticsData && (
          <ChartTooltipWrapper 
            title="New Users Over Time"
            tooltip="Tracks the daily count of new users visiting your site for the first time. This metric helps measure user acquisition and growth trends over the selected time period."
            className="mb-6"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.newUsersOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  labelFormatter={(value: any) => new Date(value).toLocaleDateString()}
                />
                <Line 
                  type="monotone" 
                  dataKey="new_users" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartTooltipWrapper>
        )}

        {/* Loading state for analytics */}
        {analyticsLoading && !analyticsData && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Icon path={mdiRefresh} className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading analytics data...</p>
              </div>
            </div>
          </div>
        )}

        {/* Error state for analytics */}
        {!analyticsLoading && !analyticsData && (
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
            <div className="text-center py-12">
              <p className="text-gray-400">Failed to load analytics data</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
