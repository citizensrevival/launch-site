'use client'

import { useEffect, useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

type ColorTheme = 'purple' | 'green' | 'blue' | 'amber' | 'rose'

const colorThemes: { theme: ColorTheme; color: string; bgColor: string }[] = [
  { theme: 'purple', color: '#7C3AED', bgColor: 'bg-purple-950' },
  { theme: 'green', color: '#047857', bgColor: 'bg-emerald-950' },
  { theme: 'blue', color: '#2563EB', bgColor: 'bg-blue-950' },
  { theme: 'amber', color: '#F59E0B', bgColor: 'bg-amber-950' },
  { theme: 'rose', color: '#E11D48', bgColor: 'bg-rose-950' },
]

function ColorIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
      <circle cx="12" cy="12" r="10" fill={color} />
    </svg>
  )
}

export function ColorThemeToggle() {
  let [mounted, setMounted] = useState(false)
  let theme = useTheme()
  let colorTheme = theme?.colorTheme || 'purple'
  let setColorTheme = theme?.setColorTheme || (() => {})

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="absolute top-4 right-4 z-50 flex gap-2">
      {colorThemes.map(({ theme, color }) => (
        <button
          key={theme}
          type="button"
          className={`cursor-pointer group -m-1 p-1 rounded-md transition-all ${
            colorTheme === theme
              ? 'bg-white/20 backdrop-blur-sm -webkit-backdrop-filter-blur-sm'
              : 'hover:bg-white/10'
          }`}
          onClick={() => setColorTheme(theme)}
          title={`Switch to ${theme} theme`}
        >
          <span className="sr-only">Switch to {theme} theme</span>
          <ColorIcon color={color} />
        </button>
      ))}
    </div>
  )
}
