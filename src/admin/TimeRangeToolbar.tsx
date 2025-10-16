import { Icon } from '@mdi/react';
import { mdiCalendarToday, mdiCalendarWeek, mdiCalendarMonth, mdiCalendar, mdiRefresh } from '@mdi/js';

export type TimeRange = 'today' | '7days' | '30days' | 'year';

interface TimeRangeToolbarProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  className?: string;
}

const timeRangeOptions = [
  { value: 'today' as TimeRange, label: 'Today', icon: mdiCalendarToday },
  { value: '7days' as TimeRange, label: 'Last 7 Days', icon: mdiCalendarWeek },
  { value: '30days' as TimeRange, label: 'Last 30 Days', icon: mdiCalendarMonth },
  { value: 'year' as TimeRange, label: 'Last Year', icon: mdiCalendar },
];

export function TimeRangeToolbar({ 
  selectedRange, 
  onRangeChange, 
  onRefresh, 
  refreshing = false, 
  className = '' 
}: TimeRangeToolbarProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="text-sm text-gray-300 mr-2">Time Range:</div>
      <div className="flex items-center gap-1">
        {timeRangeOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => onRangeChange(option.value)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
              selectedRange === option.value
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
            }`}
          >
            <Icon path={option.icon} className="h-4 w-4" />
            <span>{option.label}</span>
          </button>
        ))}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white disabled:opacity-50"
          >
            <Icon path={mdiRefresh} className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
}

export function getTimeRangeDates(range: TimeRange): { start: Date; end: Date } {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  
  switch (range) {
    case 'today': {
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      return { start: startToday, end };
    }
    
    case '7days': {
      const start7Days = new Date(end);
      start7Days.setDate(start7Days.getDate() - 6);
      start7Days.setHours(0, 0, 0, 0);
      return { start: start7Days, end };
    }
    
    case '30days': {
      const start30Days = new Date(end);
      start30Days.setDate(start30Days.getDate() - 29);
      start30Days.setHours(0, 0, 0, 0);
      return { start: start30Days, end };
    }
    
    case 'year': {
      const startYear = new Date(end);
      startYear.setFullYear(startYear.getFullYear() - 1);
      startYear.setHours(0, 0, 0, 0);
      return { start: startYear, end };
    }
    
    default:
      return { start: new Date(), end: new Date() };
  }
}
