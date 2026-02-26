/**
 * General Settings Component
 *
 * Handles general application configuration including:
 * - Format nomor laporan retribusi
 * - Other global settings
 *
 * Last Updated: 2025-11-14
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertCircle, Building, Check, Image, Loader2, Pencil, Save, Upload } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { getSettingByKey, updateSetting, uploadLogo } from '../lib/api/settings'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export default function GeneralSettings() {
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    value: '',
    description: '',
  })
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Fetch nomor laporan format setting
  const { data: setting, isLoading } = useQuery({
    queryKey: ['setting', 'nomor_laporan_format'],
    queryFn: () => getSettingByKey('nomor_laporan_format'),
  })

  // Fetch logo setting
  const { data: logoSetting } = useQuery({
    queryKey: ['setting', 'logo_kabupaten'],
    queryFn: () => getSettingByKey('logo_kabupaten'),
  })

  // Fetch jenis pemerintahan setting
  const { data: jenisPemerintahanSetting } = useQuery({
    queryKey: ['setting', 'jenis_pemerintahan'],
    queryFn: () => getSettingByKey('jenis_pemerintahan'),
  })

  // Fetch nama pemerintahan setting
  const { data: namaPemerintahanSetting } = useQuery({
    queryKey: ['setting', 'nama_pemerintahan'],
    queryFn: () => getSettingByKey('nama_pemerintahan'),
  })

  // Pemerintahan inline edit states
  const [editingJenisPemerintahan, setEditingJenisPemerintahan] = useState(false)
  const [editingNamaPemerintahan, setEditingNamaPemerintahan] = useState(false)
  const [jenisPemerintahanValue, setJenisPemerintahanValue] = useState('')
  const [namaPemerintahanValue, setNamaPemerintahanValue] = useState('')

  // Jenis Pemerintahan mutation
  const jenisPemerintahanMutation = useMutation({
    mutationFn: (data: { value: string; description?: string }) =>
      updateSetting('jenis_pemerintahan', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setting', 'jenis_pemerintahan'] })
      setEditingJenisPemerintahan(false)
      toast.success('Jenis Pemerintahan berhasil disimpan')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan')
    },
  })

  // Nama Pemerintahan mutation
  const namaPemerintahanMutation = useMutation({
    mutationFn: (data: { value: string; description?: string }) =>
      updateSetting('nama_pemerintahan', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setting', 'nama_pemerintahan'] })
      setEditingNamaPemerintahan(false)
      toast.success('Nama Pemerintahan berhasil disimpan')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menyimpan')
    },
  })

  // Logo upload mutation
  const logoUploadMutation = useMutation({
    mutationFn: uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setting', 'logo_kabupaten'] })
      toast.success('Logo berhasil diupload')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengupload logo')
    },
  })

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG atau PNG.')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file terlalu besar. Maksimal 2MB.')
      return
    }

    logoUploadMutation.mutate(file)
  }

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { value: string; description?: string }) =>
      updateSetting('nomor_laporan_format', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setting', 'nomor_laporan_format'] })
      setIsEditing(false)
      setSuccessMessage('Format nomor laporan berhasil diperbarui')
      setTimeout(() => setSuccessMessage(''), 3000)
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Gagal memperbarui pengaturan')
    },
  })

  // Handle edit button
  const handleEdit = () => {
    if (setting?.data) {
      setFormData({
        value: setting.data.value,
        description: setting.data.description || '',
      })
      setError('')
      setIsEditing(true)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setIsEditing(false)
    setError('')
  }

  // Handle save
  const handleSave = () => {
    // Validation
    if (!formData.value.trim()) {
      setError('Format nomor laporan wajib diisi')
      return
    }

    // Check if all placeholders are present
    const requiredPlaceholders = ['{nomor_urut}', '{bulan_romawi}', '{kode_opd}', '{tahun}']
    const missingPlaceholders = requiredPlaceholders.filter(
      (placeholder) => !formData.value.includes(placeholder)
    )

    if (missingPlaceholders.length > 0) {
      setError(`Format harus mengandung: ${missingPlaceholders.join(', ')}`)
      return
    }

    updateMutation.mutate(formData)
  }

  // Generate preview
  const generatePreview = (format: string) => {
    return format
      .replace('{nomor_urut}', '1')
      .replace('{bulan_romawi}', 'XI')
      .replace('{kode_opd}', 'DINKES')
      .replace('{tahun}', '2025')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Konfigurasi Umum</h2>
          <p className="mt-1 text-sm text-gray-600">
            Kelola pengaturan umum aplikasi dan format dokumen
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 flex items-center gap-2 rounded-lg bg-green-50 p-4 text-green-800">
            <Check className="h-5 w-5" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
        )}

        {/* Format Nomor Laporan Card */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {!isEditing ? (
            <div className="p-6">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                  Format Nomor Laporan
                </h3>
                <div className="flex-1 flex items-center justify-center">
                  <div className="rounded-lg bg-blue-50 px-6 py-3 font-mono text-sm text-blue-900">
                    {generatePreview(setting?.data.value || '')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="rounded-lg bg-primary-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors whitespace-nowrap"
                >
                  Edit
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="space-y-6">
                {/* Edit Form */}
                <div>
                  <label htmlFor="format" className="block text-sm font-medium text-gray-700 mb-2">
                    Format Nomor Laporan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="format"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 font-mono text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="{nomor_urut}/{bulan_romawi}/{kode_opd}/{tahun}"
                  />
                </div>

                {/* Preview */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">Preview Format</div>
                  <div className="rounded-lg bg-blue-50 p-4 font-mono text-sm text-blue-900">
                    {formData.value ? generatePreview(formData.value) : 'Masukkan format...'}
                  </div>
                </div>

                {/* Placeholders Info */}
                <div className="rounded-lg bg-amber-50 p-4">
                  <h4 className="text-sm font-semibold text-amber-900 mb-2">
                    Placeholder yang Tersedia:
                  </h4>
                  <ul className="space-y-1 text-sm text-amber-800">
                    <li>
                      <code className="bg-amber-100 px-2 py-0.5 rounded">{'{nomor_urut}'}</code> -
                      Nomor urut per bulan per OPD (contoh: 1, 2, 3)
                    </li>
                    <li>
                      <code className="bg-amber-100 px-2 py-0.5 rounded">{'{bulan_romawi}'}</code> -
                      Bulan dalam angka romawi (I-XII)
                    </li>
                    <li>
                      <code className="bg-amber-100 px-2 py-0.5 rounded">{'{kode_opd}'}</code> -
                      Kode OPD (contoh: DINKES, DISDIK)
                    </li>
                    <li>
                      <code className="bg-amber-100 px-2 py-0.5 rounded">{'{tahun}'}</code> - Tahun
                      4 digit (contoh: 2025)
                    </li>
                  </ul>
                </div>

                {/* Example Formats */}
                <div className="rounded-lg bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Contoh Format:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded border border-gray-200 flex-1 font-mono text-xs">
                        {'{nomor_urut}/{bulan_romawi}/{kode_opd}/{tahun}'}
                      </code>
                      <span className="text-gray-500">→</span>
                      <span className="font-mono text-xs">1/XI/DINKES/2025</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded border border-gray-200 flex-1 font-mono text-xs">
                        {'{kode_opd}-{nomor_urut}-{bulan_romawi}-{tahun}'}
                      </code>
                      <span className="text-gray-500">→</span>
                      <span className="font-mono text-xs">DINKES-1-XI-2025</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <code className="bg-white px-2 py-1 rounded border border-gray-200 flex-1 font-mono text-xs">
                        {'{tahun}/{bulan_romawi}/{kode_opd}/{nomor_urut}'}
                      </code>
                      <span className="text-gray-500">→</span>
                      <span className="font-mono text-xs">2025/XI/DINKES/1</span>
                    </li>
                  </ul>
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Deskripsi (Opsional)
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Catatan tentang format ini..."
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-red-800">
                    <AlertCircle className="h-5 w-5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logo Kabupaten Card */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Logo Kabupaten</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Upload logo kabupaten yang akan ditampilkan di PDF laporan retribusi
                </p>

                {/* Current Logo */}
                {logoSetting?.data?.value && (
                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Logo Saat Ini:</div>
                    <div className="inline-block rounded-lg border-2 border-gray-200 bg-gray-50 p-4">
                      <img
                        src={`${API_BASE_URL}${logoSetting.data.value}`}
                        alt="Logo Kabupaten"
                        className="h-24 w-24 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* Upload Button */}
                <div>
                  <label
                    htmlFor="logo-upload"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
                  >
                    {logoUploadMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        {logoSetting?.data?.value ? 'Ganti Logo' : 'Upload Logo'}
                      </>
                    )}
                  </label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={handleLogoUpload}
                    disabled={logoUploadMutation.isPending}
                    className="hidden"
                  />
                </div>

                {/* Upload Info */}
                <div className="mt-3 text-xs text-gray-500">
                  <p>• Format: JPG, PNG</p>
                  <p>• Ukuran maksimal: 2MB</p>
                  <p>• Rekomendasi: 200x200px atau lebih besar</p>
                </div>
              </div>

              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="rounded-lg bg-blue-50 p-3">
                  <Image className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Identitas Pemerintahan Card */}
        <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <Building className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Identitas Pemerintahan</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Informasi ini akan ditampilkan di bagian header PDF laporan retribusi, di atas nama OPD.
                </p>

                <div className="space-y-4">
                  {/* Jenis Pemerintahan */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pemerintahan</label>
                        {editingJenisPemerintahan ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={jenisPemerintahanValue}
                              onChange={(e) => setJenisPemerintahanValue(e.target.value)}
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Contoh: PEMERINTAH KABUPATEN"
                            />
                            <button
                              type="button"
                              onClick={() => jenisPemerintahanMutation.mutate({ value: jenisPemerintahanValue, description: 'Jenis pemerintahan untuk header PDF' })}
                              disabled={jenisPemerintahanMutation.isPending}
                              className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                            >
                              {jenisPemerintahanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingJenisPemerintahan(false)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-900 font-medium">
                              {jenisPemerintahanSetting?.data?.value || <span className="text-gray-400 italic">Belum diatur</span>}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setJenisPemerintahanValue(jenisPemerintahanSetting?.data?.value || '')
                                setEditingJenisPemerintahan(true)
                              }}
                              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nama Pemerintahan */}
                  <div className="rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemerintahan</label>
                        {editingNamaPemerintahan ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={namaPemerintahanValue}
                              onChange={(e) => setNamaPemerintahanValue(e.target.value)}
                              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              placeholder="Contoh: KABUPATEN BANYUMAS"
                            />
                            <button
                              type="button"
                              onClick={() => namaPemerintahanMutation.mutate({ value: namaPemerintahanValue, description: 'Nama pemerintahan untuk header PDF' })}
                              disabled={namaPemerintahanMutation.isPending}
                              className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
                            >
                              {namaPemerintahanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingNamaPemerintahan(false)}
                              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-900 font-medium">
                              {namaPemerintahanSetting?.data?.value || <span className="text-gray-400 italic">Belum diatur</span>}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setNamaPemerintahanValue(namaPemerintahanSetting?.data?.value || '')
                                setEditingNamaPemerintahan(true)
                              }}
                              className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              <Pencil className="h-3 w-3" /> Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-4 rounded-lg bg-blue-50 p-3">
                  <p className="text-xs text-blue-700">
                    <strong>Contoh hasil di header PDF:</strong> PEMERINTAH KABUPATEN / KABUPATEN BANYUMAS → ditampilkan di atas nama OPD.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
