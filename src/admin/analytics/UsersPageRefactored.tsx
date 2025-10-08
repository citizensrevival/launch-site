import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Icon } from '@mdi/react'
import { TimeRangeToolbar } from '../../components/admin/analytics/TimeRangeToolbar'
import { ChartCard, TimeSeriesLineChart, SimplePieChart, CHART_COLORS } from '../../components/admin/analytics/ChartComponents'
import { DataTable, TableColumn } from '../../components/admin/analytics/DataTable'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import type { RootState } from '../../store'

// Create typed selectors to avoid TypeScript issues
const selectTimeRange = (state: RootState) => (state as any).admin.timeRange
const selectUsersState = (state: RootState) => (state as any).admin.analytics.users
const selectLoading = (state: RootState) => (state as any).admin.analytics.loading
const selectRefreshing = (state: RootState) => (state as any).admin.analytics.refreshing
const selectCache = (state: RootState) => (state as any).cache
import { setCacheData, getCacheData, isCacheValid, clearCacheType } from '../../store/slices/cacheSlice'
import { 
  setAnalyticsUsersSort,
  setAnalyticsUsersSelectedUser,
  setAnalyticsLoading,
  setAnalyticsRefreshing
} from '../../store/slices/adminSlice'
import { analyticsService, UsersData, AnalyticsUser } from '../../lib/AnalyticsService'
import { 
  mdiRefresh,
  mdiCalendar,
  mdiClock,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiClose,
  mdiCardAccountDetailsOutline,
  mdiEye,
  mdiMouse,
  mdiMapMarker,
  mdiMonitor,
  mdiCellphone,
  mdiTablet
} from '@mdi/js'
import { formatDistanceToNow } from 'date-fns'
import { Tooltip } from '../../components/Tooltip'

export default function UsersPage() {
  const dispatch = useAppDispatch()
  const cache = useAppSelector(selectCache)
  const timeRange = useAppSelector(selectTimeRange)
  const usersState = useAppSelector(selectUsersState)
  const loading = useAppSelector(selectLoading)
  const refreshing = useAppSelector(selectRefreshing)
  
  const [data, setData] = useState<UsersData | null>(null)
  const [selectedUser, setSelectedUser] = useState<AnalyticsUser | null>(null)

  const getCacheKey = () => `analytics-users-${timeRange}`

  const fetchUsersData = async (forceRefresh = false) => {
    const cacheKey = getCacheKey()
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && isCacheValid(cache, 'analytics', cacheKey)) {
      const cachedData = getCacheData<UsersData>(cache, 'analytics', cacheKey)
      if (cachedData) {
        setData(cachedData)
        return
      }
    }

    try {
      dispatch(setAnalyticsLoading(true))
      
      // Fetch data from analytics service
      const usersData = await analyticsService.getUsersData(timeRange)
      setData(usersData)
      
      // Cache the data
      dispatch(setCacheData({
        type: 'analytics',
        key: cacheKey,
        data: usersData
      }))
    } catch (error) {
      console.error('Failed to fetch users data:', error)
    } finally {
      dispatch(setAnalyticsLoading(false))
    }
  }

  const refresh = async () => {
    dispatch(setAnalyticsRefreshing(true))
    dispatch(clearCacheType('analytics'))
    await fetchUsersData(true)
    dispatch(setAnalyticsRefreshing(false))
  }

  const handleSort = (key: keyof AnalyticsUser) => {
    dispatch(setAnalyticsUsersSort({ 
      key: key as any, 
      direction: usersState.sortKey === key && usersState.sortDirection === 'asc' ? 'desc' : 'asc' 
    }))
  }

  const handleUserClick = (user: AnalyticsUser) => {
    setSelectedUser(user)
    dispatch(setAnalyticsUsersSelectedUser(user.id))
  }

  useEffect(() => {
    fetchUsersData()
  }, [timeRange])

  const breadcrumb = (
    <div className="flex items-center gap-2">
      <a href="/manage" className="text-white hover:text-gray-200">Dashboard</a>
      <span className="text-gray-400">›</span>
      <a href="/manage/analytics" className="text-white hover:text-gray-200">Analytics</a>
      <span className="text-gray-400">›</span>
      <span className="text-white">Users</span>
    </div>
  )

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-gray-400">User engagement and behavior analysis</p>
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
      <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Icon path={mdiRefresh} className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading users data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load users data</p>
        </div>
      </AdminLayout>
    )
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getDeviceIcon = (deviceCategory: string) => {
    switch (deviceCategory) {
      case 'desktop': return mdiMonitor
      case 'mobile': return mdiCellphone
      case 'tablet': return mdiTablet
      default: return mdiMonitor
    }
  }

  // Define table columns
  const columns: TableColumn<AnalyticsUser>[] = [
    {
      key: 'anonId',
      label: 'User ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm text-white">{value}</span>
      )
    },
    {
      key: 'firstSeenAt',
      label: 'First Visit',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Icon path={mdiCalendar} className="h-4 w-4 text-gray-400" />
          <span>{formatDistanceToNow(new Date(value), { addSuffix: true })}</span>
        </div>
      )
    },
    {
      key: 'lastSeenAt',
      label: 'Last Visit',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Icon path={mdiClock} className="h-4 w-4 text-gray-400" />
          <span>{formatDistanceToNow(new Date(value), { addSuffix: true })}</span>
        </div>
      )
    },
    {
      key: 'sessions',
      label: 'Sessions',
      sortable: true,
      render: (value) => (
        <span className="text-white text-center">{value}</span>
      )
    },
    {
      key: 'avgDuration',
      label: 'Avg Duration',
      sortable: true,
      render: (value) => (
        <span className="text-white text-center">{formatDuration(value)}</span>
      )
    },
    {
      key: 'hasLead',
      label: 'Lead Submitted',
      sortable: true,
      render: (value) => (
        <div className="flex justify-center">
          <Icon 
            path={value ? mdiCheckCircle : mdiCloseCircle} 
            className={`h-5 w-5 ${value ? 'text-green-400' : 'text-red-400'}`} 
          />
        </div>
      )
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex justify-end">
          <Tooltip content="View user details">
            <button 
              className="p-2 rounded hover:bg-gray-800" 
              aria-label="View details"
              onClick={() => handleUserClick(row)}
            >
              <Icon path={mdiCardAccountDetailsOutline} className="h-5 w-5 text-white" />
            </button>
          </Tooltip>
        </div>
      )
    }
  ]

  return (
    <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
      {/* Time Range Toolbar */}
      <div className="mb-6">
        <TimeRangeToolbar 
          selectedRange={timeRange} 
          onRangeChange={(range) => {
            // TODO: Handle range change
            console.log('Range changed to:', range)
          }}
          onRefresh={refresh}
          refreshing={refreshing}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* New Users Over Time */}
        <ChartCard title="New Users Over Time">
          <TimeSeriesLineChart 
            data={data.newUsersOverTime}
            dataKey="new_users"
            color={CHART_COLORS.primary}
          />
        </ChartCard>

        {/* New vs Returning Users */}
        <ChartCard title="New vs Returning Users">
          <SimplePieChart 
            data={data.newVsReturning}
            dataKey="count"
            nameKey="type"
            valueKey="count"
          />
        </ChartCard>
      </div>

      {/* Users Table */}
      <DataTable
        data={data.users}
        columns={columns}
        sortKey={usersState.sortKey}
        sortDirection={usersState.sortDirection}
        onSort={handleSort}
        loading={loading}
        onRowClick={handleUserClick}
      />

      {/* User Detail Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedUser(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-gray-900 border-l border-gray-800 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="text-white font-semibold">User Details</div>
              <Tooltip content="Close details">
                <button className="p-2 rounded hover:bg-gray-800" onClick={() => setSelectedUser(null)} aria-label="Close">
                  <Icon path={mdiClose} className="h-5 w-5 text-white" />
                </button>
              </Tooltip>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-300">User ID</div>
                <div className="text-white font-mono text-sm">{selectedUser.anonId}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Seen" value={new Date(selectedUser.firstSeenAt).toLocaleString()} />
                <Field label="Last Seen" value={new Date(selectedUser.lastSeenAt).toLocaleString()} />
                <Field label="Total Sessions" value={selectedUser.sessions.toString()} />
                <Field label="Avg Duration" value={formatDuration(selectedUser.avgDuration)} />
                <Field label="Lead Submitted" value={selectedUser.hasLead ? 'Yes' : 'No'} />
                <Field label="Device Category" value={selectedUser.deviceCategory} />
                <Field label="Browser" value={selectedUser.browserName} />
                <Field label="Operating System" value={selectedUser.osName} />
                <Field label="Country" value={selectedUser.geoCountry} />
                <Field label="City" value={selectedUser.geoCity} />
                <Field label="First Referrer" value={selectedUser.firstReferrer} isLink={selectedUser.firstReferrer} />
                <Field label="Last Referrer" value={selectedUser.lastReferrer} isLink={selectedUser.lastReferrer} />
                <Field label="First UTM Source" value={selectedUser.firstUtmSource} />
                <Field label="Last UTM Source" value={selectedUser.lastUtmSource} />
              </div>
              
              {/* User Sessions */}
              {selectedUser.userSessions && selectedUser.userSessions.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-white mb-3">User Sessions</div>
                  <div className="space-y-2">
                    {selectedUser.userSessions.map((session) => (
                      <div
                        key={session.id}
                        className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon path={getDeviceIcon(session.deviceCategory)} className="h-4 w-4 text-gray-400" />
                            <span className="text-white font-mono text-sm">{session.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <Icon path={mdiEye} className="h-3 w-3" />
                            <span>{session.pageviews}</span>
                            <Icon path={mdiMouse} className="h-3 w-3" />
                            <span>{session.events}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <div className="flex items-center gap-2">
                            <Icon path={mdiCalendar} className="h-3 w-3" />
                            <span>{formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Icon path={mdiClock} className="h-3 w-3" />
                            <span>{formatDuration(session.duration)}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-400 truncate">
                          {session.landingPage}
                        </div>
                        {session.geoCity && session.geoCountry && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Icon path={mdiMapMarker} className="h-3 w-3" />
                            <span>{session.geoCity}, {session.geoCountry}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function Field({ label, value, isLink }: { label: string; value?: string | null; isLink?: string }) {
  return (
    <div>
      <div className="text-xs text-gray-300">{label}</div>
      <div className="text-white break-words">
        {value ? (
          isLink ? <a className="text-purple-300 hover:text-purple-200" href={isLink} target="_blank" rel="noreferrer">{value}</a> : value
        ) : ''}
      </div>
    </div>
  )
}
