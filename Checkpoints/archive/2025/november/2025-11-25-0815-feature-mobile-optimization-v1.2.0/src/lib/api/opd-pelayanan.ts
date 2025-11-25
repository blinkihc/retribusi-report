/**
 * OPD-Pelayanan API Service
 *
 * Handles all API calls related to OPD-Pelayanan relationships
 *
 * Last Updated: 2025-11-14
 */

import { apiClient } from './client'

export interface OPDPelayanan {
  id: number
  opdKode: string
  jenisRetribusiKode: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Joined data
  opdNama?: string
  jenisRetribusiId?: number
  jenisRetribusiNama?: string
  kategori?: string
  deskripsi?: string
}

export interface OPDPelayananListParams {
  page?: number
  limit?: number
  opdKode?: string
  jenisRetribusiKode?: string
  kategori?: string
  search?: string
  sortBy?: 'opdKode' | 'jenisRetribusiKode' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface OPDPelayananListResponse {
  success: boolean
  data: OPDPelayanan[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface OPDPelayananDetailResponse {
  success: boolean
  data: OPDPelayanan
}

export interface OPDPelayananCreateData {
  kodeOpd: string
  namaJenisRetribusi: string
}

export interface OPDPelayananResponse {
  success: boolean
  message: string
  data?: OPDPelayanan
}

// Get OPD-Pelayanan list with pagination and filters
export const getOPDPelayananList = async (
  params?: OPDPelayananListParams
): Promise<OPDPelayananListResponse> => {
  const queryParams = new URLSearchParams()

  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.opdKode) queryParams.append('opdKode', params.opdKode)
  if (params?.jenisRetribusiKode)
    queryParams.append('jenisRetribusiKode', params.jenisRetribusiKode)
  if (params?.kategori) queryParams.append('kategori', params.kategori)
  if (params?.search) queryParams.append('search', params.search)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

  const response = await apiClient.get<OPDPelayananListResponse>(
    `/api/opd-pelayanan?${queryParams.toString()}`
  )
  return response.data
}

// Get OPD-Pelayanan detail by ID
export const getOPDPelayananDetail = async (id: number): Promise<OPDPelayananDetailResponse> => {
  const response = await apiClient.get<OPDPelayananDetailResponse>(`/api/opd-pelayanan/${id}`)
  return response.data
}

// Create new OPD-Pelayanan relationship (admin only)
export const createOPDPelayanan = async (
  data: OPDPelayananCreateData
): Promise<OPDPelayananResponse> => {
  const response = await apiClient.post<OPDPelayananResponse>('/api/opd-pelayanan', data)
  return response.data
}

// Delete OPD-Pelayanan relationship (admin only)
export const deleteOPDPelayanan = async (id: number): Promise<OPDPelayananResponse> => {
  const response = await apiClient.delete<OPDPelayananResponse>(`/api/opd-pelayanan/${id}`)
  return response.data
}
