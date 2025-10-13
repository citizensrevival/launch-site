import { Icon } from '@mdi/react'
import { mdiRefresh, mdiCalendar } from '@mdi/js'
import { TimeRange } from '../../shell/store/slices/adminSlice'

export interface TimeRangeToolbarProps {
  selectedRange: TimeRange
  onRangeChange: (range: TimeRange) => void
  onRefresh?: () => void
  refreshing?: boolean
  className?: string
  showRefresh?: boolean
}

const TIME_RANGE_OPTIONS: Array<{ value: TimeRange; label: string }> = [
  { value: 'today', label: 'Today' },
  { value: '7days', label: 'Last 7 days' },
  { value: '30days', label: 'Last 30 days' },
  { value: 'year', label: 'This year' }
]

export function TimeRangeToolbar({ 
  selectedRange, 
  onRangeChange, 
  onRefresh, 
  refreshing,
  className = '',
  showRefresh = false
}: TimeRangeToolbarProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-2">
        <Icon path={mdiCalendar} className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-300">Time Range:</span>
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onRangeChange(option.value)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                selectedRange === option.value
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {showRefresh && onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-3 py-2 text-sm text-white hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          <Icon path={mdiRefresh} className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      )}
    </div>
  )
}
