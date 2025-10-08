import { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Icon } from '@mdi/react'
import { TimeRangeToolbar, TimeRange } from '../../components/admin/TimeRangeToolbar'
import { 
  mdiRefresh,
  mdiChevronUp,
  mdiChevronDown,
  mdiTrendingUp,
  mdiClose,
  mdiCardAccountDetailsOutline,
  mdiEye,
  mdiMouse,
  mdiPercent,
  mdiAccountGroup,
  mdiClock,
  mdiWeb
} from '@mdi/js'
import { formatDistanceToNow } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Tooltip } from '../../components/Tooltip'

interface Referrer {
  domain: string
  totalSessions: number
  totalUsers: number
  conversions: number
  avgSessionDuration: number
  bounceRate: number
  pagesPerSession: number
  lastSeen: string
  trafficShare: number
}

interface ReferrersData {
  referrers: Referrer[]
  referralTrafficOverTime: Array<{ day: string; referrals: number }>
  trafficShare: Array<{ source: string; count: number }>
  totalReferrals: number
  referralTrafficPercentage: number
  topReferrers: Array<{ domain: string; sessions: number }>
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

export default function ReferrersPage() {
  const [data, setData] = useState<ReferrersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [sortKey, setSortKey] = useState<'domain' | 'totalSessions' | 'totalUsers' | 'conversions' | 'avgSessionDuration' | 'bounceRate' | 'pagesPerSession'>('totalSessions')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [drawerReferrer, setDrawerReferrer] = useState<Referrer | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('30days')

  const fetchReferrersData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual Supabase queries
      const mockData: ReferrersData = {
        referrers: [
          {
            domain: 'google.com',
            totalSessions: 1247,
            totalUsers: 892,
            conversions: 156,
            avgSessionDuration: 245,
            bounceRate: 32.5,
            pagesPerSession: 3.2,
            lastSeen: '2024-01-07T15:30:00Z',
            trafficShare: 45.2
          },
          {
            domain: 'facebook.com',
            totalSessions: 567,
            totalUsers: 445,
            conversions: 89,
            avgSessionDuration: 180,
            bounceRate: 28.7,
            pagesPerSession: 2.8,
            lastSeen: '2024-01-07T14:20:00Z',
            trafficShare: 20.6
          },
          {
            domain: 'twitter.com',
            totalSessions: 234,
            totalUsers: 198,
            conversions: 34,
            avgSessionDuration: 195,
            bounceRate: 35.2,
            pagesPerSession: 2.5,
            lastSeen: '2024-01-07T12:15:00Z',
            trafficShare: 8.5
          },
          {
            domain: 'linkedin.com',
            totalSessions: 189,
            totalUsers: 156,
            conversions: 45,
            avgSessionDuration: 320,
            bounceRate: 22.1,
            pagesPerSession: 4.1,
            lastSeen: '2024-01-07T11:45:00Z',
            trafficShare: 6.9
          },
          {
            domain: 'reddit.com',
            totalSessions: 156,
            totalUsers: 134,
            conversions: 23,
            avgSessionDuration: 275,
            bounceRate: 41.3,
            pagesPerSession: 2.9,
            lastSeen: '2024-01-07T10:30:00Z',
            trafficShare: 5.7
          }
        ],
        referralTrafficOverTime: [
          { day: '2024-01-01', referrals: 45 },
          { day: '2024-01-02', referrals: 52 },
          { day: '2024-01-03', referrals: 38 },
          { day: '2024-01-04', referrals: 67 },
          { day: '2024-01-05', referrals: 89 },
          { day: '2024-01-06', referrals: 76 },
          { day: '2024-01-07', referrals: 94 }
        ],
        trafficShare: [
          { source: 'Google', count: 1247 },
          { source: 'Facebook', count: 567 },
          { source: 'Twitter', count: 234 },
          { source: 'LinkedIn', count: 189 },
          { source: 'Reddit', count: 156 },
          { source: 'Direct', count: 1234 },
          { source: 'Other', count: 89 }
        ],
        totalReferrals: 2393,
        referralTrafficPercentage: 65.8,
        topReferrers: [
          { domain: 'google.com', sessions: 1247 },
          { domain: 'facebook.com', sessions: 567 },
          { domain: 'twitter.com', sessions: 234 }
        ]
      }
      
      setData(mockData)
    } catch (error) {
      console.error('Failed to fetch referrers data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    await fetchReferrersData()
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
    fetchReferrersData()
  }, [])

  const breadcrumb = (
    <div className="flex items-center gap-2">
      <a href="/manage" className="text-white hover:text-gray-200">Dashboard</a>
      <span className="text-gray-400">›</span>
      <a href="/manage/analytics" className="text-white hover:text-gray-200">Analytics</a>
      <span className="text-gray-400">›</span>
      <span className="text-white">Referrers</span>
    </div>
  )

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Referrers</h1>
        <p className="text-gray-400">Traffic sources and referral analysis</p>
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
            <p className="text-gray-400">Loading referrers data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load referrers data</p>
        </div>
      </AdminLayout>
    )
  }

  const sortedReferrers = [...data.referrers].sort((a, b) => {
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
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Total Referrals"
          value={data.totalReferrals.toLocaleString()}
          icon={mdiWeb}
          trend="+12%"
          trendUp={true}
        />
        <MetricCard
          title="Referral Traffic %"
          value={`${data.referralTrafficPercentage.toFixed(1)}%`}
          icon={mdiPercent}
          trend="+3.2%"
          trendUp={true}
        />
        <MetricCard
          title="Top Referrer"
          value={data.topReferrers[0]?.domain || 'N/A'}
          icon={mdiTrendingUp}
          trend={`${data.topReferrers[0]?.sessions || 0} sessions`}
          trendUp={true}
        />
        <MetricCard
          title="Active Referrers"
          value={data.referrers.length.toString()}
          icon={mdiAccountGroup}
          trend="+2 new"
          trendUp={true}
        />
      </div>

      {/* Time Range Toolbar */}
      <div className="mb-6">
        <TimeRangeToolbar 
          selectedRange={timeRange} 
          onRangeChange={setTimeRange}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Referral Traffic Over Time */}
        <ChartCard title="Referral Traffic Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.referralTrafficOverTime}>
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
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="referrals" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Traffic Share */}
        <ChartCard title="Traffic Share by Source">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.trafficShare}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ source, percent }: any) => `${source} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.trafficShare.map((_entry, index) => (
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
        </ChartCard>
      </div>

      {/* Top 3 Referrers */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Top 3 Referrers</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.topReferrers.map((referrer, index) => (
            <div key={referrer.domain} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">#{index + 1}</span>
                  <span className="text-white font-medium">{referrer.domain}</span>
                </div>
                <div className="text-purple-400 font-semibold">{referrer.sessions.toLocaleString()}</div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(referrer.sessions / data.topReferrers[0].sessions) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Referrers Table */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                {headerCell('Referrer', 'domain')}
                {headerCell('Total Sessions', 'totalSessions')}
                {headerCell('Total Users', 'totalUsers')}
                {headerCell('Conversions', 'conversions')}
                {headerCell('Avg Session', 'avgSessionDuration')}
                {headerCell('Bounce Rate', 'bounceRate')}
                {headerCell('Pages/Session', 'pagesPerSession')}
                <th className="sticky top-0 z-10 bg-gray-800 px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedReferrers.map((referrer) => (
                <tr key={referrer.domain} className="hover:bg-gray-800/60">
                  <td className="px-3 py-2 text-white">
                    <div className="flex items-center gap-3">
                      <Icon path={mdiWeb} className="h-5 w-5 text-purple-400" />
                      <div>
                        <div className="font-medium">{referrer.domain}</div>
                        <div className="text-sm text-gray-400">{referrer.trafficShare.toFixed(1)}% of traffic</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiEye} className="h-4 w-4 text-gray-400" />
                      <span>{referrer.totalSessions.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiAccountGroup} className="h-4 w-4 text-gray-400" />
                      <span>{referrer.totalUsers.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiTrendingUp} className="h-4 w-4 text-gray-400" />
                      <span>{referrer.conversions.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiClock} className="h-4 w-4 text-gray-400" />
                      <span>{formatDuration(referrer.avgSessionDuration)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiPercent} className="h-4 w-4 text-gray-400" />
                      <span className={referrer.bounceRate > 50 ? 'text-red-400' : referrer.bounceRate > 30 ? 'text-yellow-400' : 'text-green-400'}>
                        {referrer.bounceRate.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-white text-center">
                    <div className="flex items-center gap-2">
                      <Icon path={mdiMouse} className="h-4 w-4 text-gray-400" />
                      <span>{referrer.pagesPerSession.toFixed(1)}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Tooltip content="View referrer details">
                      <button 
                        className="p-2 rounded hover:bg-gray-800" 
                        aria-label="View details"
                        onClick={() => setDrawerReferrer(referrer)}
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

      {/* Referrer Detail Drawer */}
      {drawerReferrer && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerReferrer(null)} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[480px] bg-gray-900 border-l border-gray-800 shadow-xl overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="text-white font-semibold">Referrer Details</div>
              <Tooltip content="Close details">
                <button className="p-2 rounded hover:bg-gray-800" onClick={() => setDrawerReferrer(null)} aria-label="Close">
                  <Icon path={mdiClose} className="h-5 w-5 text-white" />
                </button>
              </Tooltip>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <div className="text-xs text-gray-300">Referrer Domain</div>
                <div className="text-white font-medium">{drawerReferrer.domain}</div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Total Sessions" value={drawerReferrer.totalSessions.toLocaleString()} />
                <Field label="Total Users" value={drawerReferrer.totalUsers.toLocaleString()} />
                <Field label="Conversions" value={drawerReferrer.conversions.toLocaleString()} />
                <Field label="Avg Session Duration" value={formatDuration(drawerReferrer.avgSessionDuration)} />
                <Field label="Bounce Rate" value={`${drawerReferrer.bounceRate.toFixed(1)}%`} />
                <Field label="Pages per Session" value={drawerReferrer.pagesPerSession.toFixed(1)} />
                <Field label="Traffic Share" value={`${drawerReferrer.trafficShare.toFixed(1)}%`} />
                <Field label="Last Seen" value={formatDistanceToNow(new Date(drawerReferrer.lastSeen), { addSuffix: true })} />
              </div>
              
              {/* Performance Indicators */}
              <div>
                <div className="text-sm font-semibold text-white mb-3">Performance Indicators</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-300">Conversion Rate</span>
                    <span className="text-white font-medium">
                      {((drawerReferrer.conversions / drawerReferrer.totalSessions) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-300">Sessions per User</span>
                    <span className="text-white font-medium">
                      {(drawerReferrer.totalSessions / drawerReferrer.totalUsers).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <span className="text-sm text-gray-300">Quality Score</span>
                    <span className={`font-medium ${
                      drawerReferrer.bounceRate < 30 ? 'text-green-400' : 
                      drawerReferrer.bounceRate < 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {drawerReferrer.bounceRate < 30 ? 'Excellent' : 
                       drawerReferrer.bounceRate < 50 ? 'Good' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp 
}: { 
  title: string
  value: string
  icon: string
  trend: string
  trendUp: boolean
}) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="flex items-center gap-2">
          <Icon path={icon} className="h-8 w-8 text-purple-500" />
          <span className={`text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div className="text-xs text-gray-300">{label}</div>
      <div className="text-white break-words">{value || ''}</div>
    </div>
  )
}
