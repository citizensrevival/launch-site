import { useId } from 'react'

import { Button } from './Button'
import { useTheme } from '../contexts/ThemeContext'

export function SignUpForm() {
  let id = useId()
  const { colorTheme } = useTheme()

  // Get theme-specific colors for focus ring
  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return {
          focusRing: 'peer-focus:ring-emerald-300/15',
          focusBorder: 'peer-focus:ring-emerald-300'
        }
      case 'blue':
        return {
          focusRing: 'peer-focus:ring-blue-300/15',
          focusBorder: 'peer-focus:ring-blue-300'
        }
      case 'amber':
        return {
          focusRing: 'peer-focus:ring-amber-300/15',
          focusBorder: 'peer-focus:ring-amber-300'
        }
      case 'rose':
        return {
          focusRing: 'peer-focus:ring-rose-300/15',
          focusBorder: 'peer-focus:ring-rose-300'
        }
      default: // purple
        return {
          focusRing: 'peer-focus:ring-purple-300/15',
          focusBorder: 'peer-focus:ring-purple-300'
        }
    }
  }

  const themeColors = getThemeColors(colorTheme)

  return (
    <form className="relative isolate mt-8 flex items-center pr-1">
      <label htmlFor={id} className="sr-only">
        Email address
      </label>
      <input
        required
        type="email"
        autoComplete="email"
        name="email"
        id={id}
        placeholder="Email Address"
        className="peer w-0 flex-auto bg-transparent px-4 py-2.5 text-base text-white placeholder:text-gray-500 focus:outline-hidden sm:text-[0.8125rem]/6"
      />
      <Button type="submit" arrow>
        Stay Informed
      </Button>
      <div className={`absolute inset-0 -z-10 rounded-lg transition peer-focus:ring-4 ${themeColors.focusRing}`} />
      <div className={`absolute inset-0 -z-10 rounded-lg bg-white/2.5 ring-1 ring-white/15 transition ${themeColors.focusBorder}`} />
    </form>
  )
}
