import { ColorThemeToggle } from './ThemeToggle'
import { Menu } from './Menu'
import { useTheme } from '../contexts/ThemeContext'

export function SimpleLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const colorTheme = theme?.colorTheme || 'purple'

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'green':
        return 'bg-emerald-950'
      case 'blue':
        return 'bg-blue-950'
      case 'amber':
        return 'bg-amber-950'
      case 'rose':
        return 'bg-rose-950'
      default: // purple
        return 'bg-purple-950'
    }
  }

  return (
    <div className={`min-h-screen ${getThemeColors(colorTheme)}`}>
      {/* Header */}
      <header className="relative z-50 flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <Menu />
          <ColorThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {children}
      </main>
    </div>
  )
}
