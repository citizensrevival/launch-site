import { useEffect } from 'react'

export function LoadingScreen() {
  useEffect(() => {
    // Hide loading screen once component mounts
    const timer = setTimeout(() => {
      document.body.classList.add('content-loaded')
    }, 100) // Small delay to ensure smooth transition

    return () => clearTimeout(timer)
  }, [])

  return null
}
