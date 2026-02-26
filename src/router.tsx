/**
 * Router Configuration - React Router v7
 *
 * Changes:
 * - React Router v7 data router setup
 * - Route definitions with loaders and actions
 * - Error boundaries per route
 */

import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
// Import loaders and actions
import { loginAction } from './actions/auth'
import DashboardLayout from './components/layout/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { DashboardSkeleton } from './components/skeletons/DashboardSkeleton'
import ErrorPage from './pages/ErrorPage'
import HomePage from './pages/HomePage'
// Eager load critical pages
import LoginPage from './pages/LoginPage'

// Lazy load other pages
const DashboardHomePage = lazy(() => import('./pages/DashboardHomePage'))
const HelpPage = lazy(() => import('./pages/HelpPage'))
const JenisRetribusiFormPage = lazy(() => import('./pages/JenisRetribusiFormPage'))
const LaporanRetribusiFormPage = lazy(() => import('./pages/LaporanRetribusiFormPageNew'))
const LaporanRetribusiListPage = lazy(() => import('./pages/LaporanRetribusiListPage'))
const OPDFormPage = lazy(() => import('./pages/OPDFormPage'))
const OPDPelayananFormPage = lazy(() => import('./pages/OPDPelayananFormPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const TargetRealisasiPage = lazy(() => import('./pages/TargetRealisasiPage'))

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
  </div>
)

export const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <HomePage />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    action: loginAction,
    errorElement: <ErrorPage />,
  },

  // Protected Routes - Dashboard
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardHomePage />
          </Suspense>
        ),
      },
      {
        path: 'target-realisasi',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TargetRealisasiPage />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<PageLoader />}>
              <ReportsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<PageLoader />}>
              <SettingsPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute requireAdmin>
            <Suspense fallback={<PageLoader />}>
              <UsersPage />
            </Suspense>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'help',
        element: (
          <Suspense fallback={<PageLoader />}>
            <HelpPage />
          </Suspense>
        ),
      },
      // Laporan Retribusi
      {
        path: 'laporan-retribusi',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LaporanRetribusiListPage />
          </Suspense>
        ),
      },
      {
        path: 'laporan-retribusi/create',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LaporanRetribusiFormPage />
          </Suspense>
        ),
      },
      {
        path: 'laporan-retribusi/edit/:id',
        element: (
          <Suspense fallback={<PageLoader />}>
            <LaporanRetribusiFormPage />
          </Suspense>
        ),
      },
      // OPD Management
      {
        path: 'settings/opd/create',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OPDFormPage />
          </Suspense>
        ),
      },
      {
        path: 'settings/opd/edit/:kode',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OPDFormPage />
          </Suspense>
        ),
      },
      // Jenis Retribusi Management
      {
        path: 'settings/jenis-retribusi/create',
        element: (
          <Suspense fallback={<PageLoader />}>
            <JenisRetribusiFormPage />
          </Suspense>
        ),
      },
      {
        path: 'settings/jenis-retribusi/edit/:kode',
        element: (
          <Suspense fallback={<PageLoader />}>
            <JenisRetribusiFormPage />
          </Suspense>
        ),
      },
      // OPD-Pelayanan Management
      {
        path: 'settings/opd-pelayanan/create',
        element: (
          <Suspense fallback={<PageLoader />}>
            <OPDPelayananFormPage />
          </Suspense>
        ),
      },
    ],
  },

  // 404 Catch-all
  {
    path: '*',
    element: <ErrorPage />,
  },
])
