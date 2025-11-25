/**
 * Jenis Retribusi API Service
 *
 * Handles all API calls related to Jenis Retribusi
 *
 * Last Updated: 2025-11-14
 */

import { apiClient } from './client'

export interface JenisRetribusi {
  id: number
  kode: string
  nama: string
  kategori: string
  deskripsi: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface JenisRetribusiListParams {
  page?: number
  limit?: number
  search?: string
  kategori?: string | 'all'
  isActive?: 'true' | 'false' | 'all'
  sortBy?: 'kode' | 'nama' | 'kategori' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface JenisRetribusiListResponse {
  success: boolean
  data: JenisRetribusi[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface JenisRetribusiDetailResponse {
  success: boolean
  data: JenisRetribusi
}

export interface JenisRetribusiCreateData {
  kode: string
  nama: string
  kategori: string
  deskripsi?: string
  isActive?: boolean
}

export interface JenisRetribusiUpdateData extends Partial<JenisRetribusiCreateData> {}

export interface JenisRetribusiResponse {
  success: boolean
  message: string
  data?: JenisRetribusi
}

// Get Jenis Retribusi list with pagination and filters
export const getJenisRetribusiList = async (
  params?: JenisRetribusiListParams
): Promise<JenisRetribusiListResponse> => {
  const queryParams = new URLSearchParams()

  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.limit) queryParams.append('limit', params.limit.toString())
  if (params?.search) queryParams.append('search', params.search)
  if (params?.kategori && params.kategori !== 'all') queryParams.append('kategori', params.kategori)
  if (params?.isActive) queryParams.append('isActive', params.isActive)
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy)
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder)

  const response = await apiClient.get<JenisRetribusiListResponse>(
    `/api/jenis-retribusi?${queryParams.toString()}`
  )
  return response.data
}

// Get Jenis Retribusi detail by kode
export const getJenisRetribusiDetail = async (
  kode: string
): Promise<JenisRetribusiDetailResponse> => {
  const response = await apiClient.get<JenisRetribusiDetailResponse>(`/api/jenis-retribusi/${kode}`)
  return response.data
}

// Create new Jenis Retribusi (admin only)
export const createJenisRetribusi = async (
  data: JenisRetribusiCreateData
): Promise<JenisRetribusiResponse> => {
  const response = await apiClient.post<JenisRetribusiResponse>('/api/jenis-retribusi', data)
  return response.data
}

// Update Jenis Retribusi (admin only)
export const updateJenisRetribusi = async (
  kode: string,
  data: JenisRetribusiUpdateData
): Promise<JenisRetribusiResponse> => {
  const response = await apiClient.put<JenisRetribusiResponse>(`/api/jenis-retribusi/${kode}`, data)
  return response.data
}

// Delete Jenis Retribusi (admin only)
export const deleteJenisRetribusi = async (kode: string): Promise<JenisRetribusiResponse> => {
  const response = await apiClient.delete<JenisRetribusiResponse>(`/api/jenis-retribusi/${kode}`)
  return response.data
}

// Get unique categories
export const getKategoriList = async (): Promise<{ success: boolean; data: string[] }> => {
  const response = await apiClient.get<{ success: boolean; data: string[] }>(
    '/api/jenis-retribusi/kategori'
  )
  return response.data
}

// Check if kode is unique
export const checkKodeUnique = async (
  kode: string
): Promise<{ success: boolean; isUnique: boolean }> => {
  const response = await apiClient.get<{ success: boolean; isUnique: boolean }>(
    `/api/jenis-retribusi/check-kode/${encodeURIComponent(kode)}`
  )
  return response.data
}

// Check if nama is unique
export const checkNamaUnique = async (
  nama: string
): Promise<{ success: boolean; isUnique: boolean }> => {
  const response = await apiClient.get<{ success: boolean; isUnique: boolean }>(
    `/api/jenis-retribusi/check-nama/${encodeURIComponent(nama)}`
  )
  return response.data
}
