/**
 * Notifications Routes
 *
 * Notifikasi real-time untuk operator: approve/reject laporan dari admin.
 *
 * Endpoints:
 * - GET /api/notifications          — List notif milik user (unread first)
 * - GET /api/notifications/unread-count — Count unread saja (untuk badge)
 * - PATCH /api/notifications/:id/read  — Mark satu notif sebagai dibaca
 * - PATCH /api/notifications/read-all  — Mark semua sebagai dibaca
 */

import { and, desc, eq } from 'drizzle-orm'
import { Router } from 'express'
import { db } from '../../src/lib/db'
import { notifications } from '../../src/lib/db/schema'

export const notificationsRouter = Router()

/**
 * GET /api/notifications
 * List notifikasi milik user yang login (unread first, max 50)
 */
notificationsRouter.get('/', async (req, res, next) => {
    try {
        const userId = req.user!.userId

        const data = await db
            .select()
            .from(notifications)
            .where(eq(notifications.userId, userId))
            .orderBy(notifications.isRead, desc(notifications.createdAt))
            .limit(50)

        res.json({ success: true, data })
    } catch (error) {
        next(error)
    }
})

/**
 * GET /api/notifications/unread-count
 * Hitung jumlah notifikasi yang belum dibaca (untuk badge di bell)
 */
notificationsRouter.get('/unread-count', async (req, res, next) => {
    try {
        const userId = req.user!.userId

        const rows = await db
            .select()
            .from(notifications)
            .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))

        res.json({ success: true, count: rows.length })
    } catch (error) {
        next(error)
    }
})

/**
 * PATCH /api/notifications/read-all
 * Mark semua notif user sebagai dibaca
 * NOTE: harus SEBELUM /:id agar tidak matching 'read-all' sebagai id
 */
notificationsRouter.patch('/read-all', async (req, res, next) => {
    try {
        const userId = req.user!.userId

        await db
            .update(notifications)
            .set({ isRead: true })
            .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))

        res.json({ success: true, message: 'Semua notifikasi ditandai dibaca' })
    } catch (error) {
        next(error)
    }
})

/**
 * PATCH /api/notifications/:id/read
 * Mark satu notifikasi sebagai dibaca
 */
notificationsRouter.patch('/:id/read', async (req, res, next) => {
    try {
        const userId = req.user!.userId
        const notifId = Number(req.params.id)

        const [notif] = await db
            .select()
            .from(notifications)
            .where(and(eq(notifications.id, notifId), eq(notifications.userId, userId)))

        if (!notif) {
            return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan' })
        }

        await db
            .update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, notifId))

        res.json({ success: true, message: 'Notifikasi ditandai dibaca' })
    } catch (error) {
        next(error)
    }
})
