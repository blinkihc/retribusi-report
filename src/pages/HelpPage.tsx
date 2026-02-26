import {
  ChevronDown, ChevronUp, FileText, HelpCircle, MessageCircle,
  Shield, User, Printer, LayoutDashboard, FileBarChart,
  Settings, Database, Building2, Receipt, Link as LinkIcon,
  Sliders, Plus, Trash2, Edit, Save, Download, Search, Menu,
  Image as ImageIcon, Upload
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../lib/utils/cn'

// --- UI MOCKUP COMPONENTS (Untuk Visualisasi di PDF) ---
// Mockup ini dibuat agar SEMIRIP mungkin dengan tampilan aplikasi asli
const UIMockup = ({ type }: { type: 'sidebar' | 'dashboard' | 'table' | 'form' | 'login' | 'settings' }) => {

  // 1. SIDEBAR MOCKUP (REVISED: LIGHT THEME, UPPERCASE)
  if (type === 'sidebar') {
    return (
      <div className="bg-white text-slate-600 p-4 rounded-lg w-full max-w-[220px] font-sans text-[9px] shadow-lg border border-slate-200 h-[400px] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2 text-slate-900 font-black mb-6 pb-4 border-b-2 border-slate-100">
          <div className="w-6 h-6 bg-blue-600 rounded-sm shrink-0"></div>
          <span className="leading-tight tracking-tighter text-[10px]">SISTEM RETRIBUSI DAERAH</span>
        </div>

        {/* Menu Items */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-slate-50 font-bold text-slate-500">
            <LayoutDashboard className="w-3 h-3" /> DASHBOARD
          </div>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-slate-50 font-bold text-slate-500">
            <FileText className="w-3 h-3" /> LAPORAN RETRIBUSI
          </div>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-slate-50 font-bold text-slate-500">
            <FileBarChart className="w-3 h-3" /> LAPORAN REKAP
          </div>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-slate-50 font-bold text-slate-500">
            <User className="w-3 h-3" /> MANAJEMEN USER
          </div>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-slate-50 font-bold text-slate-500">
            <Settings className="w-3 h-3" /> SETTINGS
          </div>
          <div className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-slate-50 font-bold text-slate-500">
            <User className="w-3 h-3" /> PROFIL SAYA
          </div>
        </div>

        {/* Bottom Button */}
        <div className="mt-auto pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 bg-yellow-100 border-2 border-slate-900 text-slate-900 px-3 py-2 rounded font-bold justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <HelpCircle className="w-3 h-3" /> PUSAT BANTUAN
          </div>
        </div>
      </div>
    )
  }

  // 2. DASHBOARD MOCKUP (REVISED: COMPLEX GRID)
  if (type === 'dashboard') {
    return (
      <div className="bg-slate-50 p-2 rounded-lg w-full border border-slate-200 font-sans">

        {/* ROW 1: SUMMARY CARDS */}
        <div className="grid grid-cols-5 gap-2 mb-3">
          {/* Card 1 */}
          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col justify-between h-14">
            <div className="text-[7px] font-bold text-slate-500 uppercase truncate">Hari Ini</div>
            <div className="font-bold text-[10px] text-slate-900 truncate">Rp 0</div>
          </div>
          {/* Card 2 */}
          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col justify-between h-14">
            <div className="text-[7px] font-bold text-slate-500 uppercase truncate">Bulan Ini</div>
            <div className="font-bold text-[10px] text-slate-900 truncate">Rp 0</div>
          </div>
          {/* Card 3 */}
          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col justify-between h-14">
            <div className="text-[7px] font-bold text-slate-500 uppercase truncate">Tahun Ini</div>
            <div className="font-bold text-[10px] text-slate-900 truncate">Rp 23.7M</div>
          </div>
          {/* Card 4 (Dark) */}
          <div className="bg-slate-900 p-2 rounded border border-slate-900 shadow-sm flex flex-col justify-between h-14 text-white">
            <div className="text-[7px] font-bold text-slate-300 uppercase truncate">Total Pendapatan</div>
            <div className="font-bold text-[10px] truncate">Rp 25.7M</div>
          </div>
          {/* Card 5 */}
          <div className="bg-white p-2 rounded border border-slate-200 shadow-sm flex flex-col justify-between h-14">
            <div className="text-[7px] font-bold text-slate-500 uppercase truncate">Total Laporan</div>
            <div className="font-bold text-[10px] text-slate-900 truncate">13</div>
          </div>
        </div>

        {/* ROW 2: CHARTS */}
        <div className="grid grid-cols-3 gap-2 mb-3 h-28">
          {/* Line Chart (2/3 width) */}
          <div className="col-span-2 bg-white rounded border border-slate-200 p-2 flex flex-col">
            <div className="text-[8px] font-bold uppercase text-slate-700 mb-2 border-b pb-1">Trend Pendapatan (30 Hari)</div>
            <div className="flex-1 relative flex items-end px-2 pb-2">
              {/* Fake Line */}
              <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                <path d="M0,28 L10,28 L20,28 L30,25 L40,27 L50,26 L60,5 L70,25 L80,27 L90,28 L100,28" fill="none" stroke="#6366f1" strokeWidth="1.5" />
                <path d="M0,28 L10,28 L20,28 L30,25 L40,27 L50,26 L60,5 L70,25 L80,27 L90,28 L100,28 L100,30 L0,30 Z" fill="#e0e7ff" opacity="0.5" />
              </svg>
            </div>
          </div>
          {/* Pie Chart (1/3 width) */}
          <div className="bg-white rounded border border-slate-200 p-2 flex flex-col">
            <div className="text-[8px] font-bold uppercase text-slate-700 mb-2 border-b pb-1">Komposisi Kategori</div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-r-orange-400 border-b-green-400 rotate-45"></div>
            </div>
          </div>
        </div>

        {/* ROW 3: MORE CHARTS */}
        <div className="grid grid-cols-2 gap-2 mb-3 h-24">
          {/* Horizontal Bar */}
          <div className="bg-white rounded border border-slate-200 p-2">
            <div className="text-[8px] font-bold uppercase text-slate-700 mb-2 border-b pb-1">Performa OPD (Top 10)</div>
            <div className="space-y-1 mt-1">
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-black w-[80%] h-full"></div></div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-black w-[40%] h-full"></div></div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-black w-[20%] h-full"></div></div>
            </div>
          </div>
          {/* Vertical Bar */}
          <div className="bg-white rounded border border-slate-200 p-2 flex flex-col">
            <div className="text-[8px] font-bold uppercase text-slate-700 mb-2 border-b pb-1">Top Jenis Retribusi</div>
            <div className="flex-1 flex items-end justify-around gap-1 pb-1">
              <div className="w-3 bg-blue-500 h-[80%] rounded-t-[2px]"></div>
              <div className="w-3 bg-green-500 h-[20%] rounded-t-[2px]"></div>
              <div className="w-3 bg-pink-500 h-[10%] rounded-t-[2px]"></div>
              <div className="w-3 bg-orange-500 h-[5%] rounded-t-[2px]"></div>
            </div>
          </div>
        </div>

        {/* ROW 4: TABLE */}
        <div className="bg-white rounded border border-slate-200 p-2">
          <div className="text-[8px] font-bold uppercase text-slate-700 mb-1 flex justify-between">
            <span>Laporan Terbaru</span>
            <span className="text-blue-600 cursor-pointer">Lihat Semua &rarr;</span>
          </div>
          <div className="border-t border-slate-100 pt-1">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <div className="text-[8px] font-bold text-slate-800">LR/DIN/2025/001 <span className="text-slate-400 font-normal block">Retribusi Pelayanan Kesehatan</span></div>
              <div className="text-[8px] font-bold">Rp 500.000</div>
            </div>
            <div className="flex justify-between items-center py-1">
              <div className="text-[8px] font-bold text-slate-800">LR/DIN/2025/002 <span className="text-slate-400 font-normal block">Retribusi Parkir</span></div>
              <div className="text-[8px] font-bold">Rp 150.000</div>
            </div>
          </div>
        </div>

      </div>
    )
  }

  // 3. TABLE MOCKUP
  if (type === 'table') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden text-[10px] w-full font-sans shadow-sm">
        <div className="p-2 border-b border-slate-200 flex justify-between items-center bg-white">
          <div className="font-bold text-slate-800">Daftar Data</div>
          <div className="flex gap-1">
            <div className="bg-white border px-2 py-0.5 rounded text-slate-400 flex items-center gap-1">
              <Search className="w-2 h-2" /> Cari...
            </div>
            <div className="bg-black text-white px-2 py-0.5 rounded text-[9px] font-medium flex items-center gap-1">
              <Plus className="w-2 h-2" /> Add New
            </div>
          </div>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
            <tr>
              <th className="p-2 text-left font-medium">Nama / Kode</th>
              <th className="p-2 text-left font-medium">Kategori</th>
              <th className="p-2 text-center font-medium">Status</th>
              <th className="p-2 text-right font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[1, 2].map((_, i) => (
              <tr key={i} className="hover:bg-slate-50">
                <td className="p-2">
                  <div className="font-medium text-slate-900">Item Data {i + 1}</div>
                  <div className="text-[8px] text-slate-500">KODE-00{i + 1}</div>
                </td>
                <td className="p-2 text-slate-600">Umum</td>
                <td className="p-2 text-center"><span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-[3px] text-[8px] font-medium">Aktif</span></td>
                <td className="p-2 text-right">
                  <div className="flex justify-end gap-1">
                    <div className="p-1 bg-slate-100 rounded hover:bg-slate-200"><Edit className="w-2 h-2 text-slate-600" /></div>
                    <div className="p-1 bg-red-50 rounded hover:bg-red-100"><Trash2 className="w-2 h-2 text-red-500" /></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-1.5 border-t border-slate-100 flex justify-between items-center text-[8px] text-slate-500 bg-slate-50">
          <span>Showing 1-10 of 50</span>
          <div className="flex gap-1">
            <span className="border px-1 rounded bg-white">Prev</span>
            <span className="border px-1 rounded bg-black text-white">1</span>
            <span className="border px-1 rounded bg-white">Next</span>
          </div>
        </div>
      </div>
    )
  }

  // 4. FORM MOCKUP
  if (type === 'form') {
    return (
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm max-w-xs mx-auto font-sans w-full">
        <div className="border-b border-slate-100 pb-2 mb-3">
          <div className="font-bold text-xs text-slate-900">Form Data</div>
          <div className="text-[9px] text-slate-500">Silakan lengkapi data di bawah ini</div>
        </div>
        <div className="space-y-2.5">
          <div>
            <div className="text-[9px] font-medium mb-1 text-slate-700">Nama OPD <span className="text-red-500">*</span></div>
            <div className="h-7 border border-slate-200 rounded bg-white w-full px-2 flex items-center text-[10px]">Dinas Pendidikan</div>
          </div>
          <div>
            <div className="text-[9px] font-medium mb-1 text-slate-700">Kode Rekening</div>
            <div className="h-7 border border-slate-200 rounded bg-white w-full px-2 flex items-center text-[10px] text-slate-400">Masukkan kode...</div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
            <div className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-medium text-slate-600">Batal</div>
            <div className="px-2 py-1 bg-black text-white rounded text-[9px] font-medium flex items-center gap-1">
              <Save className="w-2 h-2" /> Simpan
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 5. SETTINGS MOCKUP (MIRIP SCREENSHOT USER)
  if (type === 'settings') {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm w-full font-sans overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b border-slate-200 bg-white px-4 pt-2">
          <div className="px-3 py-2 text-[9px] font-medium text-slate-500 flex items-center gap-1 border-b-2 border-transparent">
            <Building2 className="w-3 h-3" /> Data OPD
          </div>
          <div className="px-3 py-2 text-[9px] font-medium text-slate-500 flex items-center gap-1 border-b-2 border-transparent">
            <Receipt className="w-3 h-3" /> Jenis Retribusi
          </div>
          <div className="px-3 py-2 text-[9px] font-medium text-slate-500 flex items-center gap-1 border-b-2 border-transparent">
            <LinkIcon className="w-3 h-3" /> OPD-Pelayanan
          </div>
          <div className="px-3 py-2 text-[9px] font-bold text-blue-600 flex items-center gap-1 border-b-2 border-blue-600">
            <Settings className="w-3 h-3" /> Konfigurasi Umum
          </div>
        </div>

        {/* Settings Content */}
        <div className="p-4 bg-slate-50/50">

          {/* Header Text */}
          <div className="mb-4">
            <div className="text-sm font-bold text-slate-900">Konfigurasi Umum</div>
            <div className="text-[10px] text-slate-500">Kelola pengaturan umum aplikasi dan format dokumen</div>
          </div>

          {/* Card 1: Format Nomor */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 mb-3 flex items-center justify-between shadow-sm">
            <div className="flex-1 mr-4">
              <div className="text-[10px] font-bold text-slate-700 mb-1">Format Nomor Laporan</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-[9px] font-mono border border-slate-200">
                LR/&#123;KODE_OPD&#125;/&#123;BULAN&#125;/&#123;TAHUN&#125;/&#123;NOMOR&#125;
              </div>
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-[9px] font-bold shadow-sm shadow-blue-200">
                Edit
              </div>
            </div>
          </div>

          {/* Card 2: Logo Kabupaten */}
          <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-[10px] font-bold text-slate-700 mb-0.5">Logo Kabupaten</div>
                <div className="text-[9px] text-slate-500">Upload logo kabupaten yang akan ditampilkan di PDF laporan retribusi</div>
              </div>
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded border border-blue-100">
                <ImageIcon className="w-3 h-3" />
              </div>
            </div>

            <div className="text-[9px] text-slate-600 font-medium mb-1.5">Logo Saat Ini:</div>
            <div className="w-16 h-16 border border-slate-200 rounded bg-slate-50 flex items-center justify-center mb-3">
              {/* Logo Placeholder using pure CSS shapes */}
              <div className="relative w-10 h-12">
                <div className="absolute inset-0 bg-blue-500 rounded-b-full rounded-t-sm opacity-20"></div>
                <div className="absolute inset-2 bg-yellow-400 rounded-full opacity-80 flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 rotate-45"></div>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-[9px] font-bold shadow-sm shadow-blue-200 mb-2">
              <Upload className="w-2 h-2" /> Ganti Logo
            </div>

            <div className="text-[8px] text-slate-400 leading-tight">
              • Format: JPG, PNG<br />
              • Ukuran maksimal: 2MB<br />
              • Rekomendasi: 200x200px atau lebih besar
            </div>
          </div>

        </div>
      </div>
    )
  }

  // 6. REKAP MOCKUP (NEW: SESUAI SCREENSHOT LAPORAN REKAP)
  if (type === 'rekap') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 w-full font-sans">
        {/* Header */}
        <div className="mb-3">
          <div className="text-sm font-bold text-slate-900">Laporan Rekap</div>
          <div className="text-[9px] text-slate-500">Rekap pendapatan retribusi daerah per periode</div>
        </div>

        {/* Filter Box */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 mb-3 shadow-sm">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <div className="text-[9px] font-medium text-slate-700 mb-1">Bulan</div>
              <div className="border border-slate-200 rounded px-2 py-1 text-[10px] bg-white flex justify-between items-center">
                <span>November</span> <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-[9px] font-medium text-slate-700 mb-1">Tahun</div>
              <div className="border border-slate-200 rounded px-2 py-1 text-[10px] bg-white flex justify-between items-center">
                <span>2025</span> <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
            <div className="bg-green-600 text-white px-3 py-1 rounded text-[10px] font-bold flex items-center gap-1 shadow-sm shadow-green-200 h-[26px]">
              <Download className="w-3 h-3" /> Export <ChevronDown className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>

        {/* Summary Cards Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <div className="text-[8px] text-slate-500">Total Pendapatan</div>
              <div className="text-[11px] font-bold text-slate-900">Rp 23.7M</div>
            </div>
            <div className="w-6 h-6 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full"></div>
            </div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <div className="text-[8px] text-slate-500">Total Laporan</div>
              <div className="text-[11px] font-bold text-slate-900">13</div>
            </div>
            <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <FileText className="w-3 h-3" />
            </div>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <div className="text-[8px] text-slate-500">Jumlah OPD</div>
              <div className="text-[11px] font-bold text-slate-900">4</div>
            </div>
            <div className="w-6 h-6 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center">
              <Building2 className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-2">
          <div className="bg-blue-600 text-white px-2 py-1 rounded text-[9px] font-medium">Per OPD</div>
          <div className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded text-[9px] font-medium">Per Kategori</div>
          <div className="bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded text-[9px] font-medium">Per Jenis Pelayanan</div>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100 text-[9px] font-bold text-slate-800 bg-slate-50">Rekap per OPD</div>
          <table className="w-full text-[9px]">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="p-2 text-left w-8">NO</th>
                <th className="p-2 text-left">KODE</th>
                <th className="p-2 text-left">NAMA OPD</th>
                <th className="p-2 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <tr>
                <td className="p-2 text-slate-500">1</td>
                <td className="p-2 font-medium">DLH</td>
                <td className="p-2">DINAS LINGKUNGAN HIDUP</td>
                <td className="p-2 text-right font-bold">Rp 18.0M</td>
              </tr>
              <tr>
                <td className="p-2 text-slate-500">2</td>
                <td className="p-2 font-medium">DINKES</td>
                <td className="p-2">DINAS KESEHATAN</td>
                <td className="p-2 text-right font-bold">Rp 3.1M</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    )
  }

  return null
}

export default function HelpPage() {
  const [openItem, setOpenItem] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'general' | 'admin'>('general')

  const toggleItem = (id: string) => {
    setOpenItem(openItem === id ? null : id)
  }

  const handlePrint = () => {
    window.print()
  }

  // --- DATA CONTENT ---

  const faqs = [
    {
      id: 'item-1',
      question: 'Apakah saya bisa mengubah laporan yang sudah dikirim?',
      answer: 'Tidak. Laporan yang berstatus Final / Terkirim tidak dapat diubah oleh operator. Jika ada kesalahan, hubungi Admin Bapenda untuk melakukan penolakan laporan agar statusnya kembali menjadi draft dan bisa diedit.'
    },
    {
      id: 'item-2',
      question: 'Format file apa saja yang didukung untuk bukti setor?',
      answer: 'Sistem mendukung file gambar (JPG, PNG, WEBP) dan dokumen PDF. Ukuran maksimal file adalah 5MB. Pastikan foto bukti setor terlihat jelas dan tulisan terbaca.'
    },
    {
      id: 'item-3',
      question: 'Bagaimana jika OPD saya tidak muncul di daftar?',
      answer: 'Jika Anda adalah Operator OPD, Anda hanya akan melihat OPD yang ditugaskan kepada Anda. Jika OPD Anda salah atau tidak muncul, hubungi Admin untuk memperbarui penugasan akun Anda.'
    },
    {
      id: 'item-4',
      question: 'Apa arti status "Ditolak"?',
      answer: 'Status "Ditolak" berarti laporan Anda telah diperiksa oleh Verifikator/Admin namun ditemukan ketidaksesuaian (misal: nominal tidak cocok dengan bukti). Anda perlu mengedit laporan tersebut sesuai catatan penolakan dan mengirimkannya kembali.'
    },
    {
      id: 'item-5',
      question: 'Apakah saya bisa mencetak laporan?',
      answer: 'Ya. Anda dapat mengunduh bukti tanda terima laporan dalam format PDF dengan mengklik tombol Download PDF (ikon panah bawah) pada daftar laporan.'
    }
  ]

  // Admin Guide Data Lengkap
  const adminChapters = [
    {
      title: "BAB 1: Pengenalan Antarmuka",
      sections: [
        {
          title: "Menu Navigasi (Sidebar)",
          content: "Menu navigasi utama terletak di sebelah kiri dengan tampilan terang (Light Mode). Menu ini menyesuaikan dengan hak akses pengguna.",
          mockup: 'sidebar',
          points: [
            "DASHBOARD: Pusat informasi dan statistik real-time.",
            "LAPORAN RETRIBUSI: Daftar laporan masuk untuk diverifikasi.",
            "LAPORAN REKAP: Menu khusus untuk mencetak laporan gabungan/periodik.",
            "MANAJEMEN USER: Pengelolaan akun pengguna (Operator & Admin).",
            "SETTINGS: Konfigurasi master data (OPD, Retribusi) dan sistem.",
            "PROFIL SAYA: Pengaturan akun pribadi pengguna.",
            "PUSAT BANTUAN: Tombol cepat untuk mengakses panduan ini."
          ]
        }
      ]
    },
    {
      title: "BAB 2: Dashboard & Monitoring",
      sections: [
        {
          title: "Membaca Dashboard",
          content: "Dashboard menyajikan informasi komprehensif mengenai penerimaan retribusi dengan berbagai metrik periode.",
          mockup: 'dashboard',
          points: [
            "Kartu Ringkasan: Memantau pendapatan Hari Ini, Bulan Ini, Tahun Ini, serta Total Akumulasi (Kartu Biru Gelap) dan Jumlah Laporan.",
            "Grafik Tren & Komposisi: Melihat kenaikan/penurunan pendapatan 30 hari terakhir dan proporsi kategori retribusi.",
            "Grafik Performa: Membandingkan capaian antar OPD (Top 10) dan jenis retribusi unggulan.",
            "Laporan Terbaru: Daftar cepat laporan yang baru saja masuk ke sistem."
          ]
        }
      ]
    },
    {
      title: "BAB 3: Manajemen Laporan & Rekapitulasi",
      sections: [
        {
          title: "Verifikasi Laporan Masuk",
          content: "Tugas utama Admin adalah memvalidasi laporan dari Operator OPD. Pastikan bukti bayar sesuai dengan nominal yang diinput.",
          mockup: 'table',
          points: [
            "Buka menu 'Laporan Retribusi'.",
            "Filter status menjadi 'Menunggu Verifikasi'.",
            "Klik tombol 'Mata' (View) untuk melihat detail & bukti foto.",
            "Klik 'Approve' jika sesuai, atau 'Tolak' jika ada kesalahan."
          ]
        },
        {
          title: "Laporan Rekapitulasi",
          content: "Menu Laporan Rekap menyediakan ringkasan pendapatan daerah yang dapat difilter berdasarkan periode waktu tertentu.",
          mockup: 'rekap',
          points: [
            "Filter Periode: Pilih Bulan dan Tahun untuk melihat data spesifik.",
            "Export Data: Gunakan tombol hijau 'Export' untuk mengunduh laporan dalam format Excel atau PDF.",
            "Tab Rekapitulasi: Klik tab 'Per OPD', 'Per Kategori', atau 'Per Jenis Pelayanan' untuk melihat detail breakdown pendapatan.",
            "Summary Cards: Pantau total pendapatan dan jumlah laporan secara cepat lewat kartu ringkasan di atas."
          ]
        }
      ]
    },
    {
      title: "BAB 4: Pengaturan Master Data",
      sections: [
        {
          title: "Manajemen OPD (Organisasi Perangkat Daerah)",
          content: "Menu ini digunakan untuk menambah, mengubah, atau menonaktifkan OPD yang terdaftar dalam sistem.",
          mockup: 'table',
          points: [
            "Masuk ke Menu Settings > Master OPD.",
            "Klik '+ Add New' untuk menambah OPD baru.",
            "Isi Kode OPD dan Nama OPD dengan lengkap.",
            "Gunakan tombol Edit (Pensil) untuk mengubah nama OPD jika ada perubahan nomenklatur."
          ]
        },
        {
          title: "Manajemen Jenis Retribusi",
          content: "Mengatur daftar jenis retribusi yang bisa dipilih saat input laporan. Setiap retribusi harus memiliki Kode Rekening.",
          mockup: 'table',
          points: [
            "Masuk ke Menu Settings > Master Retribusi.",
            "Klik '+ Add New' untuk menambah jenis retribusi.",
            "Isi Kode Rekening (misal: 4.1.02.01) dan Nama Retribusi.",
            "Pastikan nama retribusi jelas agar tidak membingungkan operator."
          ]
        },
        {
          title: "Menghubungkan OPD dengan Retribusi",
          content: "Sangat Penting: Setelah membuat Retribusi, Anda harus menugaskannya ke OPD terkait agar muncul di form input mereka.",
          mockup: 'form',
          points: [
            "Pada tabel Master Retribusi, klik tombol 'Assign' atau ikon Link.",
            "Pilih OPD yang berwenang memungut retribusi tersebut.",
            "Satu jenis retribusi bisa dimiliki oleh lebih dari satu OPD jika diperlukan."
          ]
        }
      ]
    },
    {
      title: "BAB 5: Manajemen Pengguna & Konfigurasi",
      sections: [
        {
          title: "Mengelola Akun Pengguna",
          content: "Admin berwenang membuat akun untuk Operator OPD baru atau Admin lainnya.",
          mockup: 'table',
          points: [
            "Masuk ke menu Users.",
            "Klik Add New. Isi Nama, Email, dan pilih Role (Operator/Admin).",
            "Penting: Pilih OPD yang sesuai untuk Operator. Operator hanya bisa melihat data OPD-nya sendiri.",
            "Password default akan digenerate otomatis oleh sistem. Berikan password tersebut ke user."
          ]
        },
        {
          title: "Konfigurasi Umum Sistem",
          content: "Menu ini digunakan untuk mengatur preferensi global aplikasi, termasuk format penomoran dokumen, identitas instansi, dan identitas pemerintahan.",
          mockup: 'settings',
          points: [
            "Format Nomor Laporan: Anda dapat menyesuaikan format nomor otomatis (misal: LR/{TAHUN}/{NOMOR}) dengan mengklik tombol Edit.",
            "Logo Kabupaten: Upload logo resmi daerah (format PNG/JPG) yang akan otomatis muncul pada Kop Surat saat mencetak Bukti Tanda Terima PDF.",
            "Identitas Pemerintahan: Isi 'Jenis Pemerintahan' (misal: PEMERINTAH KABUPATEN) dan 'Nama Pemerintahan' (misal: KABUPATEN BANYUMAS). Informasi ini akan ditampilkan di header PDF laporan retribusi, tepat di atas nama OPD."
          ]
        }
      ]
    }
  ]

  // Style Injection untuk Hide Layout Elements saat Print
  const printStyles = `
    @media print {
      /* Sembunyikan elemen layout utama aplikasi */
      nav, header, aside, .fixed, .sticky, button {
        display: none !important;
      }
      
      /* Kecuali elemen di dalam HelpPage sendiri */
      .print\\:flex, .print\\:block, .print\\:visible {
        display: block !important;
      }
      .print\\:flex {
        display: flex !important;
      }
      
      /* Reset margin/padding layout */
      body, #root, main {
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        height: 100% !important;
        overflow: visible !important;
      }

      /* Sembunyikan header/footer browser default jika memungkinkan (opsional) */
      @page {
        margin: 0;
        size: auto;
      }
      
      /* Pastikan konten help page terlihat */
      #help-page-content {
        display: block !important;
        position: relative !important;
        z-index: 9999 !important;
        background: white !important;
        width: 100% !important;
      }
    }
  `

  return (
    <div id="help-page-content" className="min-h-screen bg-slate-50 pb-12 print:bg-white print:pb-0">
      <style>{printStyles}</style>

      {/* --- E-BOOK COVER PAGE (Print Only) --- */}
      <div className="hidden print:flex flex-col justify-center items-center h-screen w-full text-center break-after-page">
        <div className="mb-12">
          <Shield className="w-32 h-32 mx-auto mb-4 text-black" />
          <h1 className="text-5xl font-black uppercase tracking-tight mb-4">BUKU PANDUAN</h1>
          <h2 className="text-3xl font-light uppercase tracking-widest text-slate-600">Sistem Laporan Retribusi</h2>
        </div>
        <div className="mt-auto mb-24">
          <p className="text-xl font-bold mb-2">UNTUK ADMINISTRATOR</p>
          <div className="w-16 h-1 bg-black mx-auto mb-4"></div>
          <p className="text-slate-500">Versi 1.0 • Tahun 2025</p>
          <p className="text-slate-400 text-sm mt-2">Badan Pendapatan Daerah</p>
        </div>
      </div>

      {/* --- KATA PENGANTAR (Print Only) --- */}
      <div className="hidden print:block h-screen w-full px-12 py-24 break-after-page">
        <h2 className="text-3xl font-bold mb-8 border-b-2 border-black pb-4">KATA PENGANTAR</h2>
        <div className="text-justify space-y-6 text-lg leading-relaxed text-slate-800 font-serif">
          <p>
            Puji syukur kita panjatkan ke hadirat Tuhan Yang Maha Esa, karena atas rahmat dan karunia-Nya, pengembangan Sistem Laporan Retribusi Daerah ini dapat diselesaikan dan siap digunakan.
          </p>
          <p>
            Buku panduan ini disusun khusus untuk Administrator sistem, dengan tujuan memberikan pemahaman mendalam mengenai pengelolaan data, manajemen pengguna, serta konfigurasi sistem secara keseluruhan. Peran Administrator sangat krusial dalam menjaga validitas data dan kelancaran operasional pelaporan retribusi dari seluruh OPD.
          </p>
          <p>
            Kami berharap panduan ini dapat mempermudah Bapak/Ibu Administrator dalam menjalankan tugasnya. Kritik dan saran yang membangun sangat kami harapkan demi penyempurnaan sistem ini di masa mendatang.
          </p>
          <p className="mt-12 pt-12">
            Tim Pengembang Aplikasi
          </p>
        </div>
      </div>

      {/* --- TABLE OF CONTENTS (Print Only) --- */}
      <div className="hidden print:block h-screen w-full px-12 py-24 break-after-page">
        <h2 className="text-3xl font-bold mb-8 border-b-2 border-black pb-4">DAFTAR ISI</h2>
        <ul className="space-y-4 text-lg">
          {adminChapters.map((chapter, idx) => (
            <li key={idx} className="flex justify-between border-b border-dotted border-slate-400 pb-1">
              <span>{chapter.title}</span>
              <span className="font-bold">Bab {idx + 1}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* --- WEB HEADER (Hide in Print) --- */}
      <div className="bg-white border-b-2 border-black sticky top-0 z-30 print:hidden">
        <div className="px-4 lg:px-8 py-6 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3">
              <HelpCircle className="h-8 w-8" />
              Pusat Bantuan
            </h1>
            <p className="mt-2 text-slate-600 font-medium">
              Panduan penggunaan dan dokumentasi sistem
            </p>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
          >
            <Printer className="h-5 w-5" />
            Download E-Book (PDF)
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 lg:px-8 max-w-7xl mx-auto flex gap-6 border-t border-slate-100">
          <button
            onClick={() => setActiveTab('general')}
            className={cn(
              "py-4 px-2 font-bold text-sm uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2",
              activeTab === 'general'
                ? "border-black text-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <User className="h-4 w-4" />
            Panduan Operator
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={cn(
              "py-4 px-2 font-bold text-sm uppercase tracking-wide border-b-2 transition-colors flex items-center gap-2",
              activeTab === 'admin'
                ? "border-black text-black"
                : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            <Shield className="h-4 w-4" />
            Panduan Administrator (Lengkap)
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8 space-y-12 print:max-w-none print:px-8 print:py-0">

        {/* General User Content (Simple FAQ & Quick Guide) */}
        <div className={cn("space-y-12", activeTab === 'general' ? 'block' : 'hidden print:hidden')}>
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5" /> Panduan Cepat Operator
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Simple cards for web view */}
              <div className="bg-white p-6 rounded-lg border-2 border-black shadow-hard">
                <h3 className="font-bold text-lg mb-2">Input Laporan Baru</h3>
                <p className="text-slate-600 text-sm mb-4">Langkah-langkah melaporkan setoran retribusi:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                  <li>Klik menu <strong>Input Laporan</strong></li>
                  <li>Pilih jenis retribusi</li>
                  <li>Isi tanggal dan nominal</li>
                  <li>Upload bukti</li>
                  <li>Kirim</li>
                </ol>
              </div>
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold uppercase tracking-wide mb-6 flex items-center gap-2">
              <MessageCircle className="h-5 w-5" /> FAQ
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-sm">
                  <button onClick={() => toggleItem(faq.id)} className="w-full flex justify-between p-4 font-bold text-left">
                    {faq.question}
                    {openItem === faq.id ? <ChevronUp /> : <ChevronDown />}
                  </button>
                  {openItem === faq.id && <div className="p-4 pt-0 border-t text-slate-600">{faq.answer}</div>}
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* ADMIN CONTENT (E-BOOK STYLE) */}
        <div className={cn("space-y-12", activeTab === 'admin' ? 'block' : 'hidden print:block')}>
          {adminChapters.map((chapter, idx) => (
            <section key={idx} className="print:break-before-page mb-16 print:mb-0">
              {/* Chapter Header */}
              <div className="mb-8 border-b-4 border-black pb-4 print:pt-12">
                <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                  {chapter.title}
                </h2>
              </div>

              {/* Sections */}
              <div className="space-y-12 print:space-y-10">
                {chapter.sections.map((section, sIdx) => (
                  <div key={sIdx} className="flex flex-col md:flex-row gap-8 print:break-inside-avoid">
                    {/* Left/Top: Content */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">
                          {sIdx + 1}
                        </span>
                        {section.title}
                      </h3>
                      <p className="text-slate-700 mb-4 leading-relaxed">
                        {section.content}
                      </p>
                      <ul className="space-y-2">
                        {section.points.map((point, pIdx) => (
                          <li key={pIdx} className="flex items-start gap-2 text-sm text-slate-600">
                            <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 shrink-0"></div>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Right/Bottom: UI Mockup (Visualisasi) */}
                    <div className="w-full md:w-1/2 print:w-1/2 flex flex-col items-center">
                      <div className="w-full p-1 border border-slate-200 rounded bg-slate-50 mb-2 text-center text-[10px] text-slate-400 uppercase tracking-wide">
                        Visualisasi Antarmuka
                      </div>
                      <UIMockup type={section.mockup as any} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Footer for Print */}
        <div className="hidden print:flex fixed bottom-0 left-0 w-full p-8 justify-between text-xs text-slate-400 border-t">
          <span>Buku Panduan Admin Sistem Retribusi</span>
          <span>Halaman Otomatis</span>
        </div>
      </div>
    </div>
  )
}
