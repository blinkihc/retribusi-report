/**
 * Jenis Retribusi Form Page
 *
 * Form for creating and editing Jenis Retribusi data
 * - Toast notifications for success/error feedback
 *
 * Last Updated: 2025-11-14
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  DollarSign,
  Loader2,
  Save,
  XCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  checkKodeUnique,
  checkNamaUnique,
  createJenisRetribusi,
  getJenisRetribusiDetail,
  type JenisRetribusiCreateData,
  updateJenisRetribusi,
} from '../lib/api/jenis-retribusi'

export default function JenisRetribusiFormPage() {
  const { kode } = useParams<{ kode: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditMode = !!kode

  // Form state
  const [formData, setFormData] = useState<JenisRetribusiCreateData>({
    kode: '',
    nama: '',
    kategori: '',
    deskripsi: '',
    isActive: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uniqueCheck, setUniqueCheck] = useState<{
    kode: { checking: boolean; isUnique: boolean | null }
    nama: { checking: boolean; isUnique: boolean | null }
  }>({
    kode: { checking: false, isUnique: null },
    nama: { checking: false, isUnique: null },
  })

  // Fetch Jenis Retribusi data for edit mode
  const { data: jenisRetribusiData, isLoading: isLoadingData } = useQuery({
    queryKey: ['jenis-retribusi-detail', kode],
    queryFn: () => getJenisRetribusiDetail(kode!),
    enabled: isEditMode,
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (jenisRetribusiData?.data) {
      setFormData({
        kode: jenisRetribusiData.data.kode,
        nama: jenisRetribusiData.data.nama,
        kategori: jenisRetribusiData.data.kategori,
        deskripsi: jenisRetribusiData.data.deskripsi || '',
        isActive: jenisRetribusiData.data.isActive,
      })
    }
  }, [jenisRetribusiData])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createJenisRetribusi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jenis-retribusi-list'] })
      toast.success('Data Jenis Retribusi berhasil ditambahkan')
      navigate('/dashboard/settings?tab=jenis-retribusi')
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      let errorMessage = 'Gagal menyimpan data'
      const fieldErrors: Record<string, string> = {}

      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map((e: any) => {
          const field = e.path?.[0] || e.path?.join('.') || 'unknown'
          const message = e.message || 'Invalid value'
          fieldErrors[field] = message
          return `• ${field}: ${message}`
        })
        errorMessage = `${errorData.message || 'Validasi gagal'}:\n${errorMessages.join('\n')}`
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error('Gagal menyimpan data Jenis Retribusi')
      setErrors({ submit: errorMessage, ...fieldErrors })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: JenisRetribusiCreateData) => updateJenisRetribusi(kode!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jenis-retribusi-list'] })
      queryClient.invalidateQueries({ queryKey: ['jenis-retribusi-detail', kode] })
      toast.success('Data Jenis Retribusi berhasil diperbarui')
      navigate('/dashboard/settings?tab=jenis-retribusi')
    },
    onError: (error: any) => {
      const errorData = error.response?.data
      let errorMessage = 'Gagal mengupdate data'
      const fieldErrors: Record<string, string> = {}

      if (errorData?.errors && Array.isArray(errorData.errors)) {
        const errorMessages = errorData.errors.map((e: any) => {
          const field = e.path?.[0] || e.path?.join('.') || 'unknown'
          const message = e.message || 'Invalid value'
          fieldErrors[field] = message
          return `• ${field}: ${message}`
        })
        errorMessage = `${errorData.message || 'Validasi gagal'}:\n${errorMessages.join('\n')}`
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error('Gagal memperbarui data Jenis Retribusi')
      setErrors({ submit: errorMessage, ...fieldErrors })
    },
  })

  // Check kode uniqueness with debounce
  useEffect(() => {
    if (!formData.kode || isEditMode || formData.kode.trim().length < 3) {
      setUniqueCheck((prev) => ({ ...prev, kode: { checking: false, isUnique: null } }))
      return
    }

    const timer = setTimeout(async () => {
      setUniqueCheck((prev) => ({ ...prev, kode: { checking: true, isUnique: null } }))
      try {
        const result = await checkKodeUnique(formData.kode)
        setUniqueCheck((prev) => ({
          ...prev,
          kode: { checking: false, isUnique: result.isUnique },
        }))
      } catch (error) {
        console.error('Error checking kode uniqueness:', error)
        // Jika API belum ready, set null (tidak tampilkan error)
        setUniqueCheck((prev) => ({ ...prev, kode: { checking: false, isUnique: null } }))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.kode, isEditMode])

  // Check nama uniqueness with debounce
  useEffect(() => {
    if (!formData.nama || formData.nama.trim().length < 3) {
      setUniqueCheck((prev) => ({ ...prev, nama: { checking: false, isUnique: null } }))
      return
    }

    const timer = setTimeout(async () => {
      setUniqueCheck((prev) => ({ ...prev, nama: { checking: true, isUnique: null } }))
      try {
        const result = await checkNamaUnique(formData.nama)
        setUniqueCheck((prev) => ({
          ...prev,
          nama: { checking: false, isUnique: result.isUnique },
        }))
      } catch (error) {
        console.error('Error checking nama uniqueness:', error)
        // Jika API belum ready, set null (tidak tampilkan error)
        setUniqueCheck((prev) => ({ ...prev, nama: { checking: false, isUnique: null } }))
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.nama])

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.kode.trim()) {
      newErrors.kode = 'Nomor Rekening wajib diisi'
    } else if (formData.kode.length > 50) {
      newErrors.kode = 'Nomor Rekening maksimal 50 karakter'
    } else if (!isEditMode && uniqueCheck.kode.isUnique === false) {
      newErrors.kode = 'Nomor Rekening sudah digunakan'
    }

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama wajib diisi'
    } else if (formData.nama.length > 200) {
      newErrors.nama = 'Nama maksimal 200 karakter'
    } else if (uniqueCheck.nama.isUnique === false) {
      newErrors.nama = 'Nama Jenis Retribusi sudah digunakan'
    }

    if (!formData.kategori.trim()) {
      newErrors.kategori = 'Kategori wajib diisi'
    } else if (formData.kategori.length > 100) {
      newErrors.kategori = 'Kategori maksimal 100 karakter'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous errors
    setErrors({})

    // Client-side validation
    if (!validateForm()) {
      return
    }

    if (isEditMode) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  const isPageLoading = isEditMode && isLoadingData

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/dashboard/settings?tab=jenis-retribusi"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Data Jenis Retribusi
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <DollarSign className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit Jenis Retribusi' : 'Tambah Jenis Retribusi Baru'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {isEditMode
                  ? 'Perbarui data jenis retribusi'
                  : 'Tambahkan data jenis retribusi baru ke sistem'}
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errors.submit && (
          <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Gagal menyimpan data</h3>
                <p className="mt-1 text-sm text-red-700 whitespace-pre-line">{errors.submit}</p>

                {/* Show validation errors if any */}
                {Object.keys(errors).filter((k) => k !== 'submit').length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-sm text-red-700 space-y-1">
                    {Object.entries(errors)
                      .filter(([key]) => key !== 'submit')
                      .map(([key, message]) => (
                        <li key={key}>
                          <strong className="capitalize">{key}:</strong> {message}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="p-6 space-y-6">
            {/* Nomor Rekening */}
            <div>
              <label htmlFor="kode" className="block text-sm font-medium text-gray-700">
                Nomor Rekening <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="kode"
                  name="kode"
                  value={formData.kode}
                  onChange={handleChange}
                  disabled={isEditMode}
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.kode
                      ? 'border-red-300'
                      : uniqueCheck.kode.isUnique === false
                        ? 'border-red-300'
                        : uniqueCheck.kode.isUnique === true
                          ? 'border-green-300'
                          : 'border-gray-300'
                  } px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                  placeholder="Contoh: 4.1.02.01.01.0001"
                />
                {!isEditMode && formData.kode && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {uniqueCheck.kode.checking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : uniqueCheck.kode.isUnique === true ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : uniqueCheck.kode.isUnique === false ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {errors.kode && <p className="mt-1 text-sm text-red-600">{errors.kode}</p>}
              {!errors.kode && !isEditMode && uniqueCheck.kode.isUnique === false && (
                <p className="mt-1 text-sm text-red-600">Nomor Rekening sudah digunakan</p>
              )}
              {!errors.kode && !isEditMode && uniqueCheck.kode.isUnique === true && (
                <p className="mt-1 text-sm text-green-600">Nomor Rekening tersedia</p>
              )}
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">Nomor Rekening tidak dapat diubah</p>
              )}
            </div>

            {/* Nama */}
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                Nama Jenis Retribusi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  value={formData.nama}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.nama
                      ? 'border-red-300'
                      : uniqueCheck.nama.isUnique === false
                        ? 'border-red-300'
                        : uniqueCheck.nama.isUnique === true
                          ? 'border-green-300'
                          : 'border-gray-300'
                  } px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="Contoh: Retribusi Parkir"
                />
                {formData.nama && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {uniqueCheck.nama.checking ? (
                      <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    ) : uniqueCheck.nama.isUnique === true ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : uniqueCheck.nama.isUnique === false ? (
                      <XCircle className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
              {!errors.nama && uniqueCheck.nama.isUnique === false && (
                <p className="mt-1 text-sm text-red-600">Nama Jenis Retribusi sudah digunakan</p>
              )}
              {!errors.nama && uniqueCheck.nama.isUnique === true && (
                <p className="mt-1 text-sm text-green-600">Nama Jenis Retribusi tersedia</p>
              )}
            </div>

            {/* Kategori */}
            <div>
              <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">
                Kategori <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="kategori"
                name="kategori"
                value={formData.kategori}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border ${
                  errors.kategori ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                placeholder="Contoh: Jasa Umum"
              />
              {errors.kategori && <p className="mt-1 text-sm text-red-600">{errors.kategori}</p>}
            </div>

            {/* Deskripsi */}
            <div>
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
                Deskripsi
              </label>
              <textarea
                id="deskripsi"
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Deskripsi jenis retribusi"
              />
            </div>

            {/* Status Aktif */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Status Aktif
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-lg">
            <Link
              to="/dashboard/settings?tab=jenis-retribusi"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {isEditMode ? 'Update' : 'Simpan'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
