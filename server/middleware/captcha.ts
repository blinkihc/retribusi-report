/**
 * CAPTCHA Matematika — Server-side
 *
 * Generate soal matematika sederhana, simpan jawaban di memory dengan TTL.
 * Tidak perlu library external — pure JS.
 *
 * Endpoint: GET /api/captcha  → { id, question }
 * Validasi : captchaId + captchaAnswer dikirim bersama request login
 */

import type { NextFunction, Request, Response } from 'express'
import { Router } from 'express'
import { randomBytes } from 'crypto'

export const captchaRouter = Router()

// ─── Store ────────────────────────────────────────────────────────────────────

interface CaptchaEntry {
    answer: number
    expiresAt: number
}

const store = new Map<string, CaptchaEntry>()
const TTL_MS = 5 * 60 * 1000  // 5 menit

// Cleanup expired entries setiap 5 menit
setInterval(() => {
    const now = Date.now()
    for (const [id, entry] of store.entries()) {
        if (now > entry.expiresAt) store.delete(id)
    }
}, 5 * 60 * 1000)

// ─── Generator ────────────────────────────────────────────────────────────────

type Op = '+' | '-' | '×'

function generateCaptcha(): { id: string; question: string; answer: number } {
    const ops: Op[] = ['+', '-', '×']
    const op = ops[Math.floor(Math.random() * ops.length)]

    let a: number, b: number, answer: number

    if (op === '+') {
        a = Math.floor(Math.random() * 40) + 10   // 10–49
        b = Math.floor(Math.random() * 40) + 10
        answer = a + b
    } else if (op === '-') {
        a = Math.floor(Math.random() * 40) + 20   // 20–59
        b = Math.floor(Math.random() * 20)          // 0–19 → a > b selalu
        answer = a - b
    } else {
        a = Math.floor(Math.random() * 9) + 2     // 2–10
        b = Math.floor(Math.random() * 9) + 2
        answer = a * b
    }

    const id = randomBytes(16).toString('hex')
    const question = `${a} ${op} ${b} = ?`

    store.set(id, { answer, expiresAt: Date.now() + TTL_MS })

    return { id, question, answer }
}

// ─── Endpoint ─────────────────────────────────────────────────────────────────

/**
 * GET /api/captcha
 * Kembalikan soal baru. JANGAN kembalikan jawaban ke client.
 */
captchaRouter.get('/', (_req: Request, res: Response) => {
    const { id, question } = generateCaptcha()
    res.json({ success: true, data: { id, question } })
})

// ─── Validator ────────────────────────────────────────────────────────────────

/**
 * Validasi jawaban captcha dari body request.
 * Panggil sebelum proses login.
 * Body harus mengandung: captchaId (string), captchaAnswer (number/string)
 */
export function validateCaptcha(
    req: Request,
    res: Response,
    next: NextFunction
) {
    const { captchaId, captchaAnswer } = req.body

    if (!captchaId || captchaAnswer === undefined || captchaAnswer === '') {
        return res.status(400).json({
            success: false,
            message: 'Jawaban CAPTCHA wajib diisi.',
            captchaError: true,
        })
    }

    const entry = store.get(String(captchaId))

    if (!entry) {
        return res.status(400).json({
            success: false,
            message: 'CAPTCHA sudah kadaluarsa atau tidak valid. Muat ulang CAPTCHA.',
            captchaError: true,
        })
    }

    if (Date.now() > entry.expiresAt) {
        store.delete(String(captchaId))
        return res.status(400).json({
            success: false,
            message: 'CAPTCHA sudah kadaluarsa. Muat ulang CAPTCHA.',
            captchaError: true,
        })
    }

    const userAnswer = Number(captchaAnswer)
    if (isNaN(userAnswer) || userAnswer !== entry.answer) {
        // Hapus entry supaya captcha tidak bisa dicoba ulang dengan ID yang sama
        store.delete(String(captchaId))
        return res.status(400).json({
            success: false,
            message: 'Jawaban CAPTCHA salah. Muat ulang CAPTCHA.',
            captchaError: true,
        })
    }

    // Benar — hapus entry (one-time use)
    store.delete(String(captchaId))
    next()
}
