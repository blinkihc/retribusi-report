/**
 * Dashboard Loaders - React Router v7
 *
 * Data loaders untuk dashboard pages
 */

import type { LoaderFunctionArgs } from 'react-router-dom'
import { api } from '@/lib/api/client'

/**
 * Dashboard Stats Loader
 * Loads dashboard statistics
 */
export async function dashboardStatsLoader({ request }: LoaderFunctionArgs) {
  try {
    const data = await api.getDashboardStats()
    return data
  } catch (error: any) {
    console.error('Dashboard stats loader error:', error)
    throw new Response('Failed to load dashboard stats', { status: 500 })
  }
}

/**
 * Dashboard Home Loader
 * Loads all dashboard data (stats + recent reports + charts)
 */
export async function dashboardHomeLoader({ request }: LoaderFunctionArgs) {
  try {
    const [
      stats, 
      recentReports, 
      revenueTrend,
      revenueTrendDaily,
      opdRevenue,
      categoryRevenue,
      topRetribusi
    ] = await Promise.all([
      api.getDashboardStats(),
      api.getRecentReports(5),
      api.getRevenueTrend(6),
      api.getRevenueTrendDaily(30),
      api.getOPDRevenue(),
      api.getCategoryRevenue(),
      api.getTopRetribusi(),
    ])

    return {
      stats: stats.data,
      recentReports: recentReports.data,
      revenueTrend: revenueTrend.data,
      revenueTrendDaily: revenueTrendDaily.data,
      opdRevenue: opdRevenue.data,
      categoryRevenue: categoryRevenue.data,
      topRetribusi: topRetribusi.data,
    }
  } catch (error: any) {
    console.error('Dashboard home loader error:', error)
    throw new Response('Failed to load dashboard data', { status: 500 })
  }
}
