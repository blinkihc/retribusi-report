/**
 * OPD-Pelayanan List Page
 *
 * Displays list of OPD-Pelayanan relationships with:
 * - Table view with sorting
 * - Pagination
 * - Search functionality
 * - Create/Delete actions (admin only)
 * - Alert Dialog for delete confirmation
 * - Toast notifications for success/error
 *
 * Last Updated: 2025-11-14
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link2, Plus, Search, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'
import {
  deleteOPDPelayanan,
  getOPDPelayananList,
  type OPDPelayananListParams,
} from '../lib/api/opd-pelayanan'
import { useAuth } from '../lib/auth/useAuth'

export default function OPDPelayananListPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const queryClient = useQueryClient()

  // State for filters and pagination
  const [params, setParams] = useState<OPDPelayananListParams>({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'opdKode',
    sortOrder: 'asc',
  })

  // State for delete confirmation dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    id: number
    opdNama: string
    jenisRetribusiNama: string
  }>({ open: false, id: 0, opdNama: '', jenisRetribusiNama: '' })

  // Fetch OPD-Pelayanan list
  const { data, isLoading, error } = useQuery({
    queryKey: ['opd-pelayanan-list', params],
    queryFn: () => getOPDPelayananList(params),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteOPDPelayanan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opd-pelayanan-list'] })
      toast.success('Hubungan OPD-Pelayanan berhasil dihapus')
      setDeleteDialog({ open: false, id: 0, opdNama: '', jenisRetribusiNama: '' })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus hubungan OPD-Pelayanan')
    },
  })

  // Handle delete - open confirmation dialog
  const handleDelete = (id: number, opdNama: string, jenisRetribusiNama: string) => {
    setDeleteDialog({ open: true, id, opdNama, jenisRetribusiNama })
  }

  // Confirm delete
  const confirmDelete = () => {
    deleteMutation.mutate(deleteDialog.id)
  }

  // Handle search
  const handleSearch = (value: string) => {
    setParams((prev) => ({ ...prev, search: value, page: 1 }))
  }

  // Handle sort
  const handleSort = (sortBy: 'opdKode' | 'jenisRetribusiKode' | 'createdAt') => {
    setParams((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }))
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page }))
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Action Button */}
      {isAdmin && (
        <div className="mb-4 lg:mb-6 flex justify-end">
          <Link
            to="/dashboard/settings/opd-pelayanan/create"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-3 lg:px-4 py-2 text-xs lg:text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <Plus className="h-3.5 lg:h-4 w-3.5 lg:w-4" />
            <span className="hidden sm:inline">Tambah Hubungan OPD-Pelayanan</span>
            <span className="sm:hidden">Tambah</span>
          </Link>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Cari OPD atau Jenis Retribusi..."
            value={params.search}
            onChange={(e) => handleSearch(e.target.value)}
            className="block w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary-600 border-r-transparent"></div>
              <p className="mt-2 text-sm text-gray-600">Memuat data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <p className="text-sm text-red-600">Gagal memuat data OPD-Pelayanan</p>
              <p className="mt-1 text-xs text-gray-500">{error.message}</p>
            </div>
          </div>
        ) : data && data.data.length > 0 ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                    onClick={() => handleSort('opdKode')}
                  >
                    <div className="flex items-center gap-1">
                      OPD
                      {params.sortBy === 'opdKode' && (
                        <span className="text-primary-600">
                          {params.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                    onClick={() => handleSort('jenisRetribusiKode')}
                  >
                    <div className="flex items-center gap-1">
                      Jenis Retribusi
                      {params.sortBy === 'jenisRetribusiKode' && (
                        <span className="text-primary-600">
                          {params.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:bg-gray-100"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-1">
                      Tanggal Dibuat
                      {params.sortBy === 'createdAt' && (
                        <span className="text-primary-600">
                          {params.sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  {isAdmin && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary-100">
                          <Link2 className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.opdKode}</div>
                          <div className="text-xs text-gray-500">{item.opdNama}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {item.jenisRetribusiKode}
                      </div>
                      <div className="text-xs text-gray-500">{item.jenisRetribusiNama}</div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString('id-ID', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          title="Hapus"
                          onClick={() =>
                            handleDelete(
                              item.id,
                              item.opdNama || item.opdKode,
                              item.jenisRetribusiNama || item.jenisRetribusiKode
                            )
                          }
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    type="button"
                    onClick={() => handlePageChange(params.page! - 1)}
                    disabled={params.page === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePageChange(params.page! + 1)}
                    disabled={params.page === data.pagination.totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Menampilkan{' '}
                      <span className="font-medium">{(params.page! - 1) * params.limit! + 1}</span>{' '}
                      sampai{' '}
                      <span className="font-medium">
                        {Math.min(params.page! * params.limit!, data.pagination.total)}
                      </span>{' '}
                      dari <span className="font-medium">{data.pagination.total}</span> data
                    </p>
                  </div>
                  <div>
                    <nav
                      className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                      aria-label="Pagination"
                    >
                      <button
                        type="button"
                        onClick={() => handlePageChange(params.page! - 1)}
                        disabled={params.page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>←
                      </button>
                      {Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            type="button"
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              page === params.page
                                ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        type="button"
                        onClick={() => handlePageChange(params.page! + 1)}
                        disabled={params.page === data.pagination.totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>→
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <Link2 className="h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">Tidak ada data OPD-Pelayanan</p>
            {isAdmin && (
              <Link
                to="/dashboard/settings/opd-pelayanan/create"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
              >
                <Plus className="h-4 w-4" />
                Tambah Hubungan Pertama
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Hubungan OPD-Pelayanan</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus hubungan antara{' '}
              <strong>"{deleteDialog.opdNama}"</strong> dengan{' '}
              <strong>"{deleteDialog.jenisRetribusiNama}"</strong>?
              <br />
              <br />
              Data yang dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() =>
                setDeleteDialog({ open: false, id: 0, opdNama: '', jenisRetribusiNama: '' })
              }
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Menghapus...' : 'Hapus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
