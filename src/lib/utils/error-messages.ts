/**
 * Error Messages Utility
 *
 * Provides user-friendly error messages for common error scenarios
 * Created: 2025-11-25
 */

import type { AxiosError } from 'axios'

// Error codes mapping to user-friendly messages
export const ERROR_MESSAGES: Record<string, string> = {
  // Network errors
  NETWORK_ERROR: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.',
  TIMEOUT: 'Permintaan memakan waktu terlalu lama. Silakan coba lagi.',
  SERVER_ERROR: 'Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.',

  // Authentication errors
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
  INVALID_CREDENTIALS: 'Username atau password salah.',

  // Validation errors
  VALIDATION_ERROR: 'Data yang dimasukkan tidak valid. Periksa kembali form Anda.',
  REQUIRED_FIELD: 'Field ini wajib diisi.',
  INVALID_FORMAT: 'Format data tidak valid.',

  // Resource errors
  NOT_FOUND: 'Data yang dicari tidak ditemukan.',
  ALREADY_EXISTS: 'Data dengan informasi tersebut sudah ada.',
  CONFLICT: 'Terjadi konflik data. Data mungkin telah diubah oleh pengguna lain.',

  // File errors
  FILE_TOO_LARGE: 'Ukuran file terlalu besar. Maksimal 5MB.',
  INVALID_FILE_TYPE: 'Tipe file tidak didukung. Gunakan JPG, PNG, atau PDF.',
  UPLOAD_FAILED: 'Gagal mengunggah file. Silakan coba lagi.',

  // Generic errors
  UNKNOWN_ERROR: 'Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.',
  OPERATION_FAILED: 'Operasi gagal dilakukan. Silakan coba lagi.',
}

// HTTP status code to error type mapping
const HTTP_STATUS_ERRORS: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  413: 'FILE_TOO_LARGE',
  422: 'VALIDATION_ERROR',
  429: 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.',
  500: 'SERVER_ERROR',
  502: 'SERVER_ERROR',
  503: 'Server sedang dalam pemeliharaan. Silakan coba beberapa saat lagi.',
  504: 'TIMEOUT',
}

// Error context for more specific messages
export interface ErrorContext {
  action?: 'create' | 'update' | 'delete' | 'fetch' | 'upload' | 'login'
  resource?: string
}

/**
 * Get user-friendly error message from Axios error
 */
export function getErrorMessage(error: unknown, context?: ErrorContext): string {
  // Handle Axios errors
  if (isAxiosError(error)) {
    return getAxiosErrorMessage(error, context)
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    // Check for network errors
    if (error.message === 'Network Error') {
      return ERROR_MESSAGES.NETWORK_ERROR
    }
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Get error message from Axios error
 */
function getAxiosErrorMessage(error: AxiosError<any>, context?: ErrorContext): string {
  // No response - network error
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return ERROR_MESSAGES.TIMEOUT
    }
    return ERROR_MESSAGES.NETWORK_ERROR
  }

  const { status, data } = error.response

  // Check for server-provided error message
  const serverMessage = data?.message || data?.error || data?.errors?.[0]?.message

  // For validation errors, try to get field-specific messages
  if (status === 400 || status === 422) {
    if (data?.errors && Array.isArray(data.errors)) {
      const fieldErrors = data.errors
        .map((e: any) => e.message || e.msg)
        .filter(Boolean)
        .join('. ')
      if (fieldErrors) return fieldErrors
    }
    if (serverMessage) return serverMessage
    return ERROR_MESSAGES.VALIDATION_ERROR
  }

  // Use server message if available and meaningful
  if (serverMessage && serverMessage.length < 200) {
    return serverMessage
  }

  // Get message from status code
  const errorKey = HTTP_STATUS_ERRORS[status]
  if (errorKey) {
    // If it's a direct message (like 429), return it
    if (!ERROR_MESSAGES[errorKey]) {
      return errorKey
    }
    return ERROR_MESSAGES[errorKey]
  }

  // Generate context-aware message
  if (context) {
    return getContextualErrorMessage(status, context)
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Generate error message based on action context
 */
function getContextualErrorMessage(status: number, context: ErrorContext): string {
  const { action, resource } = context
  const resourceName = resource || 'data'

  const actionMessages: Record<string, Record<number, string>> = {
    create: {
      400: `Gagal membuat ${resourceName}. Periksa data yang dimasukkan.`,
      409: `${resourceName} dengan data tersebut sudah ada.`,
      500: `Gagal membuat ${resourceName}. Silakan coba lagi.`,
    },
    update: {
      400: `Gagal memperbarui ${resourceName}. Periksa data yang dimasukkan.`,
      404: `${resourceName} tidak ditemukan.`,
      409: `${resourceName} telah diubah oleh pengguna lain.`,
      500: `Gagal memperbarui ${resourceName}. Silakan coba lagi.`,
    },
    delete: {
      404: `${resourceName} tidak ditemukan.`,
      409: `${resourceName} tidak dapat dihapus karena masih digunakan.`,
      500: `Gagal menghapus ${resourceName}. Silakan coba lagi.`,
    },
    fetch: {
      404: `${resourceName} tidak ditemukan.`,
      500: `Gagal memuat ${resourceName}. Silakan coba lagi.`,
    },
    upload: {
      400: 'File tidak valid. Periksa format dan ukuran file.',
      413: ERROR_MESSAGES.FILE_TOO_LARGE,
      500: ERROR_MESSAGES.UPLOAD_FAILED,
    },
    login: {
      400: ERROR_MESSAGES.INVALID_CREDENTIALS,
      401: ERROR_MESSAGES.INVALID_CREDENTIALS,
      500: 'Gagal login. Silakan coba lagi.',
    },
  }

  if (action && actionMessages[action]?.[status]) {
    return actionMessages[action][status]
  }

  return ERROR_MESSAGES.UNKNOWN_ERROR
}

/**
 * Type guard for Axios errors
 */
function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as any).isAxiosError === true
  )
}

/**
 * Format validation errors from server response
 */
export function formatValidationErrors(errors: any[]): Record<string, string> {
  const formatted: Record<string, string> = {}

  if (!Array.isArray(errors)) return formatted

  for (const error of errors) {
    const field = error.field || error.path || error.param
    const message = error.message || error.msg
    if (field && message) {
      formatted[field] = message
    }
  }

  return formatted
}

/**
 * Get error title based on error type
 */
export function getErrorTitle(error: unknown): string {
  if (isAxiosError(error) && error.response) {
    const status = error.response.status

    if (status === 401) return 'Sesi Berakhir'
    if (status === 403) return 'Akses Ditolak'
    if (status === 404) return 'Tidak Ditemukan'
    if (status === 400 || status === 422) return 'Data Tidak Valid'
    if (status >= 500) return 'Kesalahan Server'
  }

  if (!navigator.onLine) return 'Tidak Ada Koneksi'

  return 'Terjadi Kesalahan'
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (!navigator.onLine) return true

  if (isAxiosError(error)) {
    return !error.response && error.message === 'Network Error'
  }

  return false
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (isAxiosError(error) && error.response) {
    return error.response.status === 401
  }
  return false
}
