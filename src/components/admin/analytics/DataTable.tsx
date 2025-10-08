import React from 'react'
import { Icon } from '@mdi/react'
import { mdiChevronUp, mdiChevronDown } from '@mdi/js'

// ================================================
// Data Table Types
// ================================================

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  className?: string
  width?: string
}

export interface DataTableProps<T = any> {
  data: T[]
  columns: TableColumn<T>[]
  sortKey?: keyof T
  sortDirection?: 'asc' | 'desc'
  onSort?: (key: keyof T) => void
  loading?: boolean
  emptyMessage?: string
  className?: string
  rowClassName?: (row: T, index: number) => string
  onRowClick?: (row: T) => void
}

// ================================================
// Data Table Component
// ================================================

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  sortKey,
  sortDirection = 'asc',
  onSort,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
  rowClassName,
  onRowClick
}: DataTableProps<T>) {
  const handleSort = (key: keyof T) => {
    if (onSort) {
      onSort(key)
    }
  }

  const getSortIcon = (columnKey: keyof T) => {
    if (sortKey !== columnKey) return null
    
    return (
      <Icon 
        path={sortDirection === 'asc' ? mdiChevronUp : mdiChevronDown} 
        className="h-3 w-3" 
      />
    )
  }

  if (loading) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-800 overflow-hidden ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className={`bg-gray-900 rounded-lg border border-gray-800 overflow-hidden ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-gray-400">{emptyMessage}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-900 rounded-lg border border-gray-800 overflow-hidden ${className}`}>
      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead>
            <tr>
              {columns.map((column) => (
                <th 
                  key={String(column.key)}
                  className={`sticky top-0 z-10 bg-gray-800 px-3 py-2 text-left text-xs font-semibold text-white uppercase tracking-wider ${
                    column.className || ''
                  }`}
                  style={{ width: column.width }}
                >
                  {column.sortable ? (
                    <button 
                      className="inline-flex items-center gap-1 hover:text-white transition-colors" 
                      onClick={() => handleSort(column.key)}
                    >
                      <span>{column.label}</span>
                      {getSortIcon(column.key)}
                    </button>
                  ) : (
                    <span>{column.label}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data.map((row, index) => (
              <tr 
                key={index}
                className={`hover:bg-gray-800/60 transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${rowClassName ? rowClassName(row, index) : ''}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((column) => (
                  <td 
                    key={String(column.key)}
                    className={`px-3 py-2 text-white ${column.className || ''}`}
                  >
                    {column.render 
                      ? column.render(row[column.key], row)
                      : String(row[column.key] || '')
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ================================================
// Common Table Column Renderers
// ================================================

export const TableRenderers = {
  // Date renderer
  date: (value: string | Date) => {
    const date = new Date(value)
    return (
      <div className="flex items-center gap-2">
        <span>{date.toLocaleDateString()}</span>
        <span className="text-gray-400 text-xs">
          {date.toLocaleTimeString()}
        </span>
      </div>
    )
  },

  // Relative time renderer
  relativeTime: (value: string | Date) => {
    const date = new Date(value)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    
    let relativeTime: string
    if (diffDays > 0) {
      relativeTime = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else if (diffHours > 0) {
      relativeTime = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffMinutes > 0) {
      relativeTime = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    } else {
      relativeTime = 'Just now'
    }
    
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-300">{relativeTime}</span>
      </div>
    )
  },

  // Number with formatting
  number: (value: number, options?: { decimals?: number; suffix?: string }) => {
    const { decimals = 0, suffix = '' } = options || {}
    return (
      <span className="text-white font-mono">
        {value.toLocaleString(undefined, { 
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals 
        })}{suffix}
      </span>
    )
  },

  // Percentage renderer
  percentage: (value: number, decimals: number = 1) => {
    return (
      <span className="text-white font-mono">
        {value.toFixed(decimals)}%
      </span>
    )
  },

  // Status badge renderer
  statusBadge: (value: string, type: 'success' | 'warning' | 'error' | 'info' = 'info') => {
    const colors = {
      success: 'bg-green-100 text-green-800',
      warning: 'bg-yellow-100 text-yellow-800',
      error: 'bg-red-100 text-red-800',
      info: 'bg-blue-100 text-blue-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}>
        {value}
      </span>
    )
  },

  // Boolean renderer with icons
  boolean: (value: boolean, trueLabel = 'Yes', falseLabel = 'No') => {
    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-white">{value ? trueLabel : falseLabel}</span>
      </div>
    )
  },

  // Link renderer
  link: (value: string, label?: string) => {
    return (
      <a 
        href={value} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-purple-300 hover:text-purple-200 underline"
      >
        {label || value}
      </a>
    )
  },

  // Truncated text renderer
  truncated: (value: string, maxLength: number = 50) => {
    const truncated = value.length > maxLength ? value.substring(0, maxLength) + '...' : value
    return (
      <span className="text-white" title={value}>
        {truncated}
      </span>
    )
  }
}
