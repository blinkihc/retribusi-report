/**
 * Users Management Page
 *
 * CRUD operations for user management
 * Admin only access
 *
 * Last Updated: 2025-11-15
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Eye, EyeOff, Plus, RefreshCw, Trash2, UserCheck, UserX } from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import { getOPDList } from '../lib/api/opd'
import {
  type CreateUserData,
  createUser,
  deleteUser,
  getUsers,
  type UpdateUserData,
  type User,
  updateUser,
} from '../lib/api/users'

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<CreateUserData>({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: 'operator',
    opdId: null,
  })
  const [usernameError, setUsernameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  // Alert dialog state
  const [alertDialog, setAlertDialog] = useState<{
    open: boolean
    title: string
    description: string
    type: 'success' | 'error'
  }>({
    open: false,
    title: '',
    description: '',
    type: 'success',
  })

  // Generate Password
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    let pass = ''
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password: pass })
    setShowPassword(true) // Show password when generated
  }

  // Password Strength
  const getPasswordStrength = (password: string) => {
    if (!password) return 0
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    return score
  }

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-red-500'
    if (score <= 3) return 'bg-yellow-500'
    if (score <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  })

  // Fetch OPD list for dropdown
  const { data: opdList } = useQuery({
    queryKey: ['opd-list'],
    queryFn: () => getOPDList({ isActive: 'true', limit: 100 }),
  })

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowModal(false)
      resetForm()
      setAlertDialog({
        open: true,
        title: 'Berhasil!',
        description: 'User berhasil dibuat!',
        type: 'success',
      })
    },
    onError: (error: any) => {
      setAlertDialog({
        open: true,
        title: 'Gagal!',
        description: error.response?.data?.message || 'Gagal membuat user',
        type: 'error',
      })
    },
  })

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserData }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setShowModal(false)
      setEditingUser(null)
      resetForm()
      setAlertDialog({
        open: true,
        title: 'Berhasil!',
        description: 'User berhasil diperbarui!',
        type: 'success',
      })
    },
    onError: (error: any) => {
      setAlertDialog({
        open: true,
        title: 'Gagal!',
        description: error.response?.data?.message || 'Gagal memperbarui user',
        type: 'error',
      })
    },
  })

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      setAlertDialog({
        open: true,
        title: 'Berhasil!',
        description: 'User berhasil dihapus!',
        type: 'success',
      })
    },
    onError: (error: any) => {
      setAlertDialog({
        open: true,
        title: 'Gagal!',
        description: error.response?.data?.message || 'Gagal menghapus user',
        type: 'error',
      })
    },
  })

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      fullName: '',
      role: 'operator',
      opdId: null,
    })
    setUsernameError('')
    setEmailError('')
  }

  // Validate username
  const validateUsername = (username: string) => {
    if (username.length > 0 && username.length < 4) {
      setUsernameError('Username minimal 4 karakter')
      return false
    }

    // Check for duplicate username
    const isDuplicate = users?.some(
      (user) => user.username === username && user.id !== editingUser?.id
    )
    if (isDuplicate) {
      setUsernameError('Username sudah digunakan')
      return false
    }

    setUsernameError('')
    return true
  }

  // Validate email
  const validateEmail = (email: string) => {
    if (email.length === 0) {
      setEmailError('')
      return true
    }

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailError('Format email tidak valid')
      return false
    }

    // Check for duplicate email
    const isDuplicate = users?.some((user) => user.email === email && user.id !== editingUser?.id)
    if (isDuplicate) {
      setEmailError('Email sudah digunakan')
      return false
    }

    setEmailError('')
    return true
  }

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // Don't populate password
        fullName: user.fullName,
        role: user.role,
        opdId: user.opdId,
      })
    } else {
      setEditingUser(null)
      resetForm()
    }
    setShowModal(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate before submit
    const isUsernameValid = validateUsername(formData.username)
    const isEmailValid = validateEmail(formData.email)

    if (!isUsernameValid || !isEmailValid) {
      return
    }

    if (editingUser) {
      // Update user
      const updateData: UpdateUserData = {
        username: formData.username,
        fullName: formData.fullName,
        role: formData.role,
        opdId: formData.opdId,
      }
      // Only include password if it's not empty
      if (formData.password) {
        updateData.password = formData.password
      }
      updateMutation.mutate({ id: editingUser.id, data: updateData })
    } else {
      // Create user
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: number, username: string) => {
    if (confirm(`Yakin ingin menghapus user "${username}"?`)) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 max-w-full overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-4 lg:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Manajemen User</h1>
            <p className="mt-1 lg:mt-2 text-xs lg:text-sm text-gray-600">
              Kelola akun pengguna sistem
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 w-full sm:w-auto justify-center"
          >
            <Plus className="h-3.5 lg:h-4 w-3.5 lg:w-4" />
            Tambah User
          </button>
        </div>

        {/* Users Table */}
        <div
          className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-x-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            touchAction: 'pan-x pan-y',
          }}
        >
          <table className="w-full divide-y divide-gray-200" style={{ minWidth: '1000px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Nama Lengkap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  OPD
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Last Login
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : users && users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {user.username}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {user.fullName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {user.opdId ? (
                        opdList?.data.find((opd) => opd.id === user.opdId)?.nama ||
                        `OPD ID: ${user.opdId}`
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <UserCheck className="h-4 w-4" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <UserX className="h-4 w-4" />
                          Nonaktif
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleString('id-ID')
                        : 'Belum pernah login'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(user)}
                        className="mr-3 text-primary-600 hover:text-primary-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(user.id, user.username)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                    Belum ada user
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4">
              <div
                className="fixed inset-0 bg-black opacity-30"
                onClick={() => setShowModal(false)}
              />
              <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                <h2 className="mb-4 text-xl font-bold text-gray-900">
                  {editingUser ? 'Edit User' : 'Tambah User Baru'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                      type="text"
                      required
                      minLength={4}
                      value={formData.username}
                      onChange={(e) => {
                        setFormData({ ...formData, username: e.target.value })
                        validateUsername(e.target.value)
                      }}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 ${
                        usernameError
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      }`}
                    />
                    {usernameError && <p className="mt-1 text-sm text-red-600">{usernameError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value })
                        validateEmail(e.target.value)
                      }}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-1 ${
                        emailError
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
                      }`}
                    />
                    {emailError && <p className="mt-1 text-sm text-red-600">{emailError}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password {editingUser && '(kosongkan jika tidak ingin mengubah)'}
                    </label>
                    <div className="mt-1 relative flex rounded-md shadow-sm">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required={!editingUser}
                        minLength={6}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full rounded-l-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="relative -ml-px inline-flex items-center border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={generatePassword}
                        className="relative -ml-px inline-flex items-center rounded-r-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 hover:bg-gray-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        title="Generate Secure Password"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Strength Indicator */}
                    {formData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`flex-1 rounded-full transition-all ${
                                getPasswordStrength(formData.password) >= level
                                  ? getStrengthColor(getPasswordStrength(formData.password))
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Kekuatan:{' '}
                          {
                            [
                              'Sangat Lemah',
                              'Lemah',
                              'Sedang',
                              'Kuat',
                              'Sangat Kuat',
                              'Sangat Kuat',
                            ][getPasswordStrength(formData.password)]
                          }
                        </p>
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">Minimal 6 karakter</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value as 'admin' | 'operator' })
                      }
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="operator">Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {formData.role === 'operator' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        OPD <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.opdId || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            opdId: e.target.value ? Number(e.target.value) : null,
                          })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">-- Pilih OPD --</option>
                        {opdList?.data.map((opd) => (
                          <option key={opd.id} value={opd.id}>
                            {opd.kode} - {opd.nama}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        Operator harus di-assign ke OPD tertentu
                      </p>
                    </div>
                  )}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false)
                        setEditingUser(null)
                        resetForm()
                      }}
                      className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="flex-1 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                    >
                      {createMutation.isPending || updateMutation.isPending
                        ? 'Menyimpan...'
                        : editingUser
                          ? 'Update'
                          : 'Simpan'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alert Dialog */}
      <AlertDialog
        open={alertDialog.open}
        onOpenChange={(open) => setAlertDialog({ ...alertDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => setAlertDialog({ ...alertDialog, open: false })}
              className={
                alertDialog.type === 'success'
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              }
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
