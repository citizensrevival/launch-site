import React, { useEffect, useState } from 'react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { Icon } from '@mdi/react'
import { TimeRangeToolbar, TimeRange } from '../../components/admin/TimeRangeToolbar'
import { 
  mdiAccountGroup,
  mdiEye,
  mdiMouse,
  mdiTrendingUp,
  mdiRefresh
} from '@mdi/js'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

interface AnalyticsData {
  uniqueUsers: number
  totalSessions: number
  totalPageviews: number
  totalEvents: number
  uniqueUsersOverTime: Array<{ day: string; unique_users: number }>
  sessionsOverTime: Array<{ day: string; sessions: number }>
  topPages: Array<{ path: string; views: number }>
  deviceBreakdown: Array<{ category: string; count: number }>
  newVsReturning: Array<{ type: string; count: number }>
}

const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

export default function AnalyticsOverview() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [timeRange, setTimeRange] = useState<TimeRange>('30days')

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual Supabase queries
      // For now, using mock data
      const mockData: AnalyticsData = {
        uniqueUsers: 1247,
        totalSessions: 2156,
        totalPageviews: 8943,
        totalEvents: 3421,
        uniqueUsersOverTime: [
          { day: '2024-01-01', unique_users: 45 },
          { day: '2024-01-02', unique_users: 52 },
          { day: '2024-01-03', unique_users: 38 },
          { day: '2024-01-04', unique_users: 67 },
          { day: '2024-01-05', unique_users: 89 },
          { day: '2024-01-06', unique_users: 76 },
          { day: '2024-01-07', unique_users: 94 }
        ],
        sessionsOverTime: [
          { day: '2024-01-01', sessions: 78 },
          { day: '2024-01-02', sessions: 89 },
          { day: '2024-01-03', sessions: 65 },
          { day: '2024-01-04', sessions: 112 },
          { day: '2024-01-05', sessions: 134 },
          { day: '2024-01-06', sessions: 98 },
          { day: '2024-01-07', sessions: 145 }
        ],
        topPages: [
          { path: '/', views: 2341 },
          { path: '/about', views: 892 },
          { path: '/contact', views: 567 },
          { path: '/events', views: 445 },
          { path: '/volunteer', views: 334 }
        ],
        deviceBreakdown: [
          { category: 'desktop', count: 1247 },
          { category: 'mobile', count: 678 },
          { category: 'tablet', count: 231 }
        ],
        newVsReturning: [
          { type: 'New Users', count: 892 },
          { type: 'Returning Users', count: 355 }
        ]
      }
      
      setData(mockData)
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refresh = async () => {
    setRefreshing(true)
    await fetchAnalyticsData()
    setRefreshing(false)
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [])

  const breadcrumb = (
    <div className="flex items-center gap-2">
      <a href="/manage" className="text-white hover:text-gray-200">Dashboard</a>
      <span className="text-gray-400">›</span>
      <span className="text-white">Analytics</span>
    </div>
  )

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics Overview</h1>
        <p className="text-gray-400">Site engagement and user behavior insights</p>
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
            <p className="text-gray-400">Loading analytics data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!data) {
    return (
      <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load analytics data</p>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout breadcrumb={breadcrumb} pageHeader={pageHeader}>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Unique Users"
          value={data.uniqueUsers.toLocaleString()}
          icon={mdiAccountGroup}
          trend="+12%"
          trendUp={true}
        />
        <MetricCard
          title="Total Sessions"
          value={data.totalSessions.toLocaleString()}
          icon={mdiEye}
          trend="+8%"
          trendUp={true}
        />
        <MetricCard
          title="Page Views"
          value={data.totalPageviews.toLocaleString()}
          icon={mdiMouse}
          trend="+15%"
          trendUp={true}
        />
        <MetricCard
          title="Events"
          value={data.totalEvents.toLocaleString()}
          icon={mdiTrendingUp}
          trend="+23%"
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
        {/* Unique Users Over Time */}
        <ChartCard title="Unique Users Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.uniqueUsersOverTime}>
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
              <Line 
                type="monotone" 
                dataKey="unique_users" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Sessions Over Time */}
        <ChartCard title="Sessions Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.sessionsOverTime}>
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
              <Bar dataKey="sessions" fill="#06B6D4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Device Breakdown */}
        <ChartCard title="Device Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.deviceBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.deviceBreakdown.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
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

        {/* New vs Returning Users */}
        <ChartCard title="New vs Returning Users">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.newVsReturning}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percent }: any) => `${type} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {data.newVsReturning.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
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
