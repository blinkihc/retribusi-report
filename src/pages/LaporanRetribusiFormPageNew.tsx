/**
 * Laporan Retribusi Form Page - Redesigned
 *
 * 2-column layout, 3-tier dropdown, file upload
 * Style: Government Structured Brutalism
 *
 * Last Updated: 2025-11-23
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Building,
  ChevronLeft,
  ChevronRight,
  FileText,
  Layers,
  Loader2,
  Save,
  Send,
  Upload,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import FileUpload from '../components/LaporanForm/FileUpload'
import JenisRetribusiSelector from '../components/LaporanForm/JenisRetribusiSelector'
import { DatePicker } from '../components/ui/date-picker'
import { HelpTooltip } from '../components/ui/help-tooltip'
import { useMediaQuery } from '../hooks/use-media-query'
import {
  checkDuplicateLaporan,
  createLaporanRetribusi,
  getLaporanRetribusiDetail,
  type LaporanRetribusiCreateData,
  submitLaporanRetribusi,
  updateLaporanRetribusi,
} from '../lib/api/laporan-retribusi'
import { getOPDList } from '../lib/api/opd'
import { useAuth } from '../lib/auth/useAuth'

const DRAFT_STORAGE_KEY = 'laporan-retribusi-draft'

export default function LaporanRetribusiFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const isEditMode = !!id
  const isOPDUser = user?.role === 'operator' && user?.opdId

  // Form state
  const [formData, setFormData] = useState<LaporanRetribusiCreateData>({
    opdId: 0,
    jenisRetribusiId: 0,
    tanggalSetor: '',
    nominal: '',
    keterangan: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const isFormPopulatedRef = useRef(false)
  const [_lastAutoSave, setLastAutoSave] = useState<Date | null>(null)
  const [duplicateWarning, setDuplicateWarning] = useState<any>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Mobile Wizard State
  const [currentStep, setCurrentStep] = useState(1)
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const STEPS = [
    { id: 1, title: 'Instansi', icon: Building },
    { id: 2, title: 'Rincian', icon: Layers },
    { id: 3, title: 'Bukti', icon: Upload },
  ]

  // Auto-save Draft (Only in Create Mode)
  useEffect(() => {
    if (isEditMode) return

    const autoSaveInterval = setInterval(() => {
      // Only save if there is some data
      const hasData =
        formData.opdId !== 0 ||
        formData.jenisRetribusiId !== 0 ||
        formData.nominal !== '' ||
        formData.tanggalSetor !== ''

      if (hasData) {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData))
        setLastAutoSave(new Date())
        console.log('Draft auto-saved at', new Date().toLocaleTimeString())
      }
    }, 30000) // 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [formData, isEditMode])

  // Check for Duplicates
  useEffect(() => {
    const checkDuplicate = async () => {
      // Only check if all required fields for uniqueness are present
      if (
        formData.opdId &&
        formData.jenisRetribusiId &&
        formData.tanggalSetor &&
        formData.nominal
      ) {
        try {
          const result = await checkDuplicateLaporan({
            opdId: formData.opdId,
            jenisRetribusiId: formData.jenisRetribusiId,
            tanggalSetor: formData.tanggalSetor,
            nominal: formData.nominal,
            excludeId: isEditMode ? Number(id) : undefined,
          })

          if (result.exists) {
            setDuplicateWarning(result.data)
          } else {
            setDuplicateWarning(null)
          }
        } catch (error) {
          console.error('Failed to check duplicate', error)
        }
      } else {
        setDuplicateWarning(null)
      }
    }

    const timer = setTimeout(checkDuplicate, 800) // Debounce 800ms
    return () => clearTimeout(timer)
  }, [
    formData.opdId,
    formData.jenisRetribusiId,
    formData.tanggalSetor,
    formData.nominal,
    isEditMode,
    id,
  ])

  // Check for existing draft on mount
  useEffect(() => {
    if (isEditMode) return

    const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft)
        // Check if draft has meaningful data
        if (parsedDraft.opdId || parsedDraft.nominal) {
          toast('Ditemukan draft laporan yang belum disimpan', {
            action: {
              label: 'Pulihkan Draft',
              onClick: () => {
                setFormData(parsedDraft)
                toast.success('Draft berhasil dipulihkan')
              },
            },
            duration: 8000, // Longer duration to give user time to react
          })
        }
      } catch (e) {
        console.error('Failed to parse draft', e)
      }
    }
  }, [isEditMode])

  // Set opdId for operator when user data is loaded
  useEffect(() => {
    if (isOPDUser && user?.opdId && formData.opdId === 0 && !isEditMode) {
      setFormData((prev) => ({
        ...prev,
        opdId: user.opdId || 0,
      }))
    }
  }, [isOPDUser, user?.opdId, formData.opdId, isEditMode])

  // Fetch OPD list (for admin) or single OPD (for operator)
  const { data: opdList } = useQuery({
    queryKey: ['opd-list-all'],
    queryFn: () => getOPDList({ limit: 1000 }),
    enabled: !isOPDUser, // Admin fetches all OPDs
  })

  // Fetch operator's OPD info
  const { data: operatorOpdList } = useQuery({
    queryKey: ['opd-operator', user?.opdId],
    queryFn: () => getOPDList({ limit: 1000 }),
    enabled: Boolean(isOPDUser && !isEditMode), // Operator fetches their OPD for create mode
  })

  // Fetch laporan data for edit mode
  const { data: laporanData, isLoading: isLoadingLaporan } = useQuery({
    queryKey: ['laporan-retribusi-detail', id],
    queryFn: () => getLaporanRetribusiDetail(Number(id)),
    enabled: isEditMode,
  })

  // Populate form when data is loaded
  useEffect(() => {
    if (laporanData?.data && !isFormPopulatedRef.current) {
      const laporan = laporanData.data
      setFormData({
        opdId: laporan.opdId,
        jenisRetribusiId: laporan.jenisRetribusiId,
        tanggalSetor: laporan.tanggalSetor.split('T')[0],
        nominal: laporan.nominal,
        keterangan: laporan.keterangan || '',
      })
      isFormPopulatedRef.current = true
    }
  }, [laporanData])

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: LaporanRetribusiCreateData | FormData) =>
      createLaporanRetribusi(data, (progress) => setUploadProgress(progress)),
    onSuccess: () => {
      toast.success('Laporan berhasil disimpan sebagai draft')
      setUploadProgress(0)
      localStorage.removeItem(DRAFT_STORAGE_KEY) // Clear local draft
      queryClient.invalidateQueries({ queryKey: ['laporan-retribusi'] })
      navigate('/dashboard/laporan-retribusi')
    },
    onError: (error: any) => {
      setUploadProgress(0)
      toast.error(error.response?.data?.message || 'Gagal menyimpan laporan')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: LaporanRetribusiCreateData | FormData }) =>
      updateLaporanRetribusi(id, data, (progress) => setUploadProgress(progress)),
    onSuccess: () => {
      toast.success('Laporan berhasil diperbarui')
      setUploadProgress(0)
      queryClient.invalidateQueries({ queryKey: ['laporan-retribusi'] })
      navigate('/dashboard/laporan-retribusi?tab=draft')
    },
    onError: (error: any) => {
      setUploadProgress(0)
      toast.error(error.response?.data?.message || 'Gagal memperbarui laporan')
    },
  })

  const submitMutation = useMutation({
    mutationFn: (id: number) => submitLaporanRetribusi(id),
    onSuccess: () => {
      toast.success('Laporan berhasil dikirim')
      queryClient.invalidateQueries({ queryKey: ['laporan-retribusi'] })
      navigate('/dashboard/laporan-retribusi?tab=final')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengirim laporan')
    },
  })

  // Convert form data to FormData for file upload
  const prepareFormData = (): FormData => {
    const data = new FormData()

    data.append('opdId', formData.opdId.toString())
    data.append('jenisRetribusiId', formData.jenisRetribusiId.toString())
    data.append('tanggalSetor', formData.tanggalSetor)
    data.append('nominal', formData.nominal)
    if (formData.keterangan) {
      data.append('keterangan', formData.keterangan)
    }
    if (uploadedFile) {
      data.append('fileBukti', uploadedFile)
    }

    return data
  }

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.opdId || formData.opdId === 0) {
      newErrors.opdId = 'OPD wajib dipilih'
    }
    if (!formData.jenisRetribusiId || formData.jenisRetribusiId === 0) {
      newErrors.jenisRetribusiId = 'Jenis Retribusi wajib dipilih'
    }
    if (!formData.tanggalSetor) {
      newErrors.tanggalSetor = 'Tanggal Setor wajib diisi'
    }
    if (!formData.nominal || Number(formData.nominal) <= 0) {
      newErrors.nominal = 'Nominal harus lebih dari 0'
    }
    if (!uploadedFile && !isEditMode) {
      newErrors.file = 'Bukti pembayaran wajib diupload'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Wizard Handlers
  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    if (step === 1) {
      if (!formData.opdId || formData.opdId === 0) {
        newErrors.opdId = 'OPD wajib dipilih'
        isValid = false
      }
      if (!formData.jenisRetribusiId || formData.jenisRetribusiId === 0) {
        newErrors.jenisRetribusiId = 'Jenis Retribusi wajib dipilih'
        isValid = false
      }
    }

    if (step === 2) {
      if (!formData.tanggalSetor) {
        newErrors.tanggalSetor = 'Tanggal Setor wajib diisi'
        isValid = false
      }
      if (!formData.nominal || Number(formData.nominal) <= 0) {
        newErrors.nominal = 'Nominal harus lebih dari 0'
        isValid = false
      }
    }

    if (step === 3) {
      if (!uploadedFile && !isEditMode) {
        newErrors.file = 'Bukti pembayaran wajib diupload'
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3))
      window.scrollTo(0, 0)
    }
  }

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    window.scrollTo(0, 0)
  }

  // Handle Simpan (save as draft)
  const handleSimpan = () => {
    if (!validateForm()) return

    const data = prepareFormData()

    if (isEditMode) {
      updateMutation.mutate({ id: Number(id), data })
    } else {
      createMutation.mutate(data)
    }
  }

  // Handle Kirim (submit)
  const handleKirim = async () => {
    if (!validateForm()) return

    const data = prepareFormData()

    if (isEditMode) {
      updateMutation.mutate(
        { id: Number(id), data },
        {
          onSuccess: () => {
            submitMutation.mutate(Number(id))
          },
        }
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: (response) => {
          if (response.data?.id) {
            submitMutation.mutate(response.data.id)
          }
        },
      })
    }
  }

  // Format currency
  const handleNominalChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setFormData({ ...formData, nominal: numericValue })
  }

  const formatCurrencyDisplay = (value: string) => {
    if (!value) return ''
    return new Intl.NumberFormat('id-ID').format(Number(value))
  }

  if (isLoadingLaporan) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  // Get OPD info - from opdList (admin create), operatorOpdList (operator create), or laporanData (edit mode)
  const selectedOPD = isOPDUser
    ? operatorOpdList?.data?.find((o) => o.id === formData.opdId)
    : opdList?.data?.find((o) => o.id === formData.opdId)
  const opdKode = isEditMode ? laporanData?.data?.opdKode : selectedOPD?.kode

  // Check if operator OPD data is still loading
  const isOperatorOpdLoading = isOPDUser && !isEditMode && !operatorOpdList

  return (
    <div className="min-h-screen bg-slate-50 py-8 overflow-x-hidden max-w-full pb-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard/laporan-retribusi"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-black mb-6 uppercase tracking-wide transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Daftar
          </Link>
          <div className="flex items-start gap-4 border-b-4 border-black pb-6">
            <div className="rounded-none bg-black p-3 shadow-hard-sm">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                {isEditMode ? 'Edit Laporan' : 'Input Laporan Baru'}
              </h1>
              <p className="mt-1 text-sm font-medium text-slate-600 uppercase tracking-wide">
                {isEditMode
                  ? 'Perbarui data laporan retribusi'
                  : 'Isi formulir di bawah untuk membuat laporan'}
              </p>
            </div>
          </div>
        </div>

        {/* Form - 2 Column Layout */}
        <div className="bg-white border-2 border-black shadow-hard-lg">
          {/* Form Header Accent */}
          <div className="bg-slate-900 h-2 w-full" />

          <div className="p-4 lg:p-8">
            {/* Mobile Stepper */}
            {!isDesktop && (
              <div className="mb-8">
                <div className="flex justify-between items-center relative">
                  {/* Progress Bar Background */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10" />

                  {/* Progress Bar Active */}
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-black transition-all duration-300 -z-10"
                    style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
                  />

                  {STEPS.map((step) => {
                    const isActive = currentStep >= step.id
                    const isCurrent = currentStep === step.id
                    const Icon = step.icon

                    return (
                      <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-black border-black text-white shadow-hard-sm'
                              : 'bg-white border-slate-300 text-slate-400'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isCurrent ? 'text-black' : 'text-slate-400'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Duplicate Warning */}
            {duplicateWarning && (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-bold text-yellow-800 uppercase tracking-wide">
                      Peringatan: Kemungkinan Duplikasi Data
                    </p>
                    <p className="text-sm text-yellow-700 mt-1 font-medium">
                      Laporan serupa ditemukan dengan Nomor:{' '}
                      <strong>{duplicateWarning.nomorLaporan}</strong>
                      <br />
                      <span className="text-xs uppercase opacity-80">
                        Status: {duplicateWarning.status} • Oleh: {duplicateWarning.submittedByName}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* LEFT COLUMN */}
              <div className={`space-y-6 ${!isDesktop && currentStep === 3 ? 'hidden' : ''}`}>
                {/* OPD */}
                <div className={!isDesktop && currentStep !== 1 ? 'hidden' : ''}>
                  <label
                    htmlFor="opd"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center"
                  >
                    OPD <span className="text-red-600 mx-1">*</span>
                    <HelpTooltip content="Organisasi Perangkat Daerah tempat Anda bertugas. Otomatis terisi untuk akun Operator." />
                  </label>
                  {isOPDUser || isEditMode ? (
                    isOperatorOpdLoading ? (
                      <div className="w-full rounded-none border-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 flex items-center gap-2 font-medium">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        MEMUAT DATA OPD...
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={
                          isEditMode
                            ? laporanData?.data?.opdNama || 'Loading...'
                            : selectedOPD?.nama || 'OPD TIDAK DITEMUKAN'
                        }
                        disabled
                        className="w-full rounded-none border-2 border-slate-300 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-600 uppercase"
                      />
                    )
                  ) : (
                    <select
                      id="opd"
                      value={formData.opdId}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          opdId: Number(e.target.value),
                          jenisRetribusiId: 0,
                        })
                      }
                      className={`w-full rounded-none border-2 px-4 py-3 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors ${
                        errors.opdId ? 'border-red-600 bg-red-50' : 'border-black bg-white'
                      }`}
                    >
                      <option value="0">PILIH OPD</option>
                      {opdList?.data.map((opd) => (
                        <option key={opd.id} value={opd.id}>
                          {opd.nama}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.opdId && (
                    <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 uppercase">
                      <AlertCircle className="h-4 w-4" />
                      {errors.opdId}
                    </p>
                  )}
                </div>

                {/* 3-Tier Jenis Retribusi Selector */}
                <div className={!isDesktop && currentStep !== 1 ? 'hidden' : ''}>
                  <JenisRetribusiSelector
                    opdId={formData.opdId}
                    opdKode={opdKode}
                    selectedJenisId={formData.jenisRetribusiId}
                    onJenisChange={(jenisId) =>
                      setFormData({ ...formData, jenisRetribusiId: jenisId })
                    }
                    errors={errors}
                  />
                </div>

                {/* Tanggal Setor */}
                <div className={!isDesktop && currentStep !== 2 ? 'hidden' : ''}>
                  <label
                    htmlFor="tanggal"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center"
                  >
                    Tanggal Setor <span className="text-red-600 mx-1">*</span>
                    <HelpTooltip content="Tanggal uang disetorkan ke Kas Daerah, harus sesuai dengan tanggal pada Bukti Setor." />
                  </label>
                  <DatePicker
                    date={formData.tanggalSetor ? new Date(formData.tanggalSetor) : undefined}
                    setDate={(date) =>
                      setFormData({
                        ...formData,
                        tanggalSetor: date ? format(date, 'yyyy-MM-dd') : '',
                      })
                    }
                    className={
                      errors.tanggalSetor ? 'border-red-600 bg-red-50' : 'border-black bg-white'
                    }
                  />
                  {errors.tanggalSetor && (
                    <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 uppercase">
                      <AlertCircle className="h-4 w-4" />
                      {errors.tanggalSetor}
                    </p>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className={`space-y-6 ${!isDesktop && currentStep === 1 ? 'hidden' : ''}`}>
                {/* Nominal */}
                <div className={!isDesktop && currentStep !== 2 ? 'hidden' : ''}>
                  <label
                    htmlFor="nominal"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center"
                  >
                    Nominal (Rp) <span className="text-red-600 mx-1">*</span>
                    <HelpTooltip content="Masukkan angka tanpa titik atau koma. Format mata uang akan otomatis disesuaikan." />
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-500">
                      Rp
                    </span>
                    <input
                      type="text"
                      id="nominal"
                      value={formatCurrencyDisplay(formData.nominal)}
                      onChange={(e) => handleNominalChange(e.target.value)}
                      placeholder="0"
                      className={`w-full rounded-none border-2 px-4 py-3 pl-12 text-sm font-bold text-lg focus:outline-none focus:bg-yellow-50 transition-colors ${
                        errors.nominal ? 'border-red-600 bg-red-50' : 'border-black bg-white'
                      }`}
                    />
                  </div>
                  {errors.nominal && (
                    <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 uppercase">
                      <AlertCircle className="h-4 w-4" />
                      {errors.nominal}
                    </p>
                  )}
                </div>

                {/* File Upload */}
                <div className={!isDesktop && currentStep !== 3 ? 'hidden' : ''}>
                  <FileUpload
                    file={uploadedFile}
                    onFileChange={setUploadedFile}
                    error={errors.file}
                    progress={uploadProgress}
                  />
                </div>

                {/* Keterangan */}
                <div className={!isDesktop && currentStep !== 3 ? 'hidden' : ''}>
                  <label
                    htmlFor="keterangan"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center"
                  >
                    Keterangan (Opsional)
                    <HelpTooltip content="Tambahkan catatan jika ada informasi penting lain yang perlu diketahui verifikator." />
                  </label>
                  <textarea
                    id="keterangan"
                    value={formData.keterangan}
                    onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                    rows={4}
                    placeholder="TAMBAHKAN CATATAN ATAU KETERANGAN TAMBAHAN..."
                    className="w-full rounded-none border-2 border-black px-4 py-3 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors placeholder:text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t-2 border-black bg-slate-50 px-4 lg:px-8 py-6">
            {!isDesktop ? (
              // Mobile Actions
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className={`inline-flex items-center gap-1 rounded-none border-2 border-black bg-white px-3 py-3 text-xs font-bold uppercase tracking-wide text-black hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed ${currentStep === 1 ? 'invisible' : ''}`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Kembali
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1 rounded-none bg-black border-2 border-black px-5 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-hard-sm"
                  >
                    Lanjut
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSimpan}
                      disabled={createMutation.isPending || updateMutation.isPending}
                      className="inline-flex items-center justify-center gap-1 rounded-none border-2 border-black bg-white px-3 py-3 text-xs font-bold uppercase tracking-wide text-black shadow-hard-sm disabled:opacity-50"
                    >
                      {createMutation.isPending || updateMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleKirim}
                      disabled={
                        createMutation.isPending ||
                        updateMutation.isPending ||
                        submitMutation.isPending
                      }
                      className="inline-flex items-center gap-1 rounded-none bg-black border-2 border-black px-4 py-3 text-xs font-bold uppercase tracking-wide text-white shadow-hard-sm disabled:opacity-50"
                    >
                      {submitMutation.isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Kirim
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Desktop Actions
              <div className="flex items-center justify-end gap-4">
                <Link
                  to="/dashboard/laporan-retribusi"
                  className="rounded-none border-2 border-black bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-black hover:bg-red-50 hover:text-red-600 hover:border-red-600 transition-all"
                >
                  Batal
                </Link>
                <button
                  type="button"
                  onClick={handleSimpan}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-none border-2 border-black bg-white px-6 py-3 text-sm font-bold uppercase tracking-wide text-black shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Draft
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleKirim}
                  disabled={
                    createMutation.isPending || updateMutation.isPending || submitMutation.isPending
                  }
                  className="inline-flex items-center gap-2 rounded-none bg-black border-2 border-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-hard-sm hover:bg-slate-800 hover:shadow-hard hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Mengirim...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Kirim Laporan
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
