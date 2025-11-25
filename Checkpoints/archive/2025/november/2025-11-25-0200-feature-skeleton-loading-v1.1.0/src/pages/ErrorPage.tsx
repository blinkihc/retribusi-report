/**
 * Error Page
 *
 * Error boundary page untuk handle errors dan 404
 */

import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'

export default function ErrorPage() {
  const error = useRouteError()

  let errorMessage: string
  let errorStatus: number | undefined

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message || 'An error occurred'
    errorStatus = error.status
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else {
    errorMessage = 'Unknown error occurred'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-error-50 to-error-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        {errorStatus && <div className="text-6xl font-bold text-error-600 mb-4">{errorStatus}</div>}

        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
          {errorStatus === 404 ? 'Halaman Tidak Ditemukan' : 'Terjadi Kesalahan'}
        </h1>

        <p className="text-neutral-600 mb-8">
          {errorStatus === 404 ? 'Halaman yang Anda cari tidak ditemukan.' : errorMessage}
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
          >
            Kembali ke Home
          </Link>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors font-medium"
          >
            Refresh
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && error instanceof Error && (
          <div className="mt-8 p-4 bg-neutral-100 rounded-lg text-left">
            <p className="text-xs font-mono text-neutral-600 whitespace-pre-wrap">{error.stack}</p>
          </div>
        )}
      </div>
    </div>
  )
}
