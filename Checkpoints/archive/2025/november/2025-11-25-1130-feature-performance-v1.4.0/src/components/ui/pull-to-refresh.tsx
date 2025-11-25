import { Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [startY, setStartY] = useState(0)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const threshold = 80

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY <= 10) { // Allow some tolerance
      setStartY(e.touches[0].clientY)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0 || window.scrollY > 10 || isRefreshing) return
    
    const currentY = e.touches[0].clientY
    const diff = currentY - startY
    
    if (diff > 0) {
      // Add resistance
      setPullDistance(Math.min(diff * 0.5, 150))
    }
  }

  const handleTouchEnd = async () => {
    if (startY === 0) return
    
    if (pullDistance > threshold) {
      setIsRefreshing(true)
      setPullDistance(threshold)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
        setPullDistance(0)
      }
    } else {
      setPullDistance(0)
    }
    
    setStartY(0)
  }

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen"
    >
      {/* Refresh Indicator */}
      <div 
        className="fixed top-16 left-0 w-full flex justify-center items-center pointer-events-none z-50 transition-all duration-200"
        style={{ 
          transform: `translateY(${pullDistance > 0 ? pullDistance - 40 : -100}px)`,
          opacity: pullDistance > 0 ? Math.min(pullDistance / threshold, 1) : 0,
        }}
      >
        <div className="bg-white rounded-full p-3 shadow-hard border-2 border-black">
          <Loader2 
            className={`h-6 w-6 text-black ${isRefreshing ? 'animate-spin' : ''}`} 
            style={{ transform: isRefreshing ? undefined : `rotate(${pullDistance * 3}deg)` }} 
          />
        </div>
      </div>

      {/* Content Container - We don't translate content to avoid layout issues, just show the spinner overlay */}
      <div 
        style={{ 
          transform: `translateY(${pullDistance * 0.3}px)`, // Slight parallax/feedback
          transition: isRefreshing ? 'transform 0.2s' : 'transform 0.1s'
        }}
      >
        {children}
      </div>
    </div>
  )
}
