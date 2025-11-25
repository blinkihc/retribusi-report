/**
 * Protected Route Component
 * Redirects non-admin users away from admin-only pages
 */

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const navigate = useNavigate()

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('auth_user') || '{}')

    // If admin required and user is not admin, redirect
    if (requireAdmin && user.role !== 'admin') {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate, requireAdmin])

  return <>{children}</>
}
