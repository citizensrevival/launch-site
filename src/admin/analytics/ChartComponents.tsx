import React, { useState, useRef, useEffect } from 'react'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { Icon } from '@mdi/react'
import { mdiInformation } from '@mdi/js'

// ================================================
// Chart Color Palette
// ================================================

export const CHART_COLORS = {
  primary: '#8B5CF6',
  secondary: '#06B6D4', 
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  purple: '#8B5CF6',
  cyan: '#06B6D4',
  green: '#10B981',
  yellow: '#F59E0B',
  red: '#EF4444',
  blue: '#3B82F6'
}

export const CHART_COLOR_PALETTE = [
  CHART_COLORS.primary,
  CHART_COLORS.secondary,
  CHART_COLORS.success,
  CHART_COLORS.warning,
  CHART_COLORS.danger,
  CHART_COLORS.info
]

// ================================================
// Common Chart Props
// ================================================

export interface BaseChartProps {
  data: any[]
  height?: number
  className?: string
}

export interface TimeSeriesChartProps extends BaseChartProps {
  dataKey: string
  xAxisKey?: string
  color?: string
  showDots?: boolean
  strokeWidth?: number
}

export interface BarChartProps extends BaseChartProps {
  dataKey: string
  xAxisKey?: string
  color?: string
  radius?: number[]
}

export interface PieChartProps extends BaseChartProps {
  dataKey: string
  nameKey: string
  valueKey: string
  colors?: string[]
  showLabel?: boolean
  labelKey?: string
}

// ================================================
// Reusable Chart Components
// ================================================

export function TimeSeriesLineChart({ 
  data, 
  dataKey, 
  xAxisKey = 'day',
  height = 300,
  color = CHART_COLORS.primary,
  showDots = true,
  strokeWidth = 2,
  className = ''
}: TimeSeriesChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey={xAxisKey}
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
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={strokeWidth}
            dot={showDots ? { fill: color, strokeWidth: 2, r: 4 } : false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TimeSeriesBarChart({ 
  data, 
  dataKey, 
  xAxisKey = 'day',
  height = 300,
  color = CHART_COLORS.primary,
  radius = [4, 4, 0, 0],
  className = ''
}: BarChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey={xAxisKey}
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
          <Bar dataKey={dataKey} fill={color} radius={radius as [number, number, number, number]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SimpleBarChart({ 
  data, 
  dataKey, 
  xAxisKey = 'name',
  height = 300,
  color = CHART_COLORS.primary,
  radius = [4, 4, 0, 0],
  className = ''
}: BarChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey={xAxisKey}
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
          <Bar dataKey={dataKey} fill={color} radius={radius as [number, number, number, number]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SimplePieChart({ 
  data, 
  valueKey = 'value',
  height = 300,
  colors = CHART_COLOR_PALETTE,
  showLabel = true,
  labelKey = 'name',
  className = ''
}: PieChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={showLabel ? ({ [labelKey]: name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%` : false}
            outerRadius={80}
            fill="#8884d8"
            dataKey={valueKey}
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
    </div>
  )
}

// ================================================
// Multi-Line Time Series Chart
// ================================================

export interface MultiLineChartProps extends BaseChartProps {
  lines: Array<{
    dataKey: string
    name: string
    color: string
    strokeWidth?: number
  }>
  xAxisKey?: string
}

export function MultiLineTimeSeriesChart({ 
  data, 
  lines,
  xAxisKey = 'day',
  height = 300,
  className = ''
}: MultiLineChartProps) {
  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey={xAxisKey}
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
          {lines.map((line, index) => (
            <Line
              key={index}
              type="monotone"
              dataKey={line.dataKey}
              stroke={line.color}
              strokeWidth={line.strokeWidth || 2}
              name={line.name}
              dot={{ fill: line.color, strokeWidth: 2, r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ================================================
// Chart Card Wrapper
// ================================================

export interface ChartCardProps {
  title: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
  tooltip?: string
}

export function ChartCard({ title, children, className = '', actions, tooltip }: ChartCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLButtonElement>(null)

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false)
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTooltip])

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowTooltip(!showTooltip)
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 p-6 relative ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="flex items-center gap-2">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          {/* Information Icon */}
          {tooltip && (
            <button
              ref={iconRef}
              onClick={handleIconClick}
              className="text-gray-400 hover:text-gray-300 transition-colors"
              aria-label="Show information"
            >
              <Icon path={mdiInformation} className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      {children}

      {/* Tooltip Bubble */}
      {showTooltip && tooltip && (
        <div
          ref={tooltipRef}
          className="absolute top-12 right-3 z-50 bg-gray-800 text-white text-sm rounded-lg shadow-lg border border-gray-700 p-3 max-w-xs"
          style={{ minWidth: '200px' }}
        >
          <div className="relative">
            {tooltip}
            {/* Arrow pointing up to the icon */}
            <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ================================================
// Metric Card Component
// ================================================

export interface MetricCardProps {
  title: string
  value: string | number
  icon?: string
  trend?: string
  trendUp?: boolean
  tooltip?: string
  className?: string
}

export function MetricCard({ 
  title, 
  value, 
  icon, 
  trend, 
  trendUp, 
  tooltip,
  className = '' 
}: MetricCardProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLButtonElement>(null)

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false)
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTooltip])

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowTooltip(!showTooltip)
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 p-6 relative ${className}`}>
      {/* Information Icon */}
      {tooltip && (
        <button
          ref={iconRef}
          onClick={handleIconClick}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-300 transition-colors"
          aria-label="Show information"
        >
          <Icon path={mdiInformation} className="h-4 w-4" />
        </button>
      )}

      {/* Main Content */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
        </div>
        {icon && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 text-purple-500 flex items-center justify-center">
              {/* Icon would be rendered here */}
            </div>
            {trend && (
              <span className={`text-sm font-medium ${trendUp ? 'text-green-400' : 'text-red-400'}`}>
                {trend}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Tooltip Bubble */}
      {showTooltip && tooltip && (
        <div
          ref={tooltipRef}
          className="absolute top-12 right-3 z-50 bg-gray-800 text-white text-sm rounded-lg shadow-lg border border-gray-700 p-3 max-w-xs"
          style={{ minWidth: '200px' }}
        >
          <div className="relative">
            {tooltip}
            {/* Arrow pointing up to the icon */}
            <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ================================================
// Chart Tooltip Wrapper Component
// ================================================

export interface ChartTooltipWrapperProps {
  title: string
  children: React.ReactNode
  tooltip?: string
  className?: string
}

export function ChartTooltipWrapper({ title, children, tooltip, className = '' }: ChartTooltipWrapperProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLButtonElement>(null)

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setShowTooltip(false)
      }
    }

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showTooltip])

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowTooltip(!showTooltip)
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 p-6 relative ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {/* Information Icon */}
        {tooltip && (
          <button
            ref={iconRef}
            onClick={handleIconClick}
            className="text-gray-400 hover:text-gray-300 transition-colors"
            aria-label="Show information"
          >
            <Icon path={mdiInformation} className="h-4 w-4" />
          </button>
        )}
      </div>
      {children}

      {/* Tooltip Bubble */}
      {showTooltip && tooltip && (
        <div
          ref={tooltipRef}
          className="absolute top-12 right-3 z-50 bg-gray-800 text-white text-sm rounded-lg shadow-lg border border-gray-700 p-3 max-w-xs"
          style={{ minWidth: '200px' }}
        >
          <div className="relative">
            {tooltip}
            {/* Arrow pointing up to the icon */}
            <div className="absolute -top-2 right-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  )
}

// ================================================
// Progress Bar Component
// ================================================

export interface ProgressBarProps {
  value: number
  max: number
  color?: string
  showValue?: boolean
  className?: string
}

export function ProgressBar({ 
  value, 
  max, 
  color = CHART_COLORS.primary, 
  showValue = true,
  className = '' 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-300">Progress</span>
        {showValue && (
          <span className="text-sm text-gray-300">{value.toLocaleString()}</span>
        )}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  )
}
