import { ExternalLink, User, Calendar, Clock, FileText, AlertTriangle, CheckCircle } from 'lucide-react'
import { LaporanRetribusi } from '../../lib/api/laporan-retribusi'
import { formatDate, formatCurrency } from '../../lib/utils'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'

// @ts-expect-error - Vite env variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

interface LaporanDetailModalProps {
  laporan: LaporanRetribusi | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function LaporanDetailModal({ laporan, open, onOpenChange }: LaporanDetailModalProps) {
  if (!laporan) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border-2 border-black shadow-hard">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Detail Laporan
          </DialogTitle>
        </DialogHeader>
        
        {/* Content */}
        <div className="space-y-6 py-4">
           {/* Status Banner */}
           <div className={`p-4 border-l-4 ${
             laporan.status === 'submitted' ? 'bg-green-50 border-green-500' :
             laporan.status === 'rejected' ? 'bg-red-50 border-red-500' :
             'bg-yellow-50 border-yellow-500'
           }`}>
              <div className="flex justify-between items-center">
                 <div>
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Status Laporan</p>
                    <p className={`text-lg font-black uppercase ${
                      laporan.status === 'submitted' ? 'text-green-700' :
                      laporan.status === 'rejected' ? 'text-red-700' :
                      'text-yellow-700'
                    }`}>
                      {laporan.status === 'submitted' ? 'Final / Terkirim' :
                       laporan.status === 'rejected' ? 'Ditolak' : 'Draft'}
                    </p>
                 </div>
                 <div className="text-right">
                    <p className="text-xs font-bold uppercase tracking-wider opacity-70">Nomor Laporan</p>
                    <p className="text-lg font-mono font-bold">{laporan.nomorLaporan}</p>
                 </div>
              </div>
           </div>

           {/* Main Info Grid */}
           <div className="grid grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">OPD</label>
                <p className="font-bold text-slate-900">{laporan.opdNama}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Jenis Retribusi</label>
                <p className="font-bold text-slate-900">{laporan.jenisRetribusiNama}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tanggal Setor</label>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {formatDate(laporan.tanggalSetor)}
                </p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Nominal</label>
                <p className="font-bold text-slate-900 text-xl">{formatCurrency(Number(laporan.nominal))}</p>
              </div>
           </div>
           
           {/* Keterangan & Bukti */}
           <div className="space-y-4 border-t-2 border-dashed border-slate-200 pt-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Keterangan</label>
                <p className="text-sm font-medium text-slate-700">{laporan.keterangan || '-'}</p>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1 block">Bukti Penyetoran</label>
                {laporan.fileBukti ? (
                  <a 
                    href={`${API_BASE_URL}${laporan.fileBukti}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 border-2 border-slate-200 hover:border-black hover:bg-yellow-50 font-bold text-sm transition-all uppercase"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Lihat File Bukti
                  </a>
                ) : (
                  <p className="text-sm text-slate-400 italic">Tidak ada file bukti</p>
                )}
              </div>
           </div>

           {/* Audit Trail Section */}
           <div className="bg-slate-900 text-slate-300 p-4 rounded-none space-y-3 text-sm">
              <h4 className="font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-2 flex items-center gap-2">
                 <Clock className="h-4 w-4" /> Riwayat Aktivitas
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                    <p className="text-xs uppercase text-slate-500">Dibuat Oleh</p>
                    <p className="font-bold text-white flex items-center gap-1">
                       <User className="h-3 w-3" /> {laporan.submittedByName || '-'}
                    </p>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">{formatDate(laporan.createdAt)}</p>
                 </div>

                 <div>
                    <p className="text-xs uppercase text-slate-500">Terakhir Diubah</p>
                    <p className="font-mono text-white">{formatDate(laporan.updatedAt)}</p>
                 </div>

                 {laporan.submittedAt && (
                    <div className="col-span-2">
                       <p className="text-xs uppercase text-slate-500">Dikirim Pada</p>
                       <p className="font-mono text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> {formatDate(laporan.submittedAt)}
                       </p>
                    </div>
                 )}

                 {laporan.status === 'rejected' && laporan.rejectionReason && (
                    <div className="col-span-2 bg-red-900/30 p-2 border border-red-900/50">
                       <p className="text-xs uppercase text-red-400 font-bold">Alasan Penolakan</p>
                       <p className="text-red-200 mt-1">{laporan.rejectionReason}</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
