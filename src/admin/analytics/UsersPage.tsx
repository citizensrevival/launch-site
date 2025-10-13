import { useEffect, useState, useCallback } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Icon } from '@mdi/react'
import { TimeRangeToolbar } from '../../components/admin/analytics/TimeRangeToolbar'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setCacheData, getCacheData, isCacheValid, clearCacheType } from '../../store/slices/cacheSlice'
import { setAnalyticsLoading, setAnalyticsRefreshing, setTimeRange } from '../../store/slices/adminSlice'
import { analyticsService, UsersData, AnalyticsUser, AnalyticsSession } from '../../lib/AnalyticsService'
import { 
  mdiRefresh,
  mdiChevronUp,
  mdiChevronDown,
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
  mdiTablet,
  mdiAccountMinus,
  mdiAccountPlus
} from '@mdi/js'
import { formatDistanceToNow } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Tooltip } from '../../components/Tooltip'

// Using UsersData from AnalyticsService

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

export default function UsersPage() {
  const dispatch = useAppDispatch()
  const cache = useAppSelector((state) => (state as any).cache)
  const timeRange = useAppSelector((state) => (state as any).admin?.timeRange || '30days')
  const loading = useAppSelector((state) => (state as any).admin?.analytics?.loading || false)
  const refreshing = useAppSelector((state) => (state as any).admin?.analytics?.refreshing || false)
  const [data, setData] = useState<UsersData | null>(null)
  const [sortKey, setSortKey] = useState<'firstSeenAt' | 'lastSeenAt' | 'sessions' | 'avgDuration' | 'anonId' | 'hasLead'>('lastSeenAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [drawerUser, setDrawerUser] = useState<AnalyticsUser | null>(null)
  const [selectedSession, setSelectedSession] = useState<AnalyticsSession | null>(null)
  const [excludedUsers, setExcludedUsers] = useState<Set<string>>(new Set())
  const [excludingUsers, setExcludingUsers] = useState<Set<string>>(new Set())

  const getCacheKey = useCallback(() => `analytics-users-${timeRange}`, [timeRange])

  const fetchUsersData = useCallback(async (forceRefresh = false) => {
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
  }, [timeRange, cache, dispatch, getCacheKey])

  const refresh = useCallback(async () => {
    dispatch(setAnalyticsRefreshing(true))
    // Clear cache for this data type to force refresh
    dispatch(clearCacheType('analytics'))
    await fetchUsersData(true)
    await loadExcludedUsers()
    dispatch(setAnalyticsRefreshing(false))
  }, [dispatch, fetchUsersData])

  const loadExcludedUsers = useCallback(async () => {
    try {
      const excluded = await analyticsService.getExcludedUsers()
      const excludedUserIds = new Set(excluded.map(e => e.userId).filter((id): id is string => Boolean(id)))
      setExcludedUsers(excludedUserIds)
    } catch (error) {
      console.error('Failed to load excluded users:', error)
    }
  }, [])

  const handleExcludeUser = useCallback(async (user: AnalyticsUser) => {
    if (excludingUsers.has(user.id)) return

    setExcludingUsers(prev => new Set(prev).add(user.id))
    
    try {
      const result = await analyticsService.excludeUser(
        user.id,
        undefined,
        undefined,
        user.anonId,
        'Manual exclusion from admin panel',
        'admin'
      )

      if (result.success) {
        setExcludedUsers(prev => new Set(prev).add(user.id))
        // Refresh data to reflect exclusion
        await fetchUsersData(true)
      } else {
        console.error('Failed to exclude user:', result.error)
        alert(`Failed to exclude user: ${result.error}`)
      }
    } catch (error) {
      console.error('Error excluding user:', error)
      alert('Error excluding user')
    } finally {
      setExcludingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(user.id)
        return newSet
      })
    }
  }, [excludingUsers, fetchUsersData])

  const handleRemoveExclusion = useCallback(async (user: AnalyticsUser) => {
    if (excludingUsers.has(user.id)) return

    setExcludingUsers(prev => new Set(prev).add(user.id))
    
    try {
      const result = await analyticsService.removeExclusion(
        user.id,
        undefined,
        undefined,
        user.anonId
      )

      if (result.success) {
        setExcludedUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(user.id)
          return newSet
        })
        // Refresh data to reflect removal
        await fetchUsersData(true)
      } else {
        console.error('Failed to remove exclusion:', result.error)
        alert(`Failed to remove exclusion: ${result.error}`)
      }
    } catch (error) {
      console.error('Error removing exclusion:', error)
      alert('Error removing exclusion')
    } finally {
      setExcludingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(user.id)
        return newSet
      })
    }
  }, [excludingUsers, fetchUsersData])

  const changeSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  useEffect(() => {
    fetchUsersData()
    loadExcludedUsers()
  }, [fetchUsersData, loadExcludedUsers])

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

  const sortedUsers = [...(data.users || [])].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getDeviceIcon = (deviceCategory: string) => {
    switch (deviceCategory) {
      case 'desktop':
        return mdiMonitor
      case 'mobile':
        return mdiCellphone
      case 'tablet':
        return mdiTablet
      default:
        return mdiMonitor
    }
  }

  const handleSessionClick = (session: any) => {
    setSelectedSession(session)
  }

  const headerCell = (label: string, key: typeof sortKey) => (
    <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider">
      <button 
        className="inline-flex items-center gap-1 hover:text-white" 
        onClick={() => changeSort(key)}
      >
        <span>{label}</span>
        {sortKey === key ? (
          <Icon path={sortDirection === 'asc' ? mdiChevronUp : mdiChevronDown} className="h-3 w-3" />
        ) : null}
      </button>
    </th>
  )

  return (
    <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
      {/* Time Range Toolbar */}
      <div className="mb-6">
        <TimeRangeToolbar 
          selectedRange={timeRange} 
          onRangeChange={(range) => dispatch(setTimeRange(range))}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* New Users Over Time */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">New Users Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.newUsersOverTime || []}>
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
        </div>

        {/* New vs Returning Users */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">New vs Returning Users</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.newVsReturning || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }: any) => `${type} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {(data.newVsReturning || []).map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                {headerCell('User ID', 'anonId')}
                {headerCell('First Visit', 'firstSeenAt')}
                {headerCell('Last Visit', 'lastSeenAt')}
                {headerCell('Sessions', 'sessions')}
                {headerCell('Avg Duration', 'avgDuration')}
                {headerCell('Lead Submitted', 'hasLead')}
                <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-800/60">
                  <td className="px-3 py-2 text-white font-mono text-sm">
                    {user.anonId}
                  </td>
                  <td className="px-3 py-2 text-white">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiCalendar} className="h-4 w-4 text-gray-400" />
                      <span>{formatDistanceToNow(new Date(user.firstSeenAt), { addSuffix: true })}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiClock} className="h-4 w-4 text-gray-400" />
                      <span>{formatDistanceToNow(new Date(user.lastSeenAt), { addSuffix: true })}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    {user.sessions}
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    {formatDuration(user.avgDuration)}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <Icon 
                      path={user.hasLead ? mdiCheckCircle : mdiCloseCircle} 
                      className={`h-5 w-5 ${user.hasLead ? 'text-green-400' : 'text-red-400'}`} 
                    />
                  </td>
                  <td className="px-3 py-2 text-right">
                    <div className="flex items-center gap-2">
                      {excludedUsers.has(user.id) ? (
                        <Tooltip content="Remove from exclusions">
                          <button 
                            className="p-2 rounded hover:bg-gray-800 disabled:opacity-50" 
                            aria-label="Remove exclusion"
                            disabled={excludingUsers.has(user.id)}
                            onClick={() => handleRemoveExclusion(user)}
                          >
                            <Icon path={mdiAccountPlus} className="h-5 w-5 text-green-400" />
                          </button>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Exclude from analytics">
                          <button 
                            className="p-2 rounded hover:bg-gray-800 disabled:opacity-50" 
                            aria-label="Exclude user"
                            disabled={excludingUsers.has(user.id)}
                            onClick={() => handleExcludeUser(user)}
                          >
                            <Icon path={mdiAccountMinus} className="h-5 w-5 text-red-400" />
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip content="View user details">
                        <button 
                          className="p-2 rounded hover:bg-gray-800" 
                          aria-label="View details"
                          onClick={() => setDrawerUser(user)}
                        >
                          <Icon path={mdiCardAccountDetailsOutline} className="h-5 w-5 text-white" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Detail Drawer */}
      {drawerUser && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerUser(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-gray-900 border-l border-gray-800 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="text-white font-semibold">User Details</div>
              <Tooltip content="Close details">
                <button className="p-2 rounded hover:bg-gray-800" onClick={() => setDrawerUser(null)} aria-label="Close">
                  <Icon path={mdiClose} className="h-5 w-5 text-white" />
                </button>
              </Tooltip>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-300">User ID</div>
                <div className="text-white font-mono text-sm">{drawerUser.anonId}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Seen" value={new Date(drawerUser.firstSeenAt).toLocaleString()} />
                <Field label="Last Seen" value={new Date(drawerUser.lastSeenAt).toLocaleString()} />
                <Field label="Total Sessions" value={drawerUser.sessions.toString()} />
                <Field label="Avg Duration" value={formatDuration(drawerUser.avgDuration)} />
                <Field label="Lead Submitted" value={drawerUser.hasLead ? 'Yes' : 'No'} />
                <Field label="Device Category" value={drawerUser.deviceCategory} />
                <Field label="Browser" value={drawerUser.browserName} />
                <Field label="Operating System" value={drawerUser.osName} />
                <Field label="Country" value={drawerUser.geoCountry} />
                <Field label="City" value={drawerUser.geoCity} />
                <Field label="First Referrer" value={drawerUser.firstReferrer} isLink={drawerUser.firstReferrer} />
                <Field label="Last Referrer" value={drawerUser.lastReferrer} isLink={drawerUser.lastReferrer} />
                <Field label="First UTM Source" value={drawerUser.firstUtmSource} />
                <Field label="Last UTM Source" value={drawerUser.lastUtmSource} />
              </div>
              
              {/* User Sessions */}
              {drawerUser.userSessions && drawerUser.userSessions.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-white mb-3">User Sessions</div>
                  <div className="space-y-2">
                    {(drawerUser.userSessions || []).map((session) => (
                      <div
                        key={session.id}
                        className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 cursor-pointer transition-colors"
                        onClick={() => handleSessionClick(session)}
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

      {/* Session Detail Drawer */}
      {selectedSession && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedSession(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-gray-900 border-l border-gray-800 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="text-white font-semibold">Session Details</div>
              <Tooltip content="Close details">
                <button className="p-2 rounded hover:bg-gray-800" onClick={() => setSelectedSession(null)} aria-label="Close">
                  <Icon path={mdiClose} className="h-5 w-5 text-white" />
                </button>
              </Tooltip>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-300">Session ID</div>
                <div className="text-white font-mono text-sm">{selectedSession.id}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Started At" value={new Date(selectedSession.startedAt).toLocaleString()} />
                <Field label="Ended At" value={selectedSession.endedAt ? new Date(selectedSession.endedAt).toLocaleString() : 'Still active'} />
                <Field label="Duration" value={formatDuration(selectedSession.duration)} />
                <Field label="Pageviews" value={selectedSession.pageviews.toString()} />
                <Field label="Events" value={selectedSession.events.toString()} />
                <Field label="Landing Page" value={selectedSession.landingPage} isLink={selectedSession.landingPage} />
                <Field label="Device Category" value={selectedSession.deviceCategory} />
                <Field label="Country" value={selectedSession.geoCountry} />
                <Field label="City" value={selectedSession.geoCity} />
              </div>
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
