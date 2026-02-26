import { X } from 'lucide-react'
import * as React from 'react'
import { cn } from '../../lib/utils/cn'

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
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

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity animate-in fade-in"
        onClick={() => onOpenChange?.(false)}
        aria-hidden="true"
      />
      {/* Content Wrapper to position z-index above overlay */}
      <div className="relative z-50">{children}</div>
    </div>
  )
}

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { hideCloseButton?: boolean }
>(({ className, children, hideCloseButton, ...props }, ref) => {
  // Find the onOpenChange from the parent Dialog if possible?
  // In this simple implementation, we can't easily access parent state without context.
  // But usually DialogContent contains the close button which needs to trigger close.
  // For simplicity in this custom implementation, we'll assume the parent handles outside click,
  // and for the X button we might need context.
  // OR, we just don't render the X button here if we don't have the context,
  // or we accept an onClose prop.
  // BUT shadcn API is <Dialog onOpenChange={...}><DialogContent>...</DialogContent></Dialog>
  // To support that we need Context.

  return (
    <DialogContextConsumer>
      {({ onOpenChange }) => (
        <div
          ref={ref}
          className={cn(
            'bg-white p-6 shadow-lg animate-in fade-in-0 zoom-in-95 sm:rounded-lg md:w-full',
            className
          )}
          {...props}
        >
          {children}
          {!hideCloseButton && (
            <button
              type="button"
              onClick={() => onOpenChange?.(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 data-[state=open]:text-slate-500"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      )}
    </DialogContextConsumer>
  )
})
DialogContent.displayName = 'DialogContent'

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight', className)}
    {...props}
  />
))
DialogTitle.displayName = 'DialogTitle'

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn('text-sm text-slate-500', className)} {...props} />
))
DialogDescription.displayName = 'DialogDescription'

// Context for close button
interface DialogContextType {
  onOpenChange?: (open: boolean) => void
}
const DialogContext = React.createContext<DialogContextType>({})

const DialogContextConsumer = ({
  children,
}: {
  children: (context: DialogContextType) => React.ReactNode
}) => {
  return <DialogContext.Consumer>{(context) => children(context)}</DialogContext.Consumer>
}

// Wrapper to provide context
const DialogRoot = ({ open, onOpenChange, children }: DialogProps) => (
  <DialogContext.Provider value={{ onOpenChange }}>
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog>
  </DialogContext.Provider>
)

export {
  DialogRoot as Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
