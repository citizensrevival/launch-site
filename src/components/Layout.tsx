import { useId } from 'react'

import { Intro, IntroFooter } from './Intro'
import { ColorThemeToggle } from './ThemeToggle'
import { Menu } from './Menu'
import { useTheme } from '../contexts/ThemeContext'

function Timeline() {
  let id = useId()
  let theme = useTheme()
  let colorTheme = theme?.colorTheme || 'purple'

  const getTimelineColor = (theme: string) => {
    switch (theme) {
      case 'green':
        return 'stroke-emerald-900/10'
      case 'blue':
        return 'stroke-blue-900/10'
      case 'amber':
        return 'stroke-amber-900/10'
      case 'rose':
        return 'stroke-rose-900/10'
      default: // purple
        return 'stroke-purple-900/10'
    }
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-lg lg:overflow-visible">
      <svg
        className="absolute top-0 left-[max(0px,calc(50%-18.125rem))] h-full w-1.5 lg:left-full lg:ml-1 xl:right-1 xl:left-auto xl:ml-0"
        aria-hidden="true"
      >
        <defs>
          <pattern id={id} width="6" height="8" patternUnits="userSpaceOnUse">
            <path
              d="M0 0H6M0 8H6"
              className={`${getTimelineColor(colorTheme)} xl:stroke-white/10`}
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${id})`} />
      </svg>
    </div>
  )
}

function Glow() {
  let id = useId()
  let theme = useTheme()
  let colorTheme = theme?.colorTheme || 'purple'

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          bg: 'bg-emerald-950',
          gradient1: 'rgba(4, 120, 87, 0.3)',
          gradient2: 'rgba(2, 78, 59, 0.09)'
        }
      case 'blue':
        return {
          bg: 'bg-blue-950',
          gradient1: 'rgba(37, 99, 235, 0.3)',
          gradient2: 'rgba(23, 78, 166, 0.09)'
        }
      case 'amber':
        return {
          bg: 'bg-amber-950',
          gradient1: 'rgba(245, 158, 11, 0.3)',
          gradient2: 'rgba(180, 83, 9, 0.09)'
        }
      case 'rose':
        return {
          bg: 'bg-rose-950',
          gradient1: 'rgba(225, 29, 72, 0.3)',
          gradient2: 'rgba(159, 18, 57, 0.09)'
        }
      default: // purple
        return {
          bg: 'bg-purple-950',
          gradient1: 'rgba(147, 51, 234, 0.3)',
          gradient2: 'rgba(88, 28, 135, 0.09)'
        }
    }
  }

  const colors = getThemeColors(colorTheme)

  return (
    <div className={`absolute inset-0 -z-10 overflow-hidden ${colors.bg} lg:right-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-lg`}>
      <svg
        className="absolute -bottom-48 left-[-40%] h-320 w-[180%] lg:top-[-40%] lg:-right-40 lg:bottom-auto lg:left-auto lg:h-[180%] lg:w-7xl"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${id}-desktop`} cx="100%">
            <stop offset="0%" stopColor={colors.gradient1} />
            <stop offset="53.95%" stopColor={colors.gradient2} />
            <stop offset="100%" stopColor="rgba(10, 14, 23, 0)" />
          </radialGradient>
          <radialGradient id={`${id}-mobile`} cy="100%">
            <stop offset="0%" stopColor={colors.gradient1} />
            <stop offset="53.95%" stopColor={colors.gradient2} />
            <stop offset="100%" stopColor="rgba(10, 14, 23, 0)" />
          </radialGradient>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill={`url(#${id}-desktop)`}
          className="hidden lg:block"
        />
        <rect
          width="100%"
          height="100%"
          fill={`url(#${id}-mobile)`}
          className="lg:hidden"
        />
      </svg>
      <div className="absolute inset-x-0 right-0 bottom-0 h-px bg-white mix-blend-overlay lg:top-0 lg:left-auto lg:h-auto lg:w-px" style={{ mixBlendMode: 'overlay' }} />
    </div>
  )
}

function FixedSidebar({
  main,
  footer,
}: {
  main: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div className="sidebar relative flex-none overflow-hidden px-6 lg:pointer-events-none lg:fixed lg:inset-0 lg:z-40 lg:flex lg:px-0">
      <Glow />
      <div className="relative flex w-full lg:pointer-events-auto lg:mr-[calc(max(2rem,50%-38rem)+40rem)] lg:min-w-lg lg:overflow-x-hidden lg:overflow-y-auto lg:pl-[max(4rem,calc(50%-38rem))]">
        <div className="mx-auto max-w-lg lg:mx-0 lg:flex lg:w-96 lg:max-w-none lg:flex-col lg:before:flex-1 lg:before:pt-6">
          <div className="pt-20 pb-16 sm:pt-32 sm:pb-20 lg:py-20">
            <div className="relative">
              {main}
            </div>
          </div>
          <div className="flex flex-1 items-end justify-center pb-4 lg:justify-start lg:pb-6">
            <div className="flex flex-col items-center lg:items-start space-y-4">
              <div className="flex items-center space-x-4">
                {footer}
                <Menu />
                <ColorThemeToggle />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <FixedSidebar 
        main={<Intro />} 
        footer={<IntroFooter />} 
      />
      
      <div className="main-content relative flex-auto">
        <Timeline />
        <main className="space-y-20 py-20 sm:space-y-32 sm:py-32">
          {children}
        </main>
      </div>
    </>
  )
}
