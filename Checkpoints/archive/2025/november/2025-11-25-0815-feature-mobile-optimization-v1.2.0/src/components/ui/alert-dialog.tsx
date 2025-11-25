/**
 * Alert Dialog Component
 *
 * Komponen untuk menampilkan dialog konfirmasi dengan style yang konsisten.
 * Digunakan untuk konfirmasi aksi penting seperti delete.
 *
 * Based on: https://ui.shadcn.com/docs/components/alert-dialog
 * Last Updated: 2025-11-13
 */

import * as React from 'react'
import { cn } from '../../lib/utils/cn'

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface AlertDialogContentProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogHeaderProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogFooterProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogTitleProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

const AlertDialog = ({ open, onOpenChange, children }: AlertDialogProps) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <button
        type="button"
        className="fixed inset-0 bg-black/50 transition-opacity cursor-default"
        onClick={() => onOpenChange(false)}
        aria-label="Close dialog"
      />
      {/* Content */}
      <div className="relative z-50">{children}</div>
    </div>
  )
}

const AlertDialogContent = ({ children, className }: AlertDialogContentProps) => {
  return (
    <div
      className={cn(
        'w-full max-w-lg rounded-lg bg-white p-6 shadow-lg',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
    >
      {children}
    </div>
  )
}

const AlertDialogHeader = ({ children, className }: AlertDialogHeaderProps) => {
  return (
    <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)}>
      {children}
    </div>
  )
}

const AlertDialogFooter = ({ children, className }: AlertDialogFooterProps) => {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}>
      {children}
    </div>
  )
}

const AlertDialogTitle = ({ children, className }: AlertDialogTitleProps) => {
  return <h2 className={cn('text-lg font-semibold text-gray-900', className)}>{children}</h2>
}

const AlertDialogDescription = ({ children, className }: AlertDialogDescriptionProps) => {
  return <p className={cn('text-sm text-gray-500', className)}>{children}</p>
}

const AlertDialogAction = ({ children, className, ...props }: AlertDialogActionProps) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

const AlertDialogCancel = ({ children, className, ...props }: AlertDialogCancelProps) => {
  return (
    <button
      type="button"
      className={cn(
        'mt-2 inline-flex h-10 items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:mt-0',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
