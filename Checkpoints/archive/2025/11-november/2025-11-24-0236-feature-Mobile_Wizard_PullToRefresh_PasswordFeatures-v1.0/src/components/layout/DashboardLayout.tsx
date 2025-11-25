/**
 * Dashboard Layout
 *
 * Main layout untuk dashboard pages dengan sidebar dan header
 */

import { BarChart3, FileText, Home, PlusCircle, Settings, User, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import UserDropdown from '../UserDropdown'

export default function DashboardLayout() {
  // Get user role from localStorage with state to ensure reactivity
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  })
  const isAdmin = user?.role === 'admin'
  const location = useLocation()

  // Re-check user on mount and when localStorage changes
  useEffect(() => {
    const stored = localStorage.getItem('auth_user')
    if (stored) {
      const parsedUser = JSON.parse(stored)
      console.log('DashboardLayout - User loaded:', parsedUser)
      console.log('DashboardLayout - isAdmin:', parsedUser.role === 'admin')
      setUser(parsedUser)
    }

    // Listen for storage changes (from other tabs or manual updates)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_user' && e.newValue) {
        setUser(JSON.parse(e.newValue))
      }
    }

    // Listen for custom event (for same-tab updates)
    const handleUserUpdate = () => {
      const stored = localStorage.getItem('auth_user')
      if (stored) {
        setUser(JSON.parse(stored))
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('userUpdated', handleUserUpdate)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('userUpdated', handleUserUpdate)
    }
  }, [])

  // Show login success toast on first load
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('just_logged_in')
    if (justLoggedIn === 'true' && user?.username) {
      const now = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      toast.success(`User ${user.username} berhasil masuk pada jam ${now}`)
      sessionStorage.removeItem('just_logged_in')
    }
  }, [user?.username])

  // Navigation items
  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard', show: true },
    { path: '/dashboard/laporan-retribusi', icon: FileText, label: 'Laporan', show: true },
    { path: '/dashboard/laporan-retribusi/create', icon: PlusCircle, label: 'Buat', show: true },
    { path: '/dashboard/profile', icon: User, label: 'Profil', show: true },
    { path: '/dashboard/settings', icon: Settings, label: 'Settings', show: isAdmin },
  ]

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden">
      {/* Header - Hidden on mobile, visible on desktop */}
      <header className="hidden lg:block bg-white border-b-2 border-black px-6 py-4 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-600 border-2 border-black rounded-none" />
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight uppercase">
              Sistem Retribusi Daerah
            </h1>
          </div>
          {user && <UserDropdown user={user} />}
        </div>
      </header>

      {/* Mobile Header - Visible only on mobile/tablet */}
      <header className="lg:hidden bg-white border-b-2 border-black px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
            Retribusi
          </h1>
          {user && <UserDropdown user={user} />}
        </div>
      </header>

      <div className="flex w-full max-w-full overflow-x-hidden">
        {/* Sidebar - Hidden on mobile/tablet, visible on desktop */}
        <aside className="hidden lg:block w-72 bg-white border-r-2 border-black min-h-[calc(100vh-73px)] sticky top-[73px]">
          <nav className="p-4 space-y-3">
            {[
              { path: '/dashboard', icon: Home, label: 'Dashboard' },
              { path: '/dashboard/laporan-retribusi', icon: FileText, label: 'Laporan Retribusi' },
              ...(isAdmin
                ? [
                    { path: '/dashboard/reports', icon: BarChart3, label: 'Laporan Rekap' },
                    { path: '/dashboard/users', icon: Users, label: 'Manajemen User' },
                    { path: '/dashboard/settings', icon: Settings, label: 'Settings' },
                  ]
                : []),
              { path: '/dashboard/profile', icon: User, label: 'Profil Saya' },
            ].map((item) => {
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all duration-150 ${
                    active
                      ? 'bg-yellow-50 border-black text-black font-bold shadow-hard-sm translate-x-[2px] translate-y-[2px]'
                      : 'bg-transparent border-transparent text-slate-600 hover:bg-slate-100 hover:text-black hover:border-slate-200 font-medium'
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="uppercase tracking-wide text-sm">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 w-full max-w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Bottom Navigation - Visible only on mobile/tablet */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black z-50 safe-bottom shadow-[0_-4px_0_0_rgba(0,0,0,0.1)]">
        <div className="grid grid-cols-4 h-16">
          {navItems
            .filter((item) => item.show)
            .slice(0, 4) // Limit to 4 items for mobile
            .map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center gap-1 transition-all border-r-2 last:border-r-0 border-black ${
                    active
                      ? 'bg-black text-white'
                      : 'bg-white text-slate-500 hover:bg-yellow-50 hover:text-black'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className={`text-[10px] uppercase tracking-wider ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
        </div>
      </nav>
    </div>
  )
}
