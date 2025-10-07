import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
  disabled?: boolean
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 300,
  disabled = false 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const showTooltip = () => {
    if (disabled) return
    const id = setTimeout(() => setIsVisible(true), delay)
    setTimeoutId(id)
  }

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }
    setIsVisible(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [timeoutId])

  // Calculate tooltip position when it becomes visible
  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current?.getBoundingClientRect()
      
      let top = 0
      let left = 0
      
      switch (position) {
        case 'top':
          top = triggerRect.top - (tooltipRect?.height || 0) - 8
          left = triggerRect.left + triggerRect.width / 2 - (tooltipRect?.width || 0) / 2
          break
        case 'bottom':
          top = triggerRect.bottom + 8
          left = triggerRect.left + triggerRect.width / 2 - (tooltipRect?.width || 0) / 2
          break
        case 'left':
          top = triggerRect.top + triggerRect.height / 2 - (tooltipRect?.height || 0) / 2
          left = triggerRect.left - (tooltipRect?.width || 0) - 8
          break
        case 'right':
          top = triggerRect.top + triggerRect.height / 2 - (tooltipRect?.height || 0) / 2
          left = triggerRect.right + 8
          break
      }
      
      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      if (left < 8) left = 8
      if (left + (tooltipRect?.width || 0) > viewportWidth - 8) {
        left = viewportWidth - (tooltipRect?.width || 0) - 8
      }
      if (top < 8) top = 8
      if (top + (tooltipRect?.height || 0) > viewportHeight - 8) {
        top = viewportHeight - (tooltipRect?.height || 0) - 8
      }
      
      setTooltipPosition({ top, left })
    }
  }, [isVisible, position])

  const getArrowClasses = () => {
    switch (position) {
      case 'top':
        return 'top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800'
      case 'bottom':
        return 'bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800'
      case 'left':
        return 'left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800'
      case 'right':
        return 'right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800'
      default:
        return 'top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800'
    }
  }

  const tooltipElement = isVisible && (
    <div
      ref={tooltipRef}
      className="fixed z-[99999] px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap pointer-events-none"
      style={{ 
        top: tooltipPosition.top,
        left: tooltipPosition.left,
        zIndex: 99999
      }}
    >
      {content}
      <div className={`absolute ${getArrowClasses()}`}></div>
    </div>
  )

  return (
    <div 
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {typeof document !== 'undefined' && createPortal(tooltipElement, document.body)}
    </div>
  )
}
