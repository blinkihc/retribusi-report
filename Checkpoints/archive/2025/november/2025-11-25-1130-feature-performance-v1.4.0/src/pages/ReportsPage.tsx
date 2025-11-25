/**
 * Reports Page - Laporan Rekap
 *
 * Aggregate reports with filters and export functionality
 * Max 400 lines, clean and modular
 *
 * Last Updated: 2025-11-14
 */

import { useQuery } from '@tanstack/react-query'
import { ChevronDown, Download, FileText, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import {
  getRekapByJenisPelayanan,
  getRekapByKategori,
  getRekapByOPD,
  getReportSummary,
} from '../lib/api/reports'
import { formatCurrency } from '../lib/utils'

type RekapType = 'opd' | 'kategori' | 'jenis-pelayanan'

export default function ReportsPage() {
  const currentDate = new Date()
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear())
  const [rekapType, setRekapType] = useState<RekapType>('opd')
  const [showExportMenu, setShowExportMenu] = useState(false)

  // Fetch summary statistics
  const { data: summary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['report-summary', selectedMonth, selectedYear],
    queryFn: () => getReportSummary({ month: selectedMonth, year: selectedYear }),
  })

  // Fetch rekap by OPD
  const { data: rekapByOPD, isLoading: isLoadingOPD } = useQuery({
    queryKey: ['rekap-by-opd', selectedMonth, selectedYear],
    queryFn: () => getRekapByOPD({ month: selectedMonth, year: selectedYear }),
    enabled: rekapType === 'opd',
  })

  // Fetch rekap by Kategori
  const { data: rekapByKategori, isLoading: isLoadingKategori } = useQuery({
    queryKey: ['rekap-by-kategori', selectedMonth, selectedYear],
    queryFn: () => getRekapByKategori({ month: selectedMonth, year: selectedYear }),
    enabled: rekapType === 'kategori',
  })

  // Fetch rekap by Jenis Pelayanan
  const { data: rekapByJenisPelayanan, isLoading: isLoadingJenisPelayanan } = useQuery({
    queryKey: ['rekap-by-jenis-pelayanan', selectedMonth, selectedYear],
    queryFn: () => getRekapByJenisPelayanan({ month: selectedMonth, year: selectedYear }),
    enabled: rekapType === 'jenis-pelayanan',
  })

  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ]

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() - i)

  const handleExport = async (format: 'excel' | 'pdf') => {
    try {
      const token = localStorage.getItem('auth_token')
      const url = `/api/reports/export/${format}?type=${rekapType}&month=${selectedMonth}&year=${selectedYear}`

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
      let filename = `Rekap_${rekapType}_${selectedMonth}_${selectedYear}.${format === 'excel' ? 'xlsx' : 'pdf'}`
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
    } catch (error) {
      console.error('Export error:', error)
      alert('Gagal export data. Silakan coba lagi.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 overflow-x-hidden max-w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Laporan Rekap</h1>
          <p className="mt-2 text-sm text-gray-600">
            Rekap pendapatan retribusi daerah per periode
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-2">
                Bulan
              </label>
              <select
                id="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
                Tahun
              </label>
              <select
                id="year"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-4 w-4" />
              </button>

              {showExportMenu && (
                <div className="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="py-1">
                    <button
                      onClick={() => handleExport('excel')}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileText className="h-4 w-4 text-green-600" />
                      Export Excel
                    </button>
                    <button
                      onClick={() => handleExport('pdf')}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <FileText className="h-4 w-4 text-red-600" />
                      Export PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {/* Total Pendapatan */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {isLoadingSummary ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    formatCurrency(Number(summary?.data.totalNominal || 0))
                  )}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Total Laporan */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Laporan</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {isLoadingSummary ? (
                    <span className="text-gray-400">...</span>
                  ) : (
                    summary?.data.totalLaporan || 0
                  )}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Jumlah OPD */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Jumlah OPD</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {isLoadingSummary ? (
                    <span className="text-gray-400">...</span>
                  ) : (
                    summary?.data.jumlahOPD || 0
                  )}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Rekap Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setRekapType('opd')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              rekapType === 'opd'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Per OPD
          </button>
          <button
            type="button"
            onClick={() => setRekapType('kategori')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              rekapType === 'kategori'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Per Kategori
          </button>
          <button
            type="button"
            onClick={() => setRekapType('jenis-pelayanan')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              rekapType === 'jenis-pelayanan'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Per Jenis Pelayanan
          </button>
        </div>

        {/* Rekap Table */}
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {rekapType === 'opd' && 'Rekap per OPD'}
              {rekapType === 'kategori' && 'Rekap per Kategori Retribusi'}
              {rekapType === 'jenis-pelayanan' && 'Rekap per Jenis Pelayanan'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            {/* Table Per OPD */}
            {rekapType === 'opd' && (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kode OPD
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nama OPD
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Jumlah Laporan
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total Nominal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoadingOPD ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : !rekapByOPD?.data.length ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    rekapByOPD.data.map((item, i) => (
                      <tr key={item.opdId} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{i + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium">{item.opdKode}</td>
                        <td className="px-6 py-4 text-sm">{item.opdNama}</td>
                        <td className="px-6 py-4 text-sm text-right">{item.jumlahLaporan}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium">
                          {formatCurrency(Number(item.totalNominal))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Table Per Kategori */}
            {rekapType === 'kategori' && (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kategori Retribusi
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Jumlah Laporan
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total Nominal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoadingKategori ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : !rekapByKategori?.data.length ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    rekapByKategori.data.map((item, i) => (
                      <tr key={item.kategori} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{i + 1}</td>
                        <td className="px-6 py-4 text-sm font-medium">{item.kategori}</td>
                        <td className="px-6 py-4 text-sm text-right">{item.jumlahLaporan}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium">
                          {formatCurrency(Number(item.totalNominal))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}

            {/* Table Per Jenis Pelayanan */}
            {rekapType === 'jenis-pelayanan' && (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Jenis Pelayanan
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Jumlah Laporan
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Total Nominal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoadingJenisPelayanan ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : !rekapByJenisPelayanan?.data.length ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        Tidak ada data
                      </td>
                    </tr>
                  ) : (
                    rekapByJenisPelayanan.data.map((item, i) => (
                      <tr
                        key={`${item.kategori}-${item.jenisPelayanan}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-sm">{i + 1}</td>
                        <td className="px-6 py-4 text-sm">{item.kategori}</td>
                        <td className="px-6 py-4 text-sm font-medium">{item.jenisPelayanan}</td>
                        <td className="px-6 py-4 text-sm text-right">{item.jumlahLaporan}</td>
                        <td className="px-6 py-4 text-sm text-right font-medium">
                          {formatCurrency(Number(item.totalNominal))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
