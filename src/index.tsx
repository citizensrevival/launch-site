import { createRoot } from 'react-dom/client'
import App from './App'
import { LoadingScreen } from './shell/LoadingScreen'
import './shell/styles/tailwind.css'

console.log('React app starting...')

const container = document.getElementById('root')
if (!container) {
  console.error('Failed to find the root element')
  throw new Error('Failed to find the root element')
}

console.log('Root element found:', container)

try {
  const root = createRoot(container)
  console.log('React root created')
  
  // Render the app with loading screen
  root.render(
    <>
      <LoadingScreen />
      <App />
    </>
  )
  console.log('React app rendered')
} catch (error) {
  console.error('Error rendering React app:', error)
}
