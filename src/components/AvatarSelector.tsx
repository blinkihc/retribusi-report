/**
 * Avatar Selector Modal
 *
 * Full-screen modal for selecting avatar images
 */

import { X } from 'lucide-react'
import { useEffect } from 'react'
import { AVATARS } from '../lib/avatars'

interface AvatarSelectorProps {
  isOpen: boolean
  selectedAvatarId: string
  onSelect: (avatarId: string) => void
  onClose: () => void
}

export default function AvatarSelector({
  isOpen,
  selectedAvatarId,
  onSelect,
  onClose,
}: AvatarSelectorProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEsc)
    return () => document.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-neutral-900/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-2xl p-6 md:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900">Pilih Avatar Anda</h2>
            <p className="text-sm text-neutral-500">Pilih avatar yang mewakili diri Anda</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-full"
            aria-label="Tutup pemilih avatar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 max-h-[500px] overflow-y-auto pr-1">
          {AVATARS.map((avatar) => {
            const isSelected = avatar.id === selectedAvatarId
            return (
              <button
                key={avatar.id}
                onClick={() => onSelect(avatar.id)}
                className={`rounded-full p-1 transition-all hover:scale-105 focus:outline-none ${
                  isSelected ? 'ring-4 ring-primary-500 ring-offset-2' : ''
                }`}
              >
                <img
                  src={avatar.imageUrl}
                  alt={`Avatar ${avatar.id}`}
                  className="h-20 w-20 rounded-full object-cover shadow-md"
                  loading="lazy"
                />
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-800 transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  )
}
