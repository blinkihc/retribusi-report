/**
 * Home Page
 *
 * Public landing page dengan modern design
 */

import { ArrowRight, BarChart3, FileText, Shield, TrendingUp, Users, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-primary-700">Sistem Retribusi Daerah</h1>
          </div>
          <Link
            to="/login"
            className="px-6 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium"
          >
            Login
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-20">
          <div className="inline-block mb-4 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
            🏛️ Badan Pendapatan Daerah
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
            Sistem Monitoring dan
            <br />
            <span className="text-primary-700">Pelaporan Retribusi Daerah</span>
          </h2>
          <p className="text-xl text-neutral-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Platform digital untuk pengelolaan retribusi daerah yang efisien, transparan, dan
            akuntabel
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              to="/login"
              className="group px-8 py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 hover:shadow-2xl hover:scale-105 transition-all duration-200 font-semibold flex items-center gap-2"
            >
              Mulai Sekarang
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white text-neutral-700 rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 font-semibold border-2 border-neutral-200"
            >
              Dashboard Publik
            </Link>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-neutral-100">
            <div className="w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <div className="text-4xl font-bold text-neutral-900 mb-2">100%</div>
            <div className="text-base text-neutral-600 font-medium">Sistem Digital</div>
            <div className="text-sm text-neutral-500 mt-1">Paperless & Otomatis</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-neutral-100">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-4">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div className="text-4xl font-bold text-neutral-900 mb-2">Real-time</div>
            <div className="text-base text-neutral-600 font-medium">Monitoring</div>
            <div className="text-sm text-neutral-500 mt-1">Data Terupdate Langsung</div>
          </div>
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-neutral-100">
            <div className="w-14 h-14 bg-gradient-to-br from-warning-500 to-warning-600 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="text-4xl font-bold text-neutral-900 mb-2">Aman</div>
            <div className="text-base text-neutral-600 font-medium">& Terpercaya</div>
            <div className="text-sm text-neutral-500 mt-1">Audit Trail Lengkap</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 hover:border-primary-200 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Efisien</h3>
            <p className="text-neutral-600 leading-relaxed">
              Proses pelaporan yang cepat dan mudah dengan antarmuka yang intuitif
            </p>
          </div>
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 hover:border-success-200 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Transparan</h3>
            <p className="text-neutral-600 leading-relaxed">
              Data yang dapat diakses secara real-time dengan visualisasi yang jelas
            </p>
          </div>
          <div className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-100 hover:border-warning-200 hover:-translate-y-2">
            <div className="w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-neutral-900 mb-3">Akuntabel</h3>
            <p className="text-neutral-600 leading-relaxed">
              Audit trail lengkap untuk setiap transaksi dengan keamanan terjamin
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-12 text-center shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-4">
            Siap untuk Digitalisasi Retribusi Daerah?
          </h3>
          <p className="text-white/90 mb-8 text-lg">
            Sistem terintegrasi untuk pengelolaan retribusi yang lebih efisien
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary-700 rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 font-bold shadow-lg"
          >
            Mulai Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-neutral-600 text-sm">
            © 2025 Badan Pendapatan Daerah. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
