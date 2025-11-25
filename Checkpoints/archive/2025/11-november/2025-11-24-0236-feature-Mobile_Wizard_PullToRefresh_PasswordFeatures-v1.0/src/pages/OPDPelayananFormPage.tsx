/**
 * OPD-Pelayanan Form Page
 *
 * Form for creating OPD-Pelayanan relationship
 * - Toast notifications for success/error feedback
 *
 * Last Updated: 2025-11-14
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, ArrowLeft, Link2, Loader2, Save } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getJenisRetribusiList } from '../lib/api/jenis-retribusi'
import { getOPDList } from '../lib/api/opd'
import { createOPDPelayanan, type OPDPelayananCreateData } from '../lib/api/opd-pelayanan'

export default function OPDPelayananFormPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Form state
  const [formData, setFormData] = useState({
    opdKode: '',
    jenisRetribusiKode: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch OPD list for dropdown
  const { data: opdList, isLoading: isLoadingOPD } = useQuery({
    queryKey: ['opd-list-all'],
    queryFn: () => getOPDList({ limit: 1000 }),
  })

  // Fetch Jenis Retribusi list for dropdown
  const { data: jenisRetribusiList, isLoading: isLoadingJenisRetribusi } = useQuery({
    queryKey: ['jenis-retribusi-list-all'],
    queryFn: () => getJenisRetribusiList({ limit: 1000 }),
  })

  // Debug: Log data
  console.log('OPD List:', opdList)
  console.log('Jenis Retribusi List:', jenisRetribusiList)

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createOPDPelayanan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opd-pelayanan-list'] })
      toast.success('Hubungan OPD-Pelayanan berhasil ditambahkan')
      navigate('/dashboard/settings?tab=opd-pelayanan')
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

      toast.error('Gagal menyimpan hubungan OPD-Pelayanan')
      setErrors({ submit: errorMessage, ...fieldErrors })
    },
  })

  // Handle select change
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

    if (!formData.opdKode) {
      newErrors.opdKode = 'OPD wajib dipilih'
    }

    if (!formData.jenisRetribusiKode) {
      newErrors.jenisRetribusiKode = 'Jenis Retribusi wajib dipilih'
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

    // Find selected jenis retribusi to get the nama
    const selectedJenisRetribusi = jenisRetribusiList?.data.find(
      (jr) => jr.kode === formData.jenisRetribusiKode
    )

    if (!selectedJenisRetribusi) {
      setErrors({ jenisRetribusiKode: 'Jenis Retribusi tidak valid' })
      return
    }

    // Prepare data for backend (backend expects kodeOpd and namaJenisRetribusi)
    const dataToSubmit: OPDPelayananCreateData = {
      kodeOpd: formData.opdKode,
      namaJenisRetribusi: selectedJenisRetribusi.nama,
    }

    createMutation.mutate(dataToSubmit)
  }

  const isLoading = createMutation.isPending
  const isPageLoading = isLoadingOPD || isLoadingJenisRetribusi

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
            to="/dashboard/settings?tab=opd-pelayanan"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Data OPD-Pelayanan
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
              <Link2 className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tambah Hubungan OPD-Pelayanan</h1>
              <p className="mt-1 text-sm text-gray-600">
                Hubungkan OPD dengan Jenis Retribusi yang dilayani
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
            {/* OPD */}
            <div>
              <label htmlFor="opdKode" className="block text-sm font-medium text-gray-700">
                OPD <span className="text-red-500">*</span>
              </label>
              <select
                id="opdKode"
                name="opdKode"
                value={formData.opdKode}
                onChange={handleChange}
                disabled={isLoadingOPD}
                className={`mt-1 block w-full rounded-lg border ${
                  errors.opdKode ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">{isLoadingOPD ? 'Memuat data OPD...' : 'Pilih OPD'}</option>
                {opdList?.data && opdList.data.length > 0
                  ? opdList.data.map((opd) => (
                      <option key={opd.kode} value={opd.kode}>
                        {opd.kode} - {opd.nama}
                      </option>
                    ))
                  : !isLoadingOPD && (
                      <option value="" disabled>
                        Tidak ada data OPD
                      </option>
                    )}
              </select>
              {errors.opdKode && <p className="mt-1 text-sm text-red-600">{errors.opdKode}</p>}
              {!isLoadingOPD && opdList?.data && opdList.data.length === 0 && (
                <p className="mt-1 text-sm text-amber-600">
                  Belum ada data OPD. Silakan tambahkan data OPD terlebih dahulu.
                </p>
              )}
            </div>

            {/* Jenis Retribusi */}
            <div>
              <label
                htmlFor="jenisRetribusiKode"
                className="block text-sm font-medium text-gray-700"
              >
                Jenis Retribusi <span className="text-red-500">*</span>
              </label>
              <select
                id="jenisRetribusiKode"
                name="jenisRetribusiKode"
                value={formData.jenisRetribusiKode}
                onChange={handleChange}
                disabled={isLoadingJenisRetribusi}
                className={`mt-1 block w-full rounded-lg border ${
                  errors.jenisRetribusiKode ? 'border-red-300' : 'border-gray-300'
                } px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed`}
              >
                <option value="">
                  {isLoadingJenisRetribusi
                    ? 'Memuat data Jenis Retribusi...'
                    : 'Pilih Jenis Retribusi'}
                </option>
                {jenisRetribusiList?.data && jenisRetribusiList.data.length > 0
                  ? jenisRetribusiList.data.map((jenis) => (
                      <option key={jenis.kode} value={jenis.kode}>
                        {jenis.kode} - {jenis.nama}
                      </option>
                    ))
                  : !isLoadingJenisRetribusi && (
                      <option value="" disabled>
                        Tidak ada data Jenis Retribusi
                      </option>
                    )}
              </select>
              {errors.jenisRetribusiKode && (
                <p className="mt-1 text-sm text-red-600">{errors.jenisRetribusiKode}</p>
              )}
              {!isLoadingJenisRetribusi &&
                jenisRetribusiList?.data &&
                jenisRetribusiList.data.length === 0 && (
                  <p className="mt-1 text-sm text-amber-600">
                    Belum ada data Jenis Retribusi. Silakan tambahkan data Jenis Retribusi terlebih
                    dahulu.
                  </p>
                )}
            </div>

            {/* Info */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-blue-800">Informasi</h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Hubungan ini menandakan bahwa OPD yang dipilih melayani jenis retribusi
                    tertentu. Pastikan kombinasi OPD dan Jenis Retribusi belum ada sebelumnya.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 rounded-b-lg">
            <Link
              to="/dashboard/settings?tab=opd-pelayanan"
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
                  Simpan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
