/**
 * Report (Laporan Retribusi) Validation Schemas
 *
 * Changes:
 * - Laporan retribusi input validation
 * - File upload validation
 * - Status transition validation
 */

import { z } from 'zod'
import { currencySchema, dateSchema, fileUploadSchema } from './common'

// Create laporan schema
export const createLaporanSchema = z.object({
  opdId: z.number().int().positive({ message: 'OPD tidak valid' }),
  jenisRetribusiId: z.number().int().positive({ message: 'Jenis retribusi tidak valid' }),
  tanggalSetor: dateSchema,
  nominal: currencySchema.refine((val) => val > 0, {
    message: 'Nominal harus lebih besar dari 0',
  }),
  keterangan: z.string().max(1000, { message: 'Keterangan maksimal 1000 karakter' }).optional(),
  fileBukti: z.string().optional(), // File path after upload
})

// Update laporan schema
export const updateLaporanSchema = z.object({
  jenisRetribusiId: z.number().int().positive().optional(),
  tanggalSetor: dateSchema.optional(),
  nominal: currencySchema.optional(),
  keterangan: z.string().max(1000).optional(),
  fileBukti: z.string().optional(),
})

// Submit laporan schema (draft -> submitted)
export const submitLaporanSchema = z.object({
  id: z.number().int().positive(),
})

// Verify laporan schema (submitted -> verified)
export const verifyLaporanSchema = z.object({
  id: z.number().int().positive(),
})

// Reject laporan schema (submitted -> rejected)
export const rejectLaporanSchema = z.object({
  id: z.number().int().positive(),
  rejectionReason: z
    .string()
    .min(10, { message: 'Alasan penolakan minimal 10 karakter' })
    .max(500, { message: 'Alasan penolakan maksimal 500 karakter' }),
})

// Laporan query schema
export const laporanQuerySchema = z.object({
  opdId: z.coerce.number().int().positive().optional(),
  jenisRetribusiId: z.coerce.number().int().positive().optional(),
  status: z.enum(['draft', 'submitted', 'verified', 'rejected']).optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
  search: z.string().optional(),
})

// Laporan statistics query
export const laporanStatsQuerySchema = z.object({
  opdId: z.coerce.number().int().positive().optional(),
  jenisRetribusiId: z.coerce.number().int().positive().optional(),
  tahun: z.coerce.number().int().min(2020).max(2100),
  bulan: z.coerce.number().int().min(1).max(12).optional(),
})

// Bulk upload schema
export const bulkUploadSchema = z.object({
  file: fileUploadSchema,
  opdId: z.number().int().positive(),
})

// Export schema
export const exportLaporanSchema = z.object({
  format: z.enum(['excel', 'pdf'], {
    errorMap: () => ({ message: 'Format harus excel atau pdf' }),
  }),
  opdId: z.coerce.number().int().positive().optional(),
  jenisRetribusiId: z.coerce.number().int().positive().optional(),
  startDate: dateSchema.optional(),
  endDate: dateSchema.optional(),
})

// Types
export type CreateLaporanInput = z.infer<typeof createLaporanSchema>
export type UpdateLaporanInput = z.infer<typeof updateLaporanSchema>
export type SubmitLaporanInput = z.infer<typeof submitLaporanSchema>
export type VerifyLaporanInput = z.infer<typeof verifyLaporanSchema>
export type RejectLaporanInput = z.infer<typeof rejectLaporanSchema>
export type LaporanQuery = z.infer<typeof laporanQuerySchema>
export type LaporanStatsQuery = z.infer<typeof laporanStatsQuerySchema>
export type BulkUploadInput = z.infer<typeof bulkUploadSchema>
export type ExportLaporanInput = z.infer<typeof exportLaporanSchema>
