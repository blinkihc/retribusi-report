/**
 * Target & Realisasi Page
 *
 * Halaman untuk melihat dan mengelola target penerimaan retribusi vs realisasinya.
 *
 * Fitur:
 * - [Admin] Panel input target per Jenis Retribusi per Tahun
 * - Tabel 1: Matrix Realisasi Bulanan (pivot: baris=retribusi, kolom=Jan-Des + Target + Total + %)
 * - Tabel 2: Rekap Realisasi per Jenis Retribusi (s/d bln lalu, bln ini, total, %, sisa)
 * - Export Excel & PDF untuk kedua tabel
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDown,
  Download,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Save,
  Search,
  Target,
  TrendingUp,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api/client'
import {
  bulkSaveTargetRetribusi,
  getExportUrl,
  getTargetRealisasiMatrix,
  getTargetRealisasiRekap,
  getTargetRetribusi,
  type TargetItem,
} from '@/lib/api/target-retribusi'
import type { TargetRealisasiMatrix, TargetRealisasiRekap } from '@/lib/db/schema'

// ─── HELPERS ────────────────────────────────────────────────────────────────

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const BULAN_FULL = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

const formatRp = (n: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(Math.round(n))

// Alias: tabel gunakan pemisah ribuan penuh
const formatNum = formatRp

// Format angka tanpa simbol Rp (untuk input display)
const formatAngka = (n: number) => new Intl.NumberFormat('id-ID').format(Math.round(n))

// Parse string ribuan ke number
const parseAngka = (s: string) => {
  const cleaned = s.replace(/[^0-9]/g, '')
  return cleaned === '' ? 0 : Number(cleaned)
}

const pctBadge = (pct: number) => {
  if (pct >= 100) return 'bg-green-100 text-green-800 border-green-300'
  if (pct >= 70) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  return 'bg-red-100 text-red-800 border-red-300'
}

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

function BadgePct({ pct }: { pct: number }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded border text-sm font-semibold ${pctBadge(pct)}`}
    >
      {pct.toFixed(2)}%
    </span>
  )
}

// ─── TABEL 1: MATRIX BULANAN ─────────────────────────────────────────────────

interface MatrixTableProps {
  data: TargetRealisasiMatrix[]
  tahun: number
  onExportExcel: () => void
  onExportPdf: () => void
  loading: boolean
}

function TabelMatrix({ data, tahun, onExportExcel, onExportPdf, loading }: MatrixTableProps) {
  // Totals per kolom
  const totals = useMemo(() => {
    const target = data.reduce((s, r) => s + r.target, 0)
    const bulanan: Record<number, number> = {}
    for (let b = 1; b <= 12; b++) {
      bulanan[b] = data.reduce((s, r) => s + (r.bulanan[b] ?? 0), 0)
    }
    const total = data.reduce((s, r) => s + r.total, 0)
    const pct = target > 0 ? (total / target) * 100 : 0
    return { target, bulanan, total, pct }
  }, [data])

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <Target className="h-12 w-12 opacity-30" />
        <p className="text-sm font-medium">Belum ada target yang diatur untuk tahun {tahun}</p>
        <p className="text-xs">Gunakan panel "Input Target" di atas untuk menambahkan target</p>
      </div>
    )
  }

  return (
    <div>
      {/* Export buttons */}
      <div className="flex gap-2 justify-end mb-4">
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </button>
        <button
          onClick={onExportPdf}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      {/* Scrollable table */}
      <div className="overflow-x-auto rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-blue-700 text-white">
              <th className="sticky left-0 z-10 bg-blue-700 text-left px-3 py-3 font-semibold min-w-[180px] whitespace-nowrap border-r border-blue-600">
                Nama Retribusi
              </th>
              <th className="text-right px-3 py-3 font-semibold min-w-[110px] whitespace-nowrap border-r border-blue-600">
                Target
              </th>
              {BULAN.map((b) => (
                <th
                  key={b}
                  className="text-right px-2 py-3 font-semibold min-w-[85px] whitespace-nowrap border-r border-blue-600"
                >
                  {b}
                </th>
              ))}
              <th className="text-right px-3 py-3 font-semibold min-w-[110px] whitespace-nowrap border-r border-blue-600">
                Total Penerimaan
              </th>
              <th className="text-center px-3 py-3 font-semibold min-w-[80px] whitespace-nowrap">
                % dari Target
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.jenisRetribusiId}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
              >
                <td className="sticky left-0 z-10 bg-inherit font-medium text-slate-800 px-3 py-2.5 border-r border-slate-200 whitespace-nowrap">
                  {row.namaRetribusi}
                </td>
                <td className="text-right px-3 py-2.5 text-slate-700 border-r border-slate-100 whitespace-nowrap">
                  {formatNum(row.target)}
                </td>
                {Array.from({ length: 12 }, (_, bi) => {
                  const val = row.bulanan[bi + 1] ?? 0
                  return (
                    <td
                      key={bi}
                      className="text-right px-2 py-2.5 border-r border-slate-100 whitespace-nowrap"
                    >
                      {val > 0 ? (
                        <span className="text-slate-700">{formatNum(val)}</span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                  )
                })}
                <td className="text-right px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                  {formatNum(row.total)}
                </td>
                <td className="text-center px-3 py-2.5 whitespace-nowrap">
                  <BadgePct pct={row.persentase} />
                </td>
              </tr>
            ))}
          </tbody>
          {/* TOTAL ROW */}
          <tfoot>
            <tr className="bg-blue-50 border-t-2 border-black font-bold">
              <td className="sticky left-0 z-10 bg-blue-50 px-3 py-3 text-slate-900 border-r border-slate-300">
                TOTAL
              </td>
              <td className="text-right px-3 py-3 text-slate-900 border-r border-slate-200 whitespace-nowrap">
                {formatNum(totals.target)}
              </td>
              {Array.from({ length: 12 }, (_, bi) => (
                <td
                  key={bi}
                  className="text-right px-2 py-3 text-slate-900 border-r border-slate-200 whitespace-nowrap"
                >
                  {totals.bulanan[bi + 1] > 0 ? (
                    formatNum(totals.bulanan[bi + 1])
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              ))}
              <td className="text-right px-3 py-3 text-slate-900 border-r border-slate-200 whitespace-nowrap">
                {formatNum(totals.total)}
              </td>
              <td className="text-center px-3 py-3 whitespace-nowrap">
                <BadgePct pct={totals.pct} />
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─── TABEL 2: REKAP ──────────────────────────────────────────────────────────

interface RekapTableProps {
  data: TargetRealisasiRekap[]
  tahun: number
  namaBulan: string
  onExportExcel: () => void
  onExportPdf: () => void
  loading: boolean
}

function TabelRekap({
  data,
  tahun,
  namaBulan,
  onExportExcel,
  onExportPdf,
  loading,
}: RekapTableProps) {
  const totals = useMemo(
    () => ({
      target: data.reduce((s, r) => s + r.target, 0),
      bulanLalu: data.reduce((s, r) => s + r.realisasiBulanLalu, 0),
      bulanIni: data.reduce((s, r) => s + r.realisasiBulanIni, 0),
      total: data.reduce((s, r) => s + r.realisasiTotal, 0),
      sisa: data.reduce((s, r) => s + r.sisaTarget, 0),
    }),
    [data]
  )

  const totalPct = totals.target > 0 ? (totals.total / totals.target) * 100 : 0

  if (loading)
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    )

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
        <TrendingUp className="h-12 w-12 opacity-30" />
        <p className="text-sm font-medium">Belum ada data rekap untuk tahun {tahun}</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2 justify-end mb-4">
        <button
          onClick={onExportExcel}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Export Excel
        </button>
        <button
          onClick={onExportPdf}
          className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border-2 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-white">
              <th className="sticky left-0 z-10 bg-slate-800 text-left px-3 py-3 font-semibold min-w-[200px] border-r border-slate-600">
                Nama Retribusi
              </th>
              <th className="text-right px-3 py-3 font-semibold min-w-[130px] border-r border-slate-600 whitespace-nowrap">
                Target
              </th>
              <th className="text-right px-3 py-3 font-semibold min-w-[130px] border-r border-slate-600 whitespace-nowrap">
                Realisasi s/d Bln Lalu
              </th>
              <th className="text-right px-3 py-3 font-semibold min-w-[130px] border-r border-slate-600 whitespace-nowrap">
                Realisasi {namaBulan}
              </th>
              <th className="text-right px-3 py-3 font-semibold min-w-[130px] border-r border-slate-600 whitespace-nowrap">
                Realisasi s/d {namaBulan}
              </th>
              <th className="text-center px-3 py-3 font-semibold min-w-[100px] border-r border-slate-600 whitespace-nowrap">
                % Pencapaian
              </th>
              <th className="text-right px-3 py-3 font-semibold min-w-[130px] whitespace-nowrap">
                Sisa Target
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr
                key={row.jenisRetribusiId}
                className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
              >
                <td className="sticky left-0 z-10 bg-inherit font-medium text-slate-800 px-3 py-2.5 border-r border-slate-200 whitespace-nowrap">
                  {row.namaRetribusi}
                </td>
                <td className="text-right px-3 py-2.5 text-slate-700 border-r border-slate-100 whitespace-nowrap">
                  {formatRp(row.target)}
                </td>
                <td className="text-right px-3 py-2.5 text-slate-600 border-r border-slate-100 whitespace-nowrap">
                  {row.realisasiBulanLalu > 0 ? (
                    formatRp(row.realisasiBulanLalu)
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="text-right px-3 py-2.5 text-slate-700 border-r border-slate-100 whitespace-nowrap">
                  {row.realisasiBulanIni > 0 ? (
                    formatRp(row.realisasiBulanIni)
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
                <td className="text-right px-3 py-2.5 font-semibold text-slate-800 border-r border-slate-100 whitespace-nowrap">
                  {row.realisasiTotal > 0 ? (
                    formatRp(row.realisasiTotal)
                  ) : (
                    <span className="text-slate-400">Rp0</span>
                  )}
                </td>
                <td className="text-center px-3 py-2.5 border-r border-slate-100 whitespace-nowrap">
                  <BadgePct pct={row.persentase} />
                </td>
                <td
                  className={`text-right px-3 py-2.5 font-semibold whitespace-nowrap ${row.sisaTarget < 0 ? 'text-green-700' : 'text-red-600'}`}
                >
                  {row.sisaTarget < 0
                    ? `+${formatRp(Math.abs(row.sisaTarget))}`
                    : formatRp(row.sisaTarget)}
                  {row.sisaTarget < 0 && <span className="ml-1 text-xs">(lebih)</span>}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-black font-bold">
              <td className="sticky left-0 z-10 bg-slate-100 px-3 py-3 text-slate-900 border-r border-slate-300">
                TOTAL
              </td>
              <td className="text-right px-3 py-3 text-slate-900 border-r border-slate-200 whitespace-nowrap">
                {formatRp(totals.target)}
              </td>
              <td className="text-right px-3 py-3 text-slate-900 border-r border-slate-200 whitespace-nowrap">
                {formatRp(totals.bulanLalu)}
              </td>
              <td className="text-right px-3 py-3 text-slate-900 border-r border-slate-200 whitespace-nowrap">
                {formatRp(totals.bulanIni)}
              </td>
              <td className="text-right px-3 py-3 text-slate-900 border-r border-slate-200 whitespace-nowrap">
                {formatRp(totals.total)}
              </td>
              <td className="text-center px-3 py-3 border-r border-slate-200 whitespace-nowrap">
                <BadgePct pct={totalPct} />
              </td>
              <td
                className={`text-right px-3 py-3 whitespace-nowrap ${totals.sisa < 0 ? 'text-green-700' : 'text-red-700'}`}
              >
                {totals.sisa < 0
                  ? `+${formatRp(Math.abs(totals.sisa))} (lebih)`
                  : formatRp(totals.sisa)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─── PANEL INPUT TARGET (Admin only) ─────────────────────────────────────────

interface DraftItem {
  jenisRetribusiId: number
  namaRetribusi: string
  kodeRetribusi: string
  targetNominal: number
  existingId?: number // set jika sudah ada di DB
}

interface JenisOption {
  id: number
  nama: string
  kode: string
}

interface InputTargetPanelProps {
  tahun: number
  existingTargets: TargetItem[]
  onSaved: () => void
}

function InputTargetPanel({ tahun, existingTargets, onSaved }: InputTargetPanelProps) {
  const queryClient = useQueryClient()

  // ── Draft list (pre-populated from existing targets) ──
  const [drafts, setDrafts] = useState<DraftItem[]>(() =>
    existingTargets.map((t) => ({
      jenisRetribusiId: t.jenisRetribusiId,
      namaRetribusi: t.namaRetribusi ?? '',
      kodeRetribusi: t.kodeRetribusi ?? '',
      targetNominal: Number(t.targetNominal),
      existingId: t.id,
    }))
  )

  // ── Form state ──
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedOption, setSelectedOption] = useState<JenisOption | null>(null)
  const [nominalInput, setNominalInput] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [nominalFocused, setNominalFocused] = useState(false)

  // ── Inline edit state ──
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editNominal, setEditNominal] = useState('')
  const [editFocused, setEditFocused] = useState(false)

  // Debounce search input (400ms)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => clearTimeout(t)
  }, [searchQuery])

  // ── Fetch jenis retribusi berdasarkan search (on-demand) ──
  const { data: searchRes, isFetching: searching } = useQuery({
    queryKey: ['jenis-retribusi-search', debouncedSearch],
    queryFn: () =>
      apiClient.get<{ success: boolean; data: { id: number; nama: string; kode: string }[] }>(
        `/api/jenis-retribusi?search=${encodeURIComponent(debouncedSearch)}&limit=15&isActive=true&sortBy=kode&sortOrder=asc`
      ),
    enabled: debouncedSearch.trim().length >= 1,
    staleTime: 30_000,
  })

  const searchOptions: JenisOption[] = (searchRes?.data?.data ?? []).filter(
    (o) => !drafts.some((d) => d.jenisRetribusiId === o.id)
  )

  // ── Tambah ke draft ──
  const handleTambah = () => {
    if (!selectedOption) return
    const nominal = parseAngka(nominalInput)
    setDrafts((prev) => [
      ...prev,
      {
        jenisRetribusiId: selectedOption.id,
        namaRetribusi: selectedOption.nama,
        kodeRetribusi: selectedOption.kode,
        targetNominal: nominal,
      },
    ])
    // Reset form
    setSearchQuery('')
    setDebouncedSearch('')
    setSelectedOption(null)
    setNominalInput('')
    setShowDropdown(false)
  }

  // ── Hapus dari draft ──
  const handleHapus = (jenisRetribusiId: number) => {
    setDrafts((prev) => prev.filter((d) => d.jenisRetribusiId !== jenisRetribusiId))
  }

  // ── Simpan semua ke DB ──
  const { mutate: saveBulk, isPending } = useMutation({
    mutationFn: () =>
      bulkSaveTargetRetribusi({
        tahun,
        targets: drafts.map((d) => ({
          jenisRetribusiId: d.jenisRetribusiId,
          targetNominal: d.targetNominal,
        })),
      }),
    onSuccess: (res) => {
      toast.success(`${res.data.saved} target berhasil disimpan`)
      queryClient.invalidateQueries({ queryKey: ['targets', tahun] })
      queryClient.invalidateQueries({ queryKey: ['target-realisasi-matrix', tahun] })
      queryClient.invalidateQueries({ queryKey: ['target-realisasi-rekap', tahun] })
      onSaved()
    },
    onError: () => toast.error('Gagal menyimpan target'),
  })

  const nominalVal = parseAngka(nominalInput)

  return (
    <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Input Target Tahun {tahun}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cari retribusi → isi nominal → klik Tambah. Klik Simpan Semua untuk menyimpan ke
            database.
          </p>
        </div>
        <button
          onClick={() => saveBulk()}
          disabled={isPending || drafts.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-bold hover:bg-blue-800 disabled:opacity-40 transition-colors shadow-sm whitespace-nowrap"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan Semua ({drafts.length})
        </button>
      </div>

      {/* ── Form add retribusi ── */}
      <div className="flex gap-2 mb-4 items-end">
        {/* Search retribusi */}
        <div className="flex-1 relative">
          <label className="block text-xs font-medium text-slate-600 mb-1">Cari Retribusi</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={
                selectedOption ? `${selectedOption.kode} – ${selectedOption.nama}` : searchQuery
              }
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSelectedOption(null)
                setShowDropdown(true)
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              placeholder="Ketik nama atau kode retribusi…"
              className="w-full pl-8 pr-8 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {(searchQuery || selectedOption) && (
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setSearchQuery('')
                  setSelectedOption(null)
                  setDebouncedSearch('')
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
            {/* Dropdown hasil search */}
            {showDropdown && !selectedOption && debouncedSearch.length >= 1 && (
              <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg">
                {searching && (
                  <div className="flex items-center gap-2 px-3 py-3 text-slate-400 text-sm">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Mencari…
                  </div>
                )}
                {!searching && searchOptions.length === 0 && (
                  <div className="px-3 py-3 text-slate-400 text-sm">
                    Tidak ada hasil untuk "{debouncedSearch}"
                  </div>
                )}
                {searchOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedOption(opt)
                      setSearchQuery('')
                      setShowDropdown(false)
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-slate-100 last:border-0"
                  >
                    <span className="font-medium text-slate-800 text-sm">{opt.nama}</span>
                    <span className="ml-2 text-xs font-mono text-slate-400">{opt.kode}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Nominal input */}
        <div className="w-52">
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Target Nominal (Rp)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={
              nominalFocused
                ? nominalVal === 0
                  ? ''
                  : String(nominalVal)
                : nominalVal === 0
                  ? ''
                  : formatAngka(nominalVal)
            }
            onFocus={() => setNominalFocused(true)}
            onBlur={() => setNominalFocused(false)}
            onChange={(e) => setNominalInput(e.target.value)}
            placeholder="0"
            className="w-full text-right border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Tambah button */}
        <button
          onClick={handleTambah}
          disabled={!selectedOption}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 disabled:opacity-40 transition-colors whitespace-nowrap"
        >
          <span className="text-base leading-none">+</span>
          Tambah
        </button>
      </div>

      {/* ── Draft list tabel ── */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="text-left px-4 py-2.5 font-semibold text-slate-700">Nama Retribusi</th>
              <th className="text-left px-3 py-2.5 font-semibold text-slate-700 w-44">Kode</th>
              <th className="text-right px-4 py-2.5 font-semibold text-slate-700 w-52">
                Target Nominal (Rp)
              </th>
              <th className="w-16 px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {drafts.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400 text-sm">
                  <Target className="h-8 w-8 mx-auto mb-2 opacity-25" />
                  Belum ada retribusi ditambahkan. Gunakan form di atas untuk menambahkan.
                </td>
              </tr>
            )}
            {drafts.map((d, idx) => {
              const isEditing = editingId === d.jenisRetribusiId
              return (
                <tr
                  key={d.jenisRetribusiId}
                  className={`border-b border-slate-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'} hover:bg-blue-50 transition-colors`}
                >
                  <td className="px-4 py-2.5 text-slate-800 font-medium">{d.namaRetribusi}</td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs font-mono">
                    {d.kodeRetribusi}
                  </td>
                  <td className="px-4 py-2.5">
                    {isEditing ? (
                      <input
                        type="text"
                        inputMode="numeric"
                        value={
                          editFocused
                            ? parseAngka(editNominal) === 0
                              ? ''
                              : String(parseAngka(editNominal))
                            : parseAngka(editNominal) === 0
                              ? ''
                              : formatAngka(parseAngka(editNominal))
                        }
                        onFocus={() => setEditFocused(true)}
                        onBlur={() => {
                          setEditFocused(false)
                          // Save on blur
                          setDrafts((prev) =>
                            prev.map((item) =>
                              item.jenisRetribusiId === d.jenisRetribusiId
                                ? { ...item, targetNominal: parseAngka(editNominal) }
                                : item
                            )
                          )
                          setEditingId(null)
                        }}
                        onChange={(e) => setEditNominal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                          if (e.key === 'Escape') setEditingId(null)
                        }}
                        className="w-full text-right border border-blue-400 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(d.jenisRetribusiId)
                          setEditNominal(String(d.targetNominal))
                          setEditFocused(true)
                        }}
                        className="w-full text-right px-3 py-1 rounded-md hover:bg-blue-100 transition-colors text-slate-700 font-medium border border-transparent"
                        title="Klik untuk edit"
                      >
                        {d.targetNominal > 0 ? (
                          formatAngka(d.targetNominal)
                        ) : (
                          <span className="text-slate-300">0 (klik edit)</span>
                        )}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => handleHapus(d.jenisRetribusiId)}
                      className="text-red-400 hover:text-red-600 transition-colors text-xs p-1 rounded hover:bg-red-50"
                      title="Hapus dari daftar"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {drafts.length > 0 && (
        <p className="text-xs text-slate-400 mt-2">
          {drafts.length} retribusi dalam daftar · Klik nominal untuk edit
        </p>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

export default function TargetRealisasiPage() {
  const [tahun, setTahun] = useState(currentYear)
  const [showInputPanel, setShowInputPanel] = useState(false)

  // Get user role
  const isAdmin = (() => {
    try {
      const u = JSON.parse(localStorage.getItem('auth_user') ?? '{}')
      return u?.role === 'admin'
    } catch {
      return false
    }
  })()

  const queryClient = useQueryClient()

  // ── Queries ──
  const { data: targetsRes, isLoading: targetsLoading } = useQuery({
    queryKey: ['targets', tahun],
    queryFn: () => getTargetRetribusi(tahun),
    enabled: isAdmin,
  })

  const {
    data: matrixRes,
    isLoading: matrixLoading,
    refetch: refetchMatrix,
  } = useQuery({
    queryKey: ['target-realisasi-matrix', tahun],
    queryFn: () => getTargetRealisasiMatrix(tahun),
  })

  const {
    data: rekapRes,
    isLoading: rekapLoading,
    refetch: refetchRekap,
  } = useQuery({
    queryKey: ['target-realisasi-rekap', tahun],
    queryFn: () => getTargetRealisasiRekap(tahun),
  })

  const matrixData: TargetRealisasiMatrix[] = matrixRes?.data?.data ?? []
  const rekapData: TargetRealisasiRekap[] = rekapRes?.data?.data ?? []
  const existingTargets: TargetItem[] = targetsRes?.data?.data ?? []
  const namaBulan = rekapRes?.data?.namaBulan ?? BULAN_FULL[new Date().getMonth()]

  // ── Export handlers ──
  const handleExport = (tabel: 'matrix' | 'rekap', format: 'excel' | 'pdf') => {
    const url = getExportUrl(tahun, tabel, format)
    // Get token from localStorage
    const token = localStorage.getItem('auth_token')
    // Use fetch with auth header and create blob URL
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = `target-realisasi-${tabel}-${tahun}.${format === 'excel' ? 'xlsx' : 'pdf'}`
        a.click()
        URL.revokeObjectURL(a.href)
      })
      .catch(() => toast.error('Gagal mengunduh file'))
  }

  const handleRefresh = () => {
    refetchMatrix()
    refetchRekap()
    if (isAdmin) queryClient.invalidateQueries({ queryKey: ['targets', tahun] })
    toast.info('Data diperbarui')
  }

  // ── Stat cards ──
  const totalTarget = rekapData.reduce((s, r) => s + r.target, 0)
  const totalRealisasi = rekapData.reduce((s, r) => s + r.realisasiTotal, 0)
  const totalPct = totalTarget > 0 ? (totalRealisasi / totalTarget) * 100 : 0
  const sisaTotal = totalTarget - totalRealisasi

  return (
    <div className="space-y-6 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-2">
            <Target className="h-7 w-7 text-blue-600" />
            Target &amp; Realisasi
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Monitoring pencapaian target penerimaan retribusi daerah
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tahun filter */}
          <div className="relative">
            <select
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 border-2 border-black rounded-lg text-sm font-bold bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {yearOptions.map((y) => (
                <option key={y} value={y}>
                  Tahun {y}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none text-slate-500" />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2 border-2 border-black rounded-lg hover:bg-slate-100 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      {rekapData.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Target',
              value: formatNum(totalTarget),
              color: 'border-blue-400 bg-blue-50',
            },
            {
              label: 'Total Realisasi',
              value: formatNum(totalRealisasi),
              color: 'border-green-400 bg-green-50',
            },
            {
              label: '% Pencapaian',
              value: `${totalPct.toFixed(2)}%`,
              color:
                totalPct >= 100
                  ? 'border-green-400 bg-green-50'
                  : totalPct >= 70
                    ? 'border-yellow-400 bg-yellow-50'
                    : 'border-red-400 bg-red-50',
            },
            {
              label: 'Sisa Target',
              value: (sisaTotal < 0 ? '+' : '') + formatNum(Math.abs(sisaTotal)),
              color: sisaTotal < 0 ? 'border-green-400 bg-green-50' : 'border-red-400 bg-red-50',
            },
          ].map((card) => (
            <div key={card.label} className={`rounded-xl border-2 ${card.color} p-4 shadow-sm`}>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-xl font-extrabold text-slate-900 mt-1">{card.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Admin: Input Target Panel */}
      {isAdmin && (
        <div>
          <button
            onClick={() => setShowInputPanel((p) => !p)}
            className="flex items-center gap-2 text-sm font-bold text-blue-700 hover:text-blue-900 mb-3 transition-colors"
          >
            <Target className="h-4 w-4" />
            {showInputPanel ? '▲ Sembunyikan panel input target' : '▼ Input / Edit Target'}
          </button>

          {showInputPanel && !targetsLoading && (
            <InputTargetPanel
              tahun={tahun}
              existingTargets={existingTargets}
              onSaved={() => setShowInputPanel(false)}
            />
          )}
        </div>
      )}

      {/* Tabel 1: Matrix Bulanan */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
          <span className="inline-block w-3 h-3 bg-blue-600 rounded-sm" />
          Tabel 1: Realisasi Penerimaan Bulanan Tahun {tahun}
        </h3>
        <TabelMatrix
          data={matrixData}
          tahun={tahun}
          loading={matrixLoading}
          onExportExcel={() => handleExport('matrix', 'excel')}
          onExportPdf={() => handleExport('matrix', 'pdf')}
        />
      </div>

      {/* Tabel 2: Rekap */}
      <div className="bg-white border-2 border-black rounded-xl p-5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg">
          <span className="inline-block w-3 h-3 bg-slate-800 rounded-sm" />
          Tabel 2: Rekap Realisasi Penerimaan Retribusi Tahun {tahun}
        </h3>
        <TabelRekap
          data={rekapData}
          tahun={tahun}
          namaBulan={namaBulan}
          loading={rekapLoading}
          onExportExcel={() => handleExport('rekap', 'excel')}
          onExportPdf={() => handleExport('rekap', 'pdf')}
        />
      </div>
    </div>
  )
}
