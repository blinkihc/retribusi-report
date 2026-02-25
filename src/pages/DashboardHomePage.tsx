/**
 * Dashboard Home Page
 *
 * Main dashboard dengan style Government Structured Brutalism
 *
 * Stats Cards:
 * 1. Retribusi Hari Ini - Daily revenue
 * 2. Retribusi Minggu Ini - Weekly revenue
 * 3. Retribusi Bulan Ini - Monthly revenue
 * 4. Total Pendapatan - All-time revenue
 * 5. Total Laporan - All-time report count
 *
 * Charts:
 * - Trend Pendapatan (Area/Line)
 * - Komposisi Kategori (Pie)
 * - Perbandingan OPD (Bar)
 * - Top Retribusi (Bar)
 *
 * Last Updated: 2025-11-23
 */

import { useQuery } from '@tanstack/react-query'
import {
  ArrowRight,
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  PieChart as PieChartIcon,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { DashboardSkeleton } from '../components/skeletons/DashboardSkeleton'
import { api } from '../lib/api/client'

type DashboardData = {
  stats: {
    dailyRevenue: number
    dailyGrowth: number
    weeklyRevenue: number
    weeklyGrowth: number
    monthlyRevenue: number
    monthlyGrowth: number
    totalRevenue: number
    totalReports: number
    period: {
      year: number
      month: number
    }
  }
  recentReports: any[]
  revenueTrend: any[]
  revenueTrendDaily: any[]
  opdRevenue: any[]
  categoryRevenue: any[]
  topRetribusi: any[]
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const [
    stats,
    recentReports,
    revenueTrend,
    revenueTrendDaily,
    opdRevenue,
    categoryRevenue,
    topRetribusi,
  ] = await Promise.all([
    api.getDashboardStats(),
    api.getRecentReports(5),
    api.getRevenueTrend(6),
    api.getRevenueTrendDaily(30),
    api.getOPDRevenue(),
    api.getCategoryRevenue(),
    api.getTopRetribusi(),
  ])

  return {
    stats: stats.data,
    recentReports: recentReports.data,
    revenueTrend: revenueTrend.data,
    revenueTrendDaily: revenueTrendDaily.data,
    opdRevenue: opdRevenue.data,
    categoryRevenue: categoryRevenue.data,
    topRetribusi: topRetribusi.data,
  }
}

const COLORS = ['#2563eb', '#16a34a', '#db2777', '#ca8a04', '#9333ea', '#0891b2']

// Growth Indicator Component
const GrowthIndicator = ({ value }: { value: number }) => {
  const isPositive = value > 0
  const isNegative = value < 0

  if (value === 0)
    return (
      <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wide">
        Tidak ada perubahan
      </span>
    )

  return (
    <div
      className={`flex items-center text-[10px] font-bold uppercase tracking-wide ${isPositive ? 'text-green-600' : 'text-red-600'}`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3 mr-1" />
      ) : (
        <TrendingDown className="w-3 h-3 mr-1" />
      )}
      {Math.abs(value).toFixed(1)}% vs periode lalu
    </div>
  )
}

// Custom Brutalist Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-2 border-black p-3 shadow-hard-sm">
        <p className="text-xs font-bold uppercase text-slate-500 mb-1">{label}</p>
        <p className="text-sm font-extrabold text-slate-900">
          {new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0,
          }).format(payload[0].value)}
        </p>
      </div>
    )
  }
  return null
}

export default function DashboardHomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-home'],
    queryFn: fetchDashboardData,
    refetchInterval: 300000, // Refetch every 5 minutes
  })

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
        <div className="text-red-500 font-bold mb-2">Gagal memuat data dashboard</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-black text-white font-bold rounded hover:bg-slate-800"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatCompactNumber = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      notation: 'compact',
      compactDisplay: 'short',
      maximumFractionDigits: 1,
    }).format(number)
  }

  const monthNames = [
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

  return (
    <div className="space-y-8 overflow-x-hidden max-w-full pb-12">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b-2 border-dashed border-slate-300 pb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight uppercase mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 font-medium">Overview kinerja penerimaan retribusi daerah</p>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-bold font-mono rounded-none border-2 border-black shadow-hard-sm">
          <Calendar className="w-4 h-4" />
          <span>
            {monthNames[data.stats.period.month - 1]} {data.stats.period.year}
          </span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        {/* Daily Revenue */}
        <div className="bg-white border-2 border-black shadow-hard rounded-none p-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-hard-lg transition-all duration-200">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              Hari Ini
            </div>
            <div className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-2">
              {formatCurrency(data.stats.dailyRevenue)}
            </div>
            <div className="mt-2">
              <GrowthIndicator value={data.stats.dailyGrowth} />
            </div>
          </div>
        </div>

        {/* Weekly Revenue */}
        <div className="bg-white border-2 border-black shadow-hard rounded-none p-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-hard-lg transition-all duration-200">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-100 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-600 rounded-full" />
              Minggu Ini
            </div>
            <div className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-2">
              {formatCurrency(data.stats.weeklyRevenue)}
            </div>
            <div className="mt-2">
              <GrowthIndicator value={data.stats.weeklyGrowth} />
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white border-2 border-black shadow-hard rounded-none p-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-hard-lg transition-all duration-200">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-100 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-600 rounded-full" />
              Bulan Ini
            </div>
            <div className="text-lg lg:text-xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-2">
              {formatCurrency(data.stats.monthlyRevenue)}
            </div>
            <div className="mt-2">
              <GrowthIndicator value={data.stats.monthlyGrowth} />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-slate-900 border-2 border-black shadow-hard rounded-none p-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-hard-lg transition-all duration-200">
          <div className="absolute top-0 right-0 w-16 h-16 bg-slate-800 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-2">
              <DollarSign className="w-3 h-3" />
              Total Pendapatan
            </div>
            <div className="text-lg lg:text-xl font-extrabold text-white tracking-tight tabular-nums mt-2">
              {formatCurrency(data.stats.totalRevenue)}
            </div>
          </div>
        </div>

        {/* Total Reports */}
        <div className="bg-white border-2 border-black shadow-hard rounded-none p-5 relative overflow-hidden group hover:-translate-y-1 hover:shadow-hard-lg transition-all duration-200">
          <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-100 rounded-bl-full -mr-8 -mt-8 z-0 transition-transform group-hover:scale-150" />
          <div className="relative z-10">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-2">
              <FileText className="w-3 h-3" />
              Total Laporan
            </div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums mt-2">
              {data.stats.totalReports}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section Row 1: Trend & Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Trend Chart (2/3 width) */}
        <div className="lg:col-span-2 bg-white border-2 border-black shadow-hard-lg rounded-none flex flex-col">
          <div className="p-4 border-b-2 border-black bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                Trend Pendapatan (30 Hari)
              </h2>
            </div>
          </div>
          <div className="p-6 flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.revenueTrendDaily}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => {
                    const d = new Date(date)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis
                  tickFormatter={(value) => formatCompactNumber(value)}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#000000"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart (1/3 width) */}
        <div className="bg-white border-2 border-black shadow-hard-lg rounded-none flex flex-col">
          <div className="p-4 border-b-2 border-black bg-slate-50">
            <div className="flex items-center gap-3">
              <PieChartIcon className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                Komposisi Kategori
              </h2>
            </div>
          </div>
          <div className="p-6 flex-1 min-h-[350px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data.categoryRevenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="total"
                  nameKey="kategori"
                >
                  {data.categoryRevenue.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke="#000000"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs font-bold uppercase text-slate-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Section Row 2: OPD & Top Retribusi */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* OPD Performance (Bar Chart) */}
        <div className="bg-white border-2 border-black shadow-hard-lg rounded-none flex flex-col">
          <div className="p-4 border-b-2 border-black bg-slate-50">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                Performa OPD (Top 10)
              </h2>
            </div>
          </div>
          <div className="p-6 flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                layout="vertical"
                data={data.opdRevenue}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="opdNama"
                  type="category"
                  width={150}
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#1e293b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" fill="#000000" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Retribusi Types (Bar Chart) */}
        <div className="bg-white border-2 border-black shadow-hard-lg rounded-none flex flex-col">
          <div className="p-4 border-b-2 border-black bg-slate-50">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-slate-700" />
              <h2 className="text-lg font-extrabold text-slate-900 uppercase tracking-tight">
                Top Jenis Retribusi
              </h2>
            </div>
          </div>
          <div className="p-6 flex-1 min-h-[400px]">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={data.topRetribusi}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="nama"
                  tick={false} // Hide labels if they are too long
                  axisLine={{ stroke: '#000' }}
                />
                <YAxis
                  tickFormatter={(value) => formatCompactNumber(value)}
                  tick={{ fontSize: 12, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="total"
                  fill="#2563eb"
                  stroke="#000000"
                  strokeWidth={2}
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                >
                  {data.topRetribusi.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className="bg-white border-2 border-black shadow-hard-lg rounded-none overflow-hidden">
        <div className="p-5 border-b-2 border-black bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white border-2 border-black rounded-none flex items-center justify-center shadow-hard-sm">
              <FileText className="w-5 h-5 text-slate-900" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
              Laporan Terbaru
            </h2>
          </div>
          <Link
            to="/dashboard/laporan-retribusi"
            className="text-sm font-bold text-black hover:text-blue-600 hover:underline uppercase tracking-wide flex items-center gap-1 transition-colors"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div>
          {data.recentReports.length === 0 ? (
            <div className="p-12 text-center bg-slate-50/50">
              <div className="w-16 h-16 bg-slate-100 border-2 border-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-900 font-bold text-lg uppercase">Belum ada laporan</p>
              <p className="text-slate-500 font-medium">Data laporan terbaru akan muncul di sini</p>
            </div>
          ) : (
            <div className="divide-y-2 divide-slate-100">
              {data.recentReports.map((report) => (
                <div
                  key={report.id}
                  className="group flex items-center justify-between p-5 hover:bg-yellow-50 transition-colors duration-150"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white border-2 border-slate-200 rounded-none flex items-center justify-center text-slate-400 group-hover:border-black group-hover:text-black group-hover:shadow-hard-sm transition-all">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 group-hover:underline decoration-2 underline-offset-2 uppercase tracking-wide text-sm">
                        {report.nomorLaporan}
                      </div>
                      <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">
                        {report.jenisRetribusi?.nama} •{' '}
                        <span className="text-slate-400">{report.opd?.nama}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-slate-900 tabular-nums text-lg">
                      {formatCurrency(Number(report.nominal))}
                    </div>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-none text-xs font-bold uppercase tracking-wide border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] ${report.status === 'verified'
                            ? 'bg-green-100 border-green-700 text-green-800'
                            : report.status === 'draft'
                              ? 'bg-yellow-100 border-yellow-700 text-yellow-800'
                              : 'bg-slate-100 border-slate-600 text-slate-700'
                          }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Pattern Decoration */}
        <div className="h-4 bg-grid-pattern opacity-10 border-t-2 border-slate-100" />
      </div>
    </div>
  )
}
