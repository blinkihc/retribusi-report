/**
 * Utility Functions
 *
 * Changes:
 * - Common utility functions
 * - Currency formatting (Indonesian Rupiah)
 * - Date formatting
 * - Class name utilities
 */

import { type ClassValue, clsx } from 'clsx'
import { format, parseISO } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount

  if (Number.isNaN(num)) return 'Rp 0'

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove Rp, dots, and spaces
  const cleaned = value.replace(/[Rp.\s]/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

/**
 * Format date to Indonesian format
 */
export function formatDate(date: Date | string, formatStr: string = 'dd MMMM yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: idLocale })
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd MMMM yyyy, HH:mm')
}

/**
 * Format date for input fields (YYYY-MM-DD)
 */
export function formatDateInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'yyyy-MM-dd')
}

/**
 * Get month name in Indonesian
 */
export function getMonthName(month: number): string {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ]
  return months[month - 1] || ''
}

/**
 * Generate nomor laporan (format: LAP/OPD-CODE/YYYY/MM/XXXX)
 */
export function generateNomorLaporan(opdCode: string, date: Date, sequence: number): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const seq = String(sequence).padStart(4, '0')

  return `LAP/${opdCode}/${year}/${month}/${seq}`
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100 * 100) / 100 // 2 decimal places
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return `${text.slice(0, length)}...`
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Get status badge color
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-800',
    submitted: 'bg-blue-100 text-blue-800',
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  }

  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Get status label in Indonesian
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Diajukan',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
  }

  return labels[status] || status
}
