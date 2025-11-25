/**
 * Profile Page
 *
 * User profile management with Government Structured Brutalism style.
 *
 * Features:
 * - Brutalist header with avatar display
 * - Edit profile with avatar modal picker
 * - Change password with validation
 * - Structured card-based layout
 *
 * Last Updated: 2025-11-23
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit3, Lock, Mail, Save, User as UserIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import AvatarSelector from '../components/AvatarSelector'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { apiClient } from '../lib/api/client'
import { getOPDList } from '../lib/api/opd'
import { useAuth } from '../lib/auth/useAuth'
import { getAvatarById } from '../lib/avatars'

interface UpdateProfileData {
  fullName?: string
  email?: string
  avatar?: string
}

interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function ProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Form states
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)

  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    avatar: user?.avatar || 'avatar-1',
  })

  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Sync profileData with user data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        avatar: user.avatar || 'avatar-1',
      })
    }
  }, [user])

  const [alertDialog, setAlertDialog] = useState({
    open: false,
    title: '',
    description: '',
    type: 'success' as 'success' | 'error',
  })

  // Fetch OPD info if user is operator
  const { data: opdList } = useQuery({
    queryKey: ['opd-list-all'],
    queryFn: () => getOPDList({ limit: 1000 }),
    enabled: user?.role === 'operator' && !!user?.opdId,
  })

  const userOPD = opdList?.data.find((opd) => opd.id === user?.opdId)

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await apiClient.put('/api/auth/profile', data)
      return response.data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['auth-user'] })
      setIsEditingProfile(false)
      setAlertDialog({
        open: true,
        title: 'BERHASIL',
        description: 'PROFIL BERHASIL DIPERBARUI',
        type: 'success',
      })
      // Update localStorage with response data
      if (response.data) {
        localStorage.setItem('auth_user', JSON.stringify(response.data))
        // Dispatch custom event to notify other components
        window.dispatchEvent(new Event('userUpdated'))
      }
    },
    onError: (error: any) => {
      setAlertDialog({
        open: true,
        title: 'GAGAL',
        description: error.response?.data?.message || 'GAGAL MEMPERBARUI PROFIL',
        type: 'error',
      })
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await apiClient.post('/api/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      return response.data
    },
    onSuccess: () => {
      setIsChangingPassword(false)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setAlertDialog({
        open: true,
        title: 'BERHASIL',
        description: 'PASSWORD BERHASIL DIUBAH',
        type: 'success',
      })
    },
    onError: (error: any) => {
      setAlertDialog({
        open: true,
        title: 'GAGAL',
        description: error.response?.data?.message || 'GAGAL MENGUBAH PASSWORD',
        type: 'error',
      })
    },
  })

  const handleUpdateProfile = () => {
    console.log('Updating profile with data:', profileData)
    updateProfileMutation.mutate(profileData)
  }

  const handleChangePassword = () => {
    // Validation
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setAlertDialog({
        open: true,
        title: 'VALIDASI GAGAL',
        description: 'SEMUA KOLOM PASSWORD HARUS DIISI',
        type: 'error',
      })
      return
    }

    if (passwordData.newPassword.length < 6) {
      setAlertDialog({
        open: true,
        title: 'VALIDASI GAGAL',
        description: 'PASSWORD BARU MINIMAL 6 KARAKTER',
        type: 'error',
      })
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setAlertDialog({
        open: true,
        title: 'VALIDASI GAGAL',
        description: 'PASSWORD BARU DAN KONFIRMASI TIDAK SAMA',
        type: 'error',
      })
      return
    }

    changePasswordMutation.mutate(passwordData)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'BELUM PERNAH LOGIN'
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).toUpperCase()
  }

  const handleAvatarSelect = (avatarId: string) => {
    setProfileData({ ...profileData, avatar: avatarId })
    setShowAvatarModal(false)
  }

  const currentAvatar = getAvatarById(profileData.avatar)

  return (
    <div className="min-h-screen bg-slate-50 overflow-x-hidden w-full">
      {/* Brutalist Header with Avatar */}
      <div className="bg-slate-900 px-4 py-12 md:px-8 md:py-16 w-full relative overflow-hidden border-b-4 border-black">
        <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
        {/* Decoration Lines */}
        <div className="absolute top-0 right-0 w-64 h-64 border-l-2 border-b-2 border-slate-700 opacity-30" />
        <div className="absolute bottom-0 left-0 w-48 h-48 border-r-2 border-t-2 border-slate-700 opacity-30" />
        
        <div className="max-w-4xl mx-auto text-center w-full relative z-10">
          <div className="relative inline-block mb-6 group">
            <div className="relative">
              <img
                src={currentAvatar.imageUrl}
                alt={currentAvatar.name}
                className="h-32 w-32 md:h-40 md:w-40 rounded-none border-4 border-white shadow-hard-lg object-cover bg-white"
              />
              {/* Corner Accents for Avatar */}
              <div className="absolute -top-2 -left-2 w-4 h-4 border-t-4 border-l-4 border-yellow-400" />
              <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-4 border-r-4 border-yellow-400" />
            </div>
            
            {isEditingProfile && (
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute -bottom-4 -right-4 bg-white border-2 border-black p-3 shadow-hard hover:bg-yellow-50 hover:-translate-y-1 transition-all z-20"
                aria-label="Ubah avatar"
              >
                <Edit3 className="h-5 w-5 text-black" />
              </button>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 uppercase tracking-wide">
            {user?.fullName}
          </h1>
          <div className="inline-flex items-center gap-3 mt-2">
            <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border-2 ${
              user?.role === 'admin' 
                ? 'bg-purple-500 border-purple-900 text-white' 
                : 'bg-blue-500 border-blue-900 text-white'
            }`}>
              {user?.role === 'admin' ? 'Administrator' : 'Operator'}
            </span>
            <span className="text-slate-400 font-mono text-sm">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 md:px-8 w-full space-y-8">
        {/* Profile Information Card */}
        <div className="bg-white rounded-none border-2 border-black shadow-hard-lg relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-black" />
          <div className="p-6 border-b-2 border-black bg-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                Informasi Profil
              </h2>
              {!isEditingProfile && (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-black text-black font-bold uppercase text-xs tracking-wide hover:bg-yellow-50 hover:shadow-hard transition-all"
                >
                  <Edit3 className="h-4 w-4" />
                  Edit Profil
                </button>
              )}
            </div>
          </div>
          <div className="p-8">
            {isEditingProfile ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-yellow-50 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-yellow-50 focus:outline-none font-medium"
                  />
                </div>

                <div className="flex gap-4 pt-4 border-t-2 border-dashed border-slate-200">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={updateProfileMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white border-2 border-black font-bold uppercase tracking-wide hover:bg-slate-800 hover:shadow-hard transition-all disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {updateProfileMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingProfile(false)
                      setProfileData({
                        fullName: user?.fullName || '',
                        email: user?.email || '',
                        avatar: user?.avatar || 'avatar-1',
                      })
                    }}
                    className="px-6 py-3 bg-white text-black border-2 border-black font-bold uppercase tracking-wide hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border-2 border-slate-200 bg-slate-50/50 hover:border-black transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Username</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900 pl-8">{user?.username}</p>
                  </div>

                  <div className="p-4 border-2 border-slate-200 bg-slate-50/50 hover:border-black transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-slate-400" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900 pl-8">{user?.email}</p>
                  </div>

                  <div className="p-4 border-2 border-slate-200 bg-slate-50/50 hover:border-black transition-colors">
                    <div className="flex items-center gap-3 mb-2">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Role</p>
                    </div>
                    <div className="pl-8">
                      <span
                        className={`inline-flex items-center px-3 py-1 border-2 text-xs font-bold uppercase tracking-wide shadow-sm ${
                          user?.role === 'admin'
                            ? 'bg-purple-100 border-purple-900 text-purple-900'
                            : 'bg-blue-100 border-blue-900 text-blue-900'
                        }`}
                      >
                        {user?.role === 'admin' ? 'Administrator' : 'Operator'}
                      </span>
                    </div>
                  </div>

                  {user?.role === 'operator' && userOPD && (
                    <div className="p-4 border-2 border-slate-200 bg-slate-50/50 hover:border-black transition-colors">
                      <div className="flex items-center gap-3 mb-2">
                        <UserIcon className="h-5 w-5 text-slate-400" />
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">OPD</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900 pl-8">{userOPD.nama}</p>
                    </div>
                  )}

                  <div className="p-4 border-2 border-slate-200 bg-slate-50/50 hover:border-black transition-colors md:col-span-2">
                    <div className="flex items-center gap-3 mb-2">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Login Terakhir</p>
                    </div>
                    <p className="text-lg font-bold text-slate-900 pl-8 font-mono">{formatDate(user?.lastLogin || null)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-none border-2 border-black shadow-hard-lg relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-red-600" />
          <div className="p-6 border-b-2 border-black bg-slate-50">
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Keamanan Akun
            </h2>
          </div>
          <div className="p-8">
            {isChangingPassword ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                    Password Saat Ini <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({ ...passwordData, currentPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-yellow-50 focus:outline-none font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Password Baru <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, newPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-yellow-50 focus:outline-none font-medium"
                    />
                    <p className="mt-2 text-xs font-bold text-slate-400 uppercase">Minimal 6 karakter</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                      Konfirmasi Password <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                      }
                      className="w-full px-4 py-3 border-2 border-black bg-white focus:bg-yellow-50 focus:outline-none font-medium"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4 border-t-2 border-dashed border-slate-200">
                  <button
                    onClick={handleChangePassword}
                    disabled={changePasswordMutation.isPending}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white border-2 border-black font-bold uppercase tracking-wide hover:bg-slate-800 hover:shadow-hard transition-all disabled:opacity-50"
                  >
                    <Lock className="h-4 w-4" />
                    {changePasswordMutation.isPending ? 'Mengubah...' : 'Ubah Password'}
                  </button>
                  <button
                    onClick={() => {
                      setIsChangingPassword(false)
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      })
                    }}
                    className="px-6 py-3 bg-white text-black border-2 border-black font-bold uppercase tracking-wide hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-6 bg-slate-50 border-2 border-dashed border-slate-300">
                <div>
                  <p className="font-bold text-slate-900 uppercase mb-1">
                    Ubah Password
                  </p>
                  <p className="text-sm text-slate-600">
                    Pastikan password Anda kuat dan unik untuk keamanan.
                  </p>
                </div>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-black text-black font-bold uppercase tracking-wide shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all"
                >
                  <Lock className="h-4 w-4" />
                  Ubah
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
      <AvatarSelector
        isOpen={showAvatarModal}
        selectedAvatarId={profileData.avatar}
        onSelect={handleAvatarSelect}
        onClose={() => setShowAvatarModal(false)}
      />

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
      >
        <AlertDialogContent className="border-2 border-black shadow-hard-lg p-0 overflow-hidden">
          <div className={`h-2 w-full ${alertDialog.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
          <AlertDialogHeader className="p-6 pb-2">
            <AlertDialogTitle className="text-xl font-extrabold uppercase tracking-tight">
              {alertDialog.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 font-medium">
              {alertDialog.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="p-6 pt-4 bg-slate-50 border-t-2 border-slate-100">
            <AlertDialogAction
              onClick={() => setAlertDialog({ ...alertDialog, open: false })}
              className={`border-2 border-black font-bold uppercase tracking-wide shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 transition-all ${
                alertDialog.type === 'success'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
