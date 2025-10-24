import { createContext, useContext, useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store/hooks'
import { setColorTheme } from '../store/slices/sessionSlice'

type ColorTheme = 'purple' | 'green' | 'blue' | 'amber' | 'rose'

interface ThemeContextType {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return default values during SSR to prevent hydration mismatch
    if (typeof window === 'undefined') {
      return {
        colorTheme: 'purple' as ColorTheme,
        setColorTheme: () => {}
      }
    }
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  disableTransitionOnChange?: boolean
}

export function ThemeProvider({ 
  children, 
  disableTransitionOnChange = false 
}: ThemeProviderProps) {
  const dispatch = useAppDispatch()
  const colorTheme = useAppSelector((state) => state.session.colorTheme)
  const [colorThemeState, setColorThemeState] = useState<ColorTheme>('purple')

  // Set color theme using Redux and apply to document
  const handleSetColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme)
    dispatch(setColorTheme(newColorTheme))
    
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement
      
      if (disableTransitionOnChange) {
        root.style.setProperty('--color-transition', 'none')
      }
      
      // Remove existing color theme classes
      root.classList.remove('purple', 'green', 'blue', 'amber', 'rose')
      
      // Apply new color theme
      root.classList.add(newColorTheme)
      
      // Re-enable transitions after a brief delay
      if (disableTransitionOnChange) {
        setTimeout(() => {
          root.style.removeProperty('--color-transition')
        }, 0)
      }
    }
  }

  // Initialize color theme from Redux state
  useEffect(() => {
    if (typeof window === 'undefined') return

    setColorThemeState(colorTheme)
    
    // Apply initial color theme
    const root = window.document.documentElement
    root.classList.remove('purple', 'green', 'blue', 'amber', 'rose')
    root.classList.add(colorTheme)
  }, [colorTheme])

  return (
    <ThemeContext.Provider value={{ colorTheme: colorThemeState, setColorTheme: handleSetColorTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
