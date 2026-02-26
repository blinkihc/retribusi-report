/**
 * NotificationBell Component
 *
 * Bell icon dengan badge unread count + dropdown daftar notifikasi.
 * Polling setiap 30 detik untuk notifikasi baru.
 * Klik notifikasi → mark as read + navigate ke laporan (jika ada laporanId).
 */

import { Bell, BellDot, CheckCheck, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/api/client'

interface NotificationItem {
  id: number
  type: string // 'approved' | 'rejected' | 'info'
  title: string
  message: string
  laporanId: number | null
  isRead: boolean
  createdAt: string
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Baru saja'
  if (mins < 60) return `${mins} mnt lalu`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  const days = Math.floor(hrs / 24)
  return `${days} hari lalu`
}

export default function NotificationBell() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get<{ success: boolean; data: NotificationItem[] }>(
        '/api/notifications'
      )
      if (res.data.success) setNotifications(res.data.data)
    } catch {
      // Gagal fetch — silent fail
    }
  }

  // Initial fetch + polling 30 detik
  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30_000)
    return () => clearInterval(interval)
  }, [fetchNotifications])

  // Close dropdown saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markRead = async (id: number) => {
    try {
      await apiClient.patch(`/api/notifications/${id}/read`, {})
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch {
      /* silent */
    }
  }

  const markAllRead = async () => {
    try {
      await apiClient.patch('/api/notifications/read-all', {})
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch {
      /* silent */
    }
  }

  const handleClick = async (notif: NotificationItem) => {
    await markRead(notif.id)
    setOpen(false)
    // Navigate ke list laporan — route detail individual belum ada
    // Untuk laporan approved/rejected → tab final/ditolak
    if (notif.laporanId) {
      const tab = notif.type === 'rejected' ? 'ditolak' : 'final'
      navigate(`/dashboard/laporan-retribusi?tab=${tab}`)
    }
  }

  const typeColor = (type: string) => {
    if (type === 'approved') return 'bg-green-100 border-green-400 text-green-700'
    if (type === 'rejected') return 'bg-red-100 border-red-400 text-red-700'
    return 'bg-blue-100 border-blue-400 text-blue-700'
  }

  const typeIcon = (type: string) => {
    if (type === 'approved') return '✅'
    if (type === 'rejected') return '❌'
    return 'ℹ️'
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative p-2 border-2 border-slate-300 rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-colors"
        title="Notifikasi"
      >
        {unreadCount > 0 ? (
          <BellDot className="h-5 w-5 text-blue-600" />
        ) : (
          <Bell className="h-5 w-5 text-slate-600" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 border border-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b-2 border-black bg-slate-50">
            <span className="font-bold text-sm text-slate-800 uppercase tracking-wide">
              Notifikasi
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  title="Tandai semua dibaca"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Baca semua
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {unreadCount === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
                Belum ada notifikasi
              </div>
            ) : (
              notifications
                .filter((n) => !n.isRead)
                .map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleClick(notif)}
                    className="w-full text-left px-4 py-3 border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-base mt-0.5 shrink-0">{typeIcon(notif.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border mb-1 ${typeColor(notif.type)}`}
                        >
                          {notif.title}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{notif.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {formatRelativeTime(notif.createdAt)}
                        </p>
                      </div>
                      {!notif.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1" />
                      )}
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
