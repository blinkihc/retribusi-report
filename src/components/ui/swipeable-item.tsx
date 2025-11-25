import { motion, PanInfo, useAnimation, useMotionValue, useTransform } from 'framer-motion'
import { Trash2, Edit2, Send, Eye } from 'lucide-react'
import React, { useRef, useState } from 'react'

interface SwipeAction {
  icon: React.ReactNode
  label: string
  color: string // bg-color class
  onClick: () => void
}

interface SwipeableItemProps {
  children: React.ReactNode
  actions: {
    left?: SwipeAction[] // Actions revealed when swiping right
    right?: SwipeAction[] // Actions revealed when swiping left
  }
  threshold?: number
  className?: string
}

export function SwipeableItem({ 
  children, 
  actions, 
  threshold = 0.3,
  className 
}: SwipeableItemProps) {
  const x = useMotionValue(0)
  const controls = useAnimation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState<'left' | 'right' | null>(null)

  // Calculate action widths
  const rightActionWidth = (actions.right?.length || 0) * 64 // 64px per action
  const leftActionWidth = (actions.left?.length || 0) * 64

  const handleDragEnd = async (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const offset = info.offset.x
    const velocity = info.velocity.x

    // Swipe Left (Reveal Right Actions)
    if (offset < -50 || velocity < -500) {
      if (actions.right?.length) {
        await controls.start({ x: -rightActionWidth, transition: { type: 'spring', stiffness: 300, damping: 30 } })
        setIsOpen('right')
      } else {
        await controls.start({ x: 0 })
        setIsOpen(null)
      }
    } 
    // Swipe Right (Reveal Left Actions)
    else if (offset > 50 || velocity > 500) {
      if (actions.left?.length) {
        await controls.start({ x: leftActionWidth, transition: { type: 'spring', stiffness: 300, damping: 30 } })
        setIsOpen('left')
      } else {
        await controls.start({ x: 0 })
        setIsOpen(null)
      }
    } 
    // Snap back
    else {
      await controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
      setIsOpen(null)
    }
  }

  // Close swipe when clicking outside or on the item content
  const resetSwipe = () => {
    if (isOpen) {
      controls.start({ x: 0 })
      setIsOpen(null)
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`} ref={containerRef}>
      {/* Background Actions Layer */}
      <div className="absolute inset-0 flex justify-between items-center z-0 h-full">
        {/* Left Actions (Revealed by swiping right) */}
        <div className="flex h-full items-center justify-start">
          {actions.left?.map((action, index) => (
            <button
              key={`left-${index}`}
              onClick={() => {
                action.onClick()
                resetSwipe()
              }}
              className={`${action.color} h-full w-16 flex flex-col items-center justify-center text-white transition-all active:opacity-80`}
              aria-label={action.label}
            >
              <div className="w-6 h-6 mb-1" aria-hidden="true">{action.icon}</div>
              <span className="text-[10px] font-bold uppercase tracking-tight">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Right Actions (Revealed by swiping left) */}
        <div className="flex h-full items-center justify-end ml-auto">
          {actions.right?.map((action, index) => (
            <button
              key={`right-${index}`}
              onClick={() => {
                action.onClick()
                resetSwipe()
              }}
              className={`${action.color} h-full w-16 flex flex-col items-center justify-center text-white transition-all active:opacity-80`}
              aria-label={action.label}
            >
              <div className="w-6 h-6 mb-1" aria-hidden="true">{action.icon}</div>
              <span className="text-[10px] font-bold uppercase tracking-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Foreground Content Layer */}
      <motion.div
        drag="x"
        dragConstraints={{ 
          left: -rightActionWidth, 
          right: leftActionWidth 
        }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        style={{ x, touchAction: 'pan-y' }} // pan-y allows vertical scrolling while dragging
        className="relative z-10 bg-white h-full active:cursor-grabbing cursor-grab"
        onClick={resetSwipe}
      >
        {children}
      </motion.div>
    </div>
  )
}
