import { X } from 'lucide-react'
import { memo } from 'react'
import type { JenisRetribusi } from '../../lib/api/jenis-retribusi'
import type { OPD } from '../../lib/api/opd'

interface FilterState {
  opdId: string
  jenisRetribusiId: string
  startDate: string
  endDate: string
}

interface LaporanFilterFormProps {
  filters: FilterState
  setFilters: (filters: FilterState) => void
  onApply: () => void
  onClear: () => void
  opdList?: OPD[]
  jenisRetribusiList?: JenisRetribusi[]
  className?: string
}

export const LaporanFilterForm = memo(function LaporanFilterForm({
  filters,
  setFilters,
  onApply,
  onClear,
  opdList = [],
  jenisRetribusiList = [],
  className,
}: LaporanFilterFormProps) {
  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* OPD Filter */}
        <div>
          <label
            htmlFor="opd-filter"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
          >
            OPD
          </label>
          <select
            id="opd-filter"
            value={filters.opdId}
            onChange={(e) => setFilters({ ...filters, opdId: e.target.value })}
            className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-medium focus:border-black focus:bg-yellow-50 focus:outline-none"
            aria-label="Filter berdasarkan OPD"
          >
            <option value="">SEMUA OPD</option>
            {opdList.map((opd) => (
              <option key={opd.id} value={opd.id}>
                {opd.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Jenis Retribusi Filter */}
        <div>
          <label
            htmlFor="jenis-filter"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
          >
            Jenis Retribusi
          </label>
          <select
            id="jenis-filter"
            value={filters.jenisRetribusiId}
            onChange={(e) => setFilters({ ...filters, jenisRetribusiId: e.target.value })}
            className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-medium focus:border-black focus:bg-yellow-50 focus:outline-none"
            aria-label="Filter berdasarkan Jenis Retribusi"
          >
            <option value="">SEMUA JENIS</option>
            {jenisRetribusiList.map((jenis) => (
              <option key={jenis.id} value={jenis.id}>
                {jenis.nama}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label
            htmlFor="start-date"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
          >
            Dari Tanggal
          </label>
          <input
            type="date"
            id="start-date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-medium focus:border-black focus:bg-yellow-50 focus:outline-none"
            aria-label="Filter dari tanggal"
          />
        </div>

        {/* End Date */}
        <div>
          <label
            htmlFor="end-date"
            className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2"
          >
            Sampai Tanggal
          </label>
          <input
            type="date"
            id="end-date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2.5 text-sm font-medium focus:border-black focus:bg-yellow-50 focus:outline-none"
            aria-label="Filter sampai tanggal"
          />
        </div>
      </div>

      {/* Filter Actions */}
      <div className="mt-6 flex items-center justify-end gap-3 border-t-2 border-slate-200 pt-4">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors uppercase tracking-wide"
          aria-label="Hapus semua filter"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Hapus Filter
        </button>
        <button
          type="button"
          onClick={onApply}
          className="rounded-lg bg-black px-6 py-2.5 text-sm font-bold uppercase tracking-wide text-white hover:bg-slate-800 transition-colors shadow-hard-sm"
        >
          Terapkan Filter
        </button>
      </div>
    </div>
  )
})
