/**
 * Rate Limiter Middleware
 *
 * In-memory rate limiter untuk melindungi endpoint login dari brute force.
 * Tidak memerlukan Redis — pakai Map dengan auto-cleanup.
 *
 * Konfigurasi:
 * - Max 5 percobaan gagal per IP dalam 15 menit
 * - Block selama 15 menit setelah limit tercapai
 * - Auto-cleanup expired entries setiap 10 menit
 */

import type { NextFunction, Request, Response } from 'express'

interface AttemptRecord {
    count: number
    firstAttempt: number
    blockedUntil?: number
}

// In-memory store: key = IP address
const attempts = new Map<string, AttemptRecord>()

const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000      // 15 menit
const BLOCK_MS = 15 * 60 * 1000     // 15 menit block

// Auto-cleanup setiap 10 menit agar Map tidak membengkak
setInterval(() => {
    const now = Date.now()
    for (const [ip, record] of attempts.entries()) {
        const expired = record.blockedUntil
            ? now > record.blockedUntil
            : now - record.firstAttempt > WINDOW_MS
        if (expired) attempts.delete(ip)
    }
}, 10 * 60 * 1000)

/**
 * Middleware: batasi percobaan login berdasarkan IP.
 * Terapkan SEBELUM proses login, attach helper ke req untuk dipakai di route.
 */
export function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const now = Date.now()

    let record = attempts.get(ip)

    // Kalau ada record dan sudah di-block
    if (record?.blockedUntil) {
        if (now < record.blockedUntil) {
            const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60_000)
            return res.status(429).json({
                success: false,
                message: `Terlalu banyak percobaan login gagal. Coba lagi dalam ${remainingMinutes} menit.`,
                retryAfter: remainingMinutes,
            })
        }
        // Block sudah expired — reset
        attempts.delete(ip)
        record = undefined
    }

    // Reset jika window sudah lewat
    if (record && now - record.firstAttempt > WINDOW_MS) {
        attempts.delete(ip)
        record = undefined
    }

    next()
}

/**
 * Helper: dipanggil dari route login saat credential SALAH.
 * Increment counter, block jika sudah mencapai batas.
 */
export function recordFailedAttempt(ip: string): {
    remainingAttempts: number
    blocked: boolean
    blockMinutes?: number
} {
    const now = Date.now()
    let record = attempts.get(ip)

    if (!record || now - record.firstAttempt > WINDOW_MS) {
        record = { count: 0, firstAttempt: now }
    }

    record.count += 1

    if (record.count >= MAX_ATTEMPTS) {
        record.blockedUntil = now + BLOCK_MS
        attempts.set(ip, record)
        const blockMinutes = Math.ceil(BLOCK_MS / 60_000)
        return { remainingAttempts: 0, blocked: true, blockMinutes }
    }

    attempts.set(ip, record)
    return { remainingAttempts: MAX_ATTEMPTS - record.count, blocked: false }
}

/**
 * Helper: dipanggil dari route login saat credential BENAR.
 * Reset counter untuk IP tersebut.
 */
export function resetAttempts(ip: string): void {
    attempts.delete(ip)
}
