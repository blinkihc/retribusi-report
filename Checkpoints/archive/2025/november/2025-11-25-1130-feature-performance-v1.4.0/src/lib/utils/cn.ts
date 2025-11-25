/**
 * Class Name Utility
 *
 * Utility function untuk menggabungkan class names dengan tailwind-merge.
 * Digunakan untuk menggabungkan class Tailwind CSS tanpa konflik.
 *
 * Last Updated: 2025-11-13
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
