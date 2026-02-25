/**
 * API Client — Target Retribusi
 *
 * Fungsi untuk berinteraksi dengan endpoint target-retribusi dan target-realisasi
 */

import { apiClient } from './client'
import type { TargetRealisasiMatrix, TargetRealisasiRekap } from '../db/schema'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TargetItem {
    id: number
    jenisRetribusiId: number
    namaRetribusi: string
    kategori: string
    kodeRetribusi: string
    tahun: number
    targetNominal: number
}

export interface BulkTargetPayload {
    tahun: number
    targets: { jenisRetribusiId: number; targetNominal: number }[]
}

// ─── Target CRUD (Admin) ──────────────────────────────────────────────────────

export const getTargetRetribusi = (tahun: number) =>
    apiClient.get<{ success: boolean; data: TargetItem[] }>(
        `/api/target-retribusi?tahun=${tahun}`
    )

export const createTargetRetribusi = (payload: {
    jenisRetribusiId: number
    tahun: number
    targetNominal: number
}) => apiClient.post<{ success: boolean; data: TargetItem }>('/api/target-retribusi', payload)

export const updateTargetRetribusi = (id: number, targetNominal: number) =>
    apiClient.put<{ success: boolean; data: TargetItem }>(
        `/api/target-retribusi/${id}`,
        { targetNominal }
    )

export const deleteTargetRetribusi = (id: number) =>
    apiClient.delete<{ success: boolean }>(`/api/target-retribusi/${id}`)

export const bulkSaveTargetRetribusi = (payload: BulkTargetPayload) =>
    apiClient.post<{ success: boolean; saved: number }>('/api/target-retribusi/bulk', payload)

// ─── Data Laporan Target-Realisasi ────────────────────────────────────────────

export const getTargetRealisasiMatrix = (tahun: number) =>
    apiClient.get<{ success: boolean; data: TargetRealisasiMatrix[]; tahun: number }>(
        `/api/target-realisasi/matrix?tahun=${tahun}`
    )

export const getTargetRealisasiRekap = (tahun: number) =>
    apiClient.get<{
        success: boolean
        data: TargetRealisasiRekap[]
        tahun: number
        bulanSekarang: number
        namaBulan: string
    }>(`/api/target-realisasi/rekap?tahun=${tahun}`)

// ─── Export URLs (direct browser download) ───────────────────────────────────

export const getExportUrl = (tahun: number, tabel: 'matrix' | 'rekap', format: 'excel' | 'pdf') =>
    `/api/target-realisasi/export/${format}?tahun=${tahun}&tabel=${tabel}`
