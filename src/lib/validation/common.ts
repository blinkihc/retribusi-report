/**
 * Common Validation Schemas
 *
 * Changes:
 * - Common reusable validation schemas
 * - Indonesian language error messages
 * - Date, currency, and file validation
 */

import { z } from 'zod'

// Date validation
export const dateSchema = z.string().refine(
  (date) => {
    const parsed = new Date(date)
    return !Number.isNaN(parsed.getTime())
  },
  { message: 'Format tanggal tidak valid' }
)

// Currency validation (positive decimal)
export const currencySchema = z
  .string()
  .or(z.number())
  .refine(
    (val) => {
      const num = typeof val === 'string' ? parseFloat(val) : val
      return !Number.isNaN(num) && num >= 0
    },
    { message: 'Nominal harus berupa angka positif' }
  )
  .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))

// Phone number validation (Indonesian format)
export const phoneSchema = z
  .string()
  .regex(/^(\+62|62|0)[0-9]{9,12}$/, {
    message: 'Format nomor telepon tidak valid',
  })
  .optional()

// Email validation
export const emailSchema = z.string().email({ message: 'Format email tidak valid' }).toLowerCase()

// File upload validation
export const fileUploadSchema = z.object({
  filename: z.string(),
  mimetype: z.enum(['application/pdf', 'image/jpeg', 'image/png'], {
    message: 'Hanya file PDF, JPG, atau PNG yang diperbolehkan',
  }),
  size: z.number().max(5 * 1024 * 1024, {
    message: 'Ukuran file maksimal 5MB',
  }),
})

// Pagination schema
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(10),
})

// Sort schema
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Date range schema
export const dateRangeSchema = z
  .object({
    startDate: dateSchema,
    endDate: dateSchema,
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: 'Tanggal mulai harus lebih kecil atau sama dengan tanggal akhir',
  })

// ID parameter schema
export const idParamSchema = z.object({
  id: z.coerce.number().int().positive({ message: 'ID tidak valid' }),
})

// Success response schema
export const successResponseSchema = z.object({
  success: z.literal(true),
  message: z.string(),
  data: z.any().optional(),
})

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  message: z.string(),
  errors: z.array(z.string()).optional(),
})
