/**
 * Authentication Actions - React Router v7
 *
 * Form actions untuk authentication flows
 */

import type { ActionFunctionArgs } from 'react-router-dom'
import { redirect } from 'react-router-dom'
import { api } from '@/lib/api/client'
import { storeToken, storeUser } from '@/lib/auth/storage'
import { loginSchema } from '@/lib/validation/user'

/**
 * Login Action
 * Handles login form submission
 */
export async function loginAction({ request }: ActionFunctionArgs) {
  const formData = await request.formData()
  const username = formData.get('username') as string
  const password = formData.get('password') as string
  const rememberMe = formData.get('rememberMe') === 'on'
  const captchaId = formData.get('captchaId') as string
  const captchaAnswer = formData.get('captchaAnswer') as string

  // Validate input
  const validationResult = loginSchema.safeParse({ username, password })

  if (!validationResult.success) {
    return {
      success: false,
      errors: validationResult.error.issues.map((issue) => issue.message),
    }
  }

  try {
    // Call login API — sertakan captchaId dan captchaAnswer
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, rememberMe, captchaId, captchaAnswer }),
    })
    const data = await response.json()

    if (!data.success) {
      return {
        success: false,
        message: data.message || 'Login gagal',
        captchaError: data.captchaError ?? false,
        remainingAttempts: data.remainingAttempts,
      }
    }

    // Store token and user data using storage utilities
    if (data.token) {
      storeToken(data.token)
      storeUser(data.user)

      // Store remember me preference
      if (rememberMe) {
        localStorage.setItem('remember_me', 'true')
      }

      // Set flag for login success toast
      sessionStorage.setItem('just_logged_in', 'true')
    }

    // Redirect to dashboard
    return redirect('/dashboard')
  } catch (error: any) {
    console.error('Login error:', error)
    return {
      success: false,
      message: error.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.',
    }
  }
}
