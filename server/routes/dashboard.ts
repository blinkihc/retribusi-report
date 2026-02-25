/**
 * Dashboard Routes
 *
 * Handles dashboard statistics and summary data
 *
 * Endpoints:
 * - GET /api/dashboard/stats - Get dashboard statistics
 *   Returns: daily, weekly, monthly, total revenue + total reports
 *
 * Stats Calculation:
 * - Daily Revenue: SUM(nominal) WHERE tanggal_setor = TODAY
 * - Weekly Revenue: SUM(nominal) WHERE tanggal_setor >= START_OF_WEEK (Monday)
 * - Monthly Revenue: SUM(nominal) WHERE MONTH = CURRENT_MONTH
 * - Total Revenue: SUM(nominal) all time
 * - Total Reports: COUNT(*) all time
 *
 * Auth: Required (JWT)
 * Last Updated: 2025-11-13
 */

import { and, eq, gte, lte, lt, sql } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../src/lib/db'
import { jenisRetribusi, laporanRetribusi, opd } from '../../src/lib/db/schema'

export const dashboardRouter = Router()

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 */
dashboardRouter.get('/stats', async (req, res, next) => {
  try {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    const currentDate = now.getDate()

    // Get start of week (Monday)
    const dayOfWeek = now.getDay()
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() + diffToMonday)
    startOfWeek.setHours(0, 0, 0, 0)

    // Build user filter for operators - only see their own laporan
    const userFilter =
      req.user?.role !== 'admin' && req.user?.userId
        ? eq(laporanRetribusi.submittedBy, req.user.userId)
        : undefined

    // Daily revenue (today) - count submitted and verified reports
    const dailyConditions = [
      sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
      sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${currentYear}`,
      sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) = ${currentMonth}`,
      sql`EXTRACT(DAY FROM ${laporanRetribusi.tanggalSetor}) = ${currentDate}`,
    ]
    if (userFilter) dailyConditions.push(userFilter)

    const [dailyRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` })
      .from(laporanRetribusi)
      .where(and(...dailyConditions))

    // Yesterday revenue
    const yesterday = new Date(now)
    yesterday.setDate(now.getDate() - 1)
    const yesterdayConditions = [
      sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
      sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${yesterday.getFullYear()}`,
      sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) = ${yesterday.getMonth() + 1}`,
      sql`EXTRACT(DAY FROM ${laporanRetribusi.tanggalSetor}) = ${yesterday.getDate()}`,
    ]
    if (userFilter) yesterdayConditions.push(userFilter)

    const [yesterdayRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` })
      .from(laporanRetribusi)
      .where(and(...yesterdayConditions))

    // Weekly revenue (this week) - count submitted and verified reports
    const weeklyConditions = [
      sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
      gte(laporanRetribusi.tanggalSetor, startOfWeek),
    ]
    if (userFilter) weeklyConditions.push(userFilter)

    const [weeklyRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` })
      .from(laporanRetribusi)
      .where(and(...weeklyConditions))

    // Last Week revenue
    const startOfLastWeek = new Date(startOfWeek)
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7)
    const lastWeekConditions = [
      sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
      gte(laporanRetribusi.tanggalSetor, startOfLastWeek),
      lt(laporanRetribusi.tanggalSetor, startOfWeek),
    ]
    if (userFilter) lastWeekConditions.push(userFilter)

    const [lastWeekRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` })
      .from(laporanRetribusi)
      .where(and(...lastWeekConditions))

    // Monthly revenue (this month) - count submitted and verified reports
    const monthlyConditions = [
      sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
      sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${currentYear}`,
      sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) = ${currentMonth}`,
    ]
    if (userFilter) monthlyConditions.push(userFilter)

    const [monthlyRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` })
      .from(laporanRetribusi)
      .where(and(...monthlyConditions))

    // Last Month revenue
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthConditions = [
      sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
      sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${lastMonthDate.getFullYear()}`,
      sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor}) = ${lastMonthDate.getMonth() + 1}`,
    ]
    if (userFilter) lastMonthConditions.push(userFilter)

    const [lastMonthRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` })
      .from(laporanRetribusi)
      .where(and(...lastMonthConditions))

    // Total revenue (current year) - count submitted and verified reports
    const totalRevenueConditions = [
      sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
      sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${currentYear}`,
    ]
    if (userFilter) totalRevenueConditions.push(userFilter)

    const [totalRevenue] = await db
      .select({ total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric` })
      .from(laporanRetribusi)
      .where(and(...totalRevenueConditions))

    // Total reports (current year) - count all reports (including draft)
    const totalReportsConditions = [
      sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor}) = ${currentYear}`,
    ]
    if (userFilter) totalReportsConditions.push(userFilter)

    const [totalReports] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(laporanRetribusi)
      .where(and(...totalReportsConditions))

    // Calculate Growth Helper
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return ((current - previous) / previous) * 100
    }

    const dailyTotal = Number(dailyRevenue?.total || 0)
    const yesterdayTotal = Number(yesterdayRevenue?.total || 0)

    const weeklyTotal = Number(weeklyRevenue?.total || 0)
    const lastWeekTotal = Number(lastWeekRevenue?.total || 0)

    const monthlyTotal = Number(monthlyRevenue?.total || 0)
    const lastMonthTotal = Number(lastMonthRevenue?.total || 0)

    res.json({
      success: true,
      data: {
        dailyRevenue: dailyTotal,
        dailyGrowth: calculateGrowth(dailyTotal, yesterdayTotal),
        weeklyRevenue: weeklyTotal,
        weeklyGrowth: calculateGrowth(weeklyTotal, lastWeekTotal),
        monthlyRevenue: monthlyTotal,
        monthlyGrowth: calculateGrowth(monthlyTotal, lastMonthTotal),
        totalRevenue: Number(totalRevenue?.total || 0),
        totalReports: totalReports?.count || 0,
        period: {
          year: currentYear,
          month: currentMonth,
        },
      },
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/dashboard/recent-reports
 * Get recent reports
 */
dashboardRouter.get('/recent-reports', async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10

    // Build user filter for operators - only see their own laporan
    const userFilter =
      req.user?.role !== 'admin' && req.user?.userId
        ? eq(laporanRetribusi.submittedBy, req.user.userId)
        : undefined

    const recentReports = await db
      .select({
        id: laporanRetribusi.id,
        nomorLaporan: laporanRetribusi.nomorLaporan,
        tanggalSetor: laporanRetribusi.tanggalSetor,
        nominal: laporanRetribusi.nominal,
        status: laporanRetribusi.status,
        jenisRetribusi: {
          id: jenisRetribusi.id,
          nama: jenisRetribusi.nama,
        },
        opd: {
          id: opd.id,
          nama: opd.nama,
        },
      })
      .from(laporanRetribusi)
      .leftJoin(jenisRetribusi, eq(laporanRetribusi.jenisRetribusiId, jenisRetribusi.id))
      .leftJoin(opd, eq(laporanRetribusi.opdId, opd.id))
      .where(userFilter || undefined)
      .orderBy(sql`${laporanRetribusi.createdAt} DESC`)
      .limit(limit)

    res.json({
      success: true,
      data: recentReports,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/dashboard/revenue-trend
 * Get revenue trend for charts
 */
dashboardRouter.get('/revenue-trend', async (req, res, next) => {
  try {
    const months = Number(req.query.months) || 6
    const currentDate = new Date()

    // Build user filter for operators - only see their own laporan
    const userFilter =
      req.user?.role !== 'admin' && req.user?.userId
        ? eq(laporanRetribusi.submittedBy, req.user.userId)
        : undefined

    const trendConditions = [
      eq(laporanRetribusi.status, 'verified'),
      gte(
        laporanRetribusi.tanggalSetor,
        new Date(currentDate.getFullYear(), currentDate.getMonth() - months, 1)
      ),
    ]
    if (userFilter) trendConditions.push(userFilter)

    const trend = await db
      .select({
        month: sql<number>`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor})::int`,
        year: sql<number>`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor})::int`,
        total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric`,
        count: sql<number>`count(*)::int`,
      })
      .from(laporanRetribusi)
      .where(and(...trendConditions))
      .groupBy(
        sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor})`,
        sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor})`
      )
      .orderBy(
        sql`EXTRACT(YEAR FROM ${laporanRetribusi.tanggalSetor})`,
        sql`EXTRACT(MONTH FROM ${laporanRetribusi.tanggalSetor})`
      )

    res.json({
      success: true,
      data: trend.map((item) => ({
        ...item,
        total: Number(item.total),
      })),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/dashboard/revenue-trend-daily
 * Get daily revenue trend for last 30 days
 */
dashboardRouter.get('/revenue-trend-daily', async (req, res, next) => {
  try {
    const days = Number(req.query.days) || 30
    const currentDate = new Date()
    const startDate = new Date(currentDate)
    startDate.setDate(currentDate.getDate() - days)

    // Build user filter for operators - only see their own laporan
    const userFilter =
      req.user?.role !== 'admin' && req.user?.userId
        ? eq(laporanRetribusi.submittedBy, req.user.userId)
        : undefined

    const trendConditions = [
      sql`${laporanRetribusi.status} IN ('submitted', 'verified')`,
      gte(laporanRetribusi.tanggalSetor, startDate),
    ]
    if (userFilter) trendConditions.push(userFilter)

    const trend = await db
      .select({
        date: sql<string>`TO_CHAR(${laporanRetribusi.tanggalSetor}, 'YYYY-MM-DD')`,
        total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric`,
        count: sql<number>`count(*)::int`,
      })
      .from(laporanRetribusi)
      .where(and(...trendConditions))
      .groupBy(sql`TO_CHAR(${laporanRetribusi.tanggalSetor}, 'YYYY-MM-DD')`)
      .orderBy(sql`TO_CHAR(${laporanRetribusi.tanggalSetor}, 'YYYY-MM-DD')`)

    // Fill in missing days with 0
    const result = []
    const map = new Map(trend.map((item) => [item.date, item]))

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      const dateStr = d.toISOString().split('T')[0]

      if (map.has(dateStr)) {
        result.push({
          ...map.get(dateStr),
          total: Number(map.get(dateStr)?.total || 0)
        })
      } else {
        result.push({
          date: dateStr,
          total: 0,
          count: 0
        })
      }
    }

    res.json({
      success: true,
      data: result,
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/dashboard/opd-revenue
 * Get revenue by OPD (Top 10)
 */
dashboardRouter.get('/opd-revenue', async (req, res, next) => {
  try {
    // Admin only for full view, operators only see their own OPD (which is just 1 bar, but consistent)
    const userFilter =
      req.user?.role !== 'admin' && req.user?.userId
        ? eq(laporanRetribusi.submittedBy, req.user.userId)
        : undefined

    const conditions = [sql`${laporanRetribusi.status} IN ('submitted', 'verified')`]
    if (userFilter) conditions.push(userFilter)

    const opdRevenue = await db
      .select({
        opdNama: opd.nama,
        opdKode: opd.kode,
        total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric`,
      })
      .from(laporanRetribusi)
      .leftJoin(opd, eq(laporanRetribusi.opdId, opd.id))
      .where(and(...conditions))
      .groupBy(opd.id, opd.nama, opd.kode)
      .orderBy(sql`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric DESC`)
      .limit(10)

    res.json({
      success: true,
      data: opdRevenue.map((item) => ({
        ...item,
        total: Number(item.total),
      })),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/dashboard/category-revenue
 * Get revenue by Category
 */
dashboardRouter.get('/category-revenue', async (req, res, next) => {
  try {
    const userFilter =
      req.user?.role !== 'admin' && req.user?.userId
        ? eq(laporanRetribusi.submittedBy, req.user.userId)
        : undefined

    const conditions = [sql`${laporanRetribusi.status} IN ('submitted', 'verified')`]
    if (userFilter) conditions.push(userFilter)

    const categoryRevenue = await db
      .select({
        kategori: jenisRetribusi.kategori,
        total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric`,
      })
      .from(laporanRetribusi)
      .leftJoin(jenisRetribusi, eq(laporanRetribusi.jenisRetribusiId, jenisRetribusi.id))
      .where(and(...conditions))
      .groupBy(jenisRetribusi.kategori)
      .orderBy(sql`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric DESC`)

    res.json({
      success: true,
      data: categoryRevenue.map((item) => ({
        ...item,
        total: Number(item.total),
      })),
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/dashboard/top-retribusi
 * Get top retribusi types by revenue
 */
dashboardRouter.get('/top-retribusi', async (req, res, next) => {
  try {
    const userFilter =
      req.user?.role !== 'admin' && req.user?.userId
        ? eq(laporanRetribusi.submittedBy, req.user.userId)
        : undefined

    const conditions = [sql`${laporanRetribusi.status} IN ('submitted', 'verified')`]
    if (userFilter) conditions.push(userFilter)

    const topRetribusi = await db
      .select({
        nama: jenisRetribusi.nama,
        total: sql<number>`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric`,
      })
      .from(laporanRetribusi)
      .leftJoin(jenisRetribusi, eq(laporanRetribusi.jenisRetribusiId, jenisRetribusi.id))
      .where(and(...conditions))
      .groupBy(jenisRetribusi.id, jenisRetribusi.nama)
      .orderBy(sql`COALESCE(SUM(${laporanRetribusi.nominal}), 0)::numeric DESC`)
      .limit(5)

    res.json({
      success: true,
      data: topRetribusi.map((item) => ({
        ...item,
        total: Number(item.total),
      })),
    })
  } catch (error) {
    next(error)
  }
})
