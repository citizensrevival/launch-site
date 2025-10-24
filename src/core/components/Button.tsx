import clsx from 'clsx'
import { Link } from 'react-router-dom'
import { useTheme } from './contexts/ThemeContext'
import { useAnalytics } from './contexts/AnalyticsContext'

export function Button({
  className,
  arrow,
  children,
  to,
  ...props
}: { arrow?: boolean; to?: string } & (
  | React.ComponentPropsWithoutRef<'a'>
  | ({ href?: undefined } & React.ComponentPropsWithoutRef<'button'>)
)) {
  const theme = useTheme()
  const { trackEvent } = useAnalytics()
  const colorTheme = theme?.colorTheme || 'purple'
  
  // Get theme-specific colors for main content area
  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-400/30',
          text: 'text-emerald-900',
          hover: 'hover:bg-emerald-500/30'
        }
      case 'blue':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-400/30',
          text: 'text-blue-900',
          hover: 'hover:bg-blue-500/30'
        }
      case 'amber':
        return {
          bg: 'bg-amber-500/20',
          border: 'border-amber-400/30',
          text: 'text-amber-900',
          hover: 'hover:bg-amber-500/30'
        }
      case 'rose':
        return {
          bg: 'bg-rose-500/20',
          border: 'border-rose-400/30',
          text: 'text-rose-900',
          hover: 'hover:bg-rose-500/30'
        }
      default: // purple
        return {
          bg: 'bg-purple-500/20',
          border: 'border-purple-400/30',
          text: 'text-purple-900',
          hover: 'hover:bg-purple-500/30'
        }
    }
  }
  
  const themeColors = getThemeColors(colorTheme)
  
  className = clsx(
    className,
    'group relative isolate flex-none rounded-md py-1.5 text-[0.8125rem]/6 font-semibold no-underline',
    // Default to theme colors (main content)
    themeColors.bg,
    themeColors.border,
    themeColors.text,
    themeColors.hover,
    // Override for sidebar - clean white styling with white text
    'sidebar:!bg-white/15 sidebar:!backdrop-blur-sm sidebar:!border-white/40 sidebar:!text-white sidebar:!hover:bg-white/25 sidebar:!hover:border-white/50',
    arrow ? 'pl-2.5 pr-[calc(9/16*1rem)]' : 'px-2.5',
  )

  const handleClick = async () => {
    // Track button click
    await trackEvent('button_clicked', children?.toString() || 'Button', {
      button_text: children?.toString(),
      destination: to,
      has_arrow: arrow
    })
  }

  if (to) {
    return (
      <Link to={to} className={className} onClick={handleClick}>
        {children} {arrow ? <span aria-hidden="true">&rarr;</span> : null}
      </Link>
    )
  }

  return typeof props.href === 'undefined' ? (
    <button className={className} onClick={handleClick} {...(props as React.ComponentPropsWithoutRef<'button'>)}>
      {children} {arrow ? <span aria-hidden="true">&rarr;</span> : null}
    </button>
  ) : (
    <a className={className} onClick={handleClick} {...(props as React.ComponentPropsWithoutRef<'a'>)}>
      {children} {arrow ? <span aria-hidden="true">&rarr;</span> : null}
    </a>
  )
}
