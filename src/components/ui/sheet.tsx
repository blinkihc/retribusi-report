import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils/cn'
import { AnimatePresence, motion } from 'framer-motion'

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const SheetContext = React.createContext<{
  open?: boolean
  onOpenChange?: (open: boolean) => void
}>({})

const Sheet = ({ open, onOpenChange, children }: SheetProps) => (
  <SheetContext.Provider value={{ open, onOpenChange }}>
    {children}
  </SheetContext.Provider>
)

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'top' | 'bottom' | 'left' | 'right'
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = 'right', className, children, ...props }, ref) => {
    const { open, onOpenChange } = React.useContext(SheetContext)

    // Prevent body scroll when open
    React.useEffect(() => {
      if (open) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }
      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [open])

    const variants = {
      initial: {
        x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
        y: side === 'bottom' ? '100%' : side === 'top' ? '-100%' : 0,
      },
      animate: { x: 0, y: 0 },
      exit: {
        x: side === 'right' ? '100%' : side === 'left' ? '-100%' : 0,
        y: side === 'bottom' ? '100%' : side === 'top' ? '-100%' : 0,
      },
    }

    return (
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onOpenChange?.(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            />
            {/* Content */}
            <motion.div
              ref={ref}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={cn(
                'fixed z-50 bg-white p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out',
                side === 'top' && 'inset-x-0 top-0 border-b',
                side === 'bottom' && 'inset-x-0 bottom-0 border-t rounded-t-xl max-h-[90vh] overflow-y-auto',
                side === 'left' && 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
                side === 'right' && 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
                className
              )}
              {...props}
            >
              <button
                type="button"
                onClick={() => onOpenChange?.(false)}
                className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }
)
SheetContent.displayName = 'SheetContent'

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col space-y-2 text-center sm:text-left',
      className
    )}
    {...props}
  />
)
SheetHeader.displayName = 'SheetHeader'

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
      className
    )}
    {...props}
  />
)
SheetFooter.displayName = 'SheetFooter'

const SheetTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold text-slate-950', className)}
    {...props}
  />
))
SheetTitle.displayName = 'SheetTitle'

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-slate-500', className)}
    {...props}
  />
))
SheetDescription.displayName = 'SheetDescription'

export {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
