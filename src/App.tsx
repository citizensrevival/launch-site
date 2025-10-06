import clsx from 'clsx'
import { ThemeProvider } from './contexts/ThemeContext'
import HomePage from './components/HomePage'

export default function App() {
  return (
    <html
      lang="en"
      className={clsx('h-full antialiased')}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-white dark:bg-gray-950">
        <ThemeProvider disableTransitionOnChange>
          <HomePage />
        </ThemeProvider>
      </body>
    </html>
  )
}
