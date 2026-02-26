/**
 * OPD Form Page
 *
 * Form for creating and editing OPD data
 * - Toast notifications for success/error feedback
 *
 * Last Updated: 2025-11-14
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, Building2, Loader2, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { createOPD, getOPDDetail, type OPDCreateData, updateOPD } from '../lib/api/opd'

export default function OPDFormPage() {
  const { kode } = useParams<{ kode: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isEditMode = !!kode

  // Form state
  const [formData, setFormData] = useState<OPDCreateData>({
    kode: '',
    nama: '',
    alamat: '',
    telepon: '',
    email: '',
    kepala: '',
    nipKepala: '',
    isActive: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch OPD data for edit mode
  const { data: opdData, isLoading: isLoadingOPD } = useQuery({
    queryKey: ['opd-detail', kode],
    queryFn: () => getOPDDetail(kode!),
    enabled: isEditMode,
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (opdData?.data) {
      setFormData({
        kode: opdData.data.kode,
        nama: opdData.data.nama,
        alamat: opdData.data.alamat || '',
        telepon: opdData.data.telepon || '',
        email: opdData.data.email || '',
        kepala: opdData.data.kepala || '',
        nipKepala: opdData.data.nipKepala || '',
        isActive: opdData.data.isActive,
      })
    }
  }, [opdData])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createOPD,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opd-list'] })
      toast.success('Data OPD berhasil ditambahkan')
      navigate('/dashboard/settings?tab=opd')
    },
    onError: (error: any) => {
      console.error('Create error - Full error:', error)
      console.error('Create error - Response:', error.response)
      console.error('Create error - Response data:', error.response?.data)
      console.error(
        'Create error - Response data (JSON):',
        JSON.stringify(error.response?.data, null, 2)
      )

      // Extract detailed error message
      const errorData = error.response?.data
      let errorMessage = 'Gagal menyimpan data'
      const fieldErrors: Record<string, string> = {}

      console.log('Error data structure:', {
        hasMessage: !!errorData?.message,
        hasErrors: !!errorData?.errors,
        isErrorsArray: Array.isArray(errorData?.errors),
        errorDataKeys: errorData ? Object.keys(errorData) : [],
        fullErrorData: errorData,
      })

      // Handle different error response formats
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Zod validation errors - show each error
        const errorMessages = errorData.errors.map((e: any) => {
          // Extract field name from path if available
          const field = e.path?.[0] || e.path?.join('.') || 'unknown'
          const message = e.message || 'Invalid value'
          fieldErrors[field] = message
          return `• ${field}: ${message}`
        })
        errorMessage = `${errorData.message || 'Validasi gagal'}:\n${errorMessages.join('\n')}`
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else if (errorData?.error) {
        // Alternative error format
        errorMessage = errorData.error
      } else if (error.message) {
        errorMessage = error.message
      }

      console.log('Final error message:', errorMessage)
      console.log('Field errors:', fieldErrors)

      // Show toast for general error
      toast.error('Gagal menyimpan data OPD')
      setErrors({ submit: errorMessage, ...fieldErrors })
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: OPDCreateData) => updateOPD(kode!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opd-list'] })
      queryClient.invalidateQueries({ queryKey: ['opd-detail', kode] })
      toast.success('Data OPD berhasil diperbarui')
      navigate('/dashboard/settings?tab=opd')
    },
    onError: (error: any) => {
      console.error('Update error - Full error:', error)
      console.error('Update error - Response:', error.response)
      console.error('Update error - Response data:', error.response?.data)

      // Extract detailed error message
      const errorData = error.response?.data
      let errorMessage = 'Gagal mengupdate data'
      const fieldErrors: Record<string, string> = {}

      // Handle different error response formats
      if (errorData?.errors && Array.isArray(errorData.errors)) {
        // Zod validation errors - show each error
        const errorMessages = errorData.errors.map((e: any) => {
          // Extract field name from path if available
          const field = e.path?.[0] || e.path?.join('.') || 'unknown'
          const message = e.message || 'Invalid value'
          fieldErrors[field] = message
          return `• ${field}: ${message}`
        })
        errorMessage = `${errorData.message || 'Validasi gagal'}:\n${errorMessages.join('\n')}`
      } else if (errorData?.message) {
        errorMessage = errorData.message
      } else if (errorData?.error) {
        // Alternative error format
        errorMessage = errorData.error
      } else if (error.message) {
        errorMessage = error.message
      }

      // Show toast for general error
      toast.error('Gagal memperbarui data OPD')
      setErrors({ submit: errorMessage, ...fieldErrors })
    },
  })

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
      newErrors.kode = 'Kode OPD wajib diisi'
    } else if (formData.kode.length > 20) {
      newErrors.kode = 'Kode OPD maksimal 20 karakter'
    }

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama OPD wajib diisi'
    } else if (formData.nama.length > 200) {
      newErrors.nama = 'Nama OPD maksimal 200 karakter'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid'
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
      console.log('Client validation failed:', errors)
      return
    }

    console.log('Submitting form data:', formData)

    if (isEditMode) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending
  const isPageLoading = isEditMode && isLoadingOPD

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
            to="/dashboard/settings?tab=opd"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Data OPD
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <Building2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEditMode ? 'Edit OPD' : 'Tambah OPD Baru'}
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {isEditMode ? 'Perbarui data OPD' : 'Tambahkan data OPD baru ke sistem'}
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
            {/* Kode OPD */}
            <div>
              <label htmlFor="kode" className="block text-sm font-medium text-gray-700">
                Kode OPD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="kode"
                name="kode"
                value={formData.kode}
                onChange={handleChange}
                disabled={isEditMode} // Kode tidak bisa diubah saat edit
                className={`mt-1 block w-full rounded-lg border ${
                  errors.kode ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
                placeholder="Contoh: BAPENDA"
              />
              {errors.kode && <p className="mt-1 text-sm text-red-600">{errors.kode}</p>}
              {isEditMode && (
                <p className="mt-1 text-xs text-gray-500">Kode OPD tidak dapat diubah</p>
              )}
            </div>

            {/* Nama OPD */}
            <div>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                Nama OPD <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="nama"
                name="nama"
                value={formData.nama}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-lg border ${
                  errors.nama ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                placeholder="Contoh: Badan Pendapatan Daerah"
              />
              {errors.nama && <p className="mt-1 text-sm text-red-600">{errors.nama}</p>}
            </div>

            {/* Alamat */}
            <div>
              <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                Alamat
              </label>
              <textarea
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Alamat lengkap OPD"
              />
            </div>

            {/* Telepon & Email */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="telepon" className="block text-sm font-medium text-gray-700">
                  Telepon
                </label>
                <input
                  type="text"
                  id="telepon"
                  name="telepon"
                  value={formData.telepon}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  placeholder="0271-123456"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`}
                  placeholder="email@opd.go.id"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            {/* Kepala */}
            <div>
              <label htmlFor="kepala" className="block text-sm font-medium text-gray-700">
                Kepala OPD
              </label>
              <input
                type="text"
                id="kepala"
                name="kepala"
                value={formData.kepala}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Nama kepala OPD beserta gelar"
              />
            </div>

            {/* NIP Kepala OPD */}
            <div>
              <label htmlFor="nipKepala" className="block text-sm font-medium text-gray-700">
                NIP Kepala OPD
              </label>
              <input
                type="text"
                id="nipKepala"
                name="nipKepala"
                value={formData.nipKepala}
                onChange={handleChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="Contoh: 19780101 200501 1 001"
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
              to="/dashboard/settings?tab=opd"
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
