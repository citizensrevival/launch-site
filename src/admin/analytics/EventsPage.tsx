import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Icon } from '@mdi/react'
import { TimeRangeToolbar, TimeRange } from '../../components/admin/TimeRangeToolbar'
import { useAppSelector, useAppDispatch } from '../../store/hooks'
import { setCacheData, getCacheData, isCacheValid, clearCacheType } from '../../store/slices/cacheSlice'
import { 
  mdiTrendingUp,
  mdiRefresh,
  mdiChevronUp,
  mdiChevronDown,
  mdiAccountGroup,
  mdiPercent,
  mdiMouse,
  mdiFormTextbox,
  mdiVideo,
  mdiDownload
} from '@mdi/js'
import { formatDistanceToNow } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

interface Event {
  name: string
  label: string
  count: number
  uniqueUsers: number
  conversionRate: number
  lastOccurred: string
}

interface EventsData {
  events: Event[]
  eventTrends: Array<{ day: string; [key: string]: number | string }>
  topEvents: Array<{ name: string; count: number }>
}

export default function EventsPage() {
  const dispatch = useAppDispatch()
  const cache = useAppSelector((state) => state.cache)
  const [data, setData] = useState<EventsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sortKey, setSortKey] = useState<'name' | 'count' | 'uniqueUsers' | 'conversionRate' | 'lastOccurred'>('count')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [timeRange, setTimeRange] = useState<TimeRange>('30days')

  const getCacheKey = () => `analytics-events-${timeRange}`

  const fetchEventsData = async (forceRefresh = false) => {
    const cacheKey = getCacheKey()
    
    // Check cache first (unless force refresh)
    if (!forceRefresh && isCacheValid(cache, 'analytics', cacheKey)) {
      const cachedData = getCacheData<EventsData>(cache, 'analytics', cacheKey)
      if (cachedData) {
        setData(cachedData)
        setLoading(false)
        return
      }
    }

    try {
      setLoading(true)
      // TODO: Replace with actual Supabase queries
      const mockData: EventsData = {
        events: [
          {
            name: 'lead_form_submitted',
            label: 'Lead Form Submitted',
            count: 234,
            uniqueUsers: 189,
            conversionRate: 15.2,
            lastOccurred: '2024-01-07T16:30:00Z'
          },
          {
            name: 'cta_click',
            label: 'CTA Clicked',
            count: 567,
            uniqueUsers: 445,
            conversionRate: 8.7,
            lastOccurred: '2024-01-07T15:45:00Z'
          },
          {
            name: 'video_play',
            label: 'Video Played',
            count: 123,
            uniqueUsers: 98,
            conversionRate: 12.3,
            lastOccurred: '2024-01-07T14:20:00Z'
          },
          {
            name: 'download_started',
            label: 'Download Started',
            count: 89,
            uniqueUsers: 76,
            conversionRate: 18.9,
            lastOccurred: '2024-01-07T13:15:00Z'
          }
        ],
        eventTrends: [
          { day: '2024-01-01', lead_form_submitted: 12, cta_click: 45, video_play: 8, download_started: 5 } as any,
          { day: '2024-01-02', lead_form_submitted: 18, cta_click: 52, video_play: 12, download_started: 7 } as any,
          { day: '2024-01-03', lead_form_submitted: 15, cta_click: 38, video_play: 6, download_started: 4 } as any,
          { day: '2024-01-04', lead_form_submitted: 22, cta_click: 67, video_play: 15, download_started: 9 } as any,
          { day: '2024-01-05', lead_form_submitted: 28, cta_click: 89, video_play: 18, download_started: 12 } as any,
          { day: '2024-01-06', lead_form_submitted: 24, cta_click: 76, video_play: 14, download_started: 8 } as any,
          { day: '2024-01-07', lead_form_submitted: 31, cta_click: 95, video_play: 20, download_started: 15 } as any
        ],
        topEvents: [
          { name: 'CTA Clicked', count: 567 },
          { name: 'Lead Form Submitted', count: 234 },
          { name: 'Video Played', count: 123 },
          { name: 'Download Started', count: 89 }
        ]
      }
      
      setData(mockData)
      
      // Cache the data
      dispatch(setCacheData({
        type: 'analytics',
        key: cacheKey,
        data: mockData
      }))
    } catch (error) {
      console.error('Failed to fetch events data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    // Clear cache for this data type to force refresh
    dispatch(clearCacheType('analytics'))
    await fetchEventsData(true)
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
    fetchEventsData()
  }, [timeRange])

  const breadcrumb = (
    <div className="flex items-center gap-2">
      <a href="/manage" className="text-white hover:text-gray-200">Dashboard</a>
      <span className="text-gray-400">›</span>
      <a href="/manage/analytics" className="text-white hover:text-gray-200">Analytics</a>
      <span className="text-gray-400">›</span>
      <span className="text-white">Events</span>
    </div>
  )

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Events</h1>
        <p className="text-gray-400">User interactions and conversion tracking</p>
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
            <p className="text-gray-400">Loading events data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load events data</p>
        </div>
      </AdminLayout>
    )
  }

  const sortedEvents = [...data.events].sort((a, b) => {
    const aVal = a[sortKey]
    const bVal = b[sortKey]
    const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    return sortDirection === 'asc' ? comparison : -comparison
  })

  const getEventIcon = (name: string) => {
    switch (name) {
      case 'lead_form_submitted': return mdiFormTextbox
      case 'cta_click': return mdiMouse
      case 'video_play': return mdiVideo
      case 'download_started': return mdiDownload
      default: return mdiTrendingUp
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
      {/* Time Range Toolbar */}
      <div className="mb-6">
        <TimeRangeToolbar 
          selectedRange={timeRange} 
          onRangeChange={setTimeRange}
          onRefresh={refresh}
          refreshing={refreshing}
        />
      </div>

      {/* Event Trends Chart */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Event Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data.eventTrends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="day" 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Line type="monotone" dataKey="lead_form_submitted" stroke="#8B5CF6" strokeWidth={2} name="Lead Form Submitted" />
            <Line type="monotone" dataKey="cta_click" stroke="#06B6D4" strokeWidth={2} name="CTA Clicked" />
            <Line type="monotone" dataKey="video_play" stroke="#10B981" strokeWidth={2} name="Video Played" />
            <Line type="monotone" dataKey="download_started" stroke="#F59E0B" strokeWidth={2} name="Download Started" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Events Chart */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Top Events</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.topEvents}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1F2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#F9FAFB'
              }}
            />
            <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Events Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                {headerCell('Event', 'name')}
                {headerCell('Count', 'count')}
                {headerCell('Unique Users', 'uniqueUsers')}
                {headerCell('Conversion Rate', 'conversionRate')}
                {headerCell('Last Occurred', 'lastOccurred')}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedEvents.map((event) => (
                <tr key={event.name} className="hover:bg-gray-800/60">
                  <td className="px-3 py-2 text-white">
                    <div className="flex items-center gap-3">
                      <Icon path={getEventIcon(event.name)} className="h-5 w-5 text-purple-400" />
                      <div>
                        <div className="font-medium">{event.label}</div>
                        <div className="text-sm text-gray-400 font-mono">{event.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiTrendingUp} className="h-4 w-4 text-gray-400" />
                      <span>{event.count.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiAccountGroup} className="h-4 w-4 text-gray-400" />
                      <span>{event.uniqueUsers.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiPercent} className="h-4 w-4 text-gray-400" />
                      <span>{event.conversionRate.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiTrendingUp} className="h-4 w-4 text-gray-400" />
                      <span>{formatDistanceToNow(new Date(event.lastOccurred), { addSuffix: true })}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
