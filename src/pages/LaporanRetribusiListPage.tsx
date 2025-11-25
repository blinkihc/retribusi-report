/**
 * Laporan Retribusi List Page
 *
 * Displays list of Laporan Retribusi with Government Structured Brutalism style.
 *
 * Features:
 * - Tab navigation (Draft/Final/Ditolak)
 * - Table view with sorting & brutalist styling
 * - Neo-brutalist filters & inputs
 *
 * Last Updated: 2025-11-23
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { LaporanDetailModal } from '../components/LaporanRetribusi/LaporanDetailModal'
import { LaporanFilterForm } from '../components/LaporanRetribusi/LaporanFilterForm'
import { PullToRefresh } from '../components/ui/pull-to-refresh'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet'
import { SwipeableItem } from '../components/ui/swipeable-item'
import { TableSkeleton } from '../components/skeletons/TableSkeleton'
import { useMediaQuery } from '../hooks/use-media-query'
import {
  deleteLaporanRetribusi,
  getLaporanRetribusiList,
  type LaporanRetribusi,
  type LaporanRetribusiListParams,
  submitLaporanRetribusi,
} from '../lib/api/laporan-retribusi'
import { getJenisRetribusiList } from '../lib/api/jenis-retribusi'
import { getOPDList } from '../lib/api/opd'
import { formatCurrency, formatDate } from '../lib/utils'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

type TabType = 'draft' | 'final' | 'ditolak'

interface Tab {
  id: TabType
  label: string
  status: 'draft' | 'submitted' | 'rejected'
  color: string
  bgColor: string
}

const tabs: Tab[] = [
  {
    id: 'draft',
    label: 'Draft',
    status: 'draft',
    color: 'text-yellow-900',
    bgColor: 'bg-yellow-100 border-yellow-700',
  },
  {
    id: 'final',
    label: 'Final',
    status: 'submitted',
    color: 'text-green-900',
    bgColor: 'bg-green-100 border-green-700',
  },
  {
    id: 'ditolak',
    label: 'Ditolak',
    status: 'rejected',
    color: 'text-red-900',
    bgColor: 'bg-red-100 border-red-700',
  },
]

export default function LaporanRetribusiListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Get active tab from URL or default to 'draft'
  const activeTabId = (searchParams.get('tab') as TabType) || 'draft'
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0]

  // Responsive check
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  // State for filters and pagination
  const [params, setParams] = useState<LaporanRetribusiListParams>({
    page: 1,
    limit: 10,
    search: '',
    status: activeTab.status,
    sortBy: 'tanggalSetor',
    sortOrder: 'desc',
  })

  // State for filter panel
  const [showFilters, setShowFilters] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [filters, setFilters] = useState({
    opdId: '',
    jenisRetribusiId: '',
    startDate: '',
    endDate: '',
  })

  // Modal state
  const [selectedLaporan, setSelectedLaporan] = useState<LaporanRetribusi | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // Handle view detail
  const handleViewDetail = (laporan: LaporanRetribusi) => {
    setSelectedLaporan(laporan)
    setShowDetailModal(true)
  }

  // Fetch laporan list
  const { data, isLoading } = useQuery({
    queryKey: ['laporan-retribusi', { ...params, status: activeTab.status }],
    queryFn: () => getLaporanRetribusiList({ ...params, status: activeTab.status }),
  })

  // Fetch master data for filters
  const { data: opdData } = useQuery({
    queryKey: ['opd-list', { limit: 1000, isActive: 'true' }],
    queryFn: () => getOPDList({ limit: 1000, isActive: 'true' }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  const { data: jenisRetribusiData } = useQuery({
    queryKey: ['jenis-retribusi-list', { limit: 1000, isActive: 'true' }],
    queryFn: () => getJenisRetribusiList({ limit: 1000, isActive: 'true' }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteLaporanRetribusi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-retribusi'] })
      toast.success('Laporan berhasil dihapus')
    },
    onError: () => {
      toast.error('Gagal menghapus laporan')
    },
  })

  // Submit mutation
  const submitMutation = useMutation({
    mutationFn: submitLaporanRetribusi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['laporan-retribusi'] })
      toast.success('Laporan berhasil dikirim')
    },
    onError: () => {
      toast.error('Gagal mengirim laporan')
    },
  })

  // Handle tab change
  const handleTabChange = (tabId: TabType) => {
    setSearchParams({ tab: tabId })
    const tab = tabs.find((t) => t.id === tabId)
    if (tab) {
      setParams({ ...params, page: 1, status: tab.status })
    }
  }

  // Handle search
  const handleSearch = (value: string) => {
    setParams({ ...params, search: value, page: 1 })
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setParams({ ...params, page })
  }

  // Handle sorting
  const handleSort = (column: LaporanRetribusiListParams['sortBy']) => {
    if (!column) return
    const newSortOrder = params.sortBy === column && params.sortOrder === 'asc' ? 'desc' : 'asc'
    setParams({
      ...params,
      sortBy: column,
      sortOrder: newSortOrder,
      page: 1,
    })
  }

  // Get sort icon
  const getSortIcon = (column: string) => {
    if (params.sortBy !== column) {
      return <ArrowUpDown className="ml-1 h-4 w-4 inline-block text-slate-500" />
    }
    return params.sortOrder === 'asc' ? (
      <ArrowUp className="ml-1 h-4 w-4 inline-block text-black" />
    ) : (
      <ArrowDown className="ml-1 h-4 w-4 inline-block text-black" />
    )
  }

  // Apply filters
  const handleApplyFilters = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      opdId: filters.opdId ? Number(filters.opdId) : undefined,
      jenisRetribusiId: filters.jenisRetribusiId ? Number(filters.jenisRetribusiId) : undefined,
      startDate: filters.startDate || undefined,
      endDate: filters.endDate || undefined,
      page: 1,
    }))
    setShowFilters(false)
  }, [filters])

  // Clear filters
  const handleClearFilters = useCallback(() => {
    setFilters({
      opdId: '',
      jenisRetribusiId: '',
      startDate: '',
      endDate: '',
    })
    setParams((prev) => ({
      ...prev,
      opdId: undefined,
      jenisRetribusiId: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
    }))
  }, [])

  // Download PDF
  const handleDownloadPDF = (laporanId: number, nomorLaporan: string) => {
    const token = localStorage.getItem('auth_token')
    const url = `${API_BASE_URL}/api/laporan-retribusi/${laporanId}/pdf`

    // Create a temporary link and trigger download
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Laporan-${nomorLaporan}.pdf`)
    link.setAttribute('target', '_blank')

    // Add authorization header via fetch
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob)
        link.href = blobUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(blobUrl)
      })
      .catch((error) => {
        console.error('Error downloading PDF:', error)
        alert('Gagal mengunduh PDF. Silakan coba lagi.')
      })
  }

  // Handle edit
  const handleEdit = (laporanId: number) => {
    navigate(`/dashboard/laporan-retribusi/edit/${laporanId}`)
  }

  // Handle delete
  const handleDelete = (laporanId: number, nomorLaporan: string) => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus laporan ${nomorLaporan}?`)) {
      deleteMutation.mutate(laporanId)
    }
  }

  // Handle submit
  const handleSubmit = (laporanId: number, nomorLaporan: string) => {
    if (window.confirm(`Apakah Anda yakin ingin mengirim laporan ${nomorLaporan}?`)) {
      submitMutation.mutate(laporanId)
    }
  }

  // Handle export
  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const token = localStorage.getItem('auth_token')
      const queryParams = new URLSearchParams({
        status: activeTab.status,
        ...(params.search && { search: params.search }),
        ...(filters.opdId && { opdId: filters.opdId }),
        ...(filters.jenisRetribusiId && { jenisRetribusiId: filters.jenisRetribusiId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      })

      const url = `/api/laporan-retribusi/export/${format}?${queryParams}`

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Create blob and download
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl

      // Get filename from Content-Disposition header or generate one
      const contentDisposition = response.headers.get('Content-Disposition')
      let filename = `Laporan-Retribusi-${activeTab.label}-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/)
        if (filenameMatch) {
          filename = filenameMatch[1]
        }
      }

      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      setShowExportMenu(false)
      toast.success(`Export ${format.toUpperCase()} berhasil!`)
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Gagal export data. Silakan coba lagi.')
    }
  }

  // Handle refresh
  const handleRefresh = async () => {
    await queryClient.refetchQueries({ queryKey: ['laporan-retribusi'] })
    toast.success('Data diperbarui')
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-slate-50 w-full max-w-full overflow-x-hidden pb-12">
        {/* Header */}
        <div className="bg-white border-b-2 border-black w-full sticky top-0 z-30">
          <div className="px-4 lg:px-8 py-4 lg:py-6 w-full max-w-full relative">
            <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-4 w-full">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                  Laporan Retribusi
                </h1>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  Kelola laporan retribusi daerah
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full lg:w-auto">
                {/* Export Button */}
                <div className="relative flex-1 lg:flex-initial">
                  <button
                    type="button"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 border-2 border-black shadow-hard-sm px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-emerald-700 hover:-translate-y-0.5 hover:shadow-hard transition-all w-full"
                  >
                    <Download className="h-4 w-4" />
                    Export
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {showExportMenu && (
                    <>
                      {/* Backdrop */}
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowExportMenu(false)}
                        aria-hidden="true"
                      />
                      {/* Dropdown */}
                      <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border-2 border-black bg-white shadow-hard">
                        <div className="py-1">
                          <button
                            type="button"
                            onClick={() => handleExport('excel')}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-yellow-50 hover:text-black transition-colors"
                          >
                            <FileText className="h-4 w-4 text-emerald-600" />
                            Excel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExport('pdf')}
                            className="flex w-full items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-yellow-50 hover:text-black transition-colors"
                          >
                            <FileText className="h-4 w-4 text-red-600" />
                            PDF
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Input Pelaporan Button */}
                <Link
                  to="/dashboard/laporan-retribusi/create"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 border-2 border-black shadow-hard-sm px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-primary-700 hover:-translate-y-0.5 hover:shadow-hard transition-all flex-1 lg:flex-initial"
                >
                  <Plus className="h-4 w-4" />
                  Input Baru
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 lg:px-8 bg-slate-50 border-t-2 border-black">
            <nav className="-mb-0.5 flex space-x-2 lg:space-x-4" aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab.id === tab.id
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`whitespace-nowrap border-x-2 border-t-2 px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all relative top-0.5 rounded-t-lg ${
                      isActive
                        ? 'bg-white border-black text-black z-10 shadow-[0_-4px_0_0_rgba(0,0,0,0.1)]'
                        : 'bg-slate-200 border-transparent text-slate-500 hover:bg-slate-300 hover:text-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white border-b-2 border-black px-4 lg:px-8 py-6 shadow-hard-sm mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative w-full">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="CARI NOMOR LAPORAN, OPD, ATAU JENIS RETRIBUSI..."
                  value={params.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full rounded-lg border-2 border-slate-300 bg-white pl-12 pr-4 py-3 text-sm font-medium uppercase tracking-wide placeholder:normal-case focus:border-black focus:bg-yellow-50 focus:outline-none focus:ring-0 transition-colors"
                  aria-label="Cari laporan retribusi"
                />
              </div>
            </div>

            {/* Filter Button */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center justify-center gap-2 rounded-lg border-2 border-black px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all ${
                showFilters || params.opdId || params.jenisRetribusiId || params.startDate || params.endDate
                  ? 'bg-black text-white'
                  : 'bg-white text-black hover:bg-slate-100'
              }`}
              aria-expanded={showFilters}
              aria-controls={isDesktop ? 'desktop-filter-panel' : 'mobile-filter-sheet'}
              aria-label="Filter laporan"
            >
              <Filter className="h-4 w-4" aria-hidden="true" />
              Filter
              {(params.opdId || params.jenisRetribusiId || params.startDate || params.endDate) && (
                <span className="ml-1 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[10px] font-black text-black">
                  !
                </span>
              )}
            </button>
          </div>

          {/* Active Filter Badges */}
          {(params.opdId || params.jenisRetribusiId || params.startDate || params.endDate) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {params.opdId && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                  OPD: {opdData?.data.find(o => o.id === Number(params.opdId))?.nama || params.opdId}
                  <button
                    type="button"
                    onClick={() => {
                      const newFilters = { ...filters, opdId: '' }
                      setFilters(newFilters)
                      setParams({ ...params, opdId: undefined, page: 1 })
                    }}
                    className="ml-1 hover:text-red-600"
                    aria-label="Hapus filter OPD"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              )}
              {params.jenisRetribusiId && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                  Jenis: {jenisRetribusiData?.data.find(j => j.id === Number(params.jenisRetribusiId))?.nama || params.jenisRetribusiId}
                  <button
                    type="button"
                    onClick={() => {
                      const newFilters = { ...filters, jenisRetribusiId: '' }
                      setFilters(newFilters)
                      setParams({ ...params, jenisRetribusiId: undefined, page: 1 })
                    }}
                    className="ml-1 hover:text-red-600"
                    aria-label="Hapus filter Jenis Retribusi"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              )}
              {(params.startDate || params.endDate) && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-bold uppercase text-slate-700">
                  Tanggal: {params.startDate ? formatDate(params.startDate) : '...'} - {params.endDate ? formatDate(params.endDate) : '...'}
                  <button
                    type="button"
                    onClick={() => {
                      const newFilters = { ...filters, startDate: '', endDate: '' }
                      setFilters(newFilters)
                      setParams({ ...params, startDate: undefined, endDate: undefined, page: 1 })
                    }}
                    className="ml-1 hover:text-red-600"
                    aria-label="Hapus filter Tanggal"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Desktop Filter Panel */}
          {isDesktop && showFilters && (
            <div className="mt-6 rounded-lg border-2 border-black bg-slate-50 p-6 shadow-hard-sm animate-in slide-in-from-top-2 duration-200">
              <LaporanFilterForm
                filters={filters}
                setFilters={setFilters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                opdList={opdData?.data}
                jenisRetribusiList={jenisRetribusiData?.data}
              />
            </div>
          )}
        </div>

        {/* Mobile Filter Sheet */}
        {!isDesktop && (
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetContent side="bottom" className="max-h-[90vh] overflow-y-auto">
              <SheetHeader className="mb-6 text-left">
                <SheetTitle className="text-xl font-extrabold uppercase tracking-tight">Filter Laporan</SheetTitle>
              </SheetHeader>
              <LaporanFilterForm
                filters={filters}
                setFilters={setFilters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                opdList={opdData?.data}
                jenisRetribusiList={jenisRetribusiData?.data}
              />
            </SheetContent>
          </Sheet>
        )}

        {/* Table */}
        <div className="px-4 lg:px-8 w-full max-w-full">
          <div className="rounded-lg border-2 border-black bg-white shadow-hard-lg overflow-hidden">
            {isLoading ? (
              <TableSkeleton />
            ) : (
              <div className="flex flex-col">
                {/* Mobile View - Cards */}
                <div className="lg:hidden divide-y-2 divide-slate-200">
                  {data?.data.length === 0 ? (
                    <div className="p-12 text-center bg-slate-50">
                      <div className="w-16 h-16 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-bold text-slate-900 uppercase">Tidak ada data</p>
                      <p className="text-slate-500 mt-1">Coba ubah filter atau buat laporan baru</p>
                    </div>
                  ) : (
                    data?.data.map((laporan) => (
                      <SwipeableItem
                        key={laporan.id}
                        className="border-b-2 border-slate-100 last:border-0"
                        actions={{
                          right: laporan.status === 'draft' 
                            ? [
                                {
                                  icon: <Edit2 />,
                                  label: 'Edit',
                                  color: 'bg-blue-600',
                                  onClick: () => handleEdit(laporan.id)
                                },
                                {
                                  icon: <Trash2 />,
                                  label: 'Hapus',
                                  color: 'bg-red-600',
                                  onClick: () => handleDelete(laporan.id, laporan.nomorLaporan)
                                }
                              ]
                            : [
                                {
                                  icon: <Eye />,
                                  label: 'Detail',
                                  color: 'bg-slate-600',
                                  onClick: () => handleViewDetail(laporan)
                                }
                              ],
                          left: laporan.status === 'draft'
                            ? [
                                {
                                  icon: <Send />,
                                  label: 'Kirim',
                                  color: 'bg-green-600',
                                  onClick: () => handleSubmit(laporan.id, laporan.nomorLaporan)
                                }
                              ]
                            : undefined
                        }}
                      >
                        <div className="p-4 bg-white hover:bg-yellow-50 transition-colors group">
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
                                {formatDate(laporan.createdAt)}
                              </div>
                              <div className="font-bold text-slate-900 text-lg group-hover:underline decoration-2 underline-offset-2">
                                {laporan.nomorLaporan}
                              </div>
                            </div>
                            <span
                              className={`inline-flex rounded-none px-2 py-1 text-[10px] font-black uppercase tracking-wider border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${
                                laporan.status === 'draft'
                                  ? 'bg-yellow-100 border-yellow-700 text-yellow-800'
                                  : laporan.status === 'submitted'
                                    ? 'bg-green-100 border-green-700 text-green-800'
                                    : 'bg-red-100 border-red-700 text-red-800'
                              }`}
                            >
                              {laporan.status === 'draft'
                                ? 'Draft'
                                : laporan.status === 'submitted'
                                  ? 'Final'
                                  : 'Ditolak'}
                            </span>
                          </div>

                          {/* Card Body */}
                          <div className="space-y-2 mb-4">
                            <div>
                              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                OPD
                              </div>
                              <div className="text-sm font-medium text-slate-900">
                                {laporan.opdNama}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                Jenis Retribusi
                              </div>
                              <div className="text-sm font-medium text-slate-900">
                                {laporan.jenisRetribusiNama}
                              </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-slate-200 mt-2">
                              <div>
                                <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                  Tanggal Setor
                                </div>
                                <div className="text-sm font-medium text-slate-900">
                                  {formatDate(laporan.tanggalSetor)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                                  Nominal
                                </div>
                                <div className="text-lg font-extrabold text-slate-900">
                                  {formatCurrency(Number(laporan.nominal))}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Card Actions (Visible buttons for accessibility/desktop-like usage on mobile too) */}
                          <div className="flex items-center justify-between pt-3 border-t-2 border-slate-100">
                            <div className="flex items-center gap-2">
                              {/* Bukti */}
                              {laporan.fileBukti && (
                                <a
                                  href={`${API_BASE_URL}${laporan.fileBukti}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors uppercase"
                                  onClick={(e) => e.stopPropagation()} // Prevent swipe reset
                                >
                                  <ExternalLink className="h-3 w-3" /> Bukti
                                </a>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 animate-pulse">
                                ← Geser untuk aksi
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwipeableItem>
                    ))
                  )}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden lg:block overflow-x-auto">
                  <table
                    className="w-full border-collapse text-left"
                    style={{ minWidth: '1200px' }}
                    aria-label="Daftar Laporan Retribusi"
                  >
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors focus:outline-none focus:bg-slate-800"
                          onClick={() => handleSort('createdAt')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSort('createdAt');
                            }
                          }}
                          aria-sort={params.sortBy === 'createdAt' ? (params.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <div className="flex items-center gap-2">
                            Tanggal Lapor
                            {getSortIcon('createdAt')}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors focus:outline-none focus:bg-slate-800"
                          onClick={() => handleSort('nomorLaporan')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSort('nomorLaporan');
                            }
                          }}
                          aria-sort={params.sortBy === 'nomorLaporan' ? (params.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <div className="flex items-center gap-2">
                            No. Laporan
                            {getSortIcon('nomorLaporan')}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors focus:outline-none focus:bg-slate-800"
                          onClick={() => handleSort('opdNama')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSort('opdNama');
                            }
                          }}
                          aria-sort={params.sortBy === 'opdNama' ? (params.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <div className="flex items-center gap-2">
                            OPD
                            {getSortIcon('opdNama')}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors focus:outline-none focus:bg-slate-800"
                          onClick={() => handleSort('jenisRetribusiNama')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSort('jenisRetribusiNama');
                            }
                          }}
                          aria-sort={params.sortBy === 'jenisRetribusiNama' ? (params.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <div className="flex items-center gap-2">
                            Jenis Retribusi
                            {getSortIcon('jenisRetribusiNama')}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors focus:outline-none focus:bg-slate-800"
                          onClick={() => handleSort('tanggalSetor')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSort('tanggalSetor');
                            }
                          }}
                          aria-sort={params.sortBy === 'tanggalSetor' ? (params.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <div className="flex items-center gap-2">
                            Tanggal Setor
                            {getSortIcon('tanggalSetor')}
                          </div>
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors focus:outline-none focus:bg-slate-800 text-right"
                          onClick={() => handleSort('nominal')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSort('nominal');
                            }
                          }}
                          aria-sort={params.sortBy === 'nominal' ? (params.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Nominal (Rp)
                            {getSortIcon('nominal')}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-slate-700 text-center" scope="col">
                          Bukti
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-xs font-bold uppercase tracking-wider border-r border-slate-700 cursor-pointer hover:bg-slate-800 transition-colors focus:outline-none focus:bg-slate-800 text-center"
                          onClick={() => handleSort('status')}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSort('status');
                            }
                          }}
                          aria-sort={params.sortBy === 'status' ? (params.sortOrder === 'asc' ? 'ascending' : 'descending') : 'none'}
                        >
                          <div className="flex items-center justify-center gap-2">
                            Status
                            {getSortIcon('status')}
                          </div>
                        </th>
                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-center" scope="col">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-slate-200 bg-white">
                      {data?.data.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="p-12 text-center bg-slate-50">
                            <div className="w-16 h-16 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FileText className="w-8 h-8 text-slate-400" />
                            </div>
                            <p className="text-lg font-bold text-slate-900 uppercase">
                              Tidak ada data
                            </p>
                            <p className="text-slate-500 mt-1">
                              Coba ubah filter atau buat laporan baru
                            </p>
                          </td>
                        </tr>
                      ) : (
                        data?.data.map((laporan, index) => (
                          <tr
                            key={laporan.id}
                            className={`hover:bg-yellow-50 transition-colors group ${
                              index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'
                            }`}
                          >
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900 font-medium tabular-nums border-r border-slate-200">
                              {formatDate(laporan.createdAt)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900 tabular-nums border-r border-slate-200 group-hover:underline decoration-2 underline-offset-2">
                              {laporan.nomorLaporan}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700 font-medium border-r border-slate-200">
                              {laporan.opdNama}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-700 border-r border-slate-200 font-medium">
                              {laporan.jenisRetribusiNama}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700 tabular-nums border-r border-slate-200">
                              {formatDate(laporan.tanggalSetor)}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm font-bold text-slate-900 text-right tabular-nums border-r border-slate-200">
                              {formatCurrency(Number(laporan.nominal))}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-center border-r border-slate-200">
                              {laporan.fileBukti ? (
                                <a
                                  href={`${API_BASE_URL}${laporan.fileBukti}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center w-8 h-8 rounded border border-slate-300 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                                  title="Lihat Bukti"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              ) : (
                                <span className="text-slate-300 font-bold">-</span>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-center border-r border-slate-200">
                              <span
                                className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wide border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${
                                  laporan.status === 'draft'
                                    ? 'bg-yellow-100 border-yellow-700 text-yellow-800'
                                    : laporan.status === 'submitted'
                                      ? 'bg-green-100 border-green-700 text-green-800'
                                      : 'bg-red-100 border-red-700 text-red-800'
                                }`}
                              >
                                {laporan.status === 'draft'
                                  ? 'Draft'
                                  : laporan.status === 'submitted'
                                    ? 'Final'
                                    : 'Ditolak'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                              <div className="flex items-center justify-center gap-2">
                                {/* View Detail button - always available */}
                                <button
                                  type="button"
                                  onClick={() => handleViewDetail(laporan)}
                                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-all"
                                  title="Lihat Detail"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>

                                {/* Download PDF button - available for all */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownloadPDF(laporan.id, laporan.nomorLaporan)
                                  }
                                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-all"
                                  title="Download PDF"
                                >
                                  <Download className="h-4 w-4" />
                                </button>

                                {/* Actions based on status */}
                                {laporan.status === 'draft' && (
                                  <>
                                    {/* Edit button */}
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(laporan.id)}
                                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-all"
                                      title="Edit"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>

                                    {/* Submit button */}
                                    <button
                                      type="button"
                                      onClick={() => handleSubmit(laporan.id, laporan.nomorLaporan)}
                                      className="p-2 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded border border-transparent hover:border-green-200 transition-all"
                                      title="Kirim"
                                    >
                                      <Send className="h-4 w-4" />
                                    </button>

                                    {/* Delete button */}
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(laporan.id, laporan.nomorLaporan)}
                                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-all"
                                      title="Hapus"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}

                                {laporan.status === 'rejected' && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(laporan.id)}
                                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-200 transition-all"
                                      title="Edit"
                                    >
                                      <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(laporan.id, laporan.nomorLaporan)}
                                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition-all"
                                      title="Hapus"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                  <div className="border-t-2 border-black bg-white px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-sm font-medium text-slate-600">
                      Menampilkan{' '}
                      <span className="font-bold text-black">
                        {(data.pagination.page - 1) * data.pagination.limit + 1}
                      </span>{' '}
                      -{' '}
                      <span className="font-bold text-black">
                        {Math.min(
                          data.pagination.page * data.pagination.limit,
                          data.pagination.total
                        )}
                      </span>{' '}
                      dari <span className="font-bold text-black">{data.pagination.total}</span>{' '}
                      data
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handlePageChange((params.page || 1) - 1)}
                        disabled={params.page === 1}
                        className="px-4 py-2 text-sm font-bold uppercase tracking-wide border-2 border-black rounded bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Sebelumnya
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePageChange((params.page || 1) + 1)}
                        disabled={params.page === data.pagination.totalPages}
                        className="px-4 py-2 text-sm font-bold uppercase tracking-wide border-2 border-black rounded bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Selanjutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Detail Modal */}
        <LaporanDetailModal
          laporan={selectedLaporan}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
        />
      </div>
    </PullToRefresh>
  )
}
