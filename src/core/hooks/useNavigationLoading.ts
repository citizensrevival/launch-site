import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false)
  const location = useLocation()

  useEffect(() => {
    // Show loading when route changes
    setIsLoading(true)
    
    // Hide loading after a short delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 150)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return isLoading
}
