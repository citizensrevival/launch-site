import { useEffect, useState, useCallback } from 'react'
import { AdminLayout } from '../AdminLayout'
import { Icon } from '@mdi/react'
import { TimeRangeToolbar } from './TimeRangeToolbar'
import { ChartCard, MetricCard, TimeSeriesLineChart, TimeSeriesBarChart, SimplePieChart, CHART_COLORS } from './ChartComponents'
import { useAppSelector, useAppDispatch } from '../../shell/store/hooks'
import type { RootState } from '../../shell/store'

// Create properly typed selectors
const selectTimeRange = (state: RootState) => (state as any).admin?.timeRange || '30days'
const selectLoading = (state: RootState) => (state as any).admin?.analytics?.loading || false
const selectRefreshing = (state: RootState) => (state as any).admin?.analytics?.refreshing || false
const selectCache = (state: RootState) => (state as any).cache
import { setTimeRange, setAnalyticsLoading, setAnalyticsRefreshing } from '../../shell/store/slices/adminSlice'
import { setCacheData, getCacheData, isCacheValid, clearCacheType } from '../../shell/store/slices/cacheSlice'
import { analyticsService, AnalyticsOverviewData } from '../../shell/lib/AnalyticsService'
import { mdiRefresh } from '@mdi/js'

// Remove the interface since we're importing it from AnalyticsService

export default function AnalyticsOverview() {
  const dispatch = useAppDispatch()
  const timeRange = useAppSelector(selectTimeRange)
  const loading = useAppSelector(selectLoading)
  const refreshing = useAppSelector(selectRefreshing)
  const cache = useAppSelector(selectCache)
  const [data, setData] = useState<AnalyticsOverviewData | null>(null)

  const getCacheKey = useCallback(() => `analytics-overview-${timeRange}`, [timeRange])

  const fetchAnalyticsData = useCallback(async (forceRefresh = false) => {
    const cacheKey = getCacheKey()
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && isCacheValid(cache, 'analytics', cacheKey)) {
      const cachedData = getCacheData<AnalyticsOverviewData>(cache, 'analytics', cacheKey)
      if (cachedData) {
        setData(cachedData)
        return
      }
    }

    try {
      dispatch(setAnalyticsLoading(true))
      
      // Fetch data from analytics service
      const analyticsData = await analyticsService.getAnalyticsOverview(timeRange)
      setData(analyticsData)
      
      // Cache the data
      dispatch(setCacheData({
        type: 'analytics',
        key: cacheKey,
        data: analyticsData
      }))
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      dispatch(setAnalyticsLoading(false))
    }
  }, [timeRange, cache, dispatch, getCacheKey])

  const refresh = useCallback(async () => {
    dispatch(setAnalyticsRefreshing(true))
    // Clear cache for this data type to force refresh
    dispatch(clearCacheType('analytics'))
    await fetchAnalyticsData(true)
    dispatch(setAnalyticsRefreshing(false))
  }, [dispatch, fetchAnalyticsData])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])


  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
        <p className="text-gray-300">Authenticated users are excluded.</p>
        <p className="text-gray-400">Site engagement and user behavior insights.</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={refresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50"
        >
          <Icon path={mdiRefresh} className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
    </div>
  )

  if (loading) {
    return (
      <AdminLayout pageHeader={pageHeader}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon path={mdiRefresh} className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout pageHeader={pageHeader}>
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load analytics data</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout pageHeader={pageHeader}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Unique Users"
          value={data.uniqueUsers}
          trend="+12%"
          trendUp={true}
          tooltip="The number of distinct users who visited your site during the selected time period. This excludes authenticated users and focuses on anonymous visitor engagement."
        />
        <MetricCard
          title="Total Sessions"
          value={data.totalSessions}
          trend="+8%"
          trendUp={true}
          tooltip="The total number of user sessions on your site. A session begins when a user visits and ends after 30 minutes of inactivity or when they leave."
        />
        <MetricCard
          title="Page Views"
          value={data.totalPageviews}
          trend="+15%"
          trendUp={true}
          tooltip="The total number of pages viewed by all users. Each time a user loads a page, it counts as one page view."
        />
        <MetricCard
          title="Events"
          value={data.totalEvents}
          trend="+23%"
          trendUp={true}
          tooltip="The total number of custom events tracked on your site, such as button clicks, form submissions, and other user interactions."
        />
      </div>

      {/* Time Range Toolbar */}
      <div className="mb-6">
        <TimeRangeToolbar 
          selectedRange={timeRange} 
          onRangeChange={(range) => dispatch(setTimeRange(range))}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Unique Users Over Time */}
        <ChartCard 
          title="Unique Users Over Time"
          tooltip="Shows the daily count of unique users visiting your site over the selected time period. This helps identify trends in user engagement and growth patterns."
        >
          <TimeSeriesLineChart 
            data={data.uniqueUsersOverTime}
            dataKey="unique_users"
            color={CHART_COLORS.primary}
          />
        </ChartCard>

        {/* Sessions Over Time */}
        <ChartCard 
          title="Sessions Over Time"
          tooltip="Displays the daily number of user sessions. A session represents a user's visit to your site and includes all their interactions during that visit."
        >
          <TimeSeriesBarChart 
            data={data.sessionsOverTime}
            dataKey="sessions"
            color={CHART_COLORS.secondary}
          />
        </ChartCard>

        {/* Device Breakdown */}
        <ChartCard 
          title="Device Breakdown"
          tooltip="Shows the distribution of users by device type (desktop, mobile, tablet). This helps understand how users access your site and optimize for different devices."
        >
          <SimplePieChart 
            data={data.deviceBreakdown}
            dataKey="count"
            nameKey="category"
            valueKey="count"
          />
        </ChartCard>

        {/* New vs Returning Users */}
        <ChartCard 
          title="New vs Returning Users"
          tooltip="Compares the ratio of new visitors versus returning users. This metric helps gauge user retention and the effectiveness of your content in bringing back visitors."
        >
          <SimplePieChart 
            data={data.newVsReturning}
            dataKey="count"
            nameKey="type"
            valueKey="count"
          />
        </ChartCard>
      </div>

      {/* Top Pages */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Top Pages</h3>
        <div className="space-y-3">
          {data.topPages.map((page, index) => (
            <div key={page.path} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm w-6">#{index + 1}</span>
                <span className="text-white font-medium">{page.path}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-800 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(page.views / data.topPages[0].views) * 100}%` }}
                  />
                </div>
                <span className="text-gray-300 text-sm w-16 text-right">{page.views.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  )
}

// Removed MetricCard and ChartCard functions - now using reusable components
