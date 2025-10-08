import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Icon } from '@mdi/react'
import { TimeRangeToolbar, TimeRange } from '../../components/admin/TimeRangeToolbar'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setCacheData, getCacheData, isCacheValid, clearCacheType } from '../../store/slices/cacheSlice'
import { 
  mdiEye,
  mdiRefresh,
  mdiChevronUp,
  mdiChevronDown,
  mdiCalendar,
  mdiClock,
  mdiMouse,
  mdiMapMarker,
  mdiMonitor,
  mdiCellphone,
  mdiTablet,
  mdiClose,
  mdiCardAccountDetailsOutline
} from '@mdi/js'
import { formatDistanceToNow } from 'date-fns'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Tooltip } from '../../components/Tooltip'

interface Session {
  id: string
  userId: string
  startedAt: string
  endedAt?: string
  duration: number
  pageviews: number
  events: number
  landingPage: string
  referrer?: string
  deviceCategory: string
  browserName: string
  osName: string
  geoCountry?: string
  geoCity?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  ipAddress?: string
  userAgent?: string
}

interface SessionsData {
  sessions: Session[]
  sessionsPerUser: Array<{ sessions: number; users: number }>
  avgSessionLength: number
  avgPagesPerSession: number
}

export default function SessionsPage() {
  const dispatch = useAppDispatch()
  const cache = useAppSelector((state) => state.cache)
  const [data, setData] = useState<SessionsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sortKey, setSortKey] = useState<'startedAt' | 'duration' | 'pageviews' | 'events' | 'id' | 'userId' | 'deviceCategory' | 'geoCountry'>('startedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [drawerSession, setDrawerSession] = useState<Session | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30days')

  const getCacheKey = () => `analytics-sessions-${timeRange}`

  const fetchSessionsData = async (forceRefresh = false) => {
    const cacheKey = getCacheKey()
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && isCacheValid(cache, 'analytics', cacheKey)) {
      const cachedData = getCacheData<SessionsData>(cache, 'analytics', cacheKey)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }
    }

    try {
      setLoading(true)
      // TODO: Replace with actual Supabase queries
      const mockData: SessionsData = {
        sessions: [
          {
            id: 'session_1',
            userId: 'anon_abc123',
            startedAt: '2024-01-07T10:00:00Z',
            endedAt: '2024-01-07T10:15:00Z',
            duration: 900,
            pageviews: 5,
            events: 3,
            landingPage: 'https://example.com/',
            referrer: 'https://google.com',
            deviceCategory: 'desktop',
            browserName: 'Chrome',
            osName: 'Windows',
            geoCountry: 'US',
            geoCity: 'New York',
            utmSource: 'google',
            utmMedium: 'cpc',
            utmCampaign: 'brand',
            ipAddress: '192.168.1.1',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          {
            id: 'session_2',
            userId: 'anon_def456',
            startedAt: '2024-01-07T14:20:00Z',
            endedAt: '2024-01-07T14:35:00Z',
            duration: 900,
            pageviews: 3,
            events: 1,
            landingPage: 'https://example.com/about',
            referrer: 'https://facebook.com',
            deviceCategory: 'mobile',
            browserName: 'Safari',
            osName: 'iOS',
            geoCountry: 'CA',
            geoCity: 'Toronto',
            utmSource: 'facebook',
            utmMedium: 'social',
            utmCampaign: 'awareness',
            ipAddress: '192.168.1.2',
            userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
          }
        ],
        sessionsPerUser: [
          { sessions: 1, users: 45 },
          { sessions: 2, users: 32 },
          { sessions: 3, users: 28 },
          { sessions: 4, users: 15 },
          { sessions: 5, users: 8 }
        ],
        avgSessionLength: 245,
        avgPagesPerSession: 3.2
      }
      
      setData(mockData)
      
      // Cache the data
      dispatch(setCacheData({
        type: 'analytics',
        key: cacheKey,
        data: mockData
      }))
    } catch (error) {
      console.error('Failed to fetch sessions data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    // Clear cache for this data type to force refresh
    dispatch(clearCacheType('analytics'))
    await fetchSessionsData(true)
    setRefreshing(false)
  }

  const changeSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  useEffect(() => {
    fetchSessionsData()
  }, [timeRange])

  const breadcrumb = (
    <div className="flex items-center gap-2">
      <a href="/manage" className="text-white hover:text-gray-200">Dashboard</a>
      <span className="text-gray-400">›</span>
      <a href="/manage/analytics" className="text-white hover:text-gray-200">Analytics</a>
      <span className="text-gray-400">›</span>
      <span className="text-white">Sessions</span>
    </div>
  )

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Sessions</h1>
        <p className="text-gray-400">Session analysis and user behavior patterns</p>
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
            <p className="text-gray-400">Loading sessions data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load sessions data</p>
        </div>
      </AdminLayout>
    )
  }

  const sortedSessions = [...data.sessions].sort((a, b) => {
    const aVal = a[sortKey] ?? ''
    const bVal = b[sortKey] ?? ''
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getDeviceIcon = (category: string) => {
    switch (category) {
      case 'desktop': return mdiMonitor
      case 'mobile': return mdiCellphone
      case 'tablet': return mdiTablet
      default: return mdiMonitor
    }
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
      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Sessions</p>
              <p className="text-2xl font-bold text-white">{data.sessions.length}</p>
            </div>
            <Icon path={mdiEye} className="h-8 w-8 text-purple-500" />
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Session Length</p>
              <p className="text-2xl font-bold text-white">{formatDuration(data.avgSessionLength)}</p>
            </div>
            <Icon path={mdiClock} className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Pages per Session</p>
              <p className="text-2xl font-bold text-white">{data.avgPagesPerSession}</p>
            </div>
            <Icon path={mdiMouse} className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Time Range Toolbar */}
      <div className="mb-6">
        <TimeRangeToolbar 
          selectedRange={timeRange} 
          onRangeChange={setTimeRange}
          onRefresh={refresh}
          refreshing={refreshing}
        />
      </div>

      {/* Sessions per User Chart */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Sessions per User Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.sessionsPerUser}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="sessions" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Bar dataKey="users" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sessions Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                {headerCell('Session ID', 'id')}
                {headerCell('User ID', 'userId')}
                {headerCell('Started', 'startedAt')}
                {headerCell('Duration', 'duration')}
                {headerCell('Pageviews', 'pageviews')}
                {headerCell('Events', 'events')}
                {headerCell('Device', 'deviceCategory')}
                {headerCell('Location', 'geoCountry')}
                <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedSessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-800/60">
                  <td className="px-3 py-2 text-white font-mono text-sm">
                    {session.id}
                  </td>
                  <td className="px-3 py-2 text-white font-mono text-sm">
                    {session.userId}
                  </td>
                  <td className="px-3 py-2 text-white">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiCalendar} className="h-4 w-4 text-gray-400" />
                      <span>{formatDistanceToNow(new Date(session.startedAt), { addSuffix: true })}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    {formatDuration(session.duration)}
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    {session.pageviews}
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    {session.events}
                  </td>
                  <td className="px-3 py-2 text-white">
                    <div className="flex items-center gap-2">
                      <Icon path={getDeviceIcon(session.deviceCategory)} className="h-4 w-4 text-gray-400" />
                      <span className="capitalize">{session.deviceCategory}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiMapMarker} className="h-4 w-4 text-gray-400" />
                      <span>{session.geoCity}, {session.geoCountry}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Tooltip content="View session details">
                      <button 
                        className="p-2 rounded hover:bg-gray-800" 
                        aria-label="View details"
                        onClick={() => setDrawerSession(session)}
                      >
                        <Icon path={mdiCardAccountDetailsOutline} className="h-5 w-5 text-white" />
                      </button>
                    </Tooltip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Detail Drawer */}
      {drawerSession && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerSession(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-gray-900 border-l border-gray-800 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="text-white font-semibold">Session Details</div>
              <Tooltip content="Close details">
                <button className="p-2 rounded hover:bg-gray-800" onClick={() => setDrawerSession(null)} aria-label="Close">
                  <Icon path={mdiClose} className="h-5 w-5 text-white" />
                </button>
              </Tooltip>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-300">Session ID</div>
                <div className="text-white font-mono text-sm">{drawerSession.id}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="User ID" value={drawerSession.userId} />
                <Field label="Started At" value={new Date(drawerSession.startedAt).toLocaleString()} />
                <Field label="Ended At" value={drawerSession.endedAt ? new Date(drawerSession.endedAt).toLocaleString() : 'Still active'} />
                <Field label="Duration" value={formatDuration(drawerSession.duration)} />
                <Field label="Pageviews" value={drawerSession.pageviews.toString()} />
                <Field label="Events" value={drawerSession.events.toString()} />
                <Field label="Landing Page" value={drawerSession.landingPage} isLink={drawerSession.landingPage} />
                <Field label="Referrer" value={drawerSession.referrer} isLink={drawerSession.referrer} />
                <Field label="Device Category" value={drawerSession.deviceCategory} />
                <Field label="Browser" value={drawerSession.browserName} />
                <Field label="Operating System" value={drawerSession.osName} />
                <Field label="Country" value={drawerSession.geoCountry} />
                <Field label="City" value={drawerSession.geoCity} />
                <Field label="UTM Source" value={drawerSession.utmSource} />
                <Field label="UTM Medium" value={drawerSession.utmMedium} />
                <Field label="UTM Campaign" value={drawerSession.utmCampaign} />
                <Field label="IP Address" value={drawerSession.ipAddress} />
              </div>
              <div>
                <div className="text-xs text-gray-300 mb-1">User Agent</div>
                <div className="bg-gray-800 text-white text-xs rounded p-3 overflow-auto">
                  {drawerSession.userAgent}
                </div>
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
