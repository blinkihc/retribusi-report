/**
 * Login Page — dengan Rate Limiting & CAPTCHA Matematika
 *
 * Features:
 * - Username & password input
 * - CAPTCHA matematika (generate on mount, refresh otomatis jika salah)
 * - Password visibility toggle
 * - Remember Me checkbox (JWT 7 hari)
 * - Feedback sisa percobaan login
 *
 * Last Updated: 2026-02-24
 */

import { Eye, EyeOff, RefreshCw, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Form, useActionData, useNavigation } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'

type ActionData = {
  success: boolean
  message?: string
  errors?: string[]
  captchaError?: boolean
  remainingAttempts?: number
}

async function fetchCaptcha(): Promise<{ id: string; question: string } | null> {
  try {
    const res = await fetch('/api/captcha')
    if (!res.ok) return null
    const json = await res.json()
    return json.data ?? null
  } catch {
    return null
  }
}

export default function LoginPage() {
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const [showPassword, setShowPassword] = useState(false)

  // CAPTCHA state
  const [captcha, setCaptcha] = useState<{ id: string; question: string } | null>(null)
  const [captchaLoading, setCaptchaLoading] = useState(false)

  const loadCaptcha = async () => {
    setCaptchaLoading(true)
    const data = await fetchCaptcha()
    setCaptcha(data)
    setCaptchaLoading(false)
  }

  useEffect(() => {
    loadCaptcha()
  }, [loadCaptcha])

  // Refresh CAPTCHA otomatis jika ada captchaError
  useEffect(() => {
    if (actionData?.captchaError) {
      loadCaptcha()
    }
  }, [actionData, loadCaptcha])

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />

      {/* Geometric Decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 border-r-2 border-b-2 border-slate-200 opacity-20 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 border-l-2 border-t-2 border-slate-200 opacity-20 pointer-events-none rounded-tl-3xl" />

      <div className="relative max-w-md w-full bg-white border-2 border-black shadow-hard-lg rounded-lg p-8 z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 border-2 border-black shadow-hard-sm rounded-full mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-700" strokeWidth={2} />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            LOGIN SISTEM
          </h1>
          <p className="text-slate-600 font-medium border-b-2 border-slate-100 pb-4 inline-block">
            Monitoring &amp; Pelaporan Retribusi Daerah
          </p>
        </div>

        <Form method="post" className="space-y-6">
          {/* Error Alert */}
          {actionData && !actionData.success && (
            <div className="p-4 bg-red-50 border-2 border-red-700 text-red-900 rounded-lg shadow-hard-sm animate-in slide-in-from-top-2 duration-200">
              <p className="font-bold flex items-center gap-2">⚠️ Login Gagal</p>
              <p className="text-sm mt-1 font-medium">
                {actionData.message || 'Periksa kembali username dan password.'}
              </p>
              {typeof actionData.remainingAttempts === 'number' &&
                actionData.remainingAttempts > 0 && (
                  <p className="text-xs mt-1 text-red-700">
                    Sisa percobaan: <strong>{actionData.remainingAttempts}</strong>
                  </p>
                )}
            </div>
          )}

          {/* Username Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-lg 
                focus:border-black focus:bg-yellow-50 focus:ring-0 outline-none
                transition-colors duration-150 font-medium text-slate-900 placeholder:text-slate-400"
              placeholder="Masukkan username"
              required
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 pr-12 bg-white border-2 border-slate-300 rounded-lg 
                  focus:border-black focus:bg-yellow-50 focus:ring-0 outline-none
                  transition-colors duration-150 font-medium text-slate-900 placeholder:text-slate-400"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-black transition-colors"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Eye className="w-5 h-5" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>

          {/* CAPTCHA */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2 uppercase tracking-wide">
              Verifikasi Anti-Bot
            </label>
            <div
              className={`flex items-center gap-3 p-4 rounded-lg border-2 mb-3 ${
                actionData?.captchaError
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300 bg-slate-50'
              }`}
            >
              {captchaLoading ? (
                <span className="text-slate-400 text-sm italic">Memuat soal…</span>
              ) : captcha ? (
                <>
                  <span className="font-mono text-lg font-extrabold text-slate-800 tracking-widest select-none">
                    {captcha.question}
                  </span>
                  <button
                    type="button"
                    onClick={loadCaptcha}
                    className="ml-auto text-slate-400 hover:text-slate-700 transition-colors"
                    title="Muat soal baru"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  {/* Hidden fields untuk dikirim ke server */}
                  <input type="hidden" name="captchaId" value={captcha.id} />
                </>
              ) : (
                <button
                  type="button"
                  onClick={loadCaptcha}
                  className="text-sm text-blue-600 underline"
                >
                  Gagal memuat CAPTCHA — klik untuk coba lagi
                </button>
              )}
            </div>
            <input
              id="captchaAnswer"
              name="captchaAnswer"
              type="number"
              inputMode="numeric"
              className={`w-full px-4 py-3 bg-white border-2 rounded-lg 
                focus:ring-0 outline-none transition-colors duration-150 font-mono text-lg
                ${
                  actionData?.captchaError
                    ? 'border-red-400 focus:border-red-600 bg-red-50'
                    : 'border-slate-300 focus:border-black focus:bg-yellow-50'
                }`}
              placeholder="Masukkan jawaban…"
              required
            />
            {actionData?.captchaError && (
              <p className="text-xs text-red-600 mt-1 font-medium">
                Jawaban salah atau CAPTCHA kadaluarsa. Soal baru telah dimuat.
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <div className="relative flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="peer h-5 w-5 cursor-pointer appearance-none border-2 border-slate-400 rounded bg-white checked:bg-primary-600 checked:border-black transition-all"
              />
              <svg
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <label
              htmlFor="rememberMe"
              className="ml-3 text-sm font-medium text-slate-700 cursor-pointer select-none"
            >
              Ingat saya selama 7 hari
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !captcha}
            className="w-full px-4 py-3.5 bg-primary-600 text-white text-lg font-bold uppercase tracking-wider
              border-2 border-black rounded-lg shadow-hard-sm
              hover:bg-primary-700 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none
              active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
              disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0
              transition-snappy flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Logging in...
              </>
            ) : (
              'Masuk Dashboard'
            )}
          </button>
        </Form>
      </div>

      {/* Footer */}
      <Footer className="absolute bottom-4 left-0 right-0" />
    </div>
  )
}
