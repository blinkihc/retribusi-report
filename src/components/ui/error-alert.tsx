/**
 * Error Alert Component
 *
 * Displays user-friendly error messages with actions
 * Created: 2025-11-25
 */

import { AlertCircle, FileX, RefreshCw, ShieldX, WifiOff, X } from 'lucide-react'
import {
  getErrorMessage,
  getErrorTitle,
  isAuthError,
  isNetworkError,
} from '@/lib/utils/error-messages'

interface ErrorAlertProps {
  error: unknown
  onRetry?: () => void
  onDismiss?: () => void
  context?: {
    action?: 'create' | 'update' | 'delete' | 'fetch' | 'upload' | 'login'
    resource?: string
  }
  className?: string
  variant?: 'inline' | 'card' | 'banner'
}

export function ErrorAlert({
  error,
  onRetry,
  onDismiss,
  context,
  className = '',
  variant = 'inline',
}: ErrorAlertProps) {
  const title = getErrorTitle(error)
  const message = getErrorMessage(error, context)
  const isNetwork = isNetworkError(error)
  const isAuth = isAuthError(error)

  const Icon = isNetwork ? WifiOff : isAuth ? ShieldX : AlertCircle

  if (variant === 'banner') {
    return (
      <div
        className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-red-800">{title}</h3>
            <p className="mt-1 text-sm text-red-700">{message}</p>
            {(onRetry || onDismiss) && (
              <div className="mt-3 flex gap-2">
                {onRetry && (
                  <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800"
                  >
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Coba Lagi
                  </button>
                )}
              </div>
            )}
          </div>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="text-red-500 hover:text-red-700"
              aria-label="Tutup pesan error"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <div
        className={`bg-white rounded-lg border border-red-200 shadow-sm p-6 ${className}`}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <Icon className="h-6 w-6 text-red-600" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-600 mb-4 max-w-sm">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Coba Lagi
            </button>
          )}
        </div>
      </div>
    )
  }

  // Default inline variant
  return (
    <div
      className={`flex items-start gap-3 p-4 bg-red-50 rounded-lg border border-red-200 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      <Icon className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-800">{title}</p>
        <p className="mt-1 text-sm text-red-700">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex-shrink-0 text-red-600 hover:text-red-800"
          aria-label="Coba lagi"
        >
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="flex-shrink-0 text-red-500 hover:text-red-700"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}

/**
 * Empty State with Error
 * For use when data fetch fails
 */
interface ErrorEmptyStateProps {
  error: unknown
  onRetry?: () => void
  resource?: string
}

export function ErrorEmptyState({ error, onRetry, resource = 'data' }: ErrorEmptyStateProps) {
  const isNetwork = isNetworkError(error)

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        {isNetwork ? (
          <WifiOff className="h-8 w-8 text-red-500" aria-hidden="true" />
        ) : (
          <FileX className="h-8 w-8 text-red-500" aria-hidden="true" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {isNetwork ? 'Tidak Ada Koneksi' : `Gagal Memuat ${resource}`}
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-sm mb-4">
        {getErrorMessage(error, { action: 'fetch', resource })}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          Muat Ulang
        </button>
      )}
    </div>
  )
}
