'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return default values during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return {
        theme: 'system' as Theme,
        resolvedTheme: 'light' as const,
        setTheme: () => {}
      }
    }
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  attribute?: string
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ 
  children, 
  disableTransitionOnChange = false 
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>('system')

  // Get system theme preference
  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window === 'undefined') return 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  // Get resolved theme (actual theme being applied)
  const resolvedTheme = theme === 'system' ? getSystemTheme() : theme

  // Set theme in localStorage and apply to document
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    localStorage.setItem('theme', newTheme)
    
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      if (disableTransitionOnChange) {
        root.style.setProperty('--color-transition', 'none')
      }
      
      // Remove existing theme classes
      root.classList.remove('light', 'dark')
      
      // Apply new theme
      if (newTheme === 'system') {
        const systemTheme = getSystemTheme()
        root.classList.add(systemTheme)
      } else {
        root.classList.add(newTheme)
      }
      
      // Re-enable transitions after a brief delay
      if (disableTransitionOnChange) {
        setTimeout(() => {
          root.style.removeProperty('--color-transition')
        }, 0)
      }
    }
  }

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    if (typeof window === 'undefined') return

    const storedTheme = localStorage.getItem('theme') as Theme | null
    const initialTheme = storedTheme || 'system'
    
    setThemeState(initialTheme)
    
    // Apply initial theme
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    
    if (initialTheme === 'system') {
      const systemTheme = getSystemTheme()
      root.classList.add(systemTheme)
    } else {
      root.classList.add(initialTheme)
    }
  }, [])

  // Listen for system theme changes when using 'system' theme
  useEffect(() => {
    if (typeof window === 'undefined' || theme !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = () => {
      if (theme === 'system') {
        const root = window.document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(getSystemTheme())
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
