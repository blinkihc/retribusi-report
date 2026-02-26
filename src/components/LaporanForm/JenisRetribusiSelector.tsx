/**
 * Jenis Retribusi Selector - 3 Tier Dropdown
 *
 * Tier 1: Kategori (Umum, Jasa Usaha, Perizinan Tertentu)
 * Tier 2: Pelayanan (filtered by kategori & OPD)
 * Tier 3: Jenis Retribusi (filtered by pelayanan)
 *
 * Style: Government Structured Brutalism
 *
 * Last Updated: 2025-11-23
 */

import { useQuery } from '@tanstack/react-query'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getOPDPelayananList } from '../../lib/api/opd-pelayanan'

interface JenisRetribusiSelectorProps {
  opdId: number
  opdKode?: string
  selectedJenisId: number
  onJenisChange: (jenisId: number) => void
  errors?: {
    kategori?: string
    pelayanan?: string
    jenisRetribusiId?: string
  }
}

export default function JenisRetribusiSelector({
  opdId,
  opdKode,
  selectedJenisId,
  onJenisChange,
  errors,
}: JenisRetribusiSelectorProps) {
  const [selectedKategori, setSelectedKategori] = useState<string>('')
  const [selectedPelayanan, setSelectedPelayanan] = useState<string>('')

  // Fetch ALL jenis retribusi assigned to this OPD
  const { data: opdJenisRetribusiList } = useQuery({
    queryKey: ['opd-jenis-retribusi', opdKode],
    queryFn: () =>
      getOPDPelayananList({
        opdKode,
        limit: 1000,
      }),
    enabled: !!opdKode,
  })

  // Get unique kategori for Tier 1 (only kategori assigned to this OPD)
  const uniqueKategori = Array.from(
    new Set(
      opdJenisRetribusiList?.data.map((item) => item.kategori).filter((k): k is string => !!k) || []
    )
  )

  // Filter by selected kategori for Tier 2
  const filteredByKategori = opdJenisRetribusiList?.data.filter(
    (item) => !selectedKategori || item.kategori === selectedKategori
  )

  // Get unique deskripsi for Tier 2 (Jenis Pelayanan)
  const uniquePelayanan = Array.from(
    new Set(filteredByKategori?.map((item) => item.deskripsi).filter(Boolean) || [])
  )

  // Filter jenis retribusi by selected pelayanan (Tier 3: nama)
  const filteredJenisRetribusi = filteredByKategori?.filter(
    (item) => !selectedPelayanan || item.deskripsi === selectedPelayanan
  )

  // Populate dropdowns when selectedJenisId is provided (edit mode)
  // biome-ignore lint/correctness/useExhaustiveDependencies: onJenisChange causes infinite loop
  useEffect(() => {
    if (selectedJenisId && opdJenisRetribusiList?.data) {
      // Find the selected jenis retribusi
      const selectedItem = opdJenisRetribusiList.data.find(
        (item) => item.jenisRetribusiId === selectedJenisId
      )

      if (selectedItem) {
        // Populate kategori and pelayanan from the selected item
        setSelectedKategori(selectedItem.kategori || '')
        setSelectedPelayanan(selectedItem.deskripsi || '')
      }
    }
  }, [selectedJenisId, opdJenisRetribusiList])

  // Reset when OPD changes (only in create mode, not when populating from edit)
  // biome-ignore lint/correctness/useExhaustiveDependencies: onJenisChange causes infinite loop
  useEffect(() => {
    // Don't reset if we have a selectedJenisId (edit mode)
    if (!selectedJenisId) {
      setSelectedKategori('')
      setSelectedPelayanan('')
      onJenisChange(0)
    }
  }, [opdId])

  const handleKategoriChange = (kategori: string) => {
    setSelectedKategori(kategori)
    setSelectedPelayanan('')
    onJenisChange(0)
  }

  const handlePelayananChange = (pelayanan: string) => {
    setSelectedPelayanan(pelayanan)
    onJenisChange(0)
  }

  return (
    <div className="space-y-6">
      {/* Kategori */}
      <div>
        <label
          htmlFor="kategori"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
        >
          Kategori Retribusi <span className="text-red-600">*</span>
        </label>
        <select
          id="kategori"
          value={selectedKategori}
          onChange={(e) => handleKategoriChange(e.target.value)}
          disabled={!opdKode}
          className={`w-full rounded-none border-2 px-4 py-3 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors disabled:bg-slate-100 disabled:text-slate-400 ${
            errors?.kategori
              ? 'border-red-600 focus:border-red-600 bg-red-50'
              : 'border-black focus:border-black bg-white'
          }`}
        >
          <option value="">{opdKode ? 'PILIH KATEGORI' : 'PILIH OPD TERLEBIH DAHULU'}</option>
          {uniqueKategori.map((kategori) => (
            <option key={kategori} value={kategori}>
              {kategori.toUpperCase()}
            </option>
          ))}
        </select>
        {errors?.kategori && (
          <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 uppercase">
            <AlertCircle className="h-4 w-4" />
            {errors.kategori}
          </p>
        )}
      </div>

      {/* Pelayanan */}
      <div>
        <label
          htmlFor="pelayanan"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
        >
          Jenis Pelayanan <span className="text-red-600">*</span>
        </label>
        <select
          id="pelayanan"
          value={selectedPelayanan}
          onChange={(e) => handlePelayananChange(e.target.value)}
          disabled={!selectedKategori}
          className={`w-full rounded-none border-2 px-4 py-3 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors disabled:bg-slate-100 disabled:text-slate-400 ${
            errors?.pelayanan
              ? 'border-red-600 focus:border-red-600 bg-red-50'
              : 'border-black focus:border-black bg-white'
          }`}
        >
          <option value="">
            {selectedKategori ? 'PILIH PELAYANAN' : 'PILIH KATEGORI TERLEBIH DAHULU'}
          </option>
          {uniquePelayanan.map((pelayanan) => (
            <option key={pelayanan} value={pelayanan}>
              {pelayanan}
            </option>
          ))}
        </select>
        {errors?.pelayanan && (
          <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 uppercase">
            <AlertCircle className="h-4 w-4" />
            {errors.pelayanan}
          </p>
        )}
      </div>

      {/* Jenis Retribusi */}
      <div>
        <label
          htmlFor="jenis"
          className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
        >
          Jenis Retribusi <span className="text-red-600">*</span>
        </label>
        <select
          id="jenis"
          value={selectedJenisId || 0}
          onChange={(e) => onJenisChange(Number(e.target.value))}
          disabled={!selectedPelayanan}
          className={`w-full rounded-none border-2 px-4 py-3 text-sm font-medium focus:outline-none focus:bg-yellow-50 transition-colors disabled:bg-slate-100 disabled:text-slate-400 ${
            errors?.jenisRetribusiId
              ? 'border-red-600 focus:border-red-600 bg-red-50'
              : 'border-black focus:border-black bg-white'
          }`}
        >
          <option value={0}>
            {selectedPelayanan ? 'PILIH JENIS RETRIBUSI' : 'PILIH PELAYANAN TERLEBIH DAHULU'}
          </option>
          {filteredJenisRetribusi?.map((item) => (
            <option key={item.id} value={item.jenisRetribusiId || 0}>
              {item.jenisRetribusiNama}
            </option>
          ))}
        </select>
        {errors?.jenisRetribusiId && (
          <p className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1 uppercase">
            <AlertCircle className="h-4 w-4" />
            {errors.jenisRetribusiId}
          </p>
        )}
      </div>
    </div>
  )
}
