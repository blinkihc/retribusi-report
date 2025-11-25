/**
 * Reports API Client
 *
 * API calls for aggregate reports and statistics
 */

import { apiClient } from './client'

export interface ReportSummary {
  totalLaporan: number
  totalNominal: string
  jumlahOPD: number
}

export interface RekapByOPD {
  opdId: number
  opdKode: string
  opdNama: string
  jumlahLaporan: number
  totalNominal: string
}

export interface RekapByKategori {
  kategori: string
  jumlahLaporan: number
  totalNominal: string
}

export interface RekapByJenisPelayanan {
  kategori: string
  jenisPelayanan: string
  jumlahLaporan: number
  totalNominal: string
}

export interface ReportFilters {
  month?: number
  year?: number
  opdId?: number
}

/**
 * Get summary statistics for a period
 */
export async function getReportSummary(filters: ReportFilters) {
  const params = new URLSearchParams()
  if (filters.month) params.append('month', filters.month.toString())
  if (filters.year) params.append('year', filters.year.toString())
  if (filters.opdId) params.append('opdId', filters.opdId.toString())

  const response = await apiClient.get<{ success: boolean; data: ReportSummary }>(
    `/api/reports/summary?${params.toString()}`
  )
  return response.data
}

/**
 * Get report summary grouped by OPD
 */
export async function getRekapByOPD(filters: Omit<ReportFilters, 'opdId'>) {
  const params = new URLSearchParams()
  if (filters.month) params.append('month', filters.month.toString())
  if (filters.year) params.append('year', filters.year.toString())

  const response = await apiClient.get<{ success: boolean; data: RekapByOPD[] }>(
    `/api/reports/by-opd?${params.toString()}`
  )
  return response.data
}

/**
 * Get report summary grouped by Kategori
 */
export async function getRekapByKategori(filters: Omit<ReportFilters, 'opdId'>) {
  const params = new URLSearchParams()
  if (filters.month) params.append('month', filters.month.toString())
  if (filters.year) params.append('year', filters.year.toString())

  const response = await apiClient.get<{ success: boolean; data: RekapByKategori[] }>(
    `/api/reports/by-kategori?${params.toString()}`
  )
  return response.data
}

/**
 * Get report summary grouped by Jenis Pelayanan
 */
export async function getRekapByJenisPelayanan(filters: Omit<ReportFilters, 'opdId'>) {
  const params = new URLSearchParams()
  if (filters.month) params.append('month', filters.month.toString())
  if (filters.year) params.append('year', filters.year.toString())

  const response = await apiClient.get<{ success: boolean; data: RekapByJenisPelayanan[] }>(
    `/api/reports/by-jenis-pelayanan?${params.toString()}`
  )
  return response.data
}
