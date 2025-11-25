/**
 * OPD API Service
 *
 * Handles all API calls related to OPD (Organisasi Perangkat Daerah)
 *
 * Last Updated: 2025-11-13
 */

import { apiClient } from './client'

export interface OPD {
  id: number
  kode: string
  nama: string
  alamat: string | null
  telepon: string | null
  email: string | null
  kepala: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface OPDListParams {
  page?: number
  limit?: number
  search?: string
  isActive?: 'true' | 'false' | 'all'
  sortBy?: 'kode' | 'nama' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface OPDListResponse {
  success: boolean
  data: OPD[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface OPDDetailResponse {
  success: boolean
  data: OPD
}

export interface OPDCreateData {
  kode: string
  nama: string
  alamat?: string
  telepon?: string
  email?: string
  kepala?: string
  isActive?: boolean
}

export interface OPDUpdateData extends Partial<OPDCreateData> {}

export interface OPDResponse {
  success: boolean
  message: string
  data?: OPD
}

// Get OPD list with pagination and filters
export const getOPDList = async (params?: OPDListParams): Promise<OPDListResponse> => {
  const queryParams = new URLSearchParams()

  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.isActive) queryParams.append('isActive', params.isActive)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

  const response = await apiClient.get<OPDListResponse>(`/api/opd?${queryParams.toString()}`)
  return response.data
}

// Get OPD detail by kode
export const getOPDDetail = async (kode: string): Promise<OPDDetailResponse> => {
  const response = await apiClient.get<OPDDetailResponse>(`/api/opd/${kode}`)
  return response.data
}

// Create new OPD (admin only)
export const createOPD = async (data: OPDCreateData): Promise<OPDResponse> => {
  const response = await apiClient.post<OPDResponse>('/api/opd', data)
  return response.data
}

// Update OPD (admin only)
export const updateOPD = async (kode: string, data: OPDUpdateData): Promise<OPDResponse> => {
  const response = await apiClient.put<OPDResponse>(`/api/opd/${kode}`, data)
  return response.data
}

// Delete OPD (admin only)
export const deleteOPD = async (kode: string): Promise<OPDResponse> => {
  const response = await apiClient.delete<OPDResponse>(`/api/opd/${kode}`)
  return response.data
}

// Seed OPD data from JSON (admin only)
export const seedOPD = async (): Promise<OPDResponse> => {
  const response = await apiClient.post<OPDResponse>('/api/opd/seed')
  return response.data
}
