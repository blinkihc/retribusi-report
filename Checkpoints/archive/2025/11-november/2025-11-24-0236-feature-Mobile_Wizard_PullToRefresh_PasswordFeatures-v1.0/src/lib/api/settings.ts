/**
 * Settings API Service
 *
 * Handles all API calls related to application settings
 *
 * Last Updated: 2025-11-14
 */

import { apiClient } from './client'

export interface Setting {
  id: number
  key: string
  value: string
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface SettingsListResponse {
  success: boolean
  data: Setting[]
}

export interface SettingDetailResponse {
  success: boolean
  data: Setting
}

export interface SettingUpdateData {
  value: string
  description?: string
}

export interface SettingResponse {
  success: boolean
  message: string
  data?: Setting
}

// Get all settings
export const getSettings = async (): Promise<SettingsListResponse> => {
  const response = await apiClient.get<SettingsListResponse>('/api/settings')
  return response.data
}

// Get setting by key
export const getSettingByKey = async (key: string): Promise<SettingDetailResponse> => {
  const response = await apiClient.get<SettingDetailResponse>(`/api/settings/${key}`)
  return response.data
}

// Update setting by key (admin only)
export const updateSetting = async (
  key: string,
  data: SettingUpdateData
): Promise<SettingResponse> => {
  const response = await apiClient.put<SettingResponse>(`/api/settings/${key}`, data)
  return response.data
}

// Upload logo kabupaten (admin only)
export const uploadLogo = async (file: File): Promise<SettingResponse> => {
  const formData = new FormData()
  formData.append('logo', file)

  const response = await apiClient.post<SettingResponse>('/api/settings/logo/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}
