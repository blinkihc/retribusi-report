/**
 * Error Page
 *
 * Error boundary page untuk handle errors dan 404
 * Updated: 2025-11-25 - Improved error messages
 */

import {
  AlertTriangle,
  ArrowLeft,
  FileQuestion,
  Home,
  RefreshCw,
  ShieldX,
  WifiOff,
} from 'lucide-react'
import { isRouteErrorResponse, Link, useNavigate, useRouteError } from 'react-router-dom'

// Error configuration for different status codes
const ERROR_CONFIG: Record<number, { title: string; message: string; icon: typeof AlertTriangle }> =
  {
    400: {
      title: 'Permintaan Tidak Valid',
      message: 'Data yang dikirim tidak valid. Silakan periksa dan coba lagi.',
      icon: AlertTriangle,
    },
    401: {
      title: 'Sesi Berakhir',
      message: 'Sesi Anda telah berakhir. Silakan login kembali untuk melanjutkan.',
      icon: ShieldX,
    },
    403: {
      title: 'Akses Ditolak',
      message: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
      icon: ShieldX,
    },
    404: {
      title: 'Halaman Tidak Ditemukan',
      message: 'Halaman yang Anda cari tidak ada atau telah dipindahkan.',
      icon: FileQuestion,
    },
    500: {
      title: 'Kesalahan Server',
      message: 'Terjadi kesalahan pada server. Tim kami sedang menangani masalah ini.',
      icon: AlertTriangle,
    },
    503: {
      title: 'Layanan Tidak Tersedia',
      message: 'Server sedang dalam pemeliharaan. Silakan coba beberapa saat lagi.',
      icon: AlertTriangle,
    },
  }

export default function ErrorPage() {
  const error = useRouteError()
  const navigate = useNavigate()

  let errorStatus: number | undefined
  let errorTitle: string
  let errorMessage: string
  let ErrorIcon = AlertTriangle

  // Determine error details
  if (isRouteErrorResponse(error)) {
    errorStatus = error.status
    const config = ERROR_CONFIG[error.status]
    if (config) {
      errorTitle = config.title
      errorMessage = config.message
      ErrorIcon = config.icon
    } else {
      errorTitle = 'Terjadi Kesalahan'
      errorMessage = error.statusText || error.data?.message || 'Silakan coba lagi.'
    }
  } else if (error instanceof Error) {
    // Check for network errors
    if (error.message === 'Network Error' || !navigator.onLine) {
      errorTitle = 'Tidak Ada Koneksi'
      errorMessage = 'Periksa koneksi internet Anda dan coba lagi.'
      ErrorIcon = WifiOff
    } else {
      errorTitle = 'Terjadi Kesalahan'
      errorMessage = error.message || 'Terjadi kesalahan yang tidak diketahui.'
    }
  } else {
    errorTitle = 'Terjadi Kesalahan'
    errorMessage = 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.'
  }

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4"
      aria-labelledby="error-title"
    >
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Error Icon */}
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <ErrorIcon className="h-10 w-10 text-red-500" aria-hidden="true" />
        </div>

        {/* Status Code */}
        {errorStatus && (
          <div className="text-6xl font-bold text-red-500 mb-2" aria-hidden="true">
            {errorStatus}
          </div>
        )}

        {/* Error Title */}
        <h1 id="error-title" className="text-2xl font-bold text-gray-900 mb-3">
          {errorTitle}
        </h1>

        {/* Error Message */}
        <p className="text-gray-600 mb-8 leading-relaxed">{errorMessage}</p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Kembali
          </button>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            Ke Dashboard
          </Link>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </button>
        </div>

        {/* Help Text */}
        <p className="mt-8 text-sm text-gray-500">
          Jika masalah berlanjut, hubungi administrator sistem.
        </p>

        {/* Debug Info (Development Only) */}
        {import.meta.env.DEV && error instanceof Error && error.stack && (
          <details className="mt-6 text-left">
            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
              Detail Error (Development)
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded-lg text-xs font-mono text-gray-600 overflow-auto max-h-40">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </main>
  )
}
