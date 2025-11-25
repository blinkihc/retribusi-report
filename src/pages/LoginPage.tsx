/**
 * Login Page
 *
 * User authentication page dengan style Government Structured Brutalism
 *
 * Features:
 * - Username & password input
 * - Password visibility toggle (Eye/EyeOff icon)
 * - Remember Me checkbox (extends JWT to 7 days)
 * - Loading state with snappy transition
 * - Error message display with brutalist alert
 *
 * Design Concept:
 * - Background: Geometric Dot Pattern
 * - Inputs: Thick borders, focus feedback
 * - Buttons: Hard shadows, snappy interaction
 *
 * Last Updated: 2025-11-23
 */

import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Form, useActionData, useNavigation } from 'react-router-dom'
import { Footer } from '../components/layout/Footer'

type ActionData = {
  success: boolean
  message?: string
  errors?: string[]
}

export default function LoginPage() {
  const actionData = useActionData() as ActionData | undefined
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="min-h-screen bg-slate-50 relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-dot-pattern opacity-[0.03] pointer-events-none" />

      {/* Geometric Decorations (Abstract/Wireframe) */}
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
            Monitoring & Pelaporan Retribusi Daerah
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
              {actionData.errors && (
                <ul className="mt-2 list-disc list-inside text-sm">
                  {actionData.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
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
            disabled={isSubmitting}
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

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t-2 border-dashed border-slate-200 text-center">
          <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-2">
            Credentials Default
          </p>
          <div className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded font-mono text-sm text-slate-700">
            admin / Admin123
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer className="absolute bottom-4 left-0 right-0" />
    </div>
  )
}
