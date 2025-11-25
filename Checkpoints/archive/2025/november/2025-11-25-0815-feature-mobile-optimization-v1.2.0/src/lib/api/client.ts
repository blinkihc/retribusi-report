/**
 * API Client
 *
 * Axios instance with authentication and error handling
 */

import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API helper functions
export const api = {
  // Auth
  login: async (username: string, password: string, rememberMe = false) => {
    const response = await apiClient.post('/api/auth/login', { username, password, rememberMe })
    return response.data
  },

  logout: async (userId: number) => {
    const response = await apiClient.post('/api/auth/logout', { userId })
    return response.data
  },

  getMe: async () => {
    const response = await apiClient.get('/api/auth/me')
    return response.data
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/dashboard/stats')
    return response.data
  },

  getRecentReports: async (limit = 10) => {
    const response = await apiClient.get(`/api/dashboard/recent-reports?limit=${limit}`)
    return response.data
  },

  getRevenueTrend: async (months = 6) => {
    const response = await apiClient.get(`/api/dashboard/revenue-trend?months=${months}`)
    return response.data
  },

  getRevenueTrendDaily: async (days = 30) => {
    const response = await apiClient.get(`/api/dashboard/revenue-trend-daily?days=${days}`)
    return response.data
  },

  getOPDRevenue: async () => {
    const response = await apiClient.get('/api/dashboard/opd-revenue')
    return response.data
  },

  getCategoryRevenue: async () => {
    const response = await apiClient.get('/api/dashboard/category-revenue')
    return response.data
  },

  getTopRetribusi: async () => {
    const response = await apiClient.get('/api/dashboard/top-retribusi')
    return response.data
  },

  // Reports
  getReports: async () => {
    const response = await apiClient.get('/api/reports')
    return response.data
  },

  createReport: async (data: any) => {
    const response = await apiClient.post('/api/reports', data)
    return response.data
  },

  // Users
  getUsers: async () => {
    const response = await apiClient.get('/api/users')
    return response.data
  },
}

// Helper function for logout
export const logout = () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user')
}
