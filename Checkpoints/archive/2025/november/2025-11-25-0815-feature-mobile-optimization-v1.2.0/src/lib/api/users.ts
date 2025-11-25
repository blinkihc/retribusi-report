/**
 * Users API Client
 * Functions for user management
 */

import { apiClient } from './client'

export interface User {
  id: number
  username: string
  email: string
  fullName: string
  role: 'admin' | 'operator'
  opdId: number | null
  isActive: boolean
  lastLogin: string | null
  createdAt: string
}

export interface CreateUserData {
  username: string
  email: string
  password: string
  fullName: string
  role: 'admin' | 'operator'
  opdId?: number | null
}

export interface UpdateUserData {
  username?: string
  password?: string
  fullName?: string
  role?: 'admin' | 'operator'
  opdId?: number | null
  isActive?: boolean
}

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  const response = await apiClient.get('/api/users')
  return response.data.data
}

/**
 * Get user by ID
 */
export async function getUserById(id: number): Promise<User> {
  const response = await apiClient.get(`/api/users/${id}`)
  return response.data.data
}

/**
 * Create new user
 */
export async function createUser(data: CreateUserData): Promise<User> {
  const response = await apiClient.post('/api/users', data)
  return response.data.data
}

/**
 * Update user
 */
export async function updateUser(id: number, data: UpdateUserData): Promise<User> {
  const response = await apiClient.put(`/api/users/${id}`, data)
  return response.data.data
}

/**
 * Delete user (soft delete)
 */
export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/api/users/${id}`)
}
